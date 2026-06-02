"""The Run object — the only thing most users will touch.

A ``Run`` is the lifespan of one training script invocation. It owns a unique
id, an output directory under ``~/.siliconworm/runs/<id>/``, a buffered metric
writer that flushes both to local jsonl and (optionally) to a remote ingest
endpoint, and a ``summary`` dict that holds aggregate results.

Usage is intentionally tiny::

    run = siliconworm.init(project="viscount-lm", config={"lr": 3e-4})
    run.log({"train_loss": loss}, step=step)
    run.summary["final_acc"] = 0.987
    run.finish()
"""

from __future__ import annotations

import atexit
import json
import logging
import os
import random
import secrets
import threading
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

from .client import IngestClient
from .env import capture as capture_env

logger = logging.getLogger("siliconworm.run")

# Module-level singleton — set by `init()`, cleared by `finish()`.
_current: "Run | None" = None

_FLUSH_THRESHOLD = 64        # records buffered before a forced flush
_FLUSH_INTERVAL_S = 2.0      # seconds between background flushes
_ADJECTIVES = [
    "wise", "brisk", "amber", "velvet", "iron", "feral", "lucent", "noble",
    "tidal", "spiral", "obsidian", "cobalt", "muted", "hollow", "ember",
    "stoic", "fern", "slate", "lyric", "crisp", "vapor", "azure", "ashen",
    "thorn", "polar", "midnight", "saffron", "umbra", "candle",
]
_NOUNS = [
    "sweep", "yak", "comet", "drift", "fern", "owl", "kite", "harbor",
    "lichen", "magnet", "ridge", "orbit", "ember", "fjord", "hare", "spruce",
    "willow", "totem", "delta", "thicket", "amber", "knot", "tundra",
    "cinder", "moth", "vellum", "quarry",
]


# ───────────────────────── id + name helpers ─────────────────────────

# Crockford base32, ULID-style — 10 chars of ms timestamp + 16 chars of random.
_ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def _ulid() -> str:
    now_ms = int(time.time() * 1000)
    rand = secrets.randbits(80)
    # 48-bit ms timestamp → 10 base32 chars
    ts_part = ""
    for _ in range(10):
        ts_part = _ULID_ALPHABET[now_ms & 0x1F] + ts_part
        now_ms >>= 5
    # 80-bit random → 16 base32 chars
    rand_part = ""
    for _ in range(16):
        rand_part = _ULID_ALPHABET[rand & 0x1F] + rand_part
        rand >>= 5
    return ts_part + rand_part


def _generate_name(seed: int | None = None) -> str:
    rng = random.Random(seed)
    adj = rng.choice(_ADJECTIVES)
    noun = rng.choice(_NOUNS)
    suffix = rng.randint(1, 999)
    return f"{adj}-{noun}-{suffix:03d}"


# ───────────────────────── value coercion ─────────────────────────

def _coerce_scalar(v: Any) -> float | int | str | bool | None:
    """Best-effort conversion of a logged value to a JSON-safe scalar.

    Recognises torch tensors and numpy scalars without importing either at
    module load — we don't want to make those libraries hard dependencies of
    the SDK.
    """
    if v is None or isinstance(v, (bool, int, float, str)):
        return v
    # Torch tensor — .item() works for 0-d tensors; for vectors we take the mean.
    cls_path = f"{type(v).__module__}.{type(v).__name__}"
    if cls_path.startswith("torch."):
        try:
            t = v.detach()  # type: ignore[union-attr]
            if t.ndim == 0:
                return float(t.item())
            return float(t.float().mean().item())
        except Exception:
            return None
    # numpy scalar / 0-d array
    if cls_path.startswith("numpy."):
        try:
            return float(v.item())  # type: ignore[union-attr]
        except Exception:
            try:
                return float(v.mean())  # type: ignore[union-attr]
            except Exception:
                return None
    # last-ditch: string repr
    try:
        return float(v)
    except Exception:
        return str(v)


def _normalize_metrics(metrics: dict[str, Any]) -> dict[str, Any]:
    return {str(k): _coerce_scalar(v) for k, v in metrics.items()}


# ───────────────────────── summary view ─────────────────────────

class Summary(dict):
    """Dict-like container for final aggregate values.

    Behaves like a regular dict but logs any update through the owning run so
    the summary file on disk stays current. The summary is written eagerly
    rather than buffered — there are usually only a handful of keys.
    """

    def __init__(self, run: "Run") -> None:
        super().__init__()
        self._run = run

    def __setitem__(self, k: str, v: Any) -> None:
        super().__setitem__(k, _coerce_scalar(v))
        self._run._write_summary()

    def update(self, *args, **kwargs) -> None:  # type: ignore[override]
        # Coerce all incoming values, then write once.
        merged = dict(*args, **kwargs)
        for k, v in merged.items():
            super().__setitem__(str(k), _coerce_scalar(v))
        self._run._write_summary()


# ───────────────────────── the Run itself ─────────────────────────

class Run:
    """One training invocation.

    Created by :func:`siliconworm.init`. Owns the local output directory, the
    background flusher, and the optional HTTP ingest client. Safe to use as
    a context manager — exiting calls :meth:`finish` automatically.
    """

    def __init__(
        self,
        project: str,
        *,
        name: str | None = None,
        config: dict[str, Any] | None = None,
        tags: list[str] | None = None,
        group: str | None = None,
        notes: str | None = None,
        job_type: str | None = None,
        dir: str | os.PathLike[str] | None = None,
        api_url: str | None = None,
        api_key: str | None = None,
    ) -> None:
        self.project = project
        self.id = _ulid()
        # Seed the name from the id so two runs in the same ms still differ.
        # (Crockford alphabet includes chars outside python's base-32, so we
        # roll our own seed instead of int(..., 32).)
        self.name = name or _generate_name(
            seed=sum(_ULID_ALPHABET.index(c) << (i * 5) for i, c in enumerate(self.id[-8:]))
        )
        self.config: dict[str, Any] = dict(config or {})
        self.tags: list[str] = list(tags or [])
        self.group = group
        self.notes = notes
        self.job_type = job_type
        self.summary: Summary = Summary(self)

        base = Path(dir) if dir else Path.home() / ".siliconworm" / "runs"
        self.dir: Path = base / self.id
        self.dir.mkdir(parents=True, exist_ok=True)
        self._metrics_path = self.dir / "metrics.jsonl"
        self._summary_path = self.dir / "summary.json"
        self._config_path = self.dir / "config.json"
        self._system_path = self.dir / "system.json"

        self._buf: list[dict[str, Any]] = []
        self._buf_lock = threading.Lock()
        self._auto_step = 0
        self._finished = False
        self._started_at = datetime.now(timezone.utc)
        self._t0 = time.monotonic()
        self._system = capture_env()

        self._client = IngestClient(
            api_url=api_url or os.environ.get("SILICONWORM_API_URL"),
            api_key=api_key or os.environ.get("SILICONWORM_API_KEY"),
        )

        self._write_config()
        self._write_summary()
        Path(self._system_path).write_text(json.dumps(self._system, indent=2, default=str))

        # Background flusher — small and dumb, runs until finish().
        self._stop = threading.Event()
        self._flusher = threading.Thread(
            target=self._flush_loop, name="siliconworm-flusher", daemon=True
        )
        self._flusher.start()

        # Backstop: if the user forgets `.finish()`, the atexit hook flushes.
        atexit.register(self._atexit_finish)

        self._client.post_init(self._init_payload())

        logger.info("siliconworm: %s/%s · run=%s · dir=%s",
                    self.project, self.name, self.id, self.dir)

    # ───────────── public API ─────────────

    @property
    def url(self) -> str:
        """Local URI scheme; a hosted dashboard would substitute its own host."""
        return f"siliconworm://{self.project}/{self.id}"

    def log(
        self,
        metrics: dict[str, Any],
        *,
        step: int | None = None,
        commit: bool | None = None,
    ) -> None:
        """Append a record of metrics.

        Args:
            metrics: dict of scalar values. Torch tensors and numpy scalars
                are accepted — they're converted to Python floats.
            step: explicit training step. Defaults to an auto-incrementing
                counter, so callers who don't care can omit it.
            commit: ignored for API compatibility with W&B; we always commit.
        """
        if self._finished:
            logger.warning("log() called on a finished run; ignoring")
            return
        del commit  # unused
        if step is None:
            step = self._auto_step
            self._auto_step += 1
        else:
            self._auto_step = max(self._auto_step, int(step) + 1)
        record = {
            "step": int(step),
            "ts": time.time(),
            **_normalize_metrics(metrics),
        }
        with self._buf_lock:
            self._buf.append(record)
            should_flush = len(self._buf) >= _FLUSH_THRESHOLD
        if should_flush:
            self._flush()

    def finish(self, exit_code: int = 0) -> None:
        """Drain the buffer, write the final summary, stop the flusher."""
        if self._finished:
            return
        self._finished = True
        self._stop.set()
        # Give the flusher a moment to exit; then flush whatever's left here too.
        self._flusher.join(timeout=1.0)
        self._flush()

        finished_at = datetime.now(timezone.utc)
        duration = time.monotonic() - self._t0
        finish_payload = {
            "ended_at": finished_at.isoformat(),
            "duration_s": round(duration, 3),
            "exit_code": int(exit_code),
            "summary": dict(self.summary),
        }
        # Merge finish data into summary.json so it's a complete record.
        meta = {
            "id": self.id, "name": self.name, "project": self.project,
            "started_at": self._started_at.isoformat(),
            **finish_payload,
            "tags": self.tags, "group": self.group,
        }
        self._summary_path.write_text(json.dumps(meta, indent=2, default=str))
        self._client.post_finish(self.id, finish_payload)

        global _current
        if _current is self:
            _current = None
        logger.info("siliconworm: finished %s in %.2fs", self.id, duration)

    # ───────────── context manager ─────────────

    def __enter__(self) -> "Run":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        if exc_type is not None:
            # Don't swallow the exception — finish the run as failed and re-raise.
            self.summary["_error"] = repr(exc)
            self.summary["_traceback"] = "".join(
                traceback.format_exception(exc_type, exc, tb)
            )[-2000:]
            self.finish(exit_code=1)
            return
        self.finish(exit_code=0)

    # ───────────── internals ─────────────

    def _init_payload(self) -> dict[str, Any]:
        return {
            "id": self.id, "name": self.name, "project": self.project,
            "config": self.config, "tags": self.tags, "group": self.group,
            "notes": self.notes, "job_type": self.job_type,
            "started_at": self._started_at.isoformat(),
            "system": self._system,
        }

    def _write_config(self) -> None:
        payload = {
            "id": self.id,
            "name": self.name,
            "project": self.project,
            "tags": self.tags,
            "group": self.group,
            "notes": self.notes,
            "job_type": self.job_type,
            "config": self.config,
            "started_at": self._started_at.isoformat(),
        }
        self._config_path.write_text(json.dumps(payload, indent=2, default=str))

    def _write_summary(self) -> None:
        # Eagerly written so an ad-hoc reader (or the dashboard) can pick up
        # the latest values even mid-run.
        self._summary_path.write_text(json.dumps(dict(self.summary), indent=2, default=str))

    def _drain_locked(self) -> list[dict[str, Any]]:
        with self._buf_lock:
            if not self._buf:
                return []
            batch, self._buf = self._buf, []
            return batch

    def _flush(self) -> None:
        batch = self._drain_locked()
        if not batch:
            return
        # Append to local jsonl — always.
        lines = (json.dumps(r, separators=(",", ":"), default=str) for r in batch)
        with self._metrics_path.open("a", encoding="utf-8") as f:
            f.write("\n".join(lines))
            f.write("\n")
        # Best-effort remote ingest.
        self._client.post_metrics(self.id, batch)

    def _flush_loop(self) -> None:
        while not self._stop.wait(_FLUSH_INTERVAL_S):
            try:
                self._flush()
            except Exception as e:  # never propagate from the bg thread
                logger.debug("flush error: %s", e)

    def _atexit_finish(self) -> None:
        # Final backstop — only acts if the user forgot to call finish().
        if not self._finished:
            try:
                self.finish(exit_code=0)
            except Exception:
                pass


# ───────────────────────── module-level convenience ─────────────────────────

def init(
    project: str,
    *,
    name: str | None = None,
    config: dict[str, Any] | None = None,
    tags: list[str] | None = None,
    group: str | None = None,
    notes: str | None = None,
    job_type: str | None = None,
    dir: str | os.PathLike[str] | None = None,
    api_url: str | None = None,
    api_key: str | None = None,
) -> Run:
    """Start a new run and make it the current run.

    The returned ``Run`` is also stored as a module-level singleton, so the
    bare ``siliconworm.log(...)`` / ``siliconworm.finish()`` helpers will dispatch
    to it — handy when threading a ``run`` object through your code is awkward.
    """
    global _current
    if _current is not None and not _current._finished:
        logger.warning(
            "siliconworm.init() called while %s is still active; finishing it",
            _current.id,
        )
        _current.finish()
    _current = Run(
        project=project, name=name, config=config, tags=tags, group=group,
        notes=notes, job_type=job_type, dir=dir, api_url=api_url, api_key=api_key,
    )
    return _current


def log(metrics: dict[str, Any], *, step: int | None = None) -> None:
    """Log metrics on the current run. Call :func:`init` first."""
    if _current is None:
        raise RuntimeError("siliconworm.log() called before siliconworm.init()")
    _current.log(metrics, step=step)


def finish(exit_code: int = 0) -> None:
    """Finish the current run, if any."""
    if _current is not None:
        _current.finish(exit_code=exit_code)


def current() -> Run | None:
    """Return the active run, or None if no run has been initialised."""
    return _current


def __iter__() -> Iterator[Any]:  # pragma: no cover — keeps mypy/ruff happy
    return iter([])
