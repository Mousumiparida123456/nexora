import { ApiError } from "../lib/api-error";
import { auditQueue } from "../lib/audit-queue";
import { generateOpaqueToken, hashPassword, hashToken, verifyPassword } from "../lib/security";
import { userRepository, type UserRecord } from "../repositories/user.repository";
import { tokenService } from "./token.service";

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
};

function buildPayload(user: UserRecord, sessionId: string, type: "access" | "refresh") {
  return {
    sub: user.id,
    role: user.role,
    type,
    sessionId,
  } as const;
}

async function createSession(user: UserRecord, metadata: { ipAddress?: string; userAgent?: string }) {
  const sessionId = generateOpaqueToken(16);
  const accessToken = tokenService.signAccessToken(buildPayload(user, sessionId, "access"));
  const refreshToken = tokenService.signRefreshToken(buildPayload(user, sessionId, "refresh"));
  const csrfToken = generateOpaqueToken(24);

  await userRepository.storeRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    csrfToken,
  } satisfies SessionTokens;
}

export const authService = {
  async register(input: { email: string; password: string; fullName: string }) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ApiError(409, "Email is already registered");
    }

    const user = await userRepository.createUser({
      email: input.email,
      passwordHash: await hashPassword(input.password),
      fullName: input.fullName,
    });

    auditQueue.enqueue({
      action: "auth.register",
      actorId: user.id,
      metadata: { email: user.email },
    });

    return user;
  },

  async login(input: { email: string; password: string; ipAddress?: string; userAgent?: string }) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw new ApiError(401, "Invalid email or password");
    }

    const matches = await verifyPassword(input.password, user.passwordHash);
    if (!matches) {
      throw new ApiError(401, "Invalid email or password");
    }

    auditQueue.enqueue({
      action: "auth.login",
      actorId: user.id,
      metadata: { email: user.email },
    });

    return {
      user,
      ...(await createSession(user, input)),
    };
  },

  async refresh(refreshToken: string, metadata: { ipAddress?: string; userAgent?: string }) {
    const payload = tokenService.verifyRefreshToken(refreshToken);
    if (payload.type !== "refresh") {
      throw new ApiError(401, "Invalid refresh token");
    }

    const tokenRecord = await userRepository.findRefreshToken(hashToken(refreshToken));
    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      throw new ApiError(401, "Refresh token is invalid or expired");
    }

    await userRepository.revokeRefreshToken(hashToken(refreshToken));

    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new ApiError(401, "User is unavailable");
    }

    return {
      user,
      ...(await createSession(user, metadata)),
    };
  },

  async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      await userRepository.revokeRefreshToken(hashToken(refreshToken));
    }

    if (userId) {
      await userRepository.revokeAllUserRefreshTokens(userId);
    }
  },
};
