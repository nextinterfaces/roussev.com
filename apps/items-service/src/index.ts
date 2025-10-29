/**
 *
 * Environment Variables:
 * - PORT                           - Server port (default: 8080)
 * - DB_HOST, DB_PORT, DB_USER      - Database connection
 * - DB_PASSWORD, DB_NAME
 * - OTEL_ENABLED                   - Enable tracing (default: true)
 * - OTEL_EXPORTER_OTLP_ENDPOINT    - OTLP endpoint (default: http://localhost:4318)
 * - OTEL_SERVICE_NAME              - Service name (default: items-service)
 * - OTEL_LOG_LEVEL                 - Log level (default: info)
 */

// Initialize OpenTelemetry first, before any other imports
import { initTelemetry } from "./telemetry";
initTelemetry();

import postgres from "postgres";
import { getSwaggerHtml, getRootPageHtml } from "./html";
import { openapi } from "./openapi";
import { trace, context, SpanStatusCode } from "@opentelemetry/api";

type Item = { id: number; name: string };

const PORT = Number(process.env.PORT || 8080);
const API_PREFIX = "/v1";
const APP_PREFIX = "/items";
const COMMIT_SHA = process.env.COMMIT_SHA || "unknown";

// Database configuration
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
const DB_NAME = process.env.DB_NAME || "postgres";

// Initialize PostgreSQL connection
const sql = postgres({
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Initialize database schema
async function initDatabase() {
  const tracer = trace.getTracer("items-service");
  return await tracer.startActiveSpan("initDatabase", async (span) => {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS items (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log("✅ Database initialized successfully");
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      console.error("❌ Failed to initialize database:", error);
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
      throw error;
    } finally {
      span.end();
    }
  });
}

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

function notFound() {
  return json({ error: "not found" }, { status: 404 });
}

async function handle(req: Request): Promise<Response> {
  const tracer = trace.getTracer("items-service");
  const url = new URL(req.url);
  let path = url.pathname;

  // Create a span for the HTTP request
  return await tracer.startActiveSpan(`${req.method} ${path}`, async (span) => {
    try {
      span.setAttributes({
        "http.method": req.method,
        "http.url": url.toString(),
        "http.target": path,
        "http.scheme": url.protocol.replace(":", ""),
        "http.host": url.host,
      });

      let response: Response;

      // Root page
      if (path === "/" && req.method === "GET") {
        response = new Response(getRootPageHtml(), { headers: { "content-type": "text/html; charset=utf-8" } });
      }
      // Swagger UI & OpenAPI JSON
      else if (path === "/docs" && req.method === "GET") {
        response = new Response(getSwaggerHtml(APP_PREFIX), { headers: { "content-type": "text/html; charset=utf-8" } });
      }
      else if (path === `${API_PREFIX}/openapi.json` && req.method === "GET") {
        response = json(openapi);
      }
      else {
        // if (!path.startsWith(API_PREFIX)) return notFound();
        path = path.slice(API_PREFIX.length) || "/";

        if (path === "/health" && req.method === "GET") {
          try {
            // Check database connection
            await sql`SELECT 1`;
            response = json({ status: "ok", commit: COMMIT_SHA, database: "connected" });
          } catch (error) {
            span.recordException(error as Error);
            span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
            response = json({ status: "degraded", commit: COMMIT_SHA, database: "disconnected", error: String(error) }, { status: 503 });
          }
        }
        else if (path === "/items" && req.method === "GET") {
          try {
            const items = await sql<Item[]>`SELECT id, name FROM items ORDER BY id`;
            span.setAttribute("items.count", items.length);
            response = json({ items });
          } catch (error) {
            console.error("Error fetching items:", error);
            span.recordException(error as Error);
            span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
            response = json({ error: "Failed to fetch items" }, { status: 500 });
          }
        }
        else if (path === "/items" && req.method === "POST") {
          try {
            const body = (await req.json()) as Partial<Item>;
            if (!body?.name || typeof body.name !== "string") {
              response = json({ error: "name required" }, { status: 400 });
            } else {
              const [item] = await sql<Item[]>`
                INSERT INTO items (name)
                VALUES (${body.name})
                RETURNING id, name
              `;
              span.setAttribute("item.id", item.id);
              span.setAttribute("item.name", item.name);
              response = json(item, { status: 201 });
            }
          } catch (error) {
            console.error("Error creating item:", error);
            span.recordException(error as Error);
            span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
            if (error instanceof SyntaxError) {
              response = json({ error: "invalid json" }, { status: 400 });
            } else {
              response = json({ error: "Failed to create item" }, { status: 500 });
            }
          }
        }
        else {
          response = notFound();
        }
      }

      // Set response status on span
      span.setAttribute("http.status_code", response.status);
      if (response.status >= 400) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: `HTTP ${response.status}` });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }

      return response;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
      throw error;
    } finally {
      span.end();
    }
  });
}

// Initialize database and start server
await initDatabase();

const server = Bun.serve({ port: PORT, fetch: handle });
console.log(`items service listening on http://localhost:${server.port}`);
console.log(`Swagger UI: http://localhost:${server.port}/docs`);
console.log(`Database: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
