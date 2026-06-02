import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  ChevronRight,
  Mail,
  Plus,
  Slack,
  Webhook,
  ZapOff,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Pill } from "@/components/ui/pill";
import {
  ACME_DEMO_ORG_ID,
  getCurrentOrg,
  listAlertEvents,
  listAlertRules,
  type AlertEvent,
  type AlertRule,
} from "@/lib/queries";
import { projectName, relTime } from "@/lib/utils";

type AlertSeverity = AlertRule["severity"];
type AlertChannel = AlertRule["channels"][number];

const SEVERITY_META: Record<
  AlertSeverity,
  {
    label: string;
    tone: "fail" | "warn" | "info";
    icon: React.ElementType;
    bubble: string;
  }
> = {
  critical: {
    label: "Critical",
    tone: "fail",
    icon: AlertCircle,
    bubble: "bg-fail-soft text-fail",
  },
  warn: {
    label: "Warning",
    tone: "warn",
    icon: AlertTriangle,
    bubble: "bg-warn-soft text-warn",
  },
  info: {
    label: "Info",
    tone: "info",
    icon: Bell,
    bubble: "bg-info-soft text-info",
  },
};

const CHANNEL_ICON: Record<AlertChannel, React.ElementType> = {
  email: Mail,
  slack: Slack,
  pagerduty: Bell,
  webhook: Webhook,
};

export default async function AlertsPage() {
  const [org, rules, events] = await Promise.all([
    getCurrentOrg(),
    listAlertRules(ACME_DEMO_ORG_ID),
    listAlertEvents(ACME_DEMO_ORG_ID),
  ]);
  const enabledRules = rules.filter((r) => r.enabled).length;
  const last24h = events.filter(
    (e) => Date.now() - new Date(e.triggeredAt).getTime() < 24 * 60 * 60 * 1000,
  );
  const critical24h = last24h.filter((e) => e.severity === "critical").length;
  const unacked = events.filter((e) => !e.acknowledged).length;

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/dashboard", label: org.slug }, { label: "Alerts" }]}
        title="Alerts"
        meta={
          <>
            <span>
              {enabledRules} active rules · {rules.length} total
            </span>
            <span className="text-line-strong">·</span>
            <span>{last24h.length} events in the last 24h</span>
            {unacked > 0 && (
              <>
                <span className="text-line-strong">·</span>
                <span className="text-fail">{unacked} unacknowledged</span>
              </>
            )}
          </>
        }
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:border-line-strong hover:text-ink"
            >
              <ZapOff className="h-3.5 w-3.5" /> Snooze all
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[12px] font-medium text-canvas hover:bg-accent-hover"
            >
              <Plus className="h-3.5 w-3.5" /> New rule
            </button>
          </>
        }
      />

      <div className="space-y-6 p-8">
        {/* Stat row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Active rules"
            value={enabledRules.toString()}
            sublabel={`${rules.length - enabledRules} disabled`}
          />
          <StatCard
            label="Events · 24h"
            value={last24h.length.toString()}
            sublabel="across all rules"
          />
          <StatCard
            label="Critical · 24h"
            value={critical24h.toString()}
            sublabel="page on-call"
            tone={critical24h > 0 ? "fail" : "neutral"}
          />
          <StatCard
            label="Unacknowledged"
            value={unacked.toString()}
            sublabel="needs attention"
            tone={unacked > 0 ? "warn" : "success"}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          {/* Rules */}
          <section className="rounded-lg border border-line bg-surface">
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Rules</h2>
                <p className="mt-0.5 text-[12px] text-ink-3">
                  Conditions evaluated continuously over the metric stream
                </p>
              </div>
              <div className="flex gap-1">
                {(["All", "Enabled", "Disabled"] as const).map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    className={`rounded-md px-3 py-1 text-[12px] font-medium ${
                      i === 0
                        ? "bg-surface-2 text-ink"
                        : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </header>

            <ul className="divide-y divide-line">
              {rules.map((rule) => (
                <RuleRow key={rule.id} rule={rule} />
              ))}
            </ul>
          </section>

          {/* Recent events */}
          <section className="rounded-lg border border-line bg-surface">
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">
                  Recent events
                </h2>
                <p className="mt-0.5 text-[12px] text-ink-3">
                  Most recent first
                </p>
              </div>
              <Link
                href="#"
                className="text-[12px] text-accent hover:underline"
              >
                View all →
              </Link>
            </header>
            <ol className="divide-y divide-line">
              {events.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ol>
            <footer className="border-t border-line px-4 py-3 text-[11px] text-ink-3">
              Showing {events.length} of {events.length} events from
              the last 72h
            </footer>
          </section>
        </div>
      </div>
    </>
  );
}

function RuleRow({ rule }: { rule: AlertRule }) {
  const sev = SEVERITY_META[rule.severity];
  const SevIcon = sev.icon;
  return (
    <li
      className={`flex items-start gap-4 px-4 py-4 hover:bg-surface-2/60 ${
        !rule.enabled ? "opacity-60" : ""
      }`}
    >
      <div
        className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md ${sev.bubble}`}
      >
        <SevIcon className="h-4 w-4" strokeWidth={1.6} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[14px] font-semibold text-ink">{rule.name}</h3>
          <Pill tone={sev.tone}>{sev.label}</Pill>
          <Pill>
            {rule.scope === "global" ? "All projects" : projectName(rule.scope)}
          </Pill>
          {!rule.enabled && <Pill tone="neutral">Disabled</Pill>}
        </div>
        <p className="mt-1 text-[12px] text-ink-2">{rule.description}</p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-line bg-canvas px-2 py-1 font-mono text-[11px] text-ink-2">
          <span className="text-ink-3">if</span>
          <code className="text-ink">{rule.condition}</code>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-ink-3">
          <span className="flex items-center gap-1.5">
            Channels:
            {rule.channels.map((c) => {
              const Icon = CHANNEL_ICON[c];
              return (
                <span
                  key={c}
                  title={c}
                  className="grid h-5 w-5 place-items-center rounded-sm border border-line bg-canvas"
                >
                  <Icon className="h-3 w-3 text-ink-2" strokeWidth={1.6} />
                </span>
              );
            })}
          </span>
          <span className="text-line-strong">·</span>
          <span>Triggered {rule.triggeredCount}× total</span>
          {rule.lastTriggered && (
            <>
              <span className="text-line-strong">·</span>
              <span>Last fired {relTime(rule.lastTriggered)}</span>
            </>
          )}
          <span className="text-line-strong">·</span>
          <span>By {rule.createdBy}</span>
        </div>
      </div>
      <button
        type="button"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md hover:bg-surface-2 text-ink-3"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </li>
  );
}

function EventRow({ event }: { event: AlertEvent }) {
  const sev = SEVERITY_META[event.severity];
  const SevIcon = sev.icon;
  return (
    <li className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2/60">
      <div
        className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md ${sev.bubble}`}
      >
        <SevIcon className="h-4 w-4" strokeWidth={1.6} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-[13px] font-semibold text-ink">
            {event.ruleName}
          </h4>
          <span className="text-[11px] text-ink-3">
            {relTime(event.triggeredAt)}
          </span>
        </div>
        <p className="mt-0.5 text-[12px] text-ink-2 leading-snug">
          {event.message}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-3">
          <Link
            href={`/dashboard/p/${event.projectSlug}`}
            className="hover:text-accent"
          >
            {projectName(event.projectSlug)}
          </Link>
          {event.runId && (
            <>
              <span className="text-line-strong">·</span>
              <Link
                href={`/dashboard/p/${event.projectSlug}/runs/${event.runId}`}
                className="font-mono hover:text-accent"
              >
                {event.runName}
              </Link>
            </>
          )}
          <span className="text-line-strong">·</span>
          {event.acknowledged ? (
            <span className="inline-flex items-center gap-1 text-success">
              <Check className="h-3 w-3" /> ack {event.acknowledgedBy}
            </span>
          ) : (
            <span className="text-fail">Unacknowledged</span>
          )}
        </div>
      </div>
      {!event.acknowledged && (
        <button
          type="button"
          className="shrink-0 rounded-md border border-line bg-canvas px-2 py-1 text-[11px] font-medium text-ink-2 hover:border-line-strong hover:text-ink"
        >
          Ack
        </button>
      )}
    </li>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sublabel: string;
  tone?: "neutral" | "success" | "warn" | "fail";
}) {
  const valueCls =
    tone === "success"
      ? "text-success"
      : tone === "warn"
        ? "text-warn"
        : tone === "fail"
          ? "text-fail"
          : "text-ink";
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="text-[12px] text-ink-3">{label}</div>
      <div
        className={`mt-1.5 text-[28px] font-semibold tracking-tight tabular ${valueCls}`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[12px] text-ink-3">{sublabel}</div>
    </div>
  );
}
