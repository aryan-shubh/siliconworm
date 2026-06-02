# siliconworm — Python SDK

[![PyPI version](https://img.shields.io/pypi/v/siliconworm.svg)](https://pypi.org/project/siliconworm/)
[![Python versions](https://img.shields.io/pypi/pyversions/siliconworm.svg)](https://pypi.org/project/siliconworm/)
[![CI](https://github.com/aryan-shubh/siliconworm/actions/workflows/ci-python.yml/badge.svg)](https://github.com/aryan-shubh/siliconworm/actions/workflows/ci-python.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The official client for the [Siliconworm](https://github.com/aryan-shubh/siliconworm)
experiment tracker. Drop-in for `wandb`-style code, but stays local-first:
metrics are always written to `~/.siliconworm/runs/<id>/` and only optionally
shipped to a remote ingest endpoint.

## Install

```bash
pip install siliconworm                # core, zero required deps
pip install "siliconworm[torch]"       # adds torch tensor auto-coercion
pip install "siliconworm[numpy]"       # adds numpy scalar auto-coercion
```

Source install:

```bash
git clone https://github.com/aryan-shubh/siliconworm
cd siliconworm/sdk/python
pip install -e .
```

## 30-second tour

```python
import siliconworm as sw

run = sw.init(
    project="viscount-lm",
    config={"lr": 3e-4, "batch_size": 512, "optimizer": "muon"},
)

for step, batch in enumerate(loader):
    loss = model.step(batch)
    run.log({"train_loss": loss, "lr": sched.lr}, step=step)

run.summary["final_acc"] = acc
run.finish()
```

That's it. No login, no project setup, no dashboard required. The run record
lives at `~/.siliconworm/runs/<id>/`:

```
metrics.jsonl   # one JSON object per .log() call
summary.json    # final aggregates + run metadata
config.json     # hyperparameters as passed to init()
system.json    # host, python, git, gpu snapshot
```

## What's captured automatically

On `init()` the SDK snapshots:

- **git** — current sha, branch, dirty flag, remote
- **python** — version, executable, implementation
- **host** — user, hostname, OS
- **process** — argv, cwd, pid
- **gpu** — if `torch.cuda.is_available()`, each device's name, compute
  capability, total memory, CUDA + torch versions

This goes to `system.json` once at start. Nothing is sent over the network
unless you opt in.

## Optional: ship to a Siliconworm server

If `SILICONWORM_API_URL` is set, every batch is POSTed to:

```
POST  <SILICONWORM_API_URL>/v1/runs                       # init payload
POST  <SILICONWORM_API_URL>/v1/runs/<id>/metrics          # ndjson batch
POST  <SILICONWORM_API_URL>/v1/runs/<id>/summary          # full summary
POST  <SILICONWORM_API_URL>/v1/runs/<id>/finish           # end-of-run
```

Auth via `SILICONWORM_API_KEY` → `Authorization: Bearer …`. Failures are
swallowed after a couple of retries — the local jsonl is always the source
of truth, so a flaky network never loses a step.

## API surface

```python
run = siliconworm.init(
    project="…",          # required
    name=None,            # auto-generated "wise-yak-042" if omitted
    config={…},           # any JSON-serialisable hyperparameters
    tags=[…],
    group=None,
    notes=None,
    job_type=None,
    dir=None,             # override base output dir
    api_url=None,         # else read from SILICONWORM_API_URL
    api_key=None,         # else read from SILICONWORM_API_KEY
)

run.log({"metric": value, …}, step=None)   # step auto-increments if None
run.summary["final_acc"] = 0.987           # writes summary.json eagerly
run.finish(exit_code=0)
```

The bare module also exposes `siliconworm.log(...)` / `siliconworm.finish()` that
dispatch to the most recent `init()` — handy when threading a run object
through your code is awkward.

### Tensor / numpy coercion

`run.log({"loss": tensor})` does the right thing — 0-d torch tensors become
`tensor.item()`, vectors become `.mean().item()`. Same for numpy scalars.
No need to call `.item()` yourself.

### Context manager

```python
with siliconworm.init(project="foo") as run:
    for step in range(N):
        run.log({"loss": loss}, step=step)
# finish() is called automatically; exceptions are recorded as summary._error.
```

## Examples

- [`examples/quickstart.py`](examples/quickstart.py) — fake training loop, no
  dependencies beyond the SDK
- [`examples/mnist.py`](examples/mnist.py) — real MNIST + MLP using torch,
  same spec as `_training/train.py` in the repo

## Status

Alpha. The wire protocol may change before 0.2; pin `siliconworm==0.1.*` if
you depend on it.

## Releasing (maintainers)

Releases are pushed to PyPI by a GitHub Actions workflow using **PyPI
Trusted Publishing** — no API tokens stored anywhere.

**One-time setup**, on [pypi.org/manage/account/publishing](https://pypi.org/manage/account/publishing/):

- Owner: `aryan-shubh`
- Repository name: `siliconworm`
- Workflow name: `publish-python.yml`
- Environment name: `pypi` (and a second publisher for `testpypi`)

Then, for each release:

1. Bump `siliconworm/version.py` and add a section to `CHANGELOG.md`.
2. Open a PR. CI will build + `twine check` the artifacts.
3. After merge, draft a GitHub release with tag `sdk-python-vX.Y.Z`
   (e.g. `sdk-python-v0.1.0`). Publishing the release triggers
   `.github/workflows/publish-python.yml`, which builds the sdist + wheel
   and uploads to PyPI via OIDC.

You can also dry-run against TestPyPI manually from the Actions tab
(`Publish Python SDK` → `Run workflow` → `target: testpypi`).

## License

MIT. See [LICENSE](LICENSE).
