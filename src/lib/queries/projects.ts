import { eq, and, inArray } from "drizzle-orm";
import { getDb } from "../db";
import { projects, runs } from "../schema";

export type Project = {
  id: string;
  slug: string;
  name: string;
  description: string;
  framework: string | null;
  runCount: number;
  activeCount: number;
  updated: string;
};

export async function listProjects(orgId: string): Promise<Project[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      name: projects.name,
      description: projects.description,
      framework: projects.framework,
    })
    .from(projects)
    .where(eq(projects.orgId, orgId));

  if (rows.length === 0) return [];

  // One batched query for all run rows we care about.
  const projectIds = rows.map((p) => p.id);
  const runRows = await db
    .select({
      projectId: runs.projectId,
      status: runs.status,
      startedAt: runs.startedAt,
    })
    .from(runs)
    .where(inArray(runs.projectId, projectIds));

  // Group in memory.
  const byProject = new Map<
    string,
    { total: number; active: number; latest: Date | null }
  >();
  for (const id of projectIds) byProject.set(id, { total: 0, active: 0, latest: null });
  for (const r of runRows) {
    const agg = byProject.get(r.projectId)!;
    agg.total += 1;
    if (r.status === "running") agg.active += 1;
    if (!agg.latest || r.startedAt > agg.latest) agg.latest = r.startedAt;
  }

  return rows.map((p) => {
    const agg = byProject.get(p.id)!;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description ?? "",
      framework: p.framework ?? null,
      runCount: agg.total,
      activeCount: agg.active,
      updated: (agg.latest ?? new Date()).toISOString(),
    };
  });
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
    framework: row.framework ?? null,
    runCount: all.length,
    activeCount: all.filter((r) => r.status === "running").length,
    updated: (
      all.map((r) => r.startedAt).toSorted((a, b) => +b - +a)[0] ?? new Date()
    ).toISOString(),
  };
}
