import Link from "next/link";
import {
  ArrowUpRight,
  Download,
  Filter,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Sparkline } from "@/components/ui/sparkline";
import { StatusDot } from "@/components/ui/status-dot";
import { Pill } from "@/components/ui/pill";
import {
  PROJECTS,
  runsForProject,
  CURRENT_ORG,
  type MockRun,
} from "@/lib/mock";
import { projectName } from "@/lib/workspace-mock";
import { formatDuration, formatNum, relTime } from "@/lib/utils";

export default function AllRunsPage() {
  // Aggregate across every project. We don't sort; rows naturally fall by
  // recency because mock.ts already sorts each project's runs newest-first.
  const all: MockRun[] = PROJECTS.flatMap((p) => runsForProject(p.slug, 14));
  all.sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt));

  const total = all.length;
  const running = all.filter((r) => r.status === "running").length;
  const finished = all.filter((r) => r.status === "finished").length;
  const failed = all.filter(
    (r) => r.status === "failed" || r.status === "crashed",
  ).length;

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: CURRENT_ORG.slug }, { label: "All runs" }]}
        title="All runs"
        meta={
          <>
            <span>Across {PROJECTS.length} projects</span>
            <span className="text-line-strong">·</span>
            <span>Last 7 days</span>
            <span className="text-line-strong">·</span>
            <span className="flex items-center gap-1.5">
              <StatusDot status="running" />
              {running} live now
            </span>
          </>
        }
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:border-line-strong hover:text-ink"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:border-line-strong hover:text-ink"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Columns
            </button>
          </>
        }
      />

      <div className="space-y-6 p-8">
        {/* Stat row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total runs"
            value={total.toLocaleString()}
            sublabel="last 7 days"
          />
          <StatCard
            label="Running"
            value={running.toString()}
            sublabel="across workers"
            tone="success"
          />
          <StatCard
            label="Finished"
            value={finished.toString()}
            sublabel="completed successfully"
          />
          <StatCard
            label="Failed"
            value={failed.toString()}
            sublabel="needs review"
            tone={failed > 0 ? "fail" : "neutral"}
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-line bg-canvas px-2.5 py-1.5 focus-within:border-line-strong">
              <Search className="h-3.5 w-3.5 text-ink-3" />
              <input
                placeholder="Search runs, users, tags…"
                className="w-72 border-0 bg-transparent text-[12px] text-ink outline-0 placeholder:text-ink-3"
              />
            </div>
            <Filterer label="Status" value="All" />
            <Filterer label="Project" value="All" />
            <Filterer label="User" value="Anyone" />
            <Filterer label="Time" value="Last 7d" />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas px-2.5 py-1.5 text-[12px] text-ink-2 hover:border-line-strong hover:text-ink"
            >
              <Filter className="h-3.5 w-3.5" /> More
            </button>
          </div>
          <div className="text-[12px] text-ink-3">
            Showing 1–{Math.min(60, all.length)} of {all.length}
          </div>
        </div>

        {/* Runs table */}
        <section className="rounded-lg border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-[13px]">
              <thead>
                <tr className="border-b border-line text-[11px] font-medium uppercase tracking-wider text-ink-3">
                  <th className="w-10 py-2 pl-4 text-left font-medium"></th>
                  <th className="py-2 text-left font-medium">Run</th>
                  <th className="py-2 text-left font-medium">Project</th>
                  <th className="py-2 text-left font-medium">User</th>
                  <th className="py-2 text-right font-medium">Started</th>
                  <th className="py-2 text-right font-medium">Duration</th>
                  <th className="py-2 text-right font-medium">train_loss</th>
                  <th className="py-2 text-right font-medium">val_loss</th>
                  <th className="py-2 text-right font-medium">Acc.</th>
                  <th className="py-2 text-right font-medium">Trace</th>
                  <th className="w-10 py-2 pr-4 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody className="text-ink-2">
                {all.slice(0, 60).map((r) => (
                  <tr
                    key={r.id}
                    className="group border-b border-line/70 last:border-0 hover:bg-surface-2/60"
                  >
                    <td className="py-3 pl-4">
                      <StatusDot status={r.status} />
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/p/${r.projectSlug}/runs/${r.id}`}
                        className="flex items-center gap-2"
                      >
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
                    <td className="py-3">
                      <Link
                        href={`/p/${r.projectSlug}`}
                        className="text-[12px] text-ink-2 hover:text-accent"
                      >
                        {projectName(r.projectSlug)}
                      </Link>
                    </td>
                    <td className="py-3 text-ink-2">{r.user}</td>
                    <td className="py-3 text-right text-ink-3">
                      {relTime(r.startedAt)}
                    </td>
                    <td className="py-3 text-right font-mono tabular">
                      {formatDuration(r.durationS)}
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
                        color="var(--color-ink-3)"
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
          <footer className="flex items-center justify-between border-t border-line px-4 py-3 text-[12px] text-ink-3">
            <span>Aggregated from {PROJECTS.length} projects</span>
            <span>
              1–{Math.min(60, all.length)} of {all.length}
            </span>
          </footer>
        </section>
      </div>
    </>
  );
}

function Filterer({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas px-2.5 py-1.5 text-[12px] text-ink-2 hover:border-line-strong hover:text-ink"
    >
      <span className="text-ink-3">{label}:</span>
      <span className="font-medium text-ink">{value}</span>
    </button>
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
