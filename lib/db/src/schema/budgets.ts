import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  numeric,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";
import { categoriesTable } from "./categories";

export const budgetsTable = pgTable(
  "budgets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    categoryId: varchar("category_id").references(() => categoriesTable.id, {
      onDelete: "cascade",
    }),
    name: varchar("name").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    period: varchar("period").notNull().default("monthly"),
    alertThreshold: integer("alert_threshold").notNull().default(80),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("idx_budgets_user").on(t.userId)],
);

export const insertBudgetSchema = createInsertSchema(budgetsTable).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgetsTable.$inferSelect;
