import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, auditLogsTable } from "@workspace/db";
import {
  ListAuditLogsResponse,
  ListAuditLogsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/audit-logs", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const q = ListAuditLogsQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(auditLogsTable)
    .where(eq(auditLogsTable.userId, req.user.id))
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(q.data.limit ?? 100);
  res.json(ListAuditLogsResponse.parse(rows));
});

export default router;
