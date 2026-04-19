import { Router } from "express";
import { healthController } from "../controllers/health.controller";
import { asyncHandler } from "../lib/async-handler";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health details
 */
router.get("/health", asyncHandler(healthController.check));

export default router;
