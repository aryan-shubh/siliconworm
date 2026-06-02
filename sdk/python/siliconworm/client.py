"""Minimal HTTP client for the optional ingest endpoint.

The SDK is designed to work without ever calling the network. When
``SILICONWORM_API_URL`` is set, batches of log lines are POSTed to
``<url>/v1/runs/<run_id>/metrics`` as newline-delimited JSON. Failures
are swallowed after a few retries — the local jsonl is the source of
truth, so a flaky network never loses data.
"""

from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
from typing import Any

logger = logging.getLogger("siliconworm.client")


class IngestClient:
    """POST batches of metrics to the optional Silkworm ingest endpoint.

    No-op when ``api_url`` is None — the surrounding code does not need to
    check; every public method on this class simply returns immediately.
    """

    def __init__(
        self,
        api_url: str | None,
        api_key: str | None,
        timeout: float = 5.0,
        retries: int = 2,
    ) -> None:
        self.api_url = api_url.rstrip("/") if api_url else None
        self.api_key = api_key
        self.timeout = timeout
        self.retries = retries

    @property
    def enabled(self) -> bool:
        return self.api_url is not None

    def _headers(self) -> dict[str, str]:
        h = {
            "Content-Type": "application/x-ndjson",
            "User-Agent": f"siliconworm-python/{os.environ.get('SILICONWORM_VERSION', 'dev')}",
        }
        if self.api_key:
            h["Authorization"] = f"Bearer {self.api_key}"
        return h

    def _post(self, path: str, body: bytes) -> bool:
        if not self.api_url:
            return False
        url = f"{self.api_url}{path}"
        last_err: Exception | None = None
        for attempt in range(self.retries + 1):
            try:
                req = urllib.request.Request(  # noqa: S310
                    url, data=body, headers=self._headers(), method="POST"
                )
                with urllib.request.urlopen(req, timeout=self.timeout) as r:  # noqa: S310
                    if 200 <= r.status < 300:
                        return True
                    last_err = RuntimeError(f"HTTP {r.status}")
            except urllib.error.HTTPError as e:
                # 4xx is not worth retrying — it's a client problem.
                if 400 <= e.code < 500:
                    logger.debug("ingest rejected: %s", e)
                    return False
                last_err = e
            except Exception as e:
                last_err = e
            # Tiny linear backoff; the local jsonl is authoritative either way.
            time_to_wait = 0.25 * (attempt + 1)
            try:
                import time
                time.sleep(time_to_wait)
            except Exception:
                pass
        logger.debug("ingest failed after %d attempts: %s", self.retries + 1, last_err)
        return False

    def post_metrics(self, run_id: str, records: list[dict[str, Any]]) -> bool:
        if not self.enabled or not records:
            return False
        body = ("\n".join(json.dumps(r, separators=(",", ":")) for r in records)).encode()
        return self._post(f"/v1/runs/{run_id}/metrics", body)

    def post_summary(self, run_id: str, summary: dict[str, Any]) -> bool:
        if not self.enabled:
            return False
        body = json.dumps(summary, separators=(",", ":")).encode()
        return self._post(f"/v1/runs/{run_id}/summary", body)

    def post_init(self, payload: dict[str, Any]) -> bool:
        if not self.enabled:
            return False
        body = json.dumps(payload, separators=(",", ":")).encode()
        return self._post("/v1/runs", body)

    def post_finish(self, run_id: str, payload: dict[str, Any]) -> bool:
        if not self.enabled:
            return False
        body = json.dumps(payload, separators=(",", ":")).encode()
        return self._post(f"/v1/runs/{run_id}/finish", body)
