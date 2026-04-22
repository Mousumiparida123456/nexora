import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  numeric,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";
import { accountsTable } from "./accounts";
import { categoriesTable } from "./categories";

export const recurringTransactionsTable = pgTable(
  "recurring_transactions",
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
    cadence: varchar("cadence").notNull(),
    nextRunAt: timestamp("next_run_at", { withTimezone: true }).notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("idx_recurring_user").on(t.userId),
    index("idx_recurring_next_run").on(t.nextRunAt),
  ],
);

export const insertRecurringSchema = createInsertSchema(
  recurringTransactionsTable,
)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    nextRunAt: z.coerce.date(),
  });
export type InsertRecurring = z.infer<typeof insertRecurringSchema>;
export type Recurring = typeof recurringTransactionsTable.$inferSelect;
