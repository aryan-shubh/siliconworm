import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { MetricChart } from "@/components/charts/metric-chart";
import { StatusDot } from "@/components/ui/status-dot";
import { Pill } from "@/components/ui/pill";
import { TickRule } from "@/components/ui/tick-rule";
import { Sparkline } from "@/components/ui/sparkline";
import { getProject, getRun, CURRENT_ORG } from "@/lib/mock";
import { formatDuration, formatNum, relTime } from "@/lib/utils";

export default async function RunPage({
  params,
}: {
  params: Promise<{ project: string; runId: string }>;
}) {
  const { project: slug, runId } = await params;
  const project = getProject(slug);
  const run = getRun(slug, runId);
  if (!project || !run) return notFound();

  const m = (name: string) => run.metrics.find((x) => x.name === name)!.data;

  return (
    <>
      <PageHeader
        crumbs={[
          { href: "/", label: CURRENT_ORG.slug },
          { href: `/p/${slug}`, label: project.slug },
          { label: "runs" },
        ]}
        title={
          <span className="flex items-center gap-4">
            <span className="font-mono text-[28px] tracking-tight text-bone">{run.name}</span>
            <StatusDot status={run.status} size={10} />
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-bone-dim">
              {run.status}
            </span>
          </span>
        }
        meta={
          <>
            <span>by {run.user}</span>
            <span>·</span>
            <span>started {relTime(run.startedAt)}</span>
            <span>·</span>
            <span>ran {formatDuration(run.durationS)}</span>
            <span>·</span>
            <span>{run.gpu}</span>
            <span>·</span>
            <span>id <code className="text-bone">{run.id}</code></span>
          </>
        }
        actions={
          <>
            {run.tags.map((t) => <Pill key={t}>{t}</Pill>)}
            <button className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-dim hover:border-rule-2 hover:text-bone">
              Re-run
            </button>
            <button className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-dim hover:border-rule-2 hover:text-bone">
              Share
            </button>
            {run.status === "running" && (
              <button className="bg-rust px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink hover:bg-amber">
                Stop
              </button>
            )}
          </>
        }
      />

      <div className="space-y-8 p-8">
        {/* big metric tiles */}
        <div className="grid grid-cols-2 gap-px bg-rule md:grid-cols-5">
          <MetricTile label="train_loss" value={run.summary.train_loss.toFixed(3)} trend={m("train_loss").slice(-30)} good="down" />
          <MetricTile label="val_loss"   value={run.summary.val_loss.toFixed(3)}   trend={m("val_loss").slice(-30)} good="down" />
          <MetricTile label="accuracy"   value={`${(run.summary.accuracy * 100).toFixed(2)}%`} trend={m("accuracy").slice(-30)} good="up" />
          <MetricTile label="grad_norm"  value={m("grad_norm").at(-1)!.toFixed(2)} trend={m("grad_norm").slice(-30)} good="neutral" />
          <MetricTile label="gpu_util"   value={`${m("gpu_util").at(-1)!.toFixed(0)}%`} trend={m("gpu_util").slice(-30)} good="up" />
        </div>

        {/* tab nav (visual) */}
        <div className="flex items-center justify-between border-b border-rule">
          <nav className="flex">
            {["Overview", "Charts", "System", "Logs", "Artifacts", "Code"].map((t, i) => (
              <button
                key={t}
                className={`relative -mb-px border-b px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] ${
                  i === 0
                    ? "border-lime text-bone"
                    : "border-transparent text-bone-faint hover:text-bone-dim"
                }`}
              >
                {t}
                {i === 4 && <span className="ml-1 text-bone-faint">·3</span>}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 font-mono text-[10px] text-bone-faint">
            <span>step</span>
            <Pill>x: step</Pill>
            <span>·</span>
            <span>smooth 0.6</span>
          </div>
        </div>

        {/* charts grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricChart
            data={m("train_loss")}
            label="train_loss"
            dataKey="train_loss"
            gradient={["oklch(0.62 0.18 128)", "oklch(0.92 0.22 128)"]}
            format="decimal"
          />
          <MetricChart
            data={m("val_loss")}
            label="val_loss"
            dataKey="val_loss"
            gradient={["oklch(0.50 0.13 220)", "oklch(0.82 0.13 220)"]}
            format="decimal"
          />
          <MetricChart
            data={m("accuracy")}
            label="accuracy"
            dataKey="accuracy"
            gradient={["oklch(0.65 0.01 90)", "oklch(0.96 0.012 90)"]}
            format="percent"
          />
          <MetricChart
            data={m("grad_norm")}
            label="grad_norm"
            dataKey="grad_norm"
            gradient={["oklch(0.55 0.16 75)", "oklch(0.86 0.16 75)"]}
            format="decimal"
          />
          <MetricChart
            data={m("lr")}
            label="lr"
            dataKey="lr"
            gradient={["oklch(0.40 0.01 90)", "oklch(0.78 0.01 90)"]}
            format="scientific"
          />
          <MetricChart
            data={m("gpu_util")}
            label="gpu_util"
            unit="%"
            dataKey="gpu_util"
            gradient={["oklch(0.55 0.16 128)", "oklch(0.89 0.22 128)"]}
            format="integer"
          />
        </div>

        {/* config + system + logs */}
        <div className="grid grid-cols-1 gap-px bg-rule lg:grid-cols-3">
          {/* config */}
          <div className="bg-ink-2/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="eyebrow">config</span>
              <span className="font-mono text-[10px] text-bone-faint">{Object.keys(run.config).length} keys</span>
            </div>
            <dl className="space-y-1.5 font-mono text-[12px]">
              {Object.entries(run.config).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-rule/40 py-1.5">
                  <dt className="text-bone-faint">{k}</dt>
                  <dd className="text-bone tabular">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* system */}
          <div className="bg-ink-2/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="eyebrow">system</span>
              <span className="h-1.5 w-1.5 rounded-full bg-lime blink" />
            </div>
            <dl className="space-y-1.5 font-mono text-[12px]">
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
                <div key={String(k)} className="flex justify-between border-b border-rule/40 py-1.5">
                  <dt className="text-bone-faint">{String(k)}</dt>
                  <dd className="truncate text-bone tabular">{String(v)}</dd>
                </div>
              ))}
            </dl>
            <TickRule className="my-4" />
            <div className="font-mono text-[10px] text-bone-faint">
              live system metrics ·{" "}
              <Link href="#" className="text-lime hover:underline">open in Grafana ↗</Link>
            </div>
          </div>

          {/* logs */}
          <div className="bg-ink/80 p-0">
            <div className="flex items-center justify-between border-b border-rule px-5 py-3">
              <span className="eyebrow">stderr · tail</span>
              <Pill tone="lime"><span className="h-1.5 w-1.5 rounded-full bg-lime blink" />live</Pill>
            </div>
            <pre className="overflow-x-auto px-5 py-3 font-mono text-[11px] leading-[1.65] text-bone-dim">
{`[2026-06-03 09:14:01] silkworm: connected · run=${run.id}
[2026-06-03 09:14:01] torch.cuda.is_available() → True · 8 devices
[2026-06-03 09:14:02] loading dataset/fineweb-edu-2T (sha:0x4f2ac…)
[2026-06-03 09:14:48] model: ${run.arch} · 1,403,228,160 params
[2026-06-03 09:14:48] optimizer: muon (lr=3e-4, momentum=0.95)
[2026-06-03 09:14:49] step 0     | train_loss=3.218 | tokens/s=  168k
[2026-06-03 09:18:13] step 1000  | train_loss=2.114 | tokens/s=  184k
[2026-06-03 09:22:01] step 2000  | train_loss=1.823 | tokens/s=  186k
[2026-06-03 09:25:56] step 3000  | train_loss=1.604 | tokens/s=  185k
[2026-06-03 09:29:42] step 4000  | train_loss=1.452 | tokens/s=  187k
[2026-06-03 09:33:31] checkpoint → s3://silkworm/ckpts/${run.id}/step_4000
`}
              <span className="text-lime">[2026-06-03 09:33:32] step 4001  | train_loss=0.347 | tokens/s=  184k</span>
              <span className="blink text-lime">▍</span>
            </pre>
          </div>
        </div>

        {/* artifacts */}
        <div className="border border-rule bg-ink-2/40">
          <div className="flex items-center justify-between border-b border-rule px-4 py-2.5">
            <span className="eyebrow">artifacts · checkpoints</span>
            <button className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim hover:text-bone">
              upload ↗
            </button>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-rule font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">
                <th className="py-2 pl-4 text-left font-normal">name</th>
                <th className="text-left font-normal">type</th>
                <th className="text-left font-normal">version</th>
                <th className="text-right font-normal">size</th>
                <th className="text-left font-normal">sha</th>
                <th className="pr-4 text-right font-normal">created</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "checkpoint-step-4000", type: "model",   v: 12, size: "5.61 GB", sha: "0x4f2a91…", at: "2m ago" },
                { name: "checkpoint-step-3000", type: "model",   v: 11, size: "5.61 GB", sha: "0xa10c33…", at: "12m ago" },
                { name: "eval-2026-06-03",      type: "result",  v:  3, size: "184 KB",  sha: "0xee7b04…", at: "23m ago" },
                { name: "code-snapshot",        type: "code",    v:  1, size: "11.2 MB", sha: "0x6a7c4e…", at: "5h ago" },
              ].map((a) => (
                <tr key={a.name} className="border-b border-rule/40 text-bone-dim hover:bg-ink-3/30">
                  <td className="py-2 pl-4 font-mono text-bone">{a.name}</td>
                  <td className="py-2"><Pill>{a.type}</Pill></td>
                  <td className="py-2 font-mono tabular">v{a.v}</td>
                  <td className="py-2 text-right font-mono tabular">{a.size}</td>
                  <td className="py-2 font-mono text-bone-faint">{a.sha}</td>
                  <td className="py-2 pr-4 text-right text-bone-faint">{a.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
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
    good === "up" ? delta >= 0 :
    good === "down" ? delta <= 0 :
    true;
  const color = good === "neutral" ? "var(--color-bone-dim)" : isGood ? "var(--color-lime)" : "var(--color-rust)";
  return (
    <div className="bg-ink p-4">
      <div className="eyebrow">{label}</div>
      <div className="mt-2 display text-[40px] leading-none text-bone tabular">{value}</div>
      <div className="mt-2">
        <Sparkline data={trend} width={180} height={28} color={color} fill />
      </div>
    </div>
  );
}
