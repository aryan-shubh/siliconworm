import Link from "next/link";
import { Hero } from "@/components/marketing/hero";
import { FeatureBand } from "@/components/marketing/feature-band";
import { CodeSample } from "@/components/marketing/code-sample";
import { LiveDemo } from "@/components/marketing/live-demo";
import { OverlayDemo } from "@/components/marketing/overlay-demo";

export default function Landing() {
  return (
    <>
      <Hero />

      <FeatureBand
        id="sdk"
        eyebrow="01 / ingest"
        title="Drop the SDK in. Done."
        body="Four lines of Python: init a run, log metrics in your training loop. Buffered, batched, and back-pressured by default. No daemon, no sidecar, no kubectl."
        visual={<CodeSample />}
      />

      <FeatureBand
        id="track"
        eyebrow="02 / track"
        title="Real metrics, in real time."
        body="Per-step values stream straight into the dashboard. Charts re-render as new points arrive. This one is the actual loss curve from demo-run-1, pulled live from the database."
        visual={<LiveDemo />}
        reverse
      />

      <FeatureBand
        id="compare"
        eyebrow="03 / compare"
        title="Overlay runs. Spot the regression."
        body="Open the run table, ⌘-click two runs, and silkworm overlays their metric series with shared axes. No notebook required."
        visual={<OverlayDemo />}
      />

      <section className="border-b border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-8 py-28 text-center">
          <h2 className="max-w-[20ch] font-serif text-[40px] leading-[1.05] tracking-tight text-ink">
            Open the dashboard. See the runs.
          </h2>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-5 py-3 text-[13px] font-medium text-canvas hover:bg-accent-hover"
          >
            Open dashboard →
          </Link>
        </div>
      </section>
    </>
  );
}
