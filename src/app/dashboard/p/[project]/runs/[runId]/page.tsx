import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Download,
  ExternalLink,
  MoreHorizontal,
  RotateCw,
  Share2,
  Square,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { MetricChart } from "@/components/charts/metric-chart";
import { StatusDot } from "@/components/ui/status-dot";
import { Pill } from "@/components/ui/pill";
import { Sparkline } from "@/components/ui/sparkline";
import {
  ACME_DEMO_ORG_ID,
  getCurrentOrg,
  getProjectBySlug,
  getRunById,
} from "@/lib/queries";
import { formatDuration, relTime } from "@/lib/utils";

export default async function RunPage({
  params,
}: {
  params: Promise<{ project: string; runId: string }>;
}) {
  const { project: slug, runId } = await params;
  const [project, run, org] = await Promise.all([
    getProjectBySlug(ACME_DEMO_ORG_ID, slug),
    getRunById(slug, runId),
    getCurrentOrg(),
  ]);
  if (!project || !run) return notFound();

  const m = (name: string) =>
    run.metrics.find((x) => x.name === name)?.data ?? [];
  const lastOf = (name: string, fallback = 0) => {
    const a = m(name);
    return a.length ? a[a.length - 1] : fallback;
  };
  const statusTone =
    run.status === "running"
      ? "success"
      : run.status === "finished"
        ? "neutral"
        : run.status === "failed" || run.status === "crashed"
          ? "fail"
          : "warn";

  return (
    <>
      <PageHeader
        crumbs={[
          { href: "/dashboard", label: org.slug },
          { href: `/dashboard/p/${slug}`, label: project.slug },
          { label: "runs" },
        ]}
        title={
          <span className="flex items-center gap-3">
            <span>{run.name}</span>
            <Pill tone={statusTone as "success" | "neutral" | "fail" | "warn"}>
              <StatusDot status={run.status} />
              <span className="capitalize">{run.status}</span>
            </Pill>
          </span>
        }
        meta={
          <>
            <span>by {run.user}</span>
            <span className="text-line-strong">·</span>
            <span>started {relTime(run.startedAt)}</span>
            <span className="text-line-strong">·</span>
            <span>ran {formatDuration(run.durationS)}</span>
            <span className="text-line-strong">·</span>
            <span>{run.gpu}</span>
            <span className="text-line-strong">·</span>
            <span>
              id{" "}
              <code className="rounded-sm bg-surface-2 px-1 py-px font-mono text-[11px] text-ink">
                {run.id}
              </code>
            </span>
          </>
        }
        actions={
          <>
            <Button icon={<RotateCw className="h-3.5 w-3.5" />}>Re-run</Button>
            <Button icon={<Share2 className="h-3.5 w-3.5" />}>Share</Button>
            {run.status === "running" && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-fail/40 bg-fail-soft px-3 py-1.5 text-[12px] font-medium text-fail hover:bg-fail hover:text-canvas"
              >
                <Square className="h-3.5 w-3.5" /> Stop
              </button>
            )}
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-md border border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </>
        }
      />

      <div className="space-y-8 p-8">
        {/* metric tiles */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <MetricTile
            label="train_loss"
            value={run.summary.train_loss.toFixed(3)}
            trend={m("train_loss").slice(-30)}
            good="down"
          />
          <MetricTile
            label="val_loss"
            value={run.summary.val_loss.toFixed(3)}
            trend={m("val_loss").slice(-30)}
            good="down"
          />
          <MetricTile
            label="accuracy"
            value={`${(run.summary.accuracy * 100).toFixed(2)}%`}
            trend={m("accuracy").slice(-30)}
            good="up"
          />
          <MetricTile
            label="grad_norm"
            value={lastOf("grad_norm").toFixed(2)}
            trend={m("grad_norm").slice(-30)}
            good="neutral"
          />
          <MetricTile
            label="gpu_util"
            value={`${lastOf("gpu_util").toFixed(0)}%`}
            trend={m("gpu_util").slice(-30)}
            good="up"
          />
        </div>

        {/* tabs */}
        <div className="flex items-center justify-between border-b border-line">
          <nav className="-mb-px flex gap-1">
            {["Overview", "Charts", "System", "Logs", "Artifacts", "Code"].map(
              (t, i) => (
                <button
                  key={t}
                  type="button"
                  className={`relative inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] font-medium transition ${
                    i === 0
                      ? "border-accent text-ink"
                      : "border-transparent text-ink-2 hover:text-ink"
                  }`}
                >
                  {t}
                  {i === 4 && (
                    <span className="rounded-sm bg-surface-2 px-1 text-[10px] font-medium text-ink-3">
                      3
                    </span>
                  )}
                </button>
              ),
            )}
          </nav>
          <div className="flex items-center gap-2 text-[12px] text-ink-3">
            <span>x: step</span>
            <span className="text-line-strong">·</span>
            <span>smoothing 0.6</span>
          </div>
        </div>

        {/* charts grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricChart
            data={m("train_loss")}
            label="train_loss"
            dataKey="train_loss"
            gradient={ACCENT}
            format="decimal"
          />
          <MetricChart
            data={m("val_loss")}
            label="val_loss"
            dataKey="val_loss"
            gradient={INFO}
            format="decimal"
          />
          <MetricChart
            data={m("accuracy")}
            label="accuracy"
            dataKey="accuracy"
            gradient={SUCCESS}
            format="percent"
          />
          <MetricChart
            data={m("grad_norm")}
            label="grad_norm"
            dataKey="grad_norm"
            gradient={WARN}
            format="decimal"
          />
          <MetricChart
            data={m("lr")}
            label="lr"
            dataKey="lr"
            gradient={MUTED}
            format="scientific"
          />
          <MetricChart
            data={m("gpu_util")}
            label="gpu_util"
            unit="%"
            dataKey="gpu_util"
            gradient={SAGE}
            format="integer"
          />
        </div>

        {/* config + system + logs */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Config */}
          <section className="rounded-lg border border-line bg-surface">
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
              <h3 className="text-[13px] font-semibold text-ink">
                Configuration
              </h3>
              <span className="text-[11px] text-ink-3">
                {Object.keys(run.config).length} keys
              </span>
            </header>
            <dl className="divide-y divide-line p-4 pt-2">
              {Object.entries(run.config).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between py-1.5 text-[12px]"
                >
                  <dt className="text-ink-3">{k}</dt>
                  <dd className="font-mono tabular text-ink">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* System */}
          <section className="rounded-lg border border-line bg-surface">
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
              <h3 className="text-[13px] font-semibold text-ink">System</h3>
              {run.status === "running" && (
                <Pill tone="success">
                  <StatusDot status="running" />
                  Online
                </Pill>
              )}
            </header>
            <dl className="divide-y divide-line p-4 pt-2">
              {[
                ["arch", run.arch],
                ["accelerator", run.gpu],
                ["pytorch", "2.5.0+cu124"],
                ["python", "3.12.4"],
                ["host", "ip-10-0-44-117.ec2.internal"],
                ["region", "us-east-1"],
                ["git.sha", "6a7c4e3"],
                ["dataset.sha", "sha256:0x4f2ac…"],
              ].map(([k, v]) => (
                <div
                  key={String(k)}
                  className="flex justify-between py-1.5 text-[12px]"
                >
                  <dt className="text-ink-3">{String(k)}</dt>
                  <dd className="truncate font-mono tabular text-ink">
                    {String(v)}
                  </dd>
                </div>
              ))}
            </dl>
            <footer className="border-t border-line px-4 py-3 text-[11px] text-ink-3">
              <Link
                href="#"
                className="inline-flex items-center gap-1 text-accent hover:underline"
              >
                Open in Grafana <ExternalLink className="h-3 w-3" />
              </Link>
            </footer>
          </section>

          {/* Logs */}
          <section className="overflow-hidden rounded-lg border border-line bg-surface">
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
              <h3 className="text-[13px] font-semibold text-ink">
                stderr · tail
              </h3>
              <Pill tone="success">
                <StatusDot status="running" />
                Streaming
              </Pill>
            </header>
            <pre className="overflow-x-auto px-4 py-3 font-mono text-[11px] leading-[1.7] text-ink-2">
              {`[09:14:01] silkworm connected → run=${run.id}
[09:14:01] torch.cuda 8 devices found
[09:14:02] loading fineweb-edu-2T (sha:0x4f2ac…)
[09:14:48] model: ${run.arch} · 1,403,228,160 params
[09:14:48] optimizer: muon (lr=3e-4, momentum=0.95)
[09:14:49] step 0     train_loss=3.218  tokens/s=168k
[09:18:13] step 1000  train_loss=2.114  tokens/s=184k
[09:22:01] step 2000  train_loss=1.823  tokens/s=186k
[09:25:56] step 3000  train_loss=1.604  tokens/s=185k
[09:29:42] step 4000  train_loss=1.452  tokens/s=187k
[09:33:31] checkpoint → s3://silkworm/ckpts/${run.id}/step_4000
`}
              <span className="text-success">
                [09:33:32] step 4001 train_loss=0.347 tokens/s=184k
              </span>{" "}
              <span className="text-success">▍</span>
            </pre>
          </section>
        </div>

        {/* Artifacts */}
        <section className="rounded-lg border border-line bg-surface">
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <h3 className="text-[13px] font-semibold text-ink">Artifacts</h3>
              <p className="mt-0.5 text-[12px] text-ink-3">
                Checkpoints, eval results, and code snapshots
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas px-2.5 py-1.5 text-[12px] text-ink-2 hover:border-line-strong hover:text-ink"
            >
              <Download className="h-3.5 w-3.5" /> Download all
            </button>
          </header>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-medium uppercase tracking-wider text-ink-3">
                <th className="py-2 pl-4 text-left font-medium">Name</th>
                <th className="py-2 text-left font-medium">Type</th>
                <th className="py-2 text-left font-medium">Version</th>
                <th className="py-2 text-right font-medium">Size</th>
                <th className="py-2 text-left font-medium">SHA</th>
                <th className="py-2 pr-4 text-right font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "checkpoint-step-4000",
                  type: "model",
                  tone: "info",
                  v: 12,
                  size: "5.61 GB",
                  sha: "0x4f2a91…",
                  at: "2m ago",
                },
                {
                  name: "checkpoint-step-3000",
                  type: "model",
                  tone: "info",
                  v: 11,
                  size: "5.61 GB",
                  sha: "0xa10c33…",
                  at: "12m ago",
                },
                {
                  name: "eval-2026-06-03",
                  type: "result",
                  tone: "success",
                  v: 3,
                  size: "184 KB",
                  sha: "0xee7b04…",
                  at: "23m ago",
                },
                {
                  name: "code-snapshot",
                  type: "code",
                  tone: "neutral",
                  v: 1,
                  size: "11.2 MB",
                  sha: "0x6a7c4e…",
                  at: "5h ago",
                },
              ].map((a) => (
                <tr
                  key={a.name}
                  className="border-b border-line/70 last:border-0 hover:bg-surface-2/60"
                >
                  <td className="py-3 pl-4 font-medium text-ink">{a.name}</td>
                  <td className="py-3">
                    <Pill tone={a.tone as "info" | "success" | "neutral"}>
                      {a.type}
                    </Pill>
                  </td>
                  <td className="py-3 font-mono tabular text-ink-2">v{a.v}</td>
                  <td className="py-3 text-right font-mono tabular text-ink-2">
                    {a.size}
                  </td>
                  <td className="py-3 font-mono text-[12px] text-ink-3">
                    {a.sha}
                  </td>
                  <td className="py-3 pr-4 text-right text-ink-3">{a.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

/* ─────── gradient presets per metric (no neon) ─────── */
const ACCENT: [string, string] = [
  "oklch(0.46 0.12 262)",
  "oklch(0.58 0.13 262)",
];
const INFO: [string, string] = ["oklch(0.45 0.10 220)", "oklch(0.62 0.11 220)"];
const SUCCESS: [string, string] = [
  "oklch(0.45 0.10 152)",
  "oklch(0.60 0.11 152)",
];
const WARN: [string, string] = ["oklch(0.52 0.13 70)", "oklch(0.68 0.13 70)"];
const MUTED: [string, string] = [
  "oklch(0.42 0.012 264)",
  "oklch(0.60 0.012 264)",
];
const SAGE: [string, string] = ["oklch(0.50 0.07 170)", "oklch(0.65 0.08 170)"];

function Button({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:border-line-strong hover:text-ink"
    >
      {icon}
      {children}
    </button>
  );
}

function MetricTile({
  label,
  value,
  trend,
  good,
}: {
  label: string;
  value: string;
  trend: number[];
  good: "up" | "down" | "neutral";
}) {
  const first = trend[0];
  const last = trend[trend.length - 1];
  const delta = last - first;
  const isGood =
    good === "up" ? delta >= 0 : good === "down" ? delta <= 0 : true;
  const sparkColor =
    good === "neutral"
      ? "var(--color-ink-3)"
      : isGood
        ? "var(--color-success)"
        : "var(--color-fail)";
  const deltaCls =
    good === "neutral" ? "text-ink-3" : isGood ? "text-success" : "text-fail";
  const pct = first ? (delta / Math.abs(first)) * 100 : 0;

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-ink-3">{label}</span>
        <span className={`text-[11px] tabular ${deltaCls}`}>
          {delta < 0 ? "↘" : delta > 0 ? "↗" : "→"} {Math.abs(pct).toFixed(1)}%
        </span>
      </div>
      <div className="mt-1.5 text-[26px] font-semibold tracking-tight tabular text-ink leading-none">
        {value}
      </div>
      <div className="mt-2">
        <Sparkline
          data={trend}
          width={180}
          height={28}
          color={sparkColor}
          fill
        />
      </div>
    </div>
  );
}
