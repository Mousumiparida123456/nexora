import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const auditLogsTable = pgTable(
  "audit_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    action: varchar("action").notNull(),
    resource: varchar("resource").notNull(),
    resourceId: varchar("resource_id"),
    ip: varchar("ip"),
    userAgent: varchar("user_agent"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_audit_user").on(t.userId),
    index("idx_audit_created").on(t.createdAt),
  ],
);

export type AuditLog = typeof auditLogsTable.$inferSelect;
