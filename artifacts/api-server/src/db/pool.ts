import { Pool } from "pg";
import { env } from "../config/env";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.NODE_ENV === "production" ? 20 : 10,
  idleTimeoutMillis: 30_000,
});
