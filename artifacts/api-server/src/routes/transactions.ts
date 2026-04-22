import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db, transactionsTable, accountsTable } from "@workspace/db";
import {
  CreateTransactionBody,
  UpdateTransactionBody,
  GetTransactionParams,
  UpdateTransactionParams,
  DeleteTransactionParams,
  ListTransactionsQueryParams,
  GetTransactionResponse,
  ListTransactionsResponse,
  UpdateTransactionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function adjustBalance(
  accountId: string,
  delta: string,
): Promise<void> {
  await db
    .update(accountsTable)
    .set({
      balance: sql`(${accountsTable.balance})::numeric + ${delta}::numeric`,
    })
    .where(eq(accountsTable.id, accountId));
}

function signedDelta(type: string, amount: string): string {
  const n = Number(amount);
  if (type === "expense") return (-Math.abs(n)).toString();
  if (type === "income") return Math.abs(n).toString();
  return "0";
}

router.get("/transactions", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const q = ListTransactionsQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const conds = [eq(transactionsTable.userId, req.user.id)];
  if (q.data.accountId)
    conds.push(eq(transactionsTable.accountId, q.data.accountId));
  if (q.data.categoryId)
    conds.push(eq(transactionsTable.categoryId, q.data.categoryId));
  if (q.data.type) conds.push(eq(transactionsTable.type, q.data.type));
  if (q.data.search)
    conds.push(ilike(transactionsTable.description, `%${q.data.search}%`));

  const rows = await db
    .select()
    .from(transactionsTable)
    .where(and(...conds))
    .orderBy(desc(transactionsTable.occurredAt))
    .limit(q.data.limit ?? 100);

  res.json(ListTransactionsResponse.parse(rows));
});

router.post("/transactions", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // verify account belongs to user
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

  const occurredAt = parsed.data.occurredAt
    ? new Date(parsed.data.occurredAt)
    : new Date();

  const [row] = await db
    .insert(transactionsTable)
    .values({
      userId: req.user.id,
      accountId: parsed.data.accountId,
      categoryId: parsed.data.categoryId ?? null,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description,
      merchant: parsed.data.merchant ?? null,
      occurredAt,
    })
    .returning();

  await adjustBalance(row.accountId, signedDelta(row.type, row.amount));

  res.status(201).json(GetTransactionResponse.parse(row));
});

router.get("/transactions/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.id, params.data.id),
        eq(transactionsTable.userId, req.user.id),
      ),
    );
  if (!row) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  res.json(GetTransactionResponse.parse(row));
});

router.patch("/transactions/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.id, params.data.id),
        eq(transactionsTable.userId, req.user.id),
      ),
    );
  if (!existing) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.occurredAt) {
    updates.occurredAt = new Date(parsed.data.occurredAt);
  }

  const [row] = await db
    .update(transactionsTable)
    .set(updates)
    .where(eq(transactionsTable.id, params.data.id))
    .returning();

  // reverse old delta, apply new delta
  await adjustBalance(
    existing.accountId,
    (-Number(signedDelta(existing.type, existing.amount))).toString(),
  );
  await adjustBalance(row.accountId, signedDelta(row.type, row.amount));

  res.json(UpdateTransactionResponse.parse(row));
});

router.delete("/transactions/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(transactionsTable)
    .where(
      and(
        eq(transactionsTable.id, params.data.id),
        eq(transactionsTable.userId, req.user.id),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  await adjustBalance(
    row.accountId,
    (-Number(signedDelta(row.type, row.amount))).toString(),
  );
  res.sendStatus(204);
});

export default router;
