import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../lib/api-error";
import { logger } from "../lib/logger";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    message: "Route not found",
  });
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.flatten(),
      requestId: req.requestId,
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
      requestId: req.requestId,
    });
  }

  logger.error({
    err: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    requestId: req.requestId,
    path: req.originalUrl,
  });

  return res.status(500).json({
    message: "Internal server error",
    requestId: req.requestId,
  });
}
