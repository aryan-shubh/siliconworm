import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Filter,
  GitBranch,
  Play,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Sparkline } from "@/components/ui/sparkline";
import { StatusDot } from "@/components/ui/status-dot";
import { Pill } from "@/components/ui/pill";
import { getProject, runsForProject, CURRENT_ORG } from "@/lib/mock";
import { formatDuration, formatNum, relTime, seriesColor } from "@/lib/utils";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project: slug } = await params;
  const project = getProject(slug);
  if (!project) return notFound();
  const runs = runsForProject(slug, 80);

  const activeCount = runs.filter((r) => r.status === "running").length;
  const finishedCount = runs.filter((r) => r.status === "finished").length;
  const failedCount = runs.filter(
    (r) => r.status === "failed" || r.status === "crashed",
  ).length;
  const bestVal = Math.min(...runs.map((r) => r.summary.val_loss));

  return (
    <>
      <PageHeader
        crumbs={[
          { href: "/", label: CURRENT_ORG.slug },
          { label: project.slug },
        ]}
        title={project.name}
        meta={
          <>
            <span>{project.description}</span>
            <span className="text-line-strong">·</span>
            <span>{project.framework}</span>
          </>
        }
        actions={
          <>
            <Button
              icon={<GitBranch className="h-3.5 w-3.5" />}
              variant="secondary"
            >
              Sweeps
            </Button>
            <Button
              icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
              variant="secondary"
            >
              Compare
            </Button>
            <Button icon={<Play className="h-3.5 w-3.5" />} variant="primary">
              New run
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total runs"
            value={runs.length.toLocaleString()}
            sublabel={`${activeCount} live`}
            live={activeCount > 0}
          />
          <StatCard
            label="Finished"
            value={finishedCount.toString()}
            sublabel="last 24h"
          />
          <StatCard
            label="Failed"
            value={failedCount.toString()}
            sublabel="needs review"
            tone={failedCount > 0 ? "fail" : "neutral"}
          />
          <StatCard
            label="Best val_loss"
            value={bestVal.toFixed(3)}
            sublabel="↘ from 0.61"
            tone="success"
          />
        </div>

        {/* Overlay chart */}
        <section className="rounded-lg border border-line bg-surface">
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <h2 className="text-[14px] font-semibold text-ink">
                Train loss · all runs
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-3">
                Overlay of {Math.min(runs.length, 24)} runs · step 0 → 200,000
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Pill>x: step</Pill>
              <Pill>y: log</Pill>
              <Pill>smooth 0.6</Pill>
            </div>
          </header>
          <div className="relative h-[280px] px-6 pt-4 pb-2">
            <div className="relative h-full">
              {runs.slice(0, 24).map((r, i) => (
                <div key={r.id} className="absolute inset-0">
                  <Sparkline
                    data={r.metrics.find((m) => m.name === "train_loss")!.data}
                    width={1200}
                    height={250}
                    color={muted(i)}
                    strokeWidth={r.status === "running" ? 1.3 : 0.6}
                  />
                </div>
              ))}
            </div>
          </div>
          <footer className="flex items-center justify-between border-t border-line px-4 py-2 text-[11px] text-ink-3">
            <span>Hover a row below to highlight · ⌘-click to pin</span>
          </footer>
        </section>

        {/* Runs table */}
        <section className="rounded-lg border border-line bg-surface">
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-md border border-line bg-canvas px-2 py-1.5 focus-within:border-line-strong">
                <Search className="h-3.5 w-3.5 text-ink-3" />
                <input
                  placeholder="Filter: lr<3e-4 and tag:baseline"
                  className="w-72 border-0 bg-transparent text-[12px] text-ink outline-0 placeholder:text-ink-3"
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas px-2.5 py-1.5 text-[12px] text-ink-2 hover:border-line-strong hover:text-ink"
              >
                <Filter className="h-3.5 w-3.5" /> Status
              </button>
              <Pill tone="success">{activeCount} running</Pill>
            </div>
            <div className="text-[12px] text-ink-3">
              1–{Math.min(runs.length, 50)} of {runs.length}
            </div>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-[13px]">
              <thead>
                <tr className="border-b border-line text-[11px] font-medium uppercase tracking-wider text-ink-3">
                  <th className="w-10 py-2 pl-4 text-left font-medium"></th>
                  <th className="py-2 text-left font-medium">Run</th>
                  <th className="py-2 text-left font-medium">User</th>
                  <th className="py-2 text-left font-medium">Group</th>
                  <th className="py-2 text-right font-medium">Started</th>
                  <th className="py-2 text-right font-medium">Duration</th>
                  <th className="py-2 text-right font-medium">lr</th>
                  <th className="py-2 text-right font-medium">train_loss</th>
                  <th className="py-2 text-right font-medium">val_loss</th>
                  <th className="py-2 text-right font-medium">Acc.</th>
                  <th className="py-2 text-right font-medium">Trace</th>
                  <th className="w-10 py-2 pr-4 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody className="text-ink-2">
                {runs.slice(0, 50).map((r, i) => (
                  <tr
                    key={r.id}
                    className="group border-b border-line/70 hover:bg-surface-2/60"
                  >
                    <td className="py-3 pl-4">
                      <StatusDot status={r.status} />
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/p/${slug}/runs/${r.id}`}
                        className="flex items-center gap-2"
                      >
                        <span
                          className="inline-block h-2 w-2 shrink-0 rounded-sm"
                          style={{ background: muted(i) }}
                        />
                        <span className="font-medium text-ink group-hover:text-accent">
                          {r.name}
                        </span>
                        {r.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-[11px] text-ink-3">
                            ·{t}
                          </span>
                        ))}
                      </Link>
                    </td>
                    <td className="py-3 text-ink-2">{r.user}</td>
                    <td className="py-3 text-[12px] text-ink-3">
                      {r.group ?? "—"}
                    </td>
                    <td className="py-3 text-right text-ink-3">
                      {relTime(r.startedAt)}
                    </td>
                    <td className="py-3 text-right font-mono tabular">
                      {formatDuration(r.durationS)}
                    </td>
                    <td className="py-3 text-right font-mono tabular">
                      {formatNum(r.config.lr as number)}
                    </td>
                    <td className="py-3 text-right font-mono tabular text-ink">
                      {r.summary.train_loss.toFixed(3)}
                    </td>
                    <td className="py-3 text-right font-mono tabular">
                      {r.summary.val_loss.toFixed(3)}
                    </td>
                    <td className="py-3 text-right font-mono tabular">
                      <span
                        className={
                          r.summary.accuracy > 0.9 ? "text-success" : "text-ink"
                        }
                      >
                        {(r.summary.accuracy * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Sparkline
                        data={r.metrics
                          .find((m) => m.name === "train_loss")!
                          .data.slice(0, 80)}
                        width={92}
                        height={22}
                        color={muted(i)}
                      />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-ink-3 group-hover:text-accent" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

// A calm desaturated palette for the run series — no lime/magenta neon.
const MUTED = [
  "oklch(0.46 0.12 262)", // indigo
  "oklch(0.55 0.10 220)", // info
  "oklch(0.58 0.10 152)", // sage
  "oklch(0.66 0.13 70)", // amber
  "oklch(0.55 0.16 26)", // clay
  "oklch(0.50 0.08 300)", // dusty violet
  "oklch(0.60 0.08 190)", // teal
  "oklch(0.46 0.05 250)", // slate
];
const muted = (i: number) => MUTED[i % MUTED.length];

function Button({
  children,
  icon,
  variant = "secondary",
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const cls =
    variant === "primary"
      ? "bg-accent text-canvas hover:bg-accent-hover"
      : "border border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink";
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium ${cls}`}
    >
      {icon}
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  live = false,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sublabel: string;
  live?: boolean;
  tone?: "neutral" | "success" | "fail";
}) {
  const valueCls =
    tone === "success"
      ? "text-success"
      : tone === "fail"
        ? "text-fail"
        : "text-ink";
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-ink-3">{label}</span>
        {live && (
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
        )}
      </div>
      <div
        className={`mt-1.5 text-[28px] font-semibold tracking-tight tabular ${valueCls}`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[12px] text-ink-3">{sublabel}</div>
    </div>
  );
}
