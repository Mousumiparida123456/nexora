import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.NODE_ENV = "test";

vi.mock("../src/db/pool", () => ({
  pool: {
    query: vi.fn(async (sql: string) => {
      if (sql.includes("SELECT 1")) {
        return { rows: [{ "?column?": 1 }] };
      }

      return { rows: [] };
    }),
  },
}));

const { createApp } = await import("../src/app");

describe("createApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("serves the health endpoint", async () => {
    const response = await request(createApp()).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("rejects unauthenticated profile access", async () => {
    const response = await request(createApp()).get("/api/v1/auth/me");

    expect(response.status).toBe(401);
  });

  it("validates malformed registration payloads", async () => {
    const response = await request(createApp()).post("/api/v1/auth/register").send({
      email: "bad",
      password: "short",
      fullName: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });
});
