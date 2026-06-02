import { cn } from "@/lib/utils";

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warn" | "fail" | "info";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-line bg-surface-2 text-ink-2",
    accent:  "border-accent/30 bg-accent-soft text-accent-ink",
    success: "border-success/30 bg-success-soft text-success",
    warn:    "border-warn/30 bg-warn-soft text-warn",
    fail:    "border-fail/30 bg-fail-soft text-fail",
    info:    "border-info/30 bg-info-soft text-info",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
