import { Router, type IRouter } from "express";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import {
  db,
  accountsTable,
  transactionsTable,
  categoriesTable,
} from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetSpendingByCategoryResponse,
  GetSpendingByCategoryQueryParams,
  GetMonthlyTrendsResponse,
  GetMonthlyTrendsQueryParams,
  GetTopMerchantsResponse,
  GetTopMerchantsQueryParams,
} from "@workspace/api-zod";
import { isNotNull } from "drizzle-orm";

const router: IRouter = Router();

const LIABILITY_TYPES = new Set(["credit", "loan"]);

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;

  const accounts = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.userId, userId));

  let totalAssets = 0;
  let totalLiabilities = 0;
  for (const a of accounts) {
    const bal = Number(a.balance);
    if (LIABILITY_TYPES.has(a.type)) totalLiabilities += Math.abs(bal);
    else totalAssets += bal;
  }
  const totalBalance = totalAssets - totalLiabilities;

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const monthAgg = await db
    .select({
      type: transactionsTable.type,
      total: sql<string>`COALESCE(SUM(${transactionsTable.amount}), 0)`,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, userId),
        gte(transactionsTable.occurredAt, monthStart),
      ),
    )
    .groupBy(transactionsTable.type);

  let monthIncome = "0";
  let monthExpense = "0";
  for (const r of monthAgg) {
    if (r.type === "income") monthIncome = String(r.total);
    if (r.type === "expense") monthExpense = String(r.total);
  }

  const [{ count: txnCount }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, userId));

  const recent = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, userId))
    .orderBy(desc(transactionsTable.occurredAt))
    .limit(10);

  res.json(
    GetDashboardSummaryResponse.parse({
      totalBalance: totalBalance.toFixed(2),
      totalAssets: totalAssets.toFixed(2),
      totalLiabilities: totalLiabilities.toFixed(2),
      monthIncome: Number(monthIncome).toFixed(2),
      monthExpense: Number(monthExpense).toFixed(2),
      accountCount: accounts.length,
      transactionCount: txnCount,
      recentTransactions: recent,
    }),
  );
});

router.get(
  "/dashboard/spending-by-category",
  async (req, res): Promise<void> => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const q = GetSpendingByCategoryQueryParams.safeParse(req.query);
    if (!q.success) {
      res.status(400).json({ error: q.error.message });
      return;
    }
    const days = q.data.days ?? 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await db
      .select({
        categoryId: transactionsTable.categoryId,
        categoryName: sql<string>`COALESCE(${categoriesTable.name}, 'Uncategorized')`,
        color: categoriesTable.color,
        total: sql<string>`COALESCE(SUM(${transactionsTable.amount}), 0)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(transactionsTable)
      .leftJoin(
        categoriesTable,
        eq(categoriesTable.id, transactionsTable.categoryId),
      )
      .where(
        and(
          eq(transactionsTable.userId, req.user.id),
          eq(transactionsTable.type, "expense"),
          gte(transactionsTable.occurredAt, since),
        ),
      )
      .groupBy(
        transactionsTable.categoryId,
        categoriesTable.name,
        categoriesTable.color,
      )
      .orderBy(desc(sql`SUM(${transactionsTable.amount})`));

    res.json(
      GetSpendingByCategoryResponse.parse(
        rows.map((r) => ({
          categoryId: r.categoryId,
          categoryName: r.categoryName,
          color: r.color,
          total: String(r.total),
          count: r.count,
        })),
      ),
    );
  },
);

router.get("/dashboard/monthly-trends", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const q = GetMonthlyTrendsQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const months = q.data.months ?? 6;
  const since = new Date();
  since.setUTCDate(1);
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCMonth(since.getUTCMonth() - (months - 1));

  const rows = await db
    .select({
      month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${transactionsTable.occurredAt}), 'YYYY-MM')`,
      type: transactionsTable.type,
      total: sql<string>`COALESCE(SUM(${transactionsTable.amount}), 0)`,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, req.user.id),
        gte(transactionsTable.occurredAt, since),
      ),
    )
    .groupBy(
      sql`DATE_TRUNC('month', ${transactionsTable.occurredAt})`,
      transactionsTable.type,
    );

  const map = new Map<string, { income: number; expense: number }>();
  // initialize all months
  for (let i = 0; i < months; i++) {
    const d = new Date(since);
    d.setUTCMonth(d.getUTCMonth() + i);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    map.set(key, { income: 0, expense: 0 });
  }
  for (const r of rows) {
    const cur = map.get(r.month) ?? { income: 0, expense: 0 };
    if (r.type === "income") cur.income = Number(r.total);
    if (r.type === "expense") cur.expense = Number(r.total);
    map.set(r.month, cur);
  }

  const out = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      income: v.income.toFixed(2),
      expense: v.expense.toFixed(2),
    }));

  res.json(GetMonthlyTrendsResponse.parse(out));
});

router.get("/dashboard/top-merchants", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const q = GetTopMerchantsQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const days = q.data.days ?? 30;
  const limit = q.data.limit ?? 10;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      merchant: sql<string>`${transactionsTable.merchant}`,
      total: sql<string>`COALESCE(SUM(${transactionsTable.amount}), 0)`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, req.user.id),
        eq(transactionsTable.type, "expense"),
        gte(transactionsTable.occurredAt, since),
        isNotNull(transactionsTable.merchant),
      ),
    )
    .groupBy(transactionsTable.merchant)
    .orderBy(desc(sql`SUM(${transactionsTable.amount})`))
    .limit(limit);

  res.json(
    GetTopMerchantsResponse.parse(
      rows.map((r) => ({
        merchant: r.merchant,
        total: String(r.total),
        count: r.count,
      })),
    ),
  );
});

export default router;
