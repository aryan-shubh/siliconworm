import { DEMO_RUN_ID, getRunMetrics } from "@/lib/queries";
import { OverlayChart } from "./overlay-chart";

export async function OverlayDemo() {
  const base = await getRunMetrics(DEMO_RUN_ID, "train_loss");
  const synthetic = base.map((v, i) => v * 1.12 + Math.sin(i / 9) * 0.04);
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="mb-2 flex items-center justify-between text-[11px] text-ink-3">
        <span className="font-mono">mnist-mlp / overlay</span>
        <span className="font-mono">train_loss · 2 runs</span>
      </div>
      <OverlayChart base={base} other={synthetic} />
    </div>
  );
}
