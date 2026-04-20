// @ts-nocheck
import cookieParser from "cookie-parser";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env, isProduction } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { logger } from "./lib/logger";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { apiRateLimiter } from "./middlewares/rate-limit.middleware";
import {
  corsMiddleware,
  csrfProtection,
  requestContext,
  sanitizeInput,
  securityHeaders,
} from "./middlewares/security.middleware";
import router from "./routes/index";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.use(requestContext);
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }),
  );
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(express.json({ limit: env.REQUEST_SIZE_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: env.REQUEST_SIZE_LIMIT }));
  app.use(cookieParser());
  app.use(sanitizeInput);
  app.use(apiRateLimiter);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // @ts-nocheck
  app.use(
    "/api/v1/auth",
    (req, res, next) => {
      const publicPaths = ["/login", "/register", "/refresh"];
      const path = req.path ?? req.url;
      
      if (publicPaths.some((p) => path?.includes(p))) {
        return next();
      }
      
      return csrfProtection(req, res, next);
    },
  );
  
  app.use(env.API_PREFIX, router);

  // @ts-nocheck
  app.get(
    "/",
    (_req, res) => {
      return res.status(200).json({
        name: env.APP_NAME,
        docs: "/docs",
        health: `${env.API_PREFIX}/health`,
      });
    },
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
