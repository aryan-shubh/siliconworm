import { cn } from "@/lib/utils";

const COLORS = {
  running: "bg-success",
  finished: "bg-ink-3",
  failed: "bg-fail",
  crashed: "bg-warn",
  queued: "bg-line-strong",
  killed: "bg-fail/60",
} as const;

export function StatusDot({
  status,
  size = 8,
}: {
  status: keyof typeof COLORS;
  size?: number;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn("inline-block rounded-full", COLORS[status])}
    />
  );
}
