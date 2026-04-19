import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool";
import { logger } from "../lib/logger";

async function runMigrations() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationDir = path.resolve(currentDir, "../../database/migrations");
  const files = (await readdir(migrationDir)).sort();

  for (const file of files) {
    logger.info(`Running migration ${file}`);
    const sql = await readFile(path.join(migrationDir, file), "utf8");
    await pool.query(sql);
  }

  logger.info("Migrations completed");
  await pool.end();
}

runMigrations().catch(async (error) => {
  logger.error(error);
  await pool.end();
  process.exit(1);
});
