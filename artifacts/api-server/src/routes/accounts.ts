import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, accountsTable } from "@workspace/db";
import {
  CreateAccountBody,
  UpdateAccountBody,
  GetAccountParams,
  UpdateAccountParams,
  DeleteAccountParams,
  GetAccountResponse,
  ListAccountsResponse,
  UpdateAccountResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/accounts", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rows = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.userId, req.user.id))
    .orderBy(desc(accountsTable.createdAt));
  res.json(ListAccountsResponse.parse(rows));
});

router.post("/accounts", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(accountsTable)
    .values({
      userId: req.user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      institution: parsed.data.institution ?? null,
      currency: parsed.data.currency ?? "USD",
      balance: parsed.data.balance ?? "0",
    })
    .returning();
  res.status(201).json(GetAccountResponse.parse(row));
});

router.get("/accounts/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(accountsTable)
    .where(
      and(
        eq(accountsTable.id, params.data.id),
        eq(accountsTable.userId, req.user.id),
      ),
    );
  if (!row) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.json(GetAccountResponse.parse(row));
});

router.patch("/accounts/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(accountsTable)
    .set(parsed.data)
    .where(
      and(
        eq(accountsTable.id, params.data.id),
        eq(accountsTable.userId, req.user.id),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.json(UpdateAccountResponse.parse(row));
});

router.delete("/accounts/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(accountsTable)
    .where(
      and(
        eq(accountsTable.id, params.data.id),
        eq(accountsTable.userId, req.user.id),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
