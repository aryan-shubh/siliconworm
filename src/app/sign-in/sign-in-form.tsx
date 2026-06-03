"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

function GithubMark({ className }: { className?: string }) {
  // GitHub brand mark is no longer shipped in lucide-react@1 — inlined here
  // rather than reaching for a separate icon package.
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.97.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.74.8 1.19 1.82 1.19 3.08 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.13 0 .31.21.68.8.56C20.21 21.38 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function SignInForm({ returnTo }: { returnTo?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onGithub() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ returnTo }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        const b = body as Record<string, unknown>;
        setErr(
          typeof b.error === "string"
            ? b.error
            : `Sign-in unavailable (${r.status})`,
        );
        setBusy(false);
        return;
      }
      const data = (await r.json()) as { redirectUrl: string };
      window.location.href = data.redirectUrl;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Unknown error");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="text-sm text-ink-3">Sign in to Silkworm with GitHub</p>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={onGithub}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-xs hover:bg-surface-hover disabled:opacity-60"
      >
        <GithubMark className="h-4 w-4" />
        {busy ? "Redirecting…" : "Continue with GitHub"}
        <ArrowRight className="h-4 w-4 opacity-60" />
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-line" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-canvas px-2 text-ink-3">Or</span>
        </div>
      </div>

      <fieldset disabled className="flex flex-col gap-3 opacity-60">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-2">Email</span>
          <input
            type="email"
            placeholder="you@company.com"
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-2">Password</span>
          <input
            type="password"
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm"
          />
        </label>
        <p className="text-xs text-ink-3">
          Email + password sign-in is coming soon. Use GitHub for now.
        </p>
      </fieldset>

      {err && <p className="text-xs text-red-500">{err}</p>}

      <p className="text-center text-xs text-ink-3">
        By continuing you agree to our terms of service.
      </p>
    </div>
  );
}
