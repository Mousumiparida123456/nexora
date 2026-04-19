import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate } from "../middlewares/auth.middleware";
import { authRateLimiter } from "../middlewares/rate-limit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../validators/auth.schemas";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post("/register", authRateLimiter, validate(registerSchema), asyncHandler(authController.register));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login and issue access/refresh tokens
 *     tags: [Auth]
 */
router.post("/login", authRateLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post("/refresh", authRateLimiter, asyncHandler(authController.refresh));
router.get("/me", authenticate, asyncHandler(authController.me));
router.post("/logout", authenticate, asyncHandler(authController.logout));

export default router;
