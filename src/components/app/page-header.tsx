import Link from "next/link";

type Crumb = { href?: string; label: string };

export function PageHeader({
  crumbs,
  title,
  meta,
  actions,
}: {
  crumbs?: Crumb[];
  title: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="border-b border-line bg-canvas">
      <div className="px-8 pt-6 pb-6">
        {crumbs && crumbs.length > 0 && (
          <div className="mb-3 flex items-center gap-1.5 text-[12px] text-ink-3">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                {c.href ? (
                  <Link href={c.href} className="hover:text-ink-2">{c.label}</Link>
                ) : (
                  <span className="text-ink-2">{c.label}</span>
                )}
                {i < crumbs.length - 1 && <span className="text-ink-3/60">/</span>}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[28px] font-semibold tracking-tight leading-none text-ink">{title}</h1>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
        {meta && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-3">
            {meta}
          </div>
        )}
      </div>
    </div>
  );
}
