import { type Request, type Response, type NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
      };
      isAuthenticated: () => boolean;
    }
  }
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  // TEMP local auth (for development)
  req.isAuthenticated = () => true;

  req.user = {
    id: "local-user",
    email: "test@example.com",
  };

  next();
}
