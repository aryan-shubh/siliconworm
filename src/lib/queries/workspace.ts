import {
  SWEEPS,
  ALERT_RULES,
  ALERT_EVENTS,
} from "../workspace-mock";
import type {
  MockSweep,
  AlertRule,
  AlertEvent,
} from "../workspace-mock";
import { CURRENT_USER, CURRENT_ORG } from "../mock";

export type Sweep = MockSweep;
export type { AlertRule, AlertEvent } from "../workspace-mock";

export type CurrentUser = typeof CURRENT_USER;
export type CurrentOrg = typeof CURRENT_ORG;

export async function listSweeps(_orgId: string): Promise<Sweep[]> {
  return SWEEPS;
}

export async function listAlertRules(_orgId: string): Promise<AlertRule[]> {
  return ALERT_RULES;
}

export async function listAlertEvents(_orgId: string): Promise<AlertEvent[]> {
  return ALERT_EVENTS;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return CURRENT_USER;
}

export async function getCurrentOrg(): Promise<CurrentOrg> {
  return CURRENT_ORG;
}

export type WorkspaceSummary = {
  projectCount: number;
  runningCount: number;
  activeAlerts: number;
  recentArtifactCount: number;
};

export async function getWorkspaceSummary(
  _orgId: string,
): Promise<WorkspaceSummary> {
  const { PROJECTS } = await import("../mock");
  const { ALERT_EVENTS: events, ARTIFACTS } = await import("../workspace-mock");
  return {
    projectCount: PROJECTS.length,
    runningCount: PROJECTS.reduce((s, p) => s + p.activeCount, 0),
    activeAlerts: events.filter((e) => !e.acknowledged).length,
    recentArtifactCount: ARTIFACTS.length,
  };
}
