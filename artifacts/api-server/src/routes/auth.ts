import { Router, type IRouter, type Request, type Response } from "express";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function getSafeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

router.get("/auth/user", (req: Request, res: Response) => {
  const user = req.isAuthenticated()
    ? {
        id: req.user.id,
        email: req.user.email,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
      }
    : null;

  res.json(
    GetCurrentAuthUserResponse.parse({
      user,
    }),
  );
});

router.get("/login", (req: Request, res: Response) => {
  const returnTo = getSafeReturnTo(req.query.returnTo);
  res.redirect(returnTo);
});

router.get("/logout", (_req: Request, res: Response) => {
  res.redirect("/login");
});

router.post("/mobile-auth/token-exchange", (_req: Request, res: Response) => {
  res.status(501).json({ error: "Mobile OIDC token exchange is disabled in local mode." });
});

router.post("/mobile-auth/logout", (_req: Request, res: Response) => {
  res.json({ success: true });
});

export default router;
