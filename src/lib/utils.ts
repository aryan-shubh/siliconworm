import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${
    v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)
  } ${units[i]}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNum(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs === 0) return "0";
  if (abs < 0.001 || abs >= 100_000) return n.toExponential(2);
  return n.toFixed(digits);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m < 60) return `${m}m ${s.toString().padStart(2, "0")}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${(m % 60).toString().padStart(2, "0")}m`;
}

export function relTime(d: Date | string | number): string {
  const date = new Date(d);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const COLORS = [
  "oklch(0.89 0.22 128)", // lime
  "oklch(0.82 0.16 75)", // amber
  "oklch(0.78 0.13 220)", // cyan
  "oklch(0.66 0.21 32)", // rust
  "oklch(0.78 0.16 320)", // magenta
  "oklch(0.84 0.14 180)", // teal
  "oklch(0.72 0.18 50)", // tangerine
  "oklch(0.7  0.12 270)", // indigo
];
export const seriesColor = (i: number) => COLORS[i % COLORS.length];
