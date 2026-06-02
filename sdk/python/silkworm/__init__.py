"""Silkworm — research-grade experiment tracking.

Quickstart::

    import silkworm as sw

    run = sw.init(project="viscount-lm", config={"lr": 3e-4, "batch_size": 512})

    for step, batch in enumerate(loader):
        loss = model.step(batch)
        run.log({"train_loss": loss}, step=step)

    run.summary.update({"final_acc": acc})
    run.finish()

The SDK always writes a complete record of the run to
``~/.silkworm/runs/<run-id>/`` — ``metrics.jsonl``, ``summary.json``,
``config.json``, ``system.json``. If the environment variable
``SILKWORM_API_URL`` is set, batches are also POSTed to the ingest endpoint;
otherwise the SDK is fully local-only and stays out of the network path.
"""

from .run import Run, finish, init, log
from .version import __version__

__all__ = ["Run", "__version__", "finish", "init", "log"]
