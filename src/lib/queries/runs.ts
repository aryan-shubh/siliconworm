import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../db";
import { runs, runMetrics, projects, users } from "../schema";

export type Run = {
  id: string;
  projectSlug: string;
  name: string;
  user: string;
  status: "running" | "finished" | "failed" | "crashed" | "queued" | "killed";
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

const METRIC_NAMES = [
  "train_loss",
  "val_loss",
  "accuracy",
  "grad_norm",
  "lr",
  "gpu_util",
];

async function metricsForRun(
  runId: string,
): Promise<{ name: string; data: number[] }[]> {
  const db = getDb();
  const rows = await db
    .select({ name: runMetrics.name, step: runMetrics.step, value: runMetrics.value })
    .from(runMetrics)
    .where(eq(runMetrics.runId, runId))
    .orderBy(asc(runMetrics.name), asc(runMetrics.step));
  const byName = new Map<string, number[]>();
  for (const name of METRIC_NAMES) byName.set(name, []);
  for (const r of rows) {
    if (!byName.has(r.name)) byName.set(r.name, []);
    byName.get(r.name)!.push(r.value);
  }
  return METRIC_NAMES.map((name) => ({ name, data: byName.get(name) ?? [] }));
}

async function metricsForRuns(
  runIds: string[],
): Promise<Map<string, { name: string; data: number[] }[]>> {
  const out = new Map<string, { name: string; data: number[] }[]>();
  if (runIds.length === 0) return out;
  const db = getDb();
  const rows = await db
    .select({
      runId: runMetrics.runId,
      name: runMetrics.name,
      step: runMetrics.step,
      value: runMetrics.value,
    })
    .from(runMetrics)
    .where(inArray(runMetrics.runId, runIds))
    .orderBy(asc(runMetrics.runId), asc(runMetrics.name), asc(runMetrics.step));

  // Pre-seed each run with the full METRIC_NAMES skeleton.
  for (const id of runIds) {
    out.set(id, METRIC_NAMES.map((name) => ({ name, data: [] as number[] })));
  }
  // Group by runId+name, preserving step order from ORDER BY.
  for (const r of rows) {
    const series = out.get(r.runId);
    if (!series) continue;
    let bucket = series.find((s) => s.name === r.name);
    if (!bucket) {
      bucket = { name: r.name, data: [] };
      series.push(bucket);
    }
    bucket.data.push(r.value);
  }
  return out;
}

async function projectIdForSlug(slug: string): Promise<string | null> {
  const db = getDb();
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.slug, slug));
  return row?.id ?? null;
}

export async function listRunsForProject(
  projectSlug: string,
  opts?: { limit?: number },
): Promise<Run[]> {
  const db = getDb();
  const limit = opts?.limit ?? 80;
  const projectId = await projectIdForSlug(projectSlug);
  if (!projectId) return [];
  const rows = await db
    .select({
      run: runs,
      user: { name: users.name, email: users.email },
    })
    .from(runs)
    .leftJoin(users, eq(runs.userId, users.id))
    .where(eq(runs.projectId, projectId))
    .orderBy(desc(runs.startedAt))
    .limit(limit);

  const metricsMap = await metricsForRuns(rows.map((r) => r.run.id));

  return rows.map((row) => {
    const r = row.run;
    return {
      id: r.id,
      projectSlug,
      name: r.displayName,
      user: row.user?.name ?? row.user?.email ?? "unknown",
      status: r.status,
      group: r.group,
      startedAt: r.startedAt.toISOString(),
      durationS: (r.durationMs ?? 0) / 1000,
      tags: r.tags,
      config: r.config as Run["config"],
      summary: r.summary as Run["summary"],
      metrics: metricsMap.get(r.id) ?? METRIC_NAMES.map((name) => ({ name, data: [] })),
      arch: (r.systemInfo as { arch?: string }).arch ?? "—",
      gpu: (r.systemInfo as { gpu?: string }).gpu ?? "—",
    };
  });
}

export async function getRunById(
  projectSlug: string,
  runId: string,
): Promise<Run | null> {
  const db = getDb();
  const projectId = await projectIdForSlug(projectSlug);
  if (!projectId) return null;
  const [row] = await db
    .select({
      run: runs,
      user: { name: users.name, email: users.email },
    })
    .from(runs)
    .leftJoin(users, eq(runs.userId, users.id))
    .where(and(eq(runs.id, runId), eq(runs.projectId, projectId)));
  if (!row) return null;
  const r = row.run;
  return {
    id: r.id,
    projectSlug,
    name: r.displayName,
    user: row.user?.name ?? row.user?.email ?? "unknown",
    status: r.status,
    group: r.group,
    startedAt: r.startedAt.toISOString(),
    durationS: (r.durationMs ?? 0) / 1000,
    tags: r.tags,
    config: r.config as Run["config"],
    summary: r.summary as Run["summary"],
    metrics: await metricsForRun(r.id),
    arch: (r.systemInfo as { arch?: string }).arch ?? "—",
    gpu: (r.systemInfo as { gpu?: string }).gpu ?? "—",
  };
}

export async function getRunMetrics(
  runId: string,
  metricName: string,
): Promise<number[]> {
  const db = getDb();
  const rows = await db
    .select({ value: runMetrics.value })
    .from(runMetrics)
    .where(and(eq(runMetrics.runId, runId), eq(runMetrics.name, metricName)))
    .orderBy(asc(runMetrics.step));
  return rows.map((r) => r.value);
}
