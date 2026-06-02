# silkworm — Python SDK

The official client for the [Silkworm](https://github.com/aryan-shubh/silkworm)
experiment tracker. Drop-in for `wandb`-style code, but stays local-first:
metrics are always written to `~/.silkworm/runs/<id>/` and only optionally
shipped to a remote ingest endpoint.

## Install

```bash
pip install silkworm                # core, zero deps
pip install silkworm[torch]         # adds torch tensor coercion
```

(Source install: `pip install -e .` from this folder.)

## 30-second tour

```python
import silkworm as sw

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
lives at `~/.silkworm/runs/<id>/`:

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

## Optional: ship to a Silkworm server

If `SILKWORM_API_URL` is set, every batch is POSTed to:

```
POST  <SILKWORM_API_URL>/v1/runs                       # init payload
POST  <SILKWORM_API_URL>/v1/runs/<id>/metrics          # ndjson batch
POST  <SILKWORM_API_URL>/v1/runs/<id>/summary          # full summary
POST  <SILKWORM_API_URL>/v1/runs/<id>/finish           # end-of-run
```

Auth via `SILKWORM_API_KEY` → `Authorization: Bearer …`. Failures are
swallowed after a couple of retries — the local jsonl is always the source
of truth, so a flaky network never loses a step.

## API surface

```python
run = silkworm.init(
    project="…",          # required
    name=None,            # auto-generated "wise-yak-042" if omitted
    config={…},           # any JSON-serialisable hyperparameters
    tags=[…],
    group=None,
    notes=None,
    job_type=None,
    dir=None,             # override base output dir
    api_url=None,         # else read from SILKWORM_API_URL
    api_key=None,         # else read from SILKWORM_API_KEY
)

run.log({"metric": value, …}, step=None)   # step auto-increments if None
run.summary["final_acc"] = 0.987           # writes summary.json eagerly
run.finish(exit_code=0)
```

The bare module also exposes `silkworm.log(...)` / `silkworm.finish()` that
dispatch to the most recent `init()` — handy when threading a run object
through your code is awkward.

### Tensor / numpy coercion

`run.log({"loss": tensor})` does the right thing — 0-d torch tensors become
`tensor.item()`, vectors become `.mean().item()`. Same for numpy scalars.
No need to call `.item()` yourself.

### Context manager

```python
with silkworm.init(project="foo") as run:
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

Alpha. The wire protocol may change before 0.2; pin `silkworm==0.1.*`.

## License

MIT.
