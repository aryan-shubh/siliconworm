"use client";

import {
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
        <LineChart data={rows}>
          <XAxis dataKey="step" hide />
          <YAxis hide domain={["auto", "auto"]} />
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
