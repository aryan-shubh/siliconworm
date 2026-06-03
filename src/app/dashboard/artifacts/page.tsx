import Link from "next/link";
import { ArrowUpRight, Box, Code, Database, FileBarChart, Search, Upload } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Pill } from "@/components/ui/pill";
import {
  ACME_DEMO_ORG_ID,
  getCurrentOrg,
  listArtifactsForProject,
  type Artifact,
} from "@/lib/queries";
import { formatBytes, projectName, relTime } from "@/lib/utils";

type ArtifactType = Artifact["type"];

const TYPE_META: Record<
  ArtifactType,
  {
    label: string;
    icon: React.ElementType;
    tone: "info" | "success" | "warn" | "neutral";
  }
> = {
  model: { label: "Model", icon: Box, tone: "info" },
  dataset: { label: "Dataset", icon: Database, tone: "success" },
  code: { label: "Code", icon: Code, tone: "neutral" },
  result: { label: "Result", icon: FileBarChart, tone: "warn" },
};

export default async function ArtifactsPage() {
  const [org, artifacts] = await Promise.all([
    getCurrentOrg(),
    listArtifactsForProject(ACME_DEMO_ORG_ID),
  ]);
  const byType = (t: ArtifactType) => artifacts.filter((a) => a.type === t);
  const totalBytes = artifacts.reduce((s, a) => s + a.sizeBytes, 0);
  const totalDownloads = artifacts.reduce((s, a) => s + a.downloads, 0);

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/dashboard", label: org.slug }, { label: "Artifacts" }]}
        title="Artifacts"
        meta={
          <>
            <span>{artifacts.length} artifacts</span>
            <span className="text-line-strong">·</span>
            <span>{formatBytes(totalBytes)} total · stored on S3</span>
            <span className="text-line-strong">·</span>
            <span>Content-addressed · chunk-level dedup</span>
          </>
        }
        actions={
          <>
            <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 focus-within:border-line-strong">
              <Search className="h-3.5 w-3.5 text-ink-3" />
              <input
                aria-label="Search artifacts"
                placeholder="Search by name or SHA…"
                className="w-56 border-0 bg-transparent text-[12px] text-ink outline-0 placeholder:text-ink-3"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[12px] font-medium text-canvas hover:bg-accent-hover"
            >
              <Upload className="h-3.5 w-3.5" /> Upload
            </button>
          </>
        }
      />

      <div className="space-y-6 p-8">
        {/* Stat row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <TypeCard
            type="model"
            count={byType("model").length}
            sizeBytes={byType("model").reduce((s, a) => s + a.sizeBytes, 0)}
          />
          <TypeCard
            type="dataset"
            count={byType("dataset").length}
            sizeBytes={byType("dataset").reduce((s, a) => s + a.sizeBytes, 0)}
          />
          <TypeCard
            type="code"
            count={byType("code").length}
            sizeBytes={byType("code").reduce((s, a) => s + a.sizeBytes, 0)}
          />
          <TypeCard
            type="result"
            count={byType("result").length}
            sizeBytes={byType("result").reduce((s, a) => s + a.sizeBytes, 0)}
          />
        </div>

        {/* Storage breakdown bar */}
        <section className="rounded-lg border border-line bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-semibold text-ink">Storage</h2>
              <p className="mt-0.5 text-[12px] text-ink-3">
                {formatBytes(totalBytes)} of 1.50 TB plan · {totalDownloads.toLocaleString()}{" "}
                lifetime downloads
              </p>
            </div>
            <div className="text-[12px] text-ink-3">
              <span className="font-mono tabular text-ink">
                {((totalBytes / 1.5e12) * 100).toFixed(1)}%
              </span>{" "}
              used
            </div>
          </div>
          <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-line">
            {(["model", "dataset", "code", "result"] as ArtifactType[]).map((t) => {
              const sum = byType(t).reduce((s, a) => s + a.sizeBytes, 0);
              const pct = (sum / totalBytes) * 100;
              const bgs: Record<ArtifactType, string> = {
                model: "bg-info",
                dataset: "bg-success",
                code: "bg-ink-3",
                result: "bg-warn",
              };
              return (
                <div
                  key={t}
                  className={bgs[t]}
                  style={{ width: `${pct}%` }}
                  title={`${TYPE_META[t].label}: ${formatBytes(sum)}`}
                />
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-ink-3">
            {(["model", "dataset", "code", "result"] as ArtifactType[]).map((t) => {
              const sum = byType(t).reduce((s, a) => s + a.sizeBytes, 0);
              const dots: Record<ArtifactType, string> = {
                model: "bg-info",
                dataset: "bg-success",
                code: "bg-ink-3",
                result: "bg-warn",
              };
              return (
                <span key={t} className="flex items-center gap-1.5">
                  <span className={`inline-block h-2 w-2 rounded-sm ${dots[t]}`} />
                  <span>{TYPE_META[t].label}s</span>
                  <span className="font-mono tabular text-ink-2">{formatBytes(sum)}</span>
                </span>
              );
            })}
          </div>
        </section>

        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-line">
          <nav className="-mb-px flex gap-1">
            {["All", "Models", "Datasets", "Code", "Results"].map((t, i) => (
              <button
                key={t}
                type="button"
                className={`border-b-2 px-3 py-2.5 text-[13px] font-medium transition ${
                  i === 0
                    ? "border-accent text-ink"
                    : "border-transparent text-ink-2 hover:text-ink"
                }`}
              >
                {t}
                <span className="ml-1.5 rounded-sm bg-surface-2 px-1 text-[10px] text-ink-3">
                  {i === 0
                    ? artifacts.length
                    : i === 1
                      ? byType("model").length
                      : i === 2
                        ? byType("dataset").length
                        : i === 3
                          ? byType("code").length
                          : byType("result").length}
                </span>
              </button>
            ))}
          </nav>
          <div className="text-[12px] text-ink-3">Sorted by recency</div>
        </div>

        {/* Artifacts table */}
        <section className="rounded-lg border border-line bg-surface">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-medium uppercase tracking-wider text-ink-3">
                <th className="py-2 pl-4 text-left font-medium">Name</th>
                <th className="py-2 text-left font-medium">Type</th>
                <th className="py-2 text-left font-medium">Project</th>
                <th className="py-2 text-left font-medium">Latest</th>
                <th className="py-2 text-right font-medium">Size</th>
                <th className="py-2 text-left font-medium">SHA</th>
                <th className="py-2 text-left font-medium">Source run</th>
                <th className="py-2 text-right font-medium">Downloads</th>
                <th className="py-2 text-right font-medium">Created</th>
                <th
                  aria-label="Open artifact"
                  className="w-10 py-2 pr-4 text-right font-medium"
                ></th>
              </tr>
            </thead>
            <tbody className="text-ink-2">
              {artifacts.map((a) => {
                const meta = TYPE_META[a.type];
                const Icon = meta.icon;
                return (
                  <tr
                    key={a.id}
                    className="group border-b border-line/70 last:border-0 hover:bg-surface-2/60"
                  >
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-ink-3" strokeWidth={1.6} />
                        <span className="font-medium text-ink group-hover:text-accent">
                          {a.name}
                        </span>
                        <span className="text-[11px] text-ink-3">
                          ·v{a.latestVersion} ({a.versionCount})
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Pill tone={meta.tone}>{meta.label}</Pill>
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/dashboard/p/${a.projectSlug}`}
                        className="text-[12px] text-ink-2 hover:text-accent"
                      >
                        {projectName(a.projectSlug)}
                      </Link>
                    </td>
                    <td className="py-3 font-mono tabular">v{a.latestVersion}</td>
                    <td className="py-3 text-right font-mono tabular text-ink">
                      {formatBytes(a.sizeBytes)}
                    </td>
                    <td className="py-3 font-mono text-[12px] text-ink-3">{a.sha256}</td>
                    <td className="py-3">
                      <Link
                        href={`/dashboard/p/${a.projectSlug}/runs/${a.sourceRunId}`}
                        className="text-[12px] text-ink-2 hover:text-accent"
                      >
                        {a.sourceRunName}
                      </Link>
                    </td>
                    <td className="py-3 text-right font-mono tabular text-ink-2">
                      {a.downloads.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-ink-3">{relTime(a.createdAt)}</td>
                    <td className="py-3 pr-4 text-right">
                      <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-ink-3 group-hover:text-accent" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

function TypeCard({
  type,
  count,
  sizeBytes,
}: {
  type: ArtifactType;
  count: number;
  sizeBytes: number;
}) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  const tones: Record<string, string> = {
    info: "text-info bg-info-soft",
    success: "text-success bg-success-soft",
    warn: "text-warn bg-warn-soft",
    neutral: "text-ink-2 bg-surface-2",
  };
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-ink-3">{meta.label}s</span>
        <span className={`grid h-6 w-6 place-items-center rounded-sm ${tones[meta.tone]}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
        </span>
      </div>
      <div className="mt-1.5 text-[28px] font-semibold tracking-tight tabular text-ink">
        {count}
      </div>
      <div className="mt-0.5 text-[12px] text-ink-3">{formatBytes(sizeBytes)}</div>
    </div>
  );
}
