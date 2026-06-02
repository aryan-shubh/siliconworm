import { Sidebar } from "@/components/app/sidebar";

// The dashboard reads from PlanetScale on every request. Opt out of static
// prerendering so `bun run build` doesn't try to fetch DB rows at build time.
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
