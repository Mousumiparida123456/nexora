import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import validator from "validator";
import xss from "xss";
import { env } from "../config/env";
import { generateRequestId } from "../lib/security";

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return xss(validator.trim(value));
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, sanitizeValue(nested)]),
    );
  }

  return value;
}

export const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

export const corsMiddleware = cors({
  origin: env.CLIENT_ORIGIN.split(",").map((origin: string) => origin.trim()),
  credentials: true,
});

export function requestContext(req: Request, res: Response, next: NextFunction) {
  req.requestId = req.header("x-request-id") ?? generateRequestId();
  res.setHeader("x-request-id", req.requestId ?? generateRequestId());
  next();
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  req.body = sanitizeValue(req.body);
  req.params = sanitizeValue(req.params) as Request["params"];
  next();
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const headerToken = req.header("x-csrf-token");
  const cookieToken = req.cookies["csrf-token"];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({
      message: "CSRF token validation failed",
    });
  }

  return next();
}
