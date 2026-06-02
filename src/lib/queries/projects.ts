import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { projects, runs } from "../schema";

export type Project = {
  id: string;
  slug: string;
  name: string;
  description: string;
  framework: string;
  runCount: number;
  activeCount: number;
  updated: string;
};

// Framework is not in the schema (it lives in run.systemInfo.arch loosely),
// so we infer or default. Use a static map for the seeded projects until
// schema gains a column.
const FRAMEWORK_BY_SLUG: Record<string, string> = {
  "mnist-mlp": "PyTorch (CPU)",
  "viscount-lm": "PyTorch 2.5",
  "retina-seg": "JAX 0.4",
  "halcyon-rl": "PyTorch 2.5",
  "thrush-asr": "PyTorch 2.5",
  "obsidian-diffusion": "PyTorch 2.5",
  "ledger-forecast": "JAX 0.4",
};

export async function listProjects(orgId: string): Promise<Project[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      name: projects.name,
      description: projects.description,
    })
    .from(projects)
    .where(eq(projects.orgId, orgId));

  // Per-project counts.
  const result: Project[] = [];
  for (const p of rows) {
    const allRuns = await db
      .select({ status: runs.status, startedAt: runs.startedAt })
      .from(runs)
      .where(eq(runs.projectId, p.id));
    const activeCount = allRuns.filter((r) => r.status === "running").length;
    const latest = allRuns
      .map((r) => r.startedAt)
      .sort((a, b) => +b - +a)[0];
    result.push({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description ?? "",
      framework: FRAMEWORK_BY_SLUG[p.slug] ?? "—",
      runCount: allRuns.length,
      activeCount,
      updated: (latest ?? new Date()).toISOString(),
    });
  }
  return result;
}

export async function getProjectBySlug(
  orgId: string,
  slug: string,
): Promise<Project | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.orgId, orgId), eq(projects.slug, slug)));
  if (!row) return null;

  const all = await db
    .select({ status: runs.status, startedAt: runs.startedAt })
    .from(runs)
    .where(eq(runs.projectId, row.id));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    framework: FRAMEWORK_BY_SLUG[row.slug] ?? "—",
    runCount: all.length,
    activeCount: all.filter((r) => r.status === "running").length,
    updated: (
      all.map((r) => r.startedAt).sort((a, b) => +b - +a)[0] ?? new Date()
    ).toISOString(),
  };
}
