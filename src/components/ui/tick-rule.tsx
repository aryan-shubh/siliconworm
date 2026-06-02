import { cn } from "@/lib/utils";

/**
 * Plain hairline rule. The decorative "ticks" variant from the previous
 * aesthetic has been removed — calm UIs don't need them.
 */
export function TickRule({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} />;
}
