#!/usr/bin/env bun
/**
 * Seed PlanetScale with the demo state the dashboard expects.
 * Idempotent: drops + reinserts the acme org cascade on every run.
 * Refuses to run in production (NODE_ENV).
 */
import { getDb } from "../src/lib/db";
import * as schema from "../src/lib/schema";
import { ACME_DEMO_ORG_ID, DEMO_RUN_ID } from "../src/lib/demo-ids";
import { sql } from "drizzle-orm";

// Deterministic mock generators used only by the seed. Moved here from
// src/lib/ so the app tree no longer imports them at runtime; they remain
// available so `bun run db:seed` can regenerate the demo dataset.
import { PROJECTS, runsForProject } from "./_seed-fixtures/mock";
import { ARTIFACTS } from "./_seed-fixtures/workspace-mock";

if (process.env.NODE_ENV === "production") {
  throw new Error("scripts/seed.ts refuses to run in NODE_ENV=production");
}

async function main() {
  const db = getDb();

  // 1. Clear existing acme org cascade.
  await db.execute(sql`DELETE FROM run_metrics WHERE run_id IN (SELECT id FROM runs WHERE project_id IN (SELECT id FROM projects WHERE org_id = ${ACME_DEMO_ORG_ID}))`);
  await db.execute(sql`DELETE FROM artifacts WHERE project_id IN (SELECT id FROM projects WHERE org_id = ${ACME_DEMO_ORG_ID})`);
  await db.execute(sql`DELETE FROM runs WHERE project_id IN (SELECT id FROM projects WHERE org_id = ${ACME_DEMO_ORG_ID})`);
  await db.execute(sql`DELETE FROM projects WHERE org_id = ${ACME_DEMO_ORG_ID}`);
  await db.execute(sql`DELETE FROM api_keys WHERE org_id = ${ACME_DEMO_ORG_ID}`);
  await db.execute(sql`DELETE FROM members WHERE org_id = ${ACME_DEMO_ORG_ID}`);
  await db.execute(sql`DELETE FROM orgs WHERE id = ${ACME_DEMO_ORG_ID}`);

  const ARYAN_USER_ID = "00000000-0000-0000-0000-000000000aaa";
  await db.execute(sql`DELETE FROM users WHERE id = ${ARYAN_USER_ID}`);

  // 2. Insert user, org, member, api key.
  await db.insert(schema.users).values({
    id: ARYAN_USER_ID,
    email: "pahwani.aryan@gmail.com",
    emailVerified: true,
    name: "Aryan",
  });

  await db.insert(schema.orgs).values({
    id: ACME_DEMO_ORG_ID,
    slug: "anthrop-labs",
    name: "Anthrop Labs",
  });

  await db.insert(schema.members).values({
    id: "00000000-0000-0000-0000-000000000bbb",
    orgId: ACME_DEMO_ORG_ID,
    userId: ARYAN_USER_ID,
    role: "owner",
  });

  await db.insert(schema.apiKeys).values({
    id: "00000000-0000-0000-0000-000000000ccc",
    orgId: ACME_DEMO_ORG_ID,
    userId: ARYAN_USER_ID,
    name: "demo-key",
    prefix: "sk_live_demo",
    hash: "demo-hash-not-a-real-secret",
  });

  // 3. Insert projects (deterministic ids derived from slug).
  const projectIdBySlug = new Map<string, string>();
  for (const p of PROJECTS) {
    const id = `p_${p.slug}`.padEnd(36, "_").slice(0, 36);
    projectIdBySlug.set(p.slug, id);
    await db.insert(schema.projects).values({
      id,
      orgId: ACME_DEMO_ORG_ID,
      slug: p.slug,
      name: p.name,
      description: p.description,
      visibility: "private",
    });
  }

  // 4. Insert runs + their metric tuples.
  for (const p of PROJECTS) {
    const projectId = projectIdBySlug.get(p.slug)!;
    const runs = runsForProject(p.slug, p.slug === "mnist-mlp" ? 1 : 60);
    for (const r of runs) {
      // mnist-mlp's only run must use the canonical DEMO_RUN_ID.
      const runId = r.id === "demo-run-1" ? DEMO_RUN_ID : r.id;
      const startedAt = new Date(r.startedAt);
      await db.insert(schema.runs).values({
        id: runId,
        projectId,
        displayName: r.name,
        userId: ARYAN_USER_ID,
        status: r.status,
        group: r.group,
        notes: null,
        tags: r.tags,
        config: r.config,
        summary: r.summary,
        systemInfo: { arch: r.arch, gpu: r.gpu },
        startedAt,
        durationMs: Math.round(r.durationS * 1000),
      });

      // Metrics: only the demo run gets real per-step data inserted.
      // Other runs synthesize on the fly in mock for now; once ClickHouse
      // is online, synthetic runs go away. For Phase B parity, also insert
      // a truncated 200-point series for *every* synthetic run so the
      // run-detail charts and overlay chart on the project page render.
      for (const m of r.metrics) {
        const rows = m.data.map((value, step) => ({
          runId,
          name: m.name,
          step,
          value,
        }));
        // PlanetScale single-statement insert size limit ~64MB; chunk by 1000.
        for (let i = 0; i < rows.length; i += 1000) {
          await db.insert(schema.runMetrics).values(rows.slice(i, i + 1000));
        }
      }
    }
  }

  // 5. Insert artifacts.
  for (const a of ARTIFACTS) {
    const projectId = projectIdBySlug.get(a.projectSlug);
    if (!projectId) continue;
    await db.insert(schema.artifacts).values({
      id: a.id,
      projectId,
      runId: a.sourceRunId === "demo-run-1" ? DEMO_RUN_ID : a.sourceRunId,
      name: a.name,
      type: a.type,
      version: a.latestVersion,
      sha256: a.sha256.replace(/^0x/, "").padEnd(64, "0").slice(0, 64),
      sizeBytes: a.sizeBytes,
      s3Key: `s3://silkworm/${a.id}`,
      metadata: { downloads: a.downloads, sourceRunName: a.sourceRunName },
    });
  }

  console.log("seed: done");
  process.exit(0);
}

main().catch((err) => {
  console.error("seed: failed");
  console.error(err);
  process.exit(1);
});
