import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/api-error";
import { tokenService } from "../services/token.service";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const cookieToken = req.cookies["access-token"];
  const token = bearerToken ?? cookieToken;

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    req.auth = tokenService.verifyAccessToken(token);
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired access token"));
  }
}

export function authorize(...roles: Array<"user" | "admin">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!roles.includes(req.auth.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }

    return next();
  };
}
