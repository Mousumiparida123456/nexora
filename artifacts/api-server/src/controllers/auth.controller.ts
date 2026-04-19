import type { Request, Response } from "express";
import ms from "ms";
import { env } from "../config/env";
import { authService } from "../services/auth.service";
import { userService } from "../services/user.service";

function cookieOptions(maxAge: number, httpOnly = true) {
  return {
    httpOnly,
    secure: env.COOKIE_SECURE,
    sameSite: "strict" as const,
    domain: env.COOKIE_DOMAIN || undefined,
    path: "/",
    maxAge,
  };
}

function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string; csrfToken: string },
) {
  res.cookie("access-token", tokens.accessToken, cookieOptions(ms(env.ACCESS_TOKEN_TTL as ms.StringValue), true));
  res.cookie("refresh-token", tokens.refreshToken, cookieOptions(ms(env.REFRESH_TOKEN_TTL as ms.StringValue), true));
  res.cookie("csrf-token", tokens.csrfToken, cookieOptions(ms(env.REFRESH_TOKEN_TTL as ms.StringValue), false));
}

function clearAuthCookies(res: Response) {
  res.clearCookie("access-token");
  res.clearCookie("refresh-token");
  res.clearCookie("csrf-token");
}

export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    setAuthCookies(res, result);

    res.status(200).json({
      message: "Login successful",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      csrfToken: result.csrfToken,
      user: await userService.getProfile(result.user.id),
    });
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies["refresh-token"];
    if (!refreshToken) {
      res.status(401).json({
        message: "Refresh token missing",
      });
      return;
    }

    const result = await authService.refresh(refreshToken, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    setAuthCookies(res, result);

    res.status(200).json({
      message: "Tokens refreshed",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      csrfToken: result.csrfToken,
    });
  },

  async me(req: Request, res: Response) {
    res.status(200).json({
      user: await userService.getProfile(req.auth!.sub),
    });
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.cookies["refresh-token"], req.auth?.sub);
    clearAuthCookies(res);
    res.status(200).json({
      message: "Logged out successfully",
    });
  },
};
