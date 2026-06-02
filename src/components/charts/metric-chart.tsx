"use client";

import {
  EvilLineChart,
  Line,
  XAxis,
  YAxis,
  Grid,
  Tooltip,
  Dot,
  ActiveDot,
} from "@/components/evilcharts/charts/line-chart";
import { type ChartConfig } from "@/components/evilcharts/ui/chart";
import { useMemo } from "react";

type Props = {
  /** Series values. Indices become the x axis. */
  data: number[];
  /** Header label e.g. "train_loss". */
  label: string;
  /** Smaller unit / suffix next to the value, e.g. "%". */
  unit?: string;
  /** Single-series identifier used internally — must be a valid JS key. */
  dataKey?: string;
  /** Two-stop gradient for the glowing stroke. CSS color strings. */
  gradient?: [string, string];
  /** Formatter preset for the headline value and the y-axis ticks. */
  format?:
    | "decimal"
    | "decimal3"
    | "percent"
    | "percent1"
    | "scientific"
    | "integer";
  /** Optional fixed height in px (default 220). */
  height?: number;
  /** Hide the value/delta header (when caller renders its own). */
  hideHeader?: boolean;
};

const FORMATTERS: Record<
  NonNullable<Props["format"]>,
  (v: number) => string
> = {
  decimal: (v) => v.toFixed(2),
  decimal3: (v) => v.toFixed(3),
  percent: (v) => `${(v * 100).toFixed(0)}%`,
  percent1: (v) => `${(v * 100).toFixed(1)}%`,
  scientific: (v) => v.toExponential(1),
  integer: (v) => v.toFixed(0),
};

const DEFAULT_GRADIENT: [string, string] = [
  "oklch(0.62 0.18 128)",
  "oklch(0.92 0.22 128)",
];

export function MetricChart({
  data,
  label,
  unit,
  dataKey = "value",
  gradient = DEFAULT_GRADIENT,
  format = "decimal",
  height = 220,
  hideHeader = false,
}: Props) {
  const fmt = FORMATTERS[format];
  const rows = useMemo(
    () => data.map((v, i) => ({ step: i, [dataKey]: v })),
    [data, dataKey],
  );

  const config = useMemo<ChartConfig>(
    () => ({
      [dataKey]: {
        label,
        colors: { light: gradient, dark: gradient },
      },
    }),
    [dataKey, label, gradient],
  );

  const last = data[data.length - 1] ?? 0;
  const first = data[0] ?? 0;
  const delta = last - first;
  const pct = first ? (delta / Math.abs(first)) * 100 : 0;
  const deltaCls =
    delta < 0 ? "text-accent" : delta > 0 ? "text-fail" : "text-ink-3";

  return (
    <div className="flex flex-col border border-line bg-surface/40">
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-line px-3 py-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[11px] text-ink">{label}</span>
            {unit && (
              <span className="font-mono text-[10px] text-ink-3">{unit}</span>
            )}
          </div>
          <div className="flex items-baseline gap-2 font-mono text-[11px] tabular">
            <span className="text-ink">{fmt(last)}</span>
            <span className={deltaCls}>
              {delta < 0 ? "↘" : delta > 0 ? "↗" : "→"}{" "}
              {Math.abs(pct).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
      <div style={{ height }} className="relative">
        <EvilLineChart
          data={rows}
          config={config}
          curveType="monotone"
          animationType="left-to-right"
          chartProps={{ margin: { top: 12, right: 12, bottom: 4, left: 4 } }}
          className="h-full w-full"
        >
          <Grid
            stroke="var(--color-line)"
            strokeDasharray="2 4"
            horizontal
            vertical={false}
          />
          <XAxis
            dataKey="step"
            tick={{ fill: "var(--color-ink-3)", fontSize: 10 }}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
            }
            minTickGap={32}
          />
          <YAxis
            tick={{ fill: "var(--color-ink-3)", fontSize: 10 }}
            tickFormatter={fmt}
            width={44}
          />
          <Tooltip variant="default" />
          <Line dataKey={dataKey} strokeVariant="solid">
            <ActiveDot variant="default" />
          </Line>
        </EvilLineChart>
      </div>
    </div>
  );
}
