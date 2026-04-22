import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";
import { accountsTable } from "./accounts";
import { categoriesTable } from "./categories";

export const transactionsTable = pgTable(
  "transactions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    accountId: varchar("account_id")
      .notNull()
      .references(() => accountsTable.id, { onDelete: "cascade" }),
    categoryId: varchar("category_id").references(() => categoriesTable.id, {
      onDelete: "set null",
    }),
    type: varchar("type").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    description: text("description").notNull(),
    merchant: varchar("merchant"),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_transactions_user").on(t.userId),
    index("idx_transactions_account").on(t.accountId),
    index("idx_transactions_occurred").on(t.occurredAt),
  ],
);

export const insertTransactionSchema = createInsertSchema(transactionsTable)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
  })
  .extend({
    occurredAt: z.coerce.date().optional(),
  });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
