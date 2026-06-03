import Link from "next/link";
import {
  LayoutGrid,
  FlaskConical,
  Database,
  GitBranch,
  Bell,
  Settings,
  KeyRound,
  Users,
  BookOpen,
  ChevronsUpDown,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Kbd } from "@/components/ui/kbd";
import { getCurrentOrg, getCurrentUser } from "@/lib/cached-queries";

const PRIMARY = [
  { href: "/dashboard", label: "Projects", icon: LayoutGrid },
  { href: "/dashboard/runs", label: "All runs", icon: FlaskConical },
  { href: "/dashboard/artifacts", label: "Artifacts", icon: Database },
  { href: "/dashboard/sweeps", label: "Sweeps", icon: GitBranch },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
];
const SECONDARY = [
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/keys", label: "API keys", icon: KeyRound },
  { href: "/dashboard/docs", label: "Docs", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export async function Sidebar() {
  const [org, user] = await Promise.all([getCurrentOrg(), getCurrentUser()]);
  return (
    <aside className="sticky top-0 flex h-dvh w-[240px] shrink-0 flex-col border-r border-line bg-surface-2/60">
      <div className="border-b border-line p-3">
        <Link href="/dashboard" className="block px-1 py-1">
          <Brand />
        </Link>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-between gap-2 rounded-md border border-line bg-surface px-2 py-1.5 text-left hover:border-line-strong hover:bg-surface-hover"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-accent-soft text-[10px] font-semibold text-accent-ink">
              AL
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-medium text-ink">
                {org?.name ?? "No org"}
              </span>
              <span className="block truncate text-[10px] text-ink-3">
                Team · 14 seats
              </span>
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-ink-3" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 text-[13px]">
        <NavGroup label="Workspace">
          {PRIMARY.map((it) => (
            <NavItem key={it.href} {...it} />
          ))}
        </NavGroup>
        <NavGroup label="Account" className="mt-6">
          {SECONDARY.map((it) => (
            <NavItem key={it.href} {...it} />
          ))}
        </NavGroup>

        <div className="mt-8 rounded-md border border-line bg-surface p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-ink">Storage</span>
            <span className="text-[10px] text-ink-3">Open beta</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between text-[11px]">
            <span className="text-ink-3">Artifacts</span>
            <span className="font-mono tabular text-ink">1.4 / 5.0 GB</span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: "28%" }}
            />
          </div>
          <div className="mt-3 flex items-baseline justify-between text-[11px]">
            <span className="text-ink-3">Seats</span>
            <span className="font-mono tabular text-ink">3 / 14</span>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-line p-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[10px] font-semibold text-canvas">
            {user?.initials ?? "?"}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12px] font-medium text-ink">
              {user?.name ?? user?.email ?? "Unknown"}
            </div>
            <div className="truncate text-[10px] text-ink-3">
              {user?.email}
            </div>
          </div>
        </div>
        <button
          type="button"
          title="Command palette"
          className="flex items-center gap-1 rounded-md border border-line bg-surface px-1.5 py-1 hover:border-line-strong"
        >
          <Kbd>⌘K</Kbd>
        </button>
      </div>
    </aside>
  );
}

function NavGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-3">
        {label}
      </div>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-ink-2 hover:bg-surface hover:text-ink"
      >
        <Icon className="h-4 w-4 text-ink-3" strokeWidth={1.6} />
        <span className="font-medium">{label}</span>
      </Link>
    </li>
  );
}
