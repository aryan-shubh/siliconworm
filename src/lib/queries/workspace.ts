import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { orgs, projects, runs } from "../schema";
import { getCurrentSession } from "@/lib/auth/current-user";

export type Sweep = {
  id: string;
  slug: string;
  projectSlug: string;
  name: string;
  method: "bayes" | "grid" | "random" | "hyperband";
  status: "running" | "finished" | "queued" | "paused";
  trialsRun: number;
  trialsTotal: number;
  activeWorkers: number;
  startedAt: string;
  bestMetricName: string;
  bestMetricValue: number;
  bestRunName: string;
  bestRunId: string;
  bestSoFar: number[];
  bestConfig: Record<string, string | number>;
  objective: "min" | "max";
};

export type AlertRule = {
  id: string;
  name: string;
  description: string;
  scope: "global" | string;
  metric: string;
  condition: string;
  severity: "info" | "warn" | "critical";
  channels: ("email" | "slack" | "pagerduty" | "webhook")[];
  enabled: boolean;
  triggeredCount: number;
  lastTriggered: string | null;
  createdBy: string;
};

export type AlertEvent = {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: "info" | "warn" | "critical";
  projectSlug: string;
  runName: string;
  runId: string;
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
  acknowledgedBy: string | null;
};

export type CurrentUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  initials: string;
};

export type CurrentOrg = {
  id: string;
  slug: string | null;
  name: string | null;
};

export async function listSweeps(_orgId: string): Promise<Sweep[]> {
  // No sweeps table yet — Phase 3 work. Empty for now.
  return [];
}

export async function listAlertRules(_orgId: string): Promise<AlertRule[]> {
  // No alert_rules table yet — Phase 3 work.
  return [];
}

export async function listAlertEvents(_orgId: string): Promise<AlertEvent[]> {
  return [];
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getCurrentSession();
  if (!session) return null;
  const { userId, name, email, image } = session;
  return {
    id: userId,
    name,
    email,
    image,
    initials: (name ?? email ?? "?")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

export async function getCurrentOrg(): Promise<CurrentOrg | null> {
  const db = getDb();
  const [o] = await db.select({ id: orgs.id, slug: orgs.slug, name: orgs.name }).from(orgs).limit(1);
  if (!o) return null;
  return { id: o.id, slug: o.slug ?? null, name: o.name ?? null };
}

export type WorkspaceSummary = {
  projectCount: number;
  runningCount: number;
  activeAlerts: number;
  recentArtifactCount: number;
};

export async function getWorkspaceSummary(
  orgId: string,
): Promise<WorkspaceSummary> {
  const db = getDb();
  const ps = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.orgId, orgId));
  let runningCount = 0;
  for (const p of ps) {
    const rs = await db
      .select({ status: runs.status })
      .from(runs)
      .where(eq(runs.projectId, p.id));
    runningCount += rs.filter((r) => r.status === "running").length;
  }
  return {
    projectCount: ps.length,
    runningCount,
    activeAlerts: 0,
    recentArtifactCount: 0,
  };
}
