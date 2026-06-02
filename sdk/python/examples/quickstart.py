"""Fake training loop — useful for verifying the SDK without installing torch.

Run with::

    python examples/quickstart.py

Then inspect ~/.silkworm/runs/<id>/{metrics.jsonl,summary.json,config.json}.
"""

from __future__ import annotations

import math
import random
import time

import silkworm as sw


def main() -> None:
    run = sw.init(
        project="quickstart",
        config={
            "lr": 3e-4,
            "batch_size": 128,
            "optimizer": "adamw",
            "model": "tiny-transformer",
        },
        tags=["quickstart", "no-gpu"],
    )

    print(f"started → {run.url}")
    print(f"writing to {run.dir}")

    rng = random.Random(42)
    loss = 3.2
    for step in range(200):
        loss = max(0.18, loss * (0.985 + rng.random() * 0.01) + rng.gauss(0, 0.06))
        grad_norm = abs(math.sin(step / 11)) * 0.7 + 0.3 + rng.random() * 0.2
        run.log(
            {
                "train_loss": loss,
                "grad_norm": grad_norm,
                "lr": 3e-4,
            },
            step=step,
        )
        if step and step % 50 == 0:
            run.log(
                {"val_loss": loss + 0.06 + rng.random() * 0.04, "accuracy": 1 - loss * 0.3},
                step=step,
            )
        time.sleep(0.005)  # pretend a step takes real time

    run.summary["final_train_loss"] = loss
    run.summary["final_accuracy"] = 0.964
    run.finish()
    print(f"done → metrics.jsonl has {sum(1 for _ in open(run.dir / 'metrics.jsonl'))} lines")


if __name__ == "__main__":
    main()
