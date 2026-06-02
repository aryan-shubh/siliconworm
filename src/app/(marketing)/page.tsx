import Link from "next/link";

export default function LandingStub() {
  return (
    <main className="grid min-h-dvh place-items-center px-8">
      <div className="text-center">
        <p className="font-mono text-[11px] tracking-wider text-ink-3">
          silkworm · landing coming in phase C
        </p>
        <h1 className="mt-4 font-serif text-5xl tracking-tight text-ink">
          Experiment tracking, sharper.
        </h1>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-canvas hover:bg-accent-hover"
        >
          Open dashboard →
        </Link>
      </div>
    </main>
  );
}
