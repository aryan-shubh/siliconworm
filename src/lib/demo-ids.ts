// Stable ids referenced by both the seed script and the queries layer.
// In Phase A these are arbitrary uuid-shaped strings; Phase B uses the same
// strings as the primary keys it inserts so call sites need zero change.
export const ACME_DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";
export const DEMO_RUN_ID = process.env.DEMO_RUN_ID ?? "demo-run-1";
