import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  boolean,
  json,
  index,
  uniqueIndex,
  mysqlEnum,
  double,
} from "drizzle-orm/mysql-core";

/* ─────────── auth (Better Auth core tables) ─────────── */

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  name: varchar("name", { length: 128 }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
    activeOrgId: varchar("active_org_id", { length: 36 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("idx_sessions_user").on(t.userId)],
);

export const accounts = mysqlTable(
  "accounts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    providerId: varchar("provider_id", { length: 64 }).notNull(),
    accountId: varchar("account_id", { length: 128 }).notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    password: text("password"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("uniq_provider_account").on(t.providerId, t.accountId)],
);

export const verifications = mysqlTable("verifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ─────────── orgs ─────────── */

export const orgs = mysqlTable("orgs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const members = mysqlTable(
  "members",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    orgId: varchar("org_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    role: mysqlEnum("role", ["owner", "admin", "member", "viewer"])
      .default("member")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("uniq_member").on(t.orgId, t.userId),
    index("idx_members_user").on(t.userId),
  ],
);

export const apiKeys = mysqlTable(
  "api_keys",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    orgId: varchar("org_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    prefix: varchar("prefix", { length: 12 }).notNull(), // sk_live_xxxx
    hash: varchar("hash", { length: 128 }).notNull(), // sha256 of full key
    lastUsedAt: timestamp("last_used_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("idx_api_keys_org").on(t.orgId)],
);

/* ─────────── projects, runs, artifacts ─────────── */

export const projects = mysqlTable(
  "projects",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    orgId: varchar("org_id", { length: 36 }).notNull(),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    visibility: mysqlEnum("visibility", ["private", "internal", "public"])
      .default("private")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("uniq_project_slug").on(t.orgId, t.slug)],
);

export const runs = mysqlTable(
  "runs",
  {
    id: varchar("id", { length: 36 }).primaryKey(), // ulid
    projectId: varchar("project_id", { length: 36 }).notNull(),
    displayName: varchar("display_name", { length: 128 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    status: mysqlEnum("status", [
      "queued",
      "running",
      "finished",
      "failed",
      "crashed",
      "killed",
    ])
      .default("queued")
      .notNull(),
    group: varchar("group", { length: 64 }),
    jobType: varchar("job_type", { length: 64 }),
    notes: text("notes"),
    tags: json("tags").$type<string[]>().default([]).notNull(),
    config: json("config")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    summary: json("summary")
      .$type<Record<string, number>>()
      .default({})
      .notNull(),
    systemInfo: json("system_info")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    heartbeatAt: timestamp("heartbeat_at"),
    endedAt: timestamp("ended_at"),
    durationMs: bigint("duration_ms", { mode: "number" }),
    exitCode: int("exit_code"),
  },
  (t) => [
    index("idx_runs_project_started").on(t.projectId, t.startedAt),
    index("idx_runs_project_status").on(t.projectId, t.status),
  ],
);

export const artifacts = mysqlTable(
  "artifacts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("project_id", { length: 36 }).notNull(),
    runId: varchar("run_id", { length: 36 }),
    name: varchar("name", { length: 128 }).notNull(),
    type: mysqlEnum("type", ["model", "dataset", "code", "result"]).notNull(),
    version: int("version").notNull(),
    sha256: varchar("sha256", { length: 64 }).notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    s3Key: text("s3_key").notNull(),
    metadata: json("metadata")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("uniq_artifact_version").on(t.projectId, t.name, t.version),
    index("idx_artifact_sha").on(t.sha256),
  ],
);

export const runMetrics = mysqlTable(
  "run_metrics",
  {
    runId: varchar("run_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 64 }).notNull(),
    step: bigint("step", { mode: "number" }).notNull(),
    value: double("value").notNull(),
  },
  (t) => [
    uniqueIndex("uniq_run_metric_step").on(t.runId, t.name, t.step),
    index("idx_run_metric").on(t.runId, t.name),
  ],
);

/* Note: metrics live in ClickHouse, not here. Schema there:
 *   metrics(project_id, run_id, name, step UInt64, ts DateTime64(3), value Float64)
 *   ORDER BY (project_id, run_id, name, step)
 */
