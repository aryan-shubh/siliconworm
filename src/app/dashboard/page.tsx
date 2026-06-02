import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Sparkline } from "@/components/ui/sparkline";
import { Pill } from "@/components/ui/pill";
import {
  ACME_DEMO_ORG_ID,
  listProjects,
  getCurrentOrg,
} from "@/lib/queries";
import { relTime } from "@/lib/utils";

function projSpark(seed: string): number[] {
  const h = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from(
    { length: 40 },
    (_, i) =>
      0.5 + Math.sin((i + h) / 5) * 0.25 + Math.cos((i + h) / 11) * 0.18,
  );
}

export default async function DashboardPage() {
  const [projects, org] = await Promise.all([
    listProjects(ACME_DEMO_ORG_ID),
    getCurrentOrg(),
  ]);
  const totalRuns = projects.reduce((s, p) => s + p.runCount, 0);
  const totalActive = projects.reduce((s, p) => s + p.activeCount, 0);

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/dashboard", label: org.slug }]}
        title="Projects"
        meta={
          <>
            <span>{projects.length} projects</span>
            <span className="text-line-strong">·</span>
            <span>{totalRuns.toLocaleString()} runs</span>
            <span className="text-line-strong">·</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
              {totalActive} active now
            </span>
          </>
        }
        actions={
          <>
            <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink-3 focus-within:border-line-strong">
              <Search className="h-3.5 w-3.5" />
              <input
                placeholder="Search projects…"
                className="w-44 border-0 bg-transparent text-ink outline-0 placeholder:text-ink-3"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[12px] font-medium text-canvas hover:bg-accent-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              New project
            </button>
          </>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/p/${p.slug}`}
              className="group flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 transition hover:border-line-strong hover:shadow-[0_1px_0_var(--color-line-strong)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[17px] font-semibold tracking-tight text-ink group-hover:text-accent">
                    {p.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-ink-2">
                    {p.description}
                  </p>
                </div>
                {p.activeCount > 0 && (
                  <Pill tone="success">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                    {p.activeCount}
                  </Pill>
                )}
              </div>

              <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px]">
                  <Stat label="Runs" value={p.runCount.toLocaleString()} />
                  <Stat label="Framework" value={p.framework} />
                  <Stat label="Updated" value={relTime(p.updated)} />
                  <Stat label="Visibility" value="Private" />
                </dl>
                <Sparkline
                  data={projSpark(p.slug)}
                  width={120}
                  height={42}
                  color={
                    p.activeCount > 0
                      ? "var(--color-success)"
                      : "var(--color-ink-3)"
                  }
                  fill
                />
              </div>
            </Link>
          ))}
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-transparent p-5 text-ink-3 transition hover:border-accent hover:text-accent"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[12px] font-medium">New project</span>
          </button>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-3">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
