import type { IncomingMessage, ServerResponse } from "http";

type AuthUserResponse = {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  } | null;
};

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function setCors(res: ServerResponse) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, authorization");
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", "http://localhost");
  const pathname = url.pathname;

  if (pathname === "/api/healthz" || pathname === "/api/v1/healthz") {
    sendJson(res, 200, {
      status: "ok",
      service: "Nexora API",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if ((pathname === "/api/login" || pathname === "/api/v1/login") && req.method === "GET") {
    const returnTo = url.searchParams.get("returnTo") || "/";
    res.statusCode = 302;
    res.setHeader("location", returnTo);
    res.end();
    return;
  }

  if ((pathname === "/api/logout" || pathname === "/api/v1/logout") && req.method === "GET") {
    res.statusCode = 302;
    res.setHeader("location", "/login");
    res.end();
    return;
  }

  if ((pathname === "/api/auth/user" || pathname === "/api/v1/auth/user") && req.method === "GET") {
    const payload: AuthUserResponse = {
      user: {
        id: "local-user",
        email: "test@example.com",
        firstName: null,
        lastName: null,
        profileImageUrl: null,
      },
    };
    sendJson(res, 200, payload);
    return;
  }

  sendJson(res, 404, {
    error: "Not found",
    path: pathname,
  });
}
