import {
  drizzle,
  type PlanetScaleDatabase,
} from "drizzle-orm/planetscale-serverless";
import { Client } from "@planetscale/database";
import * as schema from "./schema";

/**
 * Lazy singleton — defer the PlanetScale Client construction until the first
 * call, so that importing this module on a Vercel build (or any environment
 * without DATABASE_URL set) doesn't crash. Phase 1 doesn't read from the DB.
 */
let _db: PlanetScaleDatabase<typeof schema> | null = null;

export function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set — required to use the database.");
  }
  _db = drizzle(new Client({ url }), { schema });
  return _db;
}

export type DB = ReturnType<typeof getDb>;
