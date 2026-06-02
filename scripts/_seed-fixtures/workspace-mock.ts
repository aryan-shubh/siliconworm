/**
 * Mock data for the workspace pages — artifacts, sweeps, alerts.
 * Deterministic, indexed by name so the UI is stable across refreshes.
 */

import { PROJECTS } from "./mock";

/* ───────────────────────── artifacts ───────────────────────── */

export type ArtifactType = "model" | "dataset" | "code" | "result";

export type MockArtifact = {
  id: string;
  projectSlug: string;
  name: string;
  type: ArtifactType;
  latestVersion: number;
  versionCount: number;
  sizeBytes: number;
  sha256: string;
  sourceRunId: string;
  sourceRunName: string;
  createdAt: string;
  downloads: number;
};

const _PROJ = (i: number) =>
  PROJECTS[i % PROJECTS.length]?.slug ?? "viscount-lm";

export const ARTIFACTS: MockArtifact[] = [
  {
    id: "a_01",
    projectSlug: "viscount-lm",
    name: "viscount-1.4b-step-220k",
    type: "model",
    latestVersion: 7,
    versionCount: 7,
    sizeBytes: 5_613_000_000,
    sha256: "0x4f2a91be33…",
    sourceRunId: "r_viscount-lm_0000",
    sourceRunName: "wise-sweep-042",
    createdAt: "2026-06-03T08:14:00Z",
    downloads: 1488,
  },
  {
    id: "a_02",
    projectSlug: "viscount-lm",
    name: "fineweb-edu-2T-shard-014",
    type: "dataset",
    latestVersion: 2,
    versionCount: 2,
    sizeBytes: 18_400_000_000,
    sha256: "0x6c12aa01…",
    sourceRunId: "r_viscount-lm_0007",
    sourceRunName: "amber-yak-117",
    createdAt: "2026-05-28T19:42:00Z",
    downloads: 84,
  },
  {
    id: "a_03",
    projectSlug: "mnist-mlp",
    name: "mnist-mlp-256-128",
    type: "model",
    latestVersion: 1,
    versionCount: 1,
    sizeBytes: 1_810_000,
    sha256: "0xb44a82c1…",
    sourceRunId: "demo-run-1",
    sourceRunName: "demo-run-1",
    createdAt: "2026-06-02T18:11:04Z",
    downloads: 3,
  },
  {
    id: "a_04",
    projectSlug: "retina-seg",
    name: "oct-unet-attn-best",
    type: "model",
    latestVersion: 12,
    versionCount: 12,
    sizeBytes: 840_000_000,
    sha256: "0xdd9c0210…",
    sourceRunId: "r_retina-seg_0003",
    sourceRunName: "iron-comet-008",
    createdAt: "2026-06-02T11:30:00Z",
    downloads: 217,
  },
  {
    id: "a_05",
    projectSlug: "retina-seg",
    name: "oct-shanghai-2024",
    type: "dataset",
    latestVersion: 3,
    versionCount: 3,
    sizeBytes: 41_000_000_000,
    sha256: "0x9871fa44…",
    sourceRunId: "r_retina-seg_0001",
    sourceRunName: "feral-magnet-301",
    createdAt: "2026-05-19T08:00:00Z",
    downloads: 12,
  },
  {
    id: "a_06",
    projectSlug: "halcyon-rl",
    name: "halcyon-iql-checkpoint",
    type: "model",
    latestVersion: 23,
    versionCount: 23,
    sizeBytes: 310_000_000,
    sha256: "0xa10c33aa…",
    sourceRunId: "r_halcyon-rl_0011",
    sourceRunName: "lucent-fjord-220",
    createdAt: "2026-06-03T07:46:00Z",
    downloads: 91,
  },
  {
    id: "a_07",
    projectSlug: "halcyon-rl",
    name: "robosuite-1.5m-traj",
    type: "dataset",
    latestVersion: 4,
    versionCount: 4,
    sizeBytes: 12_900_000_000,
    sha256: "0x55bbe911…",
    sourceRunId: "r_halcyon-rl_0030",
    sourceRunName: "obsidian-kite-77",
    createdAt: "2026-05-22T12:00:00Z",
    downloads: 30,
  },
  {
    id: "a_08",
    projectSlug: "thrush-asr",
    name: "conformer-m-asr-en-de-fr",
    type: "model",
    latestVersion: 9,
    versionCount: 9,
    sizeBytes: 1_240_000_000,
    sha256: "0x71f30a3a…",
    sourceRunId: "r_thrush-asr_0001",
    sourceRunName: "candle-hare-019",
    createdAt: "2026-05-31T15:32:00Z",
    downloads: 402,
  },
  {
    id: "a_09",
    projectSlug: "thrush-asr",
    name: "common-voice-19-mixed",
    type: "dataset",
    latestVersion: 1,
    versionCount: 1,
    sizeBytes: 22_700_000_000,
    sha256: "0xee7b049a…",
    sourceRunId: "r_thrush-asr_0014",
    sourceRunName: "saffron-knot-441",
    createdAt: "2026-04-12T08:00:00Z",
    downloads: 5,
  },
  {
    id: "a_10",
    projectSlug: "obsidian-diffusion",
    name: "obsidian-flow-dit-xl-512",
    type: "model",
    latestVersion: 4,
    versionCount: 4,
    sizeBytes: 4_900_000_000,
    sha256: "0x33ac0f72…",
    sourceRunId: "r_obsidian-diffusion_0000",
    sourceRunName: "tidal-thicket-12",
    createdAt: "2026-06-03T10:02:00Z",
    downloads: 168,
  },
  {
    id: "a_11",
    projectSlug: "obsidian-diffusion",
    name: "eval-coco-30k-fid",
    type: "result",
    latestVersion: 6,
    versionCount: 6,
    sizeBytes: 184_000,
    sha256: "0x0a994411…",
    sourceRunId: "r_obsidian-diffusion_0002",
    sourceRunName: "noble-orbit-200",
    createdAt: "2026-06-03T09:00:00Z",
    downloads: 22,
  },
  {
    id: "a_12",
    projectSlug: "viscount-lm",
    name: "train-code-snapshot",
    type: "code",
    latestVersion: 41,
    versionCount: 41,
    sizeBytes: 11_400_000,
    sha256: "0x6a7c4e3a…",
    sourceRunId: "r_viscount-lm_0000",
    sourceRunName: "wise-sweep-042",
    createdAt: "2026-06-03T09:14:00Z",
    downloads: 0,
  },
  {
    id: "a_13",
    projectSlug: "ledger-forecast",
    name: "patchtst-base-finetune",
    type: "model",
    latestVersion: 2,
    versionCount: 2,
    sizeBytes: 140_000_000,
    sha256: "0x82fa0b71…",
    sourceRunId: "r_ledger-forecast_0000",
    sourceRunName: "polar-vellum-09",
    createdAt: "2026-05-28T09:00:00Z",
    downloads: 8,
  },
  {
    id: "a_14",
    projectSlug: "halcyon-rl",
    name: "policy-eval-mse-sweep",
    type: "result",
    latestVersion: 18,
    versionCount: 18,
    sizeBytes: 44_000,
    sha256: "0xff014411…",
    sourceRunId: "r_halcyon-rl_0020",
    sourceRunName: "umbra-cinder-11",
    createdAt: "2026-06-03T05:00:00Z",
    downloads: 41,
  },
];

/* ───────────────────────── sweeps ───────────────────────── */

export type SweepStatus = "running" | "finished" | "queued" | "paused";

export type MockSweep = {
  id: string;
  slug: string;
  projectSlug: string;
  name: string;
  method: "bayes" | "grid" | "random" | "hyperband";
  status: SweepStatus;
  trialsRun: number;
  trialsTotal: number;
  activeWorkers: number;
  startedAt: string;
  bestMetricName: string;
  bestMetricValue: number;
  bestRunName: string;
  bestRunId: string;
  /** Best-so-far per trial — drives the convergence sparkline. */
  bestSoFar: number[];
  bestConfig: Record<string, string | number>;
  /** "minimize" or "maximize". */
  objective: "min" | "max";
};

function convergence(
  seed: number,
  n: number,
  start: number,
  end: number,
): number[] {
  let r = seed;
  const rng = () => {
    r = (r * 1664525 + 1013904223) >>> 0;
    return r / 0xffffffff;
  };
  const out: number[] = [];
  let best = start;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const target = start + (end - start) * (1 - Math.exp(-3.5 * t));
    const noisy = target + (rng() - 0.5) * Math.abs(end - start) * 0.18;
    best = end < start ? Math.min(best, noisy) : Math.max(best, noisy);
    out.push(best);
  }
  return out;
}

export const SWEEPS: MockSweep[] = [
  {
    id: "sw_01",
    slug: "viscount-lr-bayes",
    projectSlug: "viscount-lm",
    name: "lr × warmup (bayes)",
    method: "bayes",
    status: "running",
    trialsRun: 64,
    trialsTotal: 128,
    activeWorkers: 6,
    startedAt: "2026-06-02T22:40:00Z",
    bestMetricName: "val_loss",
    bestMetricValue: 1.842,
    objective: "min",
    bestRunName: "wise-sweep-042",
    bestRunId: "r_viscount-lm_0000",
    bestSoFar: convergence(11, 64, 2.91, 1.84),
    bestConfig: {
      lr: 2.3e-4,
      warmup: 1800,
      batch_size: 1024,
      optimizer: "muon",
    },
  },
  {
    id: "sw_02",
    slug: "retina-aug-grid",
    projectSlug: "retina-seg",
    name: "augmentation × dropout (grid)",
    method: "grid",
    status: "running",
    trialsRun: 28,
    trialsTotal: 36,
    activeWorkers: 1,
    startedAt: "2026-06-03T03:12:00Z",
    bestMetricName: "dice",
    bestMetricValue: 0.918,
    objective: "max",
    bestRunName: "iron-comet-008",
    bestRunId: "r_retina-seg_0003",
    bestSoFar: convergence(7, 28, 0.74, 0.918),
    bestConfig: { aug: "elastic+intensity", dropout: 0.12, lr: 1e-4 },
  },
  {
    id: "sw_03",
    slug: "halcyon-policy-bayes",
    projectSlug: "halcyon-rl",
    name: "policy depth × tau (bayes)",
    method: "bayes",
    status: "finished",
    trialsRun: 96,
    trialsTotal: 96,
    activeWorkers: 0,
    startedAt: "2026-05-30T17:00:00Z",
    bestMetricName: "return",
    bestMetricValue: 612.4,
    objective: "max",
    bestRunName: "lucent-fjord-220",
    bestRunId: "r_halcyon-rl_0011",
    bestSoFar: convergence(13, 96, 184, 612),
    bestConfig: { policy_depth: 6, tau: 0.005, lr: 5e-4, batch_size: 256 },
  },
  {
    id: "sw_04",
    slug: "thrush-vocab-random",
    projectSlug: "thrush-asr",
    name: "vocab × subword (random)",
    method: "random",
    status: "queued",
    trialsRun: 0,
    trialsTotal: 48,
    activeWorkers: 0,
    startedAt: "2026-06-04T00:00:00Z",
    bestMetricName: "wer",
    bestMetricValue: 0,
    objective: "min",
    bestRunName: "—",
    bestRunId: "",
    bestSoFar: [],
    bestConfig: {},
  },
  {
    id: "sw_05",
    slug: "obsidian-cfg-hyperband",
    projectSlug: "obsidian-diffusion",
    name: "cfg-scale × steps (hyperband)",
    method: "hyperband",
    status: "paused",
    trialsRun: 41,
    trialsTotal: 64,
    activeWorkers: 0,
    startedAt: "2026-06-01T19:00:00Z",
    bestMetricName: "fid",
    bestMetricValue: 7.42,
    objective: "min",
    bestRunName: "tidal-thicket-12",
    bestRunId: "r_obsidian-diffusion_0000",
    bestSoFar: convergence(19, 41, 18.7, 7.42),
    bestConfig: { cfg_scale: 5.2, steps: 28, scheduler: "euler-a" },
  },
];

/* ───────────────────────── alerts ───────────────────────── */

export type AlertSeverity = "info" | "warn" | "critical";
export type AlertChannel = "email" | "slack" | "pagerduty" | "webhook";

export type AlertRule = {
  id: string;
  name: string;
  description: string;
  scope: "global" | string; // project slug
  metric: string;
  condition: string; // human-readable
  severity: AlertSeverity;
  channels: AlertChannel[];
  enabled: boolean;
  triggeredCount: number;
  lastTriggered: string | null;
  createdBy: string;
};

export const ALERT_RULES: AlertRule[] = [
  {
    id: "ar_01",
    name: "Train loss diverged",
    description: "Train loss > 5× moving average over the last 200 steps",
    scope: "global",
    metric: "train_loss",
    condition: "train_loss > 5 × mavg(200)",
    severity: "critical",
    channels: ["slack", "pagerduty"],
    enabled: true,
    triggeredCount: 4,
    lastTriggered: "2026-06-03T07:14:00Z",
    createdBy: "aryan",
  },
  {
    id: "ar_02",
    name: "Validation accuracy regression",
    description:
      "val_accuracy drops > 1.5% from the rolling best of the last 12h",
    scope: "viscount-lm",
    metric: "val_accuracy",
    condition: "val_accuracy − rolling_max(12h) < −0.015",
    severity: "warn",
    channels: ["slack"],
    enabled: true,
    triggeredCount: 11,
    lastTriggered: "2026-06-03T02:48:00Z",
    createdBy: "kai",
  },
  {
    id: "ar_03",
    name: "GPU utilisation collapsed",
    description:
      "Sustained gpu_util < 30% for 5 minutes while run.status = running",
    scope: "global",
    metric: "gpu_util",
    condition: "avg(gpu_util, 5m) < 30 AND status = 'running'",
    severity: "warn",
    channels: ["slack", "webhook"],
    enabled: true,
    triggeredCount: 27,
    lastTriggered: "2026-06-03T08:01:00Z",
    createdBy: "siva",
  },
  {
    id: "ar_04",
    name: "Run crashed",
    description:
      "Any run transitions to status = crashed (OOM, segfault, host died)",
    scope: "global",
    metric: "status",
    condition: "status changed to 'crashed'",
    severity: "critical",
    channels: ["pagerduty", "email"],
    enabled: true,
    triggeredCount: 2,
    lastTriggered: "2026-06-02T19:33:00Z",
    createdBy: "aryan",
  },
  {
    id: "ar_05",
    name: "Cost burn rate exceeded",
    description: "Hourly compute cost projected to exceed budget by > 25%",
    scope: "global",
    metric: "_cost_per_hour",
    condition: "cost_burn_rate(1h) > budget × 1.25",
    severity: "info",
    channels: ["email"],
    enabled: true,
    triggeredCount: 1,
    lastTriggered: "2026-05-31T11:20:00Z",
    createdBy: "nori",
  },
  {
    id: "ar_06",
    name: "Artifact size anomaly",
    description:
      "Checkpoint > 2× the median checkpoint size for the same artifact name",
    scope: "global",
    metric: "artifact.size",
    condition: "size > 2 × median(size for name)",
    severity: "info",
    channels: ["slack"],
    enabled: false,
    triggeredCount: 0,
    lastTriggered: null,
    createdBy: "fenwick",
  },
];

export type AlertEvent = {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  projectSlug: string;
  runName: string;
  runId: string;
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
  acknowledgedBy: string | null;
};

export const ALERT_EVENTS: AlertEvent[] = [
  {
    id: "ae_01",
    ruleId: "ar_03",
    ruleName: "GPU utilisation collapsed",
    severity: "warn",
    projectSlug: "viscount-lm",
    runName: "feral-magnet-301",
    runId: "r_viscount-lm_0009",
    message: "gpu_util averaged 11.4% for 6m13s — likely dataloader stall",
    triggeredAt: "2026-06-03T08:01:00Z",
    acknowledged: false,
    acknowledgedBy: null,
  },
  {
    id: "ae_02",
    ruleId: "ar_01",
    ruleName: "Train loss diverged",
    severity: "critical",
    projectSlug: "halcyon-rl",
    runName: "umbra-cinder-11",
    runId: "r_halcyon-rl_0020",
    message:
      "train_loss spiked from 0.42 → 3.81 in 80 steps after lr warmup ended",
    triggeredAt: "2026-06-03T07:14:00Z",
    acknowledged: true,
    acknowledgedBy: "siva",
  },
  {
    id: "ae_03",
    ruleId: "ar_02",
    ruleName: "Validation accuracy regression",
    severity: "warn",
    projectSlug: "viscount-lm",
    runName: "amber-yak-117",
    runId: "r_viscount-lm_0001",
    message: "val_accuracy fell 2.1% (0.912 → 0.891) vs 12h rolling best",
    triggeredAt: "2026-06-03T02:48:00Z",
    acknowledged: true,
    acknowledgedBy: "kai",
  },
  {
    id: "ae_04",
    ruleId: "ar_03",
    ruleName: "GPU utilisation collapsed",
    severity: "warn",
    projectSlug: "retina-seg",
    runName: "iron-comet-008",
    runId: "r_retina-seg_0003",
    message: "gpu_util averaged 26.7% for 5m04s — eval running every step",
    triggeredAt: "2026-06-02T22:30:00Z",
    acknowledged: true,
    acknowledgedBy: "aryan",
  },
  {
    id: "ae_05",
    ruleId: "ar_04",
    ruleName: "Run crashed",
    severity: "critical",
    projectSlug: "obsidian-diffusion",
    runName: "noble-orbit-200",
    runId: "r_obsidian-diffusion_0002",
    message:
      "OOM during checkpoint save on rank 3 (78.4 GB requested, 80 GB cap)",
    triggeredAt: "2026-06-02T19:33:00Z",
    acknowledged: true,
    acknowledgedBy: "fenwick",
  },
  {
    id: "ae_06",
    ruleId: "ar_01",
    ruleName: "Train loss diverged",
    severity: "critical",
    projectSlug: "thrush-asr",
    runName: "candle-hare-019",
    runId: "r_thrush-asr_0001",
    message: "loss spike at step 47k — likely label flip in shard 14",
    triggeredAt: "2026-06-02T14:11:00Z",
    acknowledged: true,
    acknowledgedBy: "kai",
  },
  {
    id: "ae_07",
    ruleId: "ar_05",
    ruleName: "Cost burn rate exceeded",
    severity: "info",
    projectSlug: "viscount-lm",
    runName: "—",
    runId: "",
    message: "projected hourly burn $5,140 vs budget $4,100 (+25.4%)",
    triggeredAt: "2026-05-31T11:20:00Z",
    acknowledged: true,
    acknowledgedBy: "nori",
  },
];

/* ───────────────────────── helpers ───────────────────────── */

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${
    v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)
  } ${units[i]}`;
}

export function projectName(slug: string): string {
  return PROJECTS.find((p) => p.slug === slug)?.name ?? slug;
}
