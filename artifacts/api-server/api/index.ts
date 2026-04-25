import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(cors({ 
  origin: ["https://nexora-finance-fintech-dashboard.vercel.app", "http://localhost:5173"], 
  credentials: true 
}));

// Root route with versioning to verify deployment
app.get("/", (req, res) => res.send("🚀 NEXORA API IS LIVE - AUTH FIX APPLIED v1"));

// Health check
app.get("/api/healthz", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "Nexora API",
    message: "Nexora API is running correctly",
    timestamp: new Date().toISOString()
  });
});

// Helper to parse username from cookies
const getUsernameFromCookies = (req: express.Request) => {
  return req.cookies?.nexora_username || null;
};

// Helper to check if session is active
const isSessionActive = (req: express.Request) => {
  return req.cookies?.nexora_session === "active";
};

// EXPLICIT ROUTES TO AVOID ROUTING ISSUES
// =====================================

// Login
const handleLogin = (req: express.Request, res: express.Response) => {
  const returnTo = req.query.returnTo as string || "/dashboard";
  const username = req.query.username as string;
  const clientOrigin = "https://nexora-finance-fintech-dashboard.vercel.app";

  res.cookie("nexora_session", "active", {
    maxAge: 86400000,
    httpOnly: false,
    secure: true,
    sameSite: "none"
  });

  if (username) {
    res.cookie("nexora_username", username, { 
      maxAge: 86400000, 
      httpOnly: false,
      secure: true,
      sameSite: "none"
    });
  }

  const redirectUrl = returnTo.startsWith("http") 
    ? returnTo 
    : `${clientOrigin}${returnTo.startsWith("/") ? "" : "/"}${returnTo}`;
  res.redirect(redirectUrl);
};

app.get("/login", handleLogin);
app.get("/v1/login", handleLogin);
app.get("/api/login", handleLogin);
app.get("/api/v1/login", handleLogin);

// Logout
const handleLogout = (req: express.Request, res: express.Response) => {
  const cookieOptions = { 
    secure: true, 
    sameSite: "none" as const, 
    path: "/",
  };
  
  res.clearCookie("nexora_session", cookieOptions);
  res.clearCookie("nexora_username", cookieOptions);
  
  // Fallback: Also clear without options just in case
  res.clearCookie("nexora_session");
  res.clearCookie("nexora_username");
  
  const returnTo = req.query.returnTo as string || "https://nexora-finance-fintech-dashboard.vercel.app/login";
  res.redirect(returnTo);
};

app.get("/logout", handleLogout);
app.get("/v1/logout", handleLogout);
app.get("/api/logout", handleLogout);
app.get("/api/v1/logout", handleLogout);

// Auth User
const handleAuthUser = (req: express.Request, res: express.Response) => {
  if (!isSessionActive(req)) {
    return res.json({ user: null });
  }

  const username = getUsernameFromCookies(req);
  res.json({
    user: {
      id: "user_prod_123",
      email: username ? `${username.toLowerCase()}@example.com` : "user@example.com",
      firstName: username || "Nexora",
      lastName: username ? "" : "User",
      profileImageUrl: null,
    }
  });
};

app.get("/auth/user", handleAuthUser);
app.get("/v1/auth/user", handleAuthUser);
app.get("/api/auth/user", handleAuthUser);
app.get("/api/v1/auth/user", handleAuthUser);

export default app;
module.exports = app;
