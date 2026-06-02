import { runsForProject, getRun } from "../mock";
import type { MockRun } from "../mock";

export type Run = MockRun;

export async function listRunsForProject(
  projectSlug: string,
  opts?: { limit?: number },
): Promise<Run[]> {
  const limit = opts?.limit ?? 80;
  return runsForProject(projectSlug, limit);
}

export async function getRunById(
  projectSlug: string,
  runId: string,
): Promise<Run | null> {
  return getRun(projectSlug, runId);
}

export async function getRunMetrics(
  runId: string,
  metricName: string,
): Promise<number[]> {
  // Phase A: pull from the mock's nested metrics array. Phase B replaces
  // this with a SELECT against the runMetrics table.
  // We don't have projectSlug here, so scan known projects' demo run.
  // For the only call site (Phase C live-demo with DEMO_RUN_ID), the demo
  // run lives under "mnist-mlp"; mock.runsForProject special-cases it.
  if (runId === "demo-run-1") {
    const demo = (await import("../mock")).runsForProject("mnist-mlp", 1)[0];
    return demo?.metrics.find((m) => m.name === metricName)?.data ?? [];
  }
  return [];
}
