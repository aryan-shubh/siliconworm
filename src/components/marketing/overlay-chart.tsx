"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["oklch(0.46 0.12 262)", "oklch(0.58 0.10 152)"];

export function OverlayChart({
  base,
  other,
}: {
  base: number[];
  other: number[];
}) {
  const rows = base.map((v, i) => ({
    step: i,
    run_a: v,
    run_b: other[i],
  }));
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid
            stroke="var(--color-line)"
            strokeDasharray="2 4"
            horizontal
            vertical={false}
          />
          <XAxis
            dataKey="step"
            tick={{ fill: "var(--color-ink-3)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
            }
            minTickGap={32}
          />
          <YAxis
            tick={{ fill: "var(--color-ink-3)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => v.toFixed(2)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-line)",
              fontSize: 11,
            }}
          />
          <Line
            dataKey="run_a"
            stroke={COLORS[0]}
            strokeWidth={1.2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="run_b"
            stroke={COLORS[1]}
            strokeWidth={1.2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
