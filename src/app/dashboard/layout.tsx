import { Sidebar } from "@/components/app/sidebar";

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
