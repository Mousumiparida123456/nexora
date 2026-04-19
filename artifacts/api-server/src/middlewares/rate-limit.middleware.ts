import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";

const buckets = new Map<string, { count: number; resetAt: number }>();

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

export function userRateLimiter(limit = 300, windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.auth?.sub;
    if (!userId) {
      return next();
    }

    const bucket = buckets.get(userId);
    const now = Date.now();

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(userId, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= limit) {
      return res.status(429).json({
        message: "User rate limit exceeded",
      });
    }

    bucket.count += 1;
    return next();
  };
}
