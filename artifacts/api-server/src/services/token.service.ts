import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { env } from "../config/env";

export type JwtPayload = {
  sub: string;
  role: "user" | "admin";
  type: "access" | "refresh";
  sessionId: string;
};

const jwtOptions = {
  issuer: env.APP_NAME,
  audience: "nexora-web",
};

export const tokenService = {
  signAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      ...jwtOptions,
      expiresIn: env.ACCESS_TOKEN_TTL as StringValue,
    });
  },

  signRefreshToken(payload: JwtPayload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      ...jwtOptions,
      expiresIn: env.REFRESH_TOKEN_TTL as StringValue,
    });
  },

  verifyAccessToken(token: string) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, jwtOptions) as JwtPayload;
  },

  verifyRefreshToken(token: string) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, jwtOptions) as JwtPayload;
  },
};
