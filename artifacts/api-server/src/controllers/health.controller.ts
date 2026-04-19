import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { cache } from "../lib/cache";

export const healthController = {
  async check(_req: Request, res: Response) {
    let database = "down";
    let cacheStatus = "down";

    try {
      await pool.query("SELECT 1");
      database = "up";
    } catch {
      database = "down";
    }

    try {
      await cache.set("healthcheck", "ok", 5);
      cacheStatus = "up";
    } catch {
      cacheStatus = "down";
    }

    res.status(database === "up" ? 200 : 503).json({
      status: database === "up" ? "ok" : "degraded",
      dependencies: {
        database,
        cache: cacheStatus,
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  },
};
