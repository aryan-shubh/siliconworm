/**
 * Deterministic mock data so SSR + client render the same thing.
 * Most projects/runs are synthetic — the one exception is `mnist-mlp /
 * demo-run-1`, which is real metrics captured by `_training/train.py`.
 */

import { DEMO_RUN, DEMO_SUMMARY } from "./demo-run";

type Status = "running" | "finished" | "failed" | "crashed" | "queued";

export type MockProject = {
  id: string;
  slug: string;
  name: string;
  description: string;
  framework: string;
  runCount: number;
  activeCount: number;
  updated: string;
};

export type MockRun = {
  id: string;
  projectSlug: string;
  name: string;
  user: string;
  status: Status;
  group: string | null;
  startedAt: string;
  durationS: number;
  tags: string[];
  config: Record<string, string | number | boolean>;
  summary: {
    train_loss: number;
    val_loss: number;
    accuracy: number;
    lr: number;
  };
  metrics: { name: string; data: number[] }[];
  arch: string;
  gpu: string;
};

// LCG for deterministic pseudo-random
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const ADJ = [
  "wise",
  "brisk",
  "amber",
  "velvet",
  "iron",
  "feral",
  "lucent",
  "noble",
  "tidal",
  "spiral",
  "obsidian",
  "cobalt",
  "muted",
  "hollow",
  "ember",
  "stoic",
  "fern",
  "slate",
  "lyric",
  "crisp",
  "vapor",
  "azure",
  "ashen",
  "thorn",
  "polar",
  "midnight",
  "saffron",
  "umbra",
  "candle",
];
const NOUN = [
  "sweep",
  "yak",
  "comet",
  "drift",
  "fern",
  "owl",
  "kite",
  "harbor",
  "lichen",
  "magnet",
  "ridge",
  "orbit",
  "ember",
  "fjord",
  "hare",
  "spruce",
  "willow",
  "totem",
  "delta",
  "thicket",
  "amber",
  "knot",
  "tundra",
  "cinder",
  "moth",
  "vellum",
  "quarry",
];

export const PROJECTS: MockProject[] = [
  {
    id: "p_demo",
    slug: "mnist-mlp",
    name: "MNIST-MLP",
    description: `Real MLP trained on MNIST · ${DEMO_SUMMARY.epochs} epochs, ${DEMO_SUMMARY.optimizer}, lr=${DEMO_SUMMARY.lr}`,
    framework: "PyTorch (CPU)",
    runCount: 1,
    activeCount: DEMO_RUN.status === "running" ? 1 : 0,
    updated: DEMO_RUN.startedAt,
  },
  {
    id: "p_01",
    slug: "viscount-lm",
    name: "Viscount-LM",
    description: "1.4B param decoder-only, FineWeb-edu pretraining",
    framework: "PyTorch 2.5",
    runCount: 247,
    activeCount: 6,
    updated: "2026-06-03T09:14:00Z",
  },
  {
    id: "p_02",
    slug: "retina-seg",
    name: "Retina-Seg",
    description: "OCT layer segmentation, U-Net++ with attention",
    framework: "JAX 0.4",
    runCount: 89,
    activeCount: 1,
    updated: "2026-06-02T22:01:00Z",
  },
  {
    id: "p_03",
    slug: "halcyon-rl",
    name: "Halcyon-RL",
    description: "Offline RL for robotic grasping, IQL baseline",
    framework: "PyTorch 2.5",
    runCount: 412,
    activeCount: 3,
    updated: "2026-06-03T07:46:00Z",
  },
  {
    id: "p_04",
    slug: "thrush-asr",
    name: "Thrush-ASR",
    description: "Streaming Conformer ASR, 8 languages",
    framework: "PyTorch 2.5",
    runCount: 156,
    activeCount: 0,
    updated: "2026-05-31T15:32:00Z",
  },
  {
    id: "p_05",
    slug: "obsidian-diffusion",
    name: "Obsidian-Diffusion",
    description: "Flow-matching text-to-image, 512px",
    framework: "PyTorch 2.5",
    runCount: 74,
    activeCount: 2,
    updated: "2026-06-03T10:02:00Z",
  },
  {
    id: "p_06",
    slug: "ledger-forecast",
    name: "Ledger-Forecast",
    description: "Timeseries foundation model fine-tuning",
    framework: "JAX 0.4",
    runCount: 31,
    activeCount: 0,
    updated: "2026-05-28T09:00:00Z",
  },
];

const TAGS_POOL = [
  "baseline",
  "ablation",
  "lr-search",
  "long-ctx",
  "muon",
  "warm-start",
  "fp8",
  "tp2",
  "ema",
  "schedfree",
];
const ARCHS = [
  "transformer-1.4B",
  "unet++",
  "iql-mlp",
  "conformer-m",
  "dit-xl",
  "patchtst-base",
];
const GPUS = [
  "8× H100 SXM",
  "4× A100 80G",
  "1× H100 PCIe",
  "16× H100 SXM",
  "2× L40S",
];

export function runsForProject(slug: string, count = 60): MockRun[] {
  // The mnist-mlp project shows the real demo run only.
  if (slug === "mnist-mlp") return [DEMO_RUN];

  const r = rng(slug.split("").reduce((a, c) => a + c.charCodeAt(0), 7));
  const out: MockRun[] = [];
  for (let i = 0; i < count; i++) {
    const a = ADJ[Math.floor(r() * ADJ.length)];
    const n = NOUN[Math.floor(r() * NOUN.length)];
    const num = Math.floor(r() * 999);
    const name = `${a}-${n}-${num}`;
    const statusRoll = r();
    const status: Status =
      statusRoll < 0.08
        ? "running"
        : statusRoll < 0.14
          ? "failed"
          : statusRoll < 0.16
            ? "crashed"
            : statusRoll < 0.18
              ? "queued"
              : "finished";
    const lr = [3e-4, 1e-4, 5e-4, 6e-5, 2e-4][Math.floor(r() * 5)];
    const bs = [128, 256, 512, 1024, 2048][Math.floor(r() * 5)];
    const optimizer = ["adamw", "muon", "schedule-free", "lion"][
      Math.floor(r() * 4)
    ];
    const baseLoss = 2.6 - i * 0.018 + (r() - 0.5) * 0.35;
    const train_loss = Math.max(0.32, baseLoss + (r() - 0.5) * 0.2);
    const val_loss = train_loss + 0.04 + r() * 0.18;
    const accuracy = Math.min(0.998, 0.42 + i * 0.0065 + (r() - 0.5) * 0.05);
    const durationS = Math.floor(60 + r() * 60 * 60 * 12);
    const startedAt = new Date(
      Date.now() - (i + 1) * 1000 * 60 * (5 + r() * 80),
    ).toISOString();
    const tags = Array.from(
      new Set(
        Array.from(
          { length: Math.floor(r() * 3) + 1 },
          () => TAGS_POOL[Math.floor(r() * TAGS_POOL.length)],
        ),
      ),
    );
    const metrics = [
      "train_loss",
      "val_loss",
      "accuracy",
      "grad_norm",
      "lr",
      "gpu_util",
    ].map((mname) => ({ name: mname, data: synthSeries(r, mname, 200) }));
    out.push({
      id: `r_${slug}_${i.toString().padStart(4, "0")}`,
      projectSlug: slug,
      name,
      user: ["aryan", "kai", "nori", "siva", "fenwick"][Math.floor(r() * 5)],
      status,
      group: r() > 0.6 ? `sweep-${Math.floor(r() * 9) + 1}` : null,
      startedAt,
      durationS,
      tags,
      config: {
        lr,
        batch_size: bs,
        optimizer,
        seed: Math.floor(r() * 9999),
        warmup_steps: 1000,
        weight_decay: 0.1,
      },
      summary: { train_loss, val_loss, accuracy, lr },
      metrics,
      arch: ARCHS[Math.floor(r() * ARCHS.length)],
      gpu: GPUS[Math.floor(r() * GPUS.length)],
    });
  }
  return out;
}

function synthSeries(r: () => number, kind: string, len: number): number[] {
  const out: number[] = [];
  if (kind === "train_loss" || kind === "val_loss") {
    let v = 3.2 + r() * 0.6;
    const noise = kind === "val_loss" ? 0.12 : 0.06;
    for (let i = 0; i < len; i++) {
      v *= 0.992 + r() * 0.004;
      out.push(Math.max(0.3, v + (r() - 0.5) * noise));
    }
  } else if (kind === "accuracy") {
    let v = 0.34 + r() * 0.1;
    for (let i = 0; i < len; i++) {
      v += (0.992 - v) * 0.012 + (r() - 0.5) * 0.01;
      out.push(Math.min(0.998, Math.max(0, v)));
    }
  } else if (kind === "grad_norm") {
    for (let i = 0; i < len; i++)
      out.push(0.6 + Math.abs(Math.sin(i / 11)) * 0.7 + r() * 0.3);
  } else if (kind === "lr") {
    for (let i = 0; i < len; i++) {
      const warm = Math.min(1, i / 20);
      const decay = Math.cos((Math.PI / 2) * (i / len)) ** 2;
      out.push(3e-4 * warm * decay);
    }
  } else {
    // gpu_util
    for (let i = 0; i < len; i++)
      out.push(78 + Math.sin(i / 7) * 8 + (r() - 0.5) * 12);
  }
  return out;
}

export function getProject(slug: string) {
  return PROJECTS.find((p) => p.slug === slug) ?? null;
}
export function getRun(slug: string, runId: string) {
  const r = runsForProject(slug, 120).find((x) => x.id === runId);
  return r ?? null;
}

export const CURRENT_USER = {
  name: "Aryan",
  email: "pahwani.aryan@gmail.com",
  initials: "AP",
};
export const CURRENT_ORG = { slug: "anthrop-labs", name: "Anthrop Labs" };
