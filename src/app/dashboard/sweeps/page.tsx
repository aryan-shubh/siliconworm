import Link from "next/link";
import {
  ArrowUpRight,
  GitBranch,
  Pause,
  Play,
  Plus,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Sparkline } from "@/components/ui/sparkline";
import { StatusDot } from "@/components/ui/status-dot";
import { Pill } from "@/components/ui/pill";
import {
  ACME_DEMO_ORG_ID,
  getCurrentOrg,
  listSweeps,
  type Sweep,
} from "@/lib/queries";
import { projectName, relTime } from "@/lib/utils";

const METHOD_LABEL: Record<Sweep["method"], string> = {
  bayes: "Bayesian",
  grid: "Grid",
  random: "Random",
  hyperband: "Hyperband",
};

const STATUS_TONE: Record<
  Sweep["status"],
  "success" | "neutral" | "warn" | "info"
> = {
  running: "success",
  finished: "neutral",
  queued: "info",
  paused: "warn",
};

export default async function SweepsPage() {
  const [org, sweeps] = await Promise.all([
    getCurrentOrg(),
    listSweeps(ACME_DEMO_ORG_ID),
  ]);

  if (sweeps.length === 0) {
    return (
      <>
        <PageHeader
          crumbs={[{ href: "/dashboard", label: org.slug }, { label: "Sweeps" }]}
          title="Sweeps"
          meta={<span>No sweeps yet</span>}
        />
        <div className="p-8 text-[13px] text-ink-3">
          Sweeps will appear here once the scheduler is online.
        </div>
      </>
    );
  }

  const featured = sweeps.find((s) => s.status === "running") ?? sweeps[0];
  const other = sweeps.filter((s) => s.id !== featured.id);
  const activeCount = sweeps.filter((s) => s.status === "running").length;
  const totalTrials = sweeps.reduce((s, sw) => s + sw.trialsRun, 0);

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/dashboard", label: org.slug }, { label: "Sweeps" }]}
        title="Hyperparameter sweeps"
        meta={
          <>
            <span>{sweeps.length} sweeps</span>
            <span className="text-line-strong">·</span>
            <span className="flex items-center gap-1.5">
              <StatusDot status="running" />
              {activeCount} running
            </span>
            <span className="text-line-strong">·</span>
            <span>{totalTrials.toLocaleString()} trials this week</span>
          </>
        }
        actions={
          <>
            <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 focus-within:border-line-strong">
              <Search className="h-3.5 w-3.5 text-ink-3" />
              <input
                placeholder="Search sweeps…"
                className="w-48 border-0 bg-transparent text-[12px] text-ink outline-0 placeholder:text-ink-3"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[12px] font-medium text-canvas hover:bg-accent-hover"
            >
              <Plus className="h-3.5 w-3.5" /> New sweep
            </button>
          </>
        }
      />

      <div className="space-y-6 p-8">
        {/* Featured sweep */}
        <FeaturedSweep sweep={featured} />

        {/* Other sweeps grid */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-ink">All sweeps</h2>
            <div className="flex gap-1">
              {(
                ["All", "Running", "Finished", "Paused", "Queued"] as const
              ).map((t, i) => (
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
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {other.map((s) => (
              <SweepCard key={s.id} sweep={s} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function FeaturedSweep({ sweep: s }: { sweep: Sweep }) {
  const tone = STATUS_TONE[s.status];
  const progress = s.trialsTotal > 0 ? (s.trialsRun / s.trialsTotal) * 100 : 0;
  const isImproving =
    s.bestSoFar.length > 1 &&
    (s.objective === "min"
      ? s.bestSoFar.at(-1)! < s.bestSoFar[0]
      : s.bestSoFar.at(-1)! > s.bestSoFar[0]);

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface">
      <header className="flex items-start justify-between gap-6 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-ink-3" strokeWidth={1.6} />
            <Pill tone={tone}>
              <StatusDot
                status={
                  s.status === "running"
                    ? "running"
                    : s.status === "finished"
                      ? "finished"
                      : s.status === "paused"
                        ? "crashed"
                        : "queued"
                }
              />
              <span className="capitalize">{s.status}</span>
            </Pill>
            <Pill>{METHOD_LABEL[s.method]}</Pill>
            <Link
              href={`/dashboard/p/${s.projectSlug}`}
              className="text-[12px] text-ink-2 hover:text-accent"
            >
              {projectName(s.projectSlug)}
            </Link>
          </div>
          <h2 className="mt-2 text-[22px] font-semibold tracking-tight text-ink">
            {s.name}
          </h2>
          <p className="mt-1 text-[12px] text-ink-3">
            Started {relTime(s.startedAt)} · {s.activeWorkers} workers · seeking{" "}
            <span className="text-ink-2">
              {s.objective === "min" ? "↓ minimum" : "↑ maximum"}
            </span>{" "}
            <span className="font-mono text-ink-2">{s.bestMetricName}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {s.status === "running" && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink-2 hover:border-line-strong hover:text-ink"
            >
              <Pause className="h-3.5 w-3.5" /> Pause
            </button>
          )}
          {s.status === "paused" && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink-2 hover:border-line-strong hover:text-ink"
            >
              <Play className="h-3.5 w-3.5" /> Resume
            </button>
          )}
          <Link
            href={`/dashboard/p/${s.projectSlug}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink-2 hover:border-line-strong hover:text-ink"
          >
            Open <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
        {/* Convergence chart */}
        <div className="border-line p-5 lg:border-r">
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <h3 className="text-[12px] font-medium text-ink-2">
                Best <span className="font-mono">{s.bestMetricName}</span> over
                trials
              </h3>
              <p className="mt-0.5 text-[11px] text-ink-3">
                Lower-envelope of every trial's final value
              </p>
            </div>
            <div className="text-right">
              <div className="font-mono text-[24px] font-semibold tabular text-ink">
                {s.bestMetricValue.toFixed(3)}
              </div>
              <div className="text-[11px] text-ink-3">
                at trial {s.bestSoFar.length}
              </div>
            </div>
          </div>
          {s.bestSoFar.length > 0 ? (
            <Sparkline
              data={s.bestSoFar}
              width={700}
              height={140}
              color={
                isImproving ? "var(--color-success)" : "var(--color-ink-3)"
              }
              strokeWidth={1.4}
              fill
            />
          ) : (
            <div className="grid h-[140px] place-items-center text-[12px] text-ink-3">
              No trials yet — sweep is queued
            </div>
          )}
          <div className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-3">
            <Metric
              label="Trials run"
              value={`${s.trialsRun} / ${s.trialsTotal}`}
              extra={`${progress.toFixed(0)}% complete`}
            />
            <Metric
              label="Active workers"
              value={s.activeWorkers.toString()}
              extra={s.status === "running" ? "Scaling auto" : "Idle"}
            />
            <Metric
              label="Best trial"
              value={s.bestRunName === "—" ? "—" : s.bestRunName}
              extra={s.bestRunName === "—" ? "—" : "Click → open run"}
            />
          </div>
        </div>

        {/* Best config */}
        <div className="p-5">
          <h3 className="mb-3 text-[12px] font-medium text-ink-2">
            Best configuration
          </h3>
          {Object.keys(s.bestConfig).length === 0 ? (
            <div className="rounded-md border border-dashed border-line px-3 py-6 text-center text-[12px] text-ink-3">
              No trials have completed yet
            </div>
          ) : (
            <dl className="divide-y divide-line">
              {Object.entries(s.bestConfig).map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 text-[12px]">
                  <dt className="text-ink-3">{k}</dt>
                  <dd className="font-mono tabular text-ink">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
          {s.bestRunId && (
            <Link
              href={`/dashboard/p/${s.projectSlug}/runs/${s.bestRunId}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-line bg-canvas px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:border-line-strong hover:text-ink"
            >
              Open best run <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function SweepCard({ sweep: s }: { sweep: Sweep }) {
  const tone = STATUS_TONE[s.status];
  const progress = s.trialsTotal > 0 ? (s.trialsRun / s.trialsTotal) * 100 : 0;
  const isImproving =
    s.bestSoFar.length > 1 &&
    (s.objective === "min"
      ? s.bestSoFar.at(-1)! < s.bestSoFar[0]
      : s.bestSoFar.at(-1)! > s.bestSoFar[0]);

  return (
    <Link
      href="#"
      className="group flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 transition hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Pill tone={tone}>
              <StatusDot
                status={
                  s.status === "running"
                    ? "running"
                    : s.status === "finished"
                      ? "finished"
                      : s.status === "paused"
                        ? "crashed"
                        : "queued"
                }
              />
              <span className="capitalize">{s.status}</span>
            </Pill>
            <Pill>{METHOD_LABEL[s.method]}</Pill>
          </div>
          <h3 className="mt-2 truncate text-[15px] font-semibold tracking-tight text-ink group-hover:text-accent">
            {s.name}
          </h3>
          <p className="mt-0.5 text-[12px] text-ink-3">
            {projectName(s.projectSlug)} · started {relTime(s.startedAt)}
          </p>
        </div>
      </div>

      {s.bestSoFar.length > 0 ? (
        <div className="rounded-md border border-line bg-canvas p-3">
          <div className="mb-2 flex items-baseline justify-between text-[11px] text-ink-3">
            <span>
              Best{" "}
              <span className="font-mono text-ink-2">{s.bestMetricName}</span>
            </span>
            <span className="font-mono tabular text-ink">
              {s.bestMetricValue.toFixed(3)}
            </span>
          </div>
          <Sparkline
            data={s.bestSoFar}
            width={300}
            height={48}
            color={isImproving ? "var(--color-success)" : "var(--color-ink-3)"}
            fill
          />
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-line bg-canvas px-3 py-4 text-center text-[11px] text-ink-3">
          Awaiting first trial
        </div>
      )}

      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
          <span className="text-ink-3">Progress</span>
          <span className="font-mono tabular text-ink-2">
            {s.trialsRun} / {s.trialsTotal}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-line">
          <div
            className={`h-full rounded-full ${
              s.status === "running" ? "bg-success" : "bg-ink-3"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function Metric({
  label,
  value,
  extra,
}: {
  label: string;
  value: string;
  extra: string;
}) {
  return (
    <div>
      <div className="text-[11px] text-ink-3">{label}</div>
      <div className="mt-0.5 text-[14px] font-semibold text-ink">{value}</div>
      <div className="text-[10px] text-ink-3">{extra}</div>
    </div>
  );
}
