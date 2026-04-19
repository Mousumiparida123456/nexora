import { z } from "zod";

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: z.enum(["user", "admin"]).optional(),
  search: z.string().max(120).optional(),
});
