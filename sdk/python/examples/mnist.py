"""MNIST + small MLP, instrumented with silkworm.

This is the same training spec as `_training/train.py`, ported to use the
SDK instead of writing jsonl by hand. Re-running it produces a new run id;
the dashboard can re-bake demo-run-1 from any such run's metrics.jsonl.

    pip install torch torchvision silkworm
    python examples/mnist.py
"""

from __future__ import annotations

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

import silkworm as sw


class MLP(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.fc1 = nn.Linear(784, 256)
        self.fc2 = nn.Linear(256, 128)
        self.fc3 = nn.Linear(128, 10)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.fc3(x)


def main() -> None:
    torch.manual_seed(42)
    device = "cuda" if torch.cuda.is_available() else "cpu"

    run = sw.init(
        project="mnist-mlp",
        name="demo-run-1",
        config={
            "lr": 3e-4,
            "batch_size": 128,
            "optimizer": "adamw",
            "weight_decay": 0.01,
            "epochs": 3,
            "arch": "MLP-256-128-10",
            "seed": 42,
            "dataset": "MNIST",
        },
        tags=["baseline", "mnist", device],
    )

    tfm = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,)),
    ])
    train_ds = datasets.MNIST("./data", train=True, download=True, transform=tfm)
    test_ds = datasets.MNIST("./data", train=False, download=True, transform=tfm)
    train_dl = DataLoader(train_ds, batch_size=128, shuffle=True)
    test_dl = DataLoader(test_ds, batch_size=512)

    model = MLP().to(device)
    opt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)

    step = 0
    EPOCHS = 3
    for epoch in range(EPOCHS):
        model.train()
        for x, y in train_dl:
            x, y = x.to(device), y.to(device)
            opt.zero_grad()
            logits = model(x)
            loss = F.cross_entropy(logits, y)
            loss.backward()
            grad_norm = sum(
                p.grad.norm().item() ** 2 for p in model.parameters() if p.grad is not None
            ) ** 0.5
            opt.step()
            if step % 5 == 0:
                # silkworm.log() accepts torch tensors directly.
                run.log(
                    {"train_loss": loss, "grad_norm": grad_norm, "lr": 3e-4},
                    step=step,
                )
            step += 1

        # End-of-epoch eval.
        model.eval()
        val_loss, correct, total = 0.0, 0, 0
        with torch.no_grad():
            for x, y in test_dl:
                x, y = x.to(device), y.to(device)
                logits = model(x)
                val_loss += F.cross_entropy(logits, y, reduction="sum").item()
                correct += (logits.argmax(1) == y).sum().item()
                total += y.size(0)
        val_loss /= total
        acc = correct / total
        run.log({"val_loss": val_loss, "accuracy": acc, "epoch": epoch}, step=step)
        print(f"epoch {epoch}: val_loss={val_loss:.4f} acc={acc:.4f}")

    run.summary.update(
        {
            "final_train_loss": loss,
            "final_val_loss": val_loss,
            "final_accuracy": acc,
            "total_steps": step,
        }
    )
    run.finish()


if __name__ == "__main__":
    main()
