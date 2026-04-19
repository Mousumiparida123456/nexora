import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { userRateLimiter } from "../middlewares/rate-limit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { userListQuerySchema } from "../validators/user.schemas";

const router = Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List users with pagination and filtering
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/",
  authenticate,
  authorize("admin"),
  userRateLimiter(),
  validate(userListQuerySchema, "query"),
  asyncHandler(userController.listUsers),
);

export default router;
