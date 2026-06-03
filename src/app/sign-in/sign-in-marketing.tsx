import { CheckCircle2 } from "lucide-react";

const FEATURES = [
  "Track every run, metric, and artifact — automatically",
  "Compare models across seeds and hyperparameter sweeps",
  "Share experiments and artifacts with your team",
] as const;

export function SignInMarketing() {
  return (
    <div className="flex h-full flex-col justify-between p-12">
      <div />

      <div className="mx-auto w-full max-w-sm">
        {/* Hero quote */}
        <figure className="rounded-lg border border-line bg-surface p-8 shadow-sm">
          <blockquote className="font-serif text-[17px] italic leading-relaxed text-ink-2">
            &ldquo;Training observability should feel as natural as reading a
            loss curve. Silkworm is what that looks like in practice.&rdquo;
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent-ink">
              MO
            </div>
            <div>
              <div className="text-[13px] font-semibold text-ink">
                Mira Osei
              </div>
              <div className="text-[12px] text-ink-3">
                ML Infrastructure Lead, Anthrop Labs
              </div>
            </div>
          </figcaption>
        </figure>

        {/* Feature bullets */}
        <ul className="mt-8 space-y-3">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span className="text-[13px] text-ink-2">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer logo row */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 opacity-40">
        {["Anthrop Labs", "Halcyon Robotics", "Obsidian AI"].map((name) => (
          <span key={name} className="font-mono text-[11px] text-ink-3">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
