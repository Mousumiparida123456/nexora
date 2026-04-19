import { config } from "dotenv";
import { z } from "zod";

config();

const defaultNodeEnv = process.env["VITEST"] ? "test" : "development";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default(defaultNodeEnv),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_NAME: z.string().default("Nexora API"),
  API_PREFIX: z.string().default("/api/v1"),
  APP_URL: z.string().url().default("http://localhost:4000"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").default("postgres://postgres:postgres@localhost:5432/nexora"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z.string().min(32).default("test-access-secret-12345678901234567890"),
  JWT_REFRESH_SECRET: z.string().min(32).default("test-refresh-secret-1234567890123456789"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  COOKIE_DOMAIN: z.string().default(""),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  REQUEST_SIZE_LIMIT: z.string().default("1mb"),
  LOG_LEVEL: z.string().default("info"),
});

export const env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === "production";
