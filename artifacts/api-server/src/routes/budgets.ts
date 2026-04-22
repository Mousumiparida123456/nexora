import { Router, type IRouter } from "express";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db, budgetsTable, transactionsTable } from "@workspace/db";
import {
  CreateBudgetBody,
  UpdateBudgetBody,
  UpdateBudgetParams,
  DeleteBudgetParams,
  ListBudgetsResponse,
  UpdateBudgetResponse,
  GetBudgetAlertsResponse,
} from "@workspace/api-zod";
import { recordAudit } from "../lib/audit";

const router: IRouter = Router();

function periodStart(period: string): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  if (period === "weekly") {
    const day = d.getUTCDay();
    d.setUTCDate(d.getUTCDate() - day);
  } else if (period === "yearly") {
    d.setUTCMonth(0, 1);
  } else {
    d.setUTCDate(1);
  }
  return d;
}

async function buildStatuses(userId: string) {
  const rows = await db
    .select()
    .from(budgetsTable)
    .where(eq(budgetsTable.userId, userId))
    .orderBy(desc(budgetsTable.createdAt));

  const result = [];
  for (const b of rows) {
    const since = periodStart(b.period);
    const conds = [
      eq(transactionsTable.userId, userId),
      eq(transactionsTable.type, "expense"),
      gte(transactionsTable.occurredAt, since),
    ];
    if (b.categoryId)
      conds.push(eq(transactionsTable.categoryId, b.categoryId));
    const [{ total }] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${transactionsTable.amount}), 0)`,
      })
      .from(transactionsTable)
      .where(and(...conds));
    const spent = Number(total);
    const amount = Number(b.amount);
    const percentUsed = amount > 0 ? (spent / amount) * 100 : 0;
    result.push({
      budget: b,
      spent: spent.toFixed(2),
      remaining: (amount - spent).toFixed(2),
      percentUsed: Math.round(percentUsed * 10) / 10,
      alert: percentUsed >= b.alertThreshold,
    });
  }
  return result;
}

router.get("/budgets", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json(ListBudgetsResponse.parse(await buildStatuses(req.user.id)));
});

router.get("/budgets/alerts", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const all = await buildStatuses(req.user.id);
  res.json(GetBudgetAlertsResponse.parse(all.filter((b) => b.alert)));
});

router.post("/budgets", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(budgetsTable)
    .values({
      userId: req.user.id,
      name: parsed.data.name,
      amount: parsed.data.amount,
      categoryId: parsed.data.categoryId ?? null,
      period: parsed.data.period ?? "monthly",
      alertThreshold: parsed.data.alertThreshold ?? 80,
    })
    .returning();
  await recordAudit(req, "create", "budget", row.id);
  res.status(201).json(UpdateBudgetResponse.parse(row));
});

router.patch("/budgets/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateBudgetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(budgetsTable)
    .set(parsed.data)
    .where(
      and(
        eq(budgetsTable.id, params.data.id),
        eq(budgetsTable.userId, req.user.id),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }
  await recordAudit(req, "update", "budget", row.id);
  res.json(UpdateBudgetResponse.parse(row));
});

router.delete("/budgets/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteBudgetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(budgetsTable)
    .where(
      and(
        eq(budgetsTable.id, params.data.id),
        eq(budgetsTable.userId, req.user.id),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }
  await recordAudit(req, "delete", "budget", row.id);
  res.sendStatus(204);
});

export default router;
