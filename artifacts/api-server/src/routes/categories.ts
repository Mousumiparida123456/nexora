import { Router, type IRouter } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db, categoriesTable } from "@workspace/db";
import {
  CreateCategoryBody,
  DeleteCategoryParams,
  ListCategoriesResponse,
  ListCategoriesResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rows = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.userId, req.user.id))
    .orderBy(asc(categoriesTable.name));
  res.json(ListCategoriesResponse.parse(rows));
});

router.post("/categories", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(categoriesTable)
    .values({
      userId: req.user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      icon: parsed.data.icon ?? null,
      color: parsed.data.color ?? null,
    })
    .returning();
  res.status(201).json(ListCategoriesResponseItem.parse(row));
});

router.delete("/categories/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(categoriesTable)
    .where(
      and(
        eq(categoriesTable.id, params.data.id),
        eq(categoriesTable.userId, req.user.id),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
