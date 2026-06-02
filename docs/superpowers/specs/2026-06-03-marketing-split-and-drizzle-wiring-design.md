# Marketing split + Drizzle/PlanetScale wiring

**Date:** 2026-06-03
**Status:** Design — approved sections, pending written-spec review

## Goal

Three coordinated changes to silkworm, executed by three parallel agents in isolated worktrees:

1. Move the existing authed app from `src/app/(app)/*` to `src/app/dashboard/*` so the root `/` is freed for a marketing landing.
2. Replace mock-data imports with real Drizzle queries against PlanetScale, and seed PlanetScale with the current demo state so the dashboard looks identical to today — just live.
3. Build a new `/` landing page inspired by [layer9.com](https://layer9.com) (calm, serif, hairline rules, generous whitespace) and [modal.com](https://modal.com) (numbered section eyebrows, dense code-sample band, real chart embedded in a feature band).

The dashboard's enterprise-calm visual style (commit `83d1cdf`) is **not** redesigned in this slice.

## §1 — Route restructure

Move the unnamed-route-group app to a concrete `dashboard` segment.

```
src/app/
├─ page.tsx            ← NEW landing (§3)
├─ layout.tsx          ← unchanged (root html/body, fonts)
├─ globals.css         ← unchanged
├─ (marketing)/
│  └─ layout.tsx       ← NEW: bare scaffold by Agent A; wordmark header + footer wired by Agent C
└─ dashboard/
   ├─ layout.tsx       ← moved verbatim from src/app/(app)/layout.tsx (sidebar shell)
   ├─ page.tsx         ← projects grid (was src/app/(app)/page.tsx)
   ├─ runs/page.tsx
   ├─ sweeps/page.tsx
   ├─ artifacts/page.tsx
   ├─ alerts/page.tsx
   └─ p/[project]/
      ├─ page.tsx
      └─ runs/[runId]/page.tsx
```

Sidebar (`src/components/app/sidebar.tsx`) links update from `/p/...`, `/runs`, `/sweeps`, `/artifacts`, `/alerts` to the `/dashboard` prefix. `next.config.ts` adds one redirect rule, `/p/:path*` → `/dashboard/p/:path*`, so old bookmarks survive.

The `(marketing)` route group exists only to scope a different `<header>` and `<footer>` to `/` without dragging the dashboard sidebar in.

## §2 — Drizzle + PlanetScale wiring

### Query module

Every page that currently imports `src/lib/mock.ts`, `src/lib/demo-run.ts`, or `src/lib/workspace-mock.ts` instead imports from `~/lib/queries`. The query module is one file per resource:

```
src/lib/queries/
├─ projects.ts    listProjects(orgId), getProjectBySlug(orgId, slug)
├─ runs.ts        listRunsForProject(projectId, filters?), getRunById(runId),
│                 getRunMetrics(runId, name)
├─ artifacts.ts   listArtifactsForRun(runId), listArtifactsForProject(projectId)
├─ workspace.ts   getWorkspaceSummary(orgId)
└─ index.ts       barrel
```

Each function:
- Takes the `DB` instance from `getDb()` (existing lazy client in `src/lib/db.ts`).
- Returns the **exact TypeScript shapes** the current mock files export. Component code does not change.
- Receives `orgId` (and other scoping ids) as arguments so call sites swap in a real session later with one-line changes.

### Schema additions

One new table: `run_metrics`. Columns: `(run_id varchar(36), name varchar(64), step bigint, value double)` with primary key `(run_id, name, step)` and an index on `(run_id, name)`. This is a deliberate MySQL-uncomfortable stopgap so the run-detail charts can read from real data before ClickHouse is online (phase 2 in `README.md`). When ClickHouse lands, `getRunMetrics` is the only function that needs to swap its backend.

All other tables in `src/lib/schema.ts` already exist and are unchanged.

### Seed

`scripts/seed.ts`, invoked via `bun run db:seed` (new entry in `package.json`).

Inserts:
- 1 org (`acme`), 1 user, 1 demo API key.
- The same 4 projects shown in today's projects grid.
- ~30 runs across those projects, generated from the deterministic seeded values currently in `src/lib/mock.ts`.
- The full MNIST demo run from `src/lib/demo-run.ts` with its real metric tuples expanded into `run_metrics`.
- A handful of artifacts that match what `mock.ts` returns.

The script is idempotent: it `DELETE`s the seeded org cascade then re-inserts. It throws hard if `process.env.NODE_ENV === 'production'`.

### Auth scoping + demo constants

Better Auth is unwired today and is out of scope for this slice. Every call site uses a hardcoded `orgId = ACME_DEMO_ORG_ID` constant. Replacing this with a real session in the future is a one-line change at each call site.

`src/lib/queries/index.ts` re-exports two constants used at call sites:

- `ACME_DEMO_ORG_ID` — the seeded org id.
- `DEMO_RUN_ID` — the MNIST run id used by the landing's `live-demo`.

Both are declared in `scripts/seed.ts` and imported by the queries barrel so call sites have one canonical source.

### Cleanup

`src/lib/mock.ts`, `src/lib/demo-run.ts`, and `src/lib/workspace-mock.ts` are deleted as the final step of Agent B, only after `tsc` and `bun run build` confirm no remaining imports.

### Env

`.env.example` documents `DATABASE_URL` (PlanetScale connection string). Local dev setup: `bun install` → `cp .env.example .env.local` → `bun run db:push` → `bun run db:seed` → `bun dev`. Running without `DATABASE_URL` throws at first query (already enforced by `getDb()`).

## §3 — Landing page at `/`

Light + minimal, layer9-leaning calm with modal.com's structural density. Reuses existing fonts (Instrument Serif display, IBM Plex Sans body, JetBrains Mono code) and palette tokens from `src/app/globals.css`. No new dependencies.

### Files

```
src/app/page.tsx                     ← marketing page (RSC, no client JS unless needed)
src/app/(marketing)/layout.tsx       ← serif wordmark header, thin footer, no sidebar
src/components/marketing/
├─ hero.tsx           huge serif title, one-line subhead, two CTAs
├─ feature-band.tsx   reusable: eyebrow + serif title + 1 paragraph + visual slot
├─ code-sample.tsx    mono code block with line numbers
├─ live-demo.tsx      a real chart, reuses src/components/charts/metric-chart.tsx
└─ footer.tsx         hairline rule + small mono link columns
```

### Sections, top to bottom

1. **Hero.** Instrument Serif H1 (~72px desktop), one-line subhead in IBM Plex, two CTAs — primary `Open dashboard` → `/dashboard`, secondary `Read the docs` (anchors to `#sdk`). Tiny mono eyebrow above the title: `silkworm · experiment tracking`.
2. **Feature band 1 — Ingest.** Eyebrow `01 / ingest`, serif title, one paragraph, visual = `code-sample` showing a 4-line `silkworm.init` + `silkworm.log` snippet.
3. **Feature band 2 — Track.** Eyebrow `02 / track`, serif title, paragraph, visual = `live-demo` driven by `queries/runs.ts::getRunMetrics(DEMO_RUN_ID, 'loss')`. Real seeded data, one chart, contained — layer9-style, not a sprawling preview.
4. **Feature band 3 — Compare.** Eyebrow `03 / compare`, serif title, paragraph, visual = `MetricChart` overlay of two seeded runs.
5. **CTA strip.** One serif line, single `Open dashboard` button. No pricing, no FAQ, no integrations row.
6. **Footer.** Wordmark, hairline rule, three small mono columns (`product`, `resources`, `legal`). Dashboard link and the GitHub repo link are real; the rest are `#` placeholders.

### Style cues

- *layer9.com*: heavy serif display, generous whitespace, tiny mono eyebrows, hairline rules instead of card borders, no shadows.
- *modal.com*: numbered section eyebrows (`01 /`), real chart embedded in a feature band, dense mono code-sample band with line numbers, short tight paragraphs.

Motion is used once — a single fade-in on the chart when it scrolls into view. Everything else is static.

## §4 — Parallel-agent execution plan

Three worktrees, three agents, sequenced merge.

```
silkworm/                       ← main (base)
├─ worktree-A: route-split      ← agent A (lands first)
├─ worktree-B: db-wiring        ← agent B (depends on A's interface, then parallel with C)
└─ worktree-C: landing          ← agent C (depends on A's marketing layout, then parallel with B)
```

### Agent A — Route restructure + query interface (foundation)

Owns:
- Move `src/app/(app)/*` → `src/app/dashboard/*` (preserves contents).
- Add `src/app/(marketing)/layout.tsx` as a bare scaffold (default `<html>`-friendly structure, no sidebar). Agent C replaces the body with the real header/footer; A only needs the file to exist so C's route group resolves.
- Create `src/lib/queries/{projects,runs,artifacts,workspace,index}.ts` with **mock-backed bodies**: same function signatures §2 specifies, but each implementation imports `mock.ts`/`demo-run.ts`/`workspace-mock.ts` and returns the existing shapes. The point is to freeze the interface contract.
- Rewrite every page to import from `~/lib/queries` instead of `~/lib/mock`.
- Update sidebar links and add the `/p/:path*` → `/dashboard/p/:path*` redirect.

Does not touch: `src/lib/schema.ts`, `src/lib/db.ts`, any new marketing component beyond the layout shell.

Output: an app that looks identical to today but lives at `/dashboard`, with every page reading through `queries/*`.

### Agent B — Drizzle wiring + seed

Depends on Agent A's queries module landing first.

Owns:
- Add `run_metrics` to `src/lib/schema.ts`.
- Replace each `queries/*.ts` body with real Drizzle queries against `getDb()`. Function signatures and return shapes are frozen by A; B is only filling in implementations.
- Write `scripts/seed.ts` and add `db:seed` to `package.json`.
- Delete `src/lib/mock.ts`, `src/lib/demo-run.ts`, `src/lib/workspace-mock.ts` as the final step.
- Update `.env.example` and `README.md` (Quick start section) to document the seed.

Does not touch: any file under `src/app/` other than verifying `tsc` passes; any marketing component.

### Agent C — Landing page

Depends only on Agent A's `(marketing)/layout.tsx` skeleton landing first. Runs fully parallel with B.

Owns:
- All files under `src/app/page.tsx`, `src/app/(marketing)/` (replaces A's scaffold body with the real wordmark header and footer), and `src/components/marketing/`.
- `live-demo.tsx` calls `queries/runs.ts::getRunMetrics(DEMO_RUN_ID, 'loss')`. The shape is stable from A and `DEMO_RUN_ID` is re-exported from `~/lib/queries`, so this works whether B has merged or not.

Does not touch: anything under `src/app/dashboard/`, `src/lib/schema.ts`, `src/lib/db.ts`, `src/lib/queries/*`.

### Merge order

1. A → main.
2. B and C land in either order; their diffs touch disjoint files.

### Spawn mechanism

One message with three parallel `Agent` tool calls, each using `isolation: "worktree"` and `subagent_type: "general-purpose"`. Each prompt is self-contained: the relevant section of this design doc, the explicit file list the agent owns, the explicit file list it must NOT touch, and the verification command `bun run build && bun run lint`. Each agent's worktree path + branch is returned in its summary; main-branch reviewer (the orchestrating Claude session) merges in the order above after the user approves each.

### Risk + mitigation

- *A finishes slowly → blocks B and C.* A's deliverable is intentionally small (route move + interface stubs wrapping existing mock), so it lands fast.
- *Interface drift between A and B.* A's queries module exports TypeScript types that B must satisfy; `tsc` fails the build on divergence.
- *Worktree merge conflicts.* B and C touch disjoint files. A is sequenced before both.

## Out of scope

- Better Auth wiring (Better Auth is in `package.json` but unconfigured; not part of this slice).
- ClickHouse, Kinesis, S3, Qdrant — phase 2/3 per `README.md`.
- Restyling the dashboard or its components.
- Pricing page, docs site, FAQ.
- Python SDK (`pip install silkworm`); the code sample in §3 shows the intended shape but the SDK does not exist yet.

## Verification

After all three agents merge:

- `bun run build` succeeds.
- `bun run lint` clean.
- `bun run db:push && bun run db:seed` succeeds against a PlanetScale dev branch.
- `bun dev` → `/` renders the landing, `/dashboard` renders the projects grid with seeded data, `/dashboard/p/<project>/runs/<runId>` renders the run-detail page with the seeded MNIST run.
- `/p/<project>` (old URL) 308-redirects to `/dashboard/p/<project>`.
- `src/lib/mock.ts`, `src/lib/demo-run.ts`, `src/lib/workspace-mock.ts` no longer exist.
