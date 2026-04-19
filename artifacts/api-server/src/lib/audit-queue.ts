import { logger } from "./logger";

type AuditJob = {
  action: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
};

export const auditQueue = {
  enqueue(job: AuditJob) {
    setImmediate(() => {
      logger.info({
        event: "audit.processed",
        ...job,
      });
    });
  },
};
