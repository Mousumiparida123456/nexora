import type { Request } from "express";
import { db, auditLogsTable } from "@workspace/db";
import { logger } from "./logger";

export async function recordAudit(
  req: Request,
  action: string,
  resource: string,
  resourceId?: string | null,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await db.insert(auditLogsTable).values({
      userId: req.user?.id ?? null,
      action,
      resource,
      resourceId: resourceId ?? null,
      ip: req.ip ?? null,
      userAgent: req.get("user-agent") ?? null,
      metadata: metadata ?? null,
    });
  } catch (err) {
    logger.error({ err }, "Failed to record audit log");
  }
}
