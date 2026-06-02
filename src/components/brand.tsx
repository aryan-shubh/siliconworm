import { cn } from "@/lib/utils";

/**
 * Wordmark. Three descending hairlines (the larva / signal-trace mark) paired
 * with the name in heavy sans.
 */
export function Brand({
  className,
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden className="relative inline-block h-3.5 w-3.5 shrink-0">
        <span className="absolute left-0 top-[2px] h-px w-full bg-ink" />
        <span className="absolute left-[14%] top-[6px] h-px w-[72%] bg-ink" />
        <span className="absolute left-[28%] top-[10px] h-px w-[44%] bg-accent" />
      </span>
      {mono ? (
        <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-ink">
          silkworm
        </span>
      ) : (
        <span className="text-[16px] font-semibold tracking-tight text-ink">
          silkworm
        </span>
      )}
    </span>
  );
}
