import swaggerJsdoc from "swagger-jsdoc";
import type { OpenAPIV3 } from "openapi-types";
import { env } from "./env";

const definition: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: env.APP_NAME,
    version: "1.0.0",
    description:
      "Production-ready Express backend with JWT auth, RBAC, PostgreSQL, Redis caching, rate limiting, and Swagger docs.",
  },
  servers: [{ url: env.APP_URL }],
  paths: {},
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition,
  apis: ["./src/routes/*.ts"],
});
