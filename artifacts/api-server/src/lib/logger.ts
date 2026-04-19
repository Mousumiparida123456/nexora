import { createLogger, format, transports } from "winston";
import { env, isProduction } from "../config/env";

export const logger = createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: env.APP_NAME },
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    isProduction ? format.json() : format.combine(format.colorize(), format.simple()),
  ),
  transports: [new transports.Console()],
});
