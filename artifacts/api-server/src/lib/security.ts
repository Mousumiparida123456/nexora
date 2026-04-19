import { createHash, randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateOpaqueToken(size = 32) {
  return randomBytes(size).toString("hex");
}

export function generateRequestId() {
  return randomUUID();
}
