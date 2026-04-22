import { Router, type IRouter } from "express";
import { and, eq, lte, sql } from "drizzle-orm";
import {
  db,
  recurringTransactionsTable,
  transactionsTable,
  accountsTable,
} from "@workspace/db";
import {
  CreateRecurringBody,
  UpdateRecurringBody,
  UpdateRecurringParams,
  DeleteRecurringParams,
  ListRecurringResponse,
  UpdateRecurringResponse,
  RunRecurringResponse,
} from "@workspace/api-zod";
import { recordAudit } from "../lib/audit";

const router: IRouter = Router();

function advance(date: Date, cadence: string): Date {
  const d = new Date(date);
  switch (cadence) {
    case "daily":
      d.setUTCDate(d.getUTCDate() + 1);
      break;
    case "weekly":
      d.setUTCDate(d.getUTCDate() + 7);
      break;
    case "biweekly":
      d.setUTCDate(d.getUTCDate() + 14);
      break;
    case "monthly":
      d.setUTCMonth(d.getUTCMonth() + 1);
      break;
    case "yearly":
      d.setUTCFullYear(d.getUTCFullYear() + 1);
      break;
  }
  return d;
}

function signedDelta(type: string, amount: string): string {
  const n = Number(amount);
  if (type === "expense") return (-Math.abs(n)).toString();
  if (type === "income") return Math.abs(n).toString();
  return "0";
}

router.get("/recurring", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rows = await db
    .select()
    .from(recurringTransactionsTable)
    .where(eq(recurringTransactionsTable.userId, req.user.id))
    .orderBy(recurringTransactionsTable.nextRunAt);
  res.json(ListRecurringResponse.parse(rows));
});

router.post("/recurring", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateRecurringBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [acc] = await db
    .select()
    .from(accountsTable)
    .where(
      and(
        eq(accountsTable.id, parsed.data.accountId),
        eq(accountsTable.userId, req.user.id),
      ),
    );
  if (!acc) {
    res.status(400).json({ error: "Invalid account" });
    return;
  }
  const [row] = await db
    .insert(recurringTransactionsTable)
    .values({
      userId: req.user.id,
      accountId: parsed.data.accountId,
      categoryId: parsed.data.categoryId ?? null,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description,
      merchant: parsed.data.merchant ?? null,
      cadence: parsed.data.cadence,
      nextRunAt: new Date(parsed.data.nextRunAt),
      active: parsed.data.active ?? true,
    })
    .returning();
  await recordAudit(req, "create", "recurring", row.id);
  res.status(201).json(UpdateRecurringResponse.parse(row));
});

router.patch("/recurring/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateRecurringParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateRecurringBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.nextRunAt) {
    updates.nextRunAt = new Date(parsed.data.nextRunAt);
  }
  const [row] = await db
    .update(recurringTransactionsTable)
    .set(updates)
    .where(
      and(
        eq(recurringTransactionsTable.id, params.data.id),
        eq(recurringTransactionsTable.userId, req.user.id),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Recurring not found" });
    return;
  }
  await recordAudit(req, "update", "recurring", row.id);
  res.json(UpdateRecurringResponse.parse(row));
});

router.delete("/recurring/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteRecurringParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(recurringTransactionsTable)
    .where(
      and(
        eq(recurringTransactionsTable.id, params.data.id),
        eq(recurringTransactionsTable.userId, req.user.id),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Recurring not found" });
    return;
  }
  await recordAudit(req, "delete", "recurring", row.id);
  res.sendStatus(204);
});

router.post("/recurring/run", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const now = new Date();
  const due = await db
    .select()
    .from(recurringTransactionsTable)
    .where(
      and(
        eq(recurringTransactionsTable.userId, req.user.id),
        eq(recurringTransactionsTable.active, true),
        lte(recurringTransactionsTable.nextRunAt, now),
      ),
    );

  let generated = 0;
  for (const r of due) {
    let next = new Date(r.nextRunAt);
    while (next <= now) {
      await db.insert(transactionsTable).values({
        userId: r.userId,
        accountId: r.accountId,
        categoryId: r.categoryId,
        type: r.type,
        amount: r.amount,
        description: r.description,
        merchant: r.merchant,
        occurredAt: next,
      });
      await db
        .update(accountsTable)
        .set({
          balance: sql`(${accountsTable.balance})::numeric + ${signedDelta(r.type, r.amount)}::numeric`,
        })
        .where(eq(accountsTable.id, r.accountId));
      generated++;
      next = advance(next, r.cadence);
    }
    await db
      .update(recurringTransactionsTable)
      .set({ nextRunAt: next })
      .where(eq(recurringTransactionsTable.id, r.id));
  }
  await recordAudit(req, "run", "recurring", null, { generated });
  res.json(RunRecurringResponse.parse({ generated }));
});

export default router;
