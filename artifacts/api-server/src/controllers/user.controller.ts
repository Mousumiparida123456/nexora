import type { Request, Response } from "express";
import { userService } from "../services/user.service";

export const userController = {
  async listUsers(req: Request, res: Response) {
    const data = await userService.listUsers(req.query as unknown as {
      page: number;
      limit: number;
      role?: "user" | "admin";
      search?: string;
    });

    res.status(200).json(data);
  },
};
