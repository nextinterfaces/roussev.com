// src/index.ts
import postgres from "postgres";
import { getSwaggerHtml, getRootPageHtml } from "./html";
import { openapi } from "./openapi";

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
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    throw error;
  }
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
  const url = new URL(req.url);
  let path = url.pathname;

  // Root page
  if (path === "/" && req.method === "GET") return new Response(getRootPageHtml(API_PREFIX), { headers: { "content-type": "text/html; charset=utf-8" } });

  // Swagger UI & OpenAPI JSON
  if (path === "/docs" && req.method === "GET") return new Response(getSwaggerHtml(APP_PREFIX), { headers: { "content-type": "text/html; charset=utf-8" } });
  if (path === `${API_PREFIX}/openapi.json` && req.method === "GET") return json(openapi);

  // if (!path.startsWith(API_PREFIX)) return notFound();
  path = path.slice(API_PREFIX.length) || "/";

  if (path === "/health" && req.method === "GET") {
    try {
      // Check database connection
      await sql`SELECT 1`;
      return json({ status: "ok", commit: COMMIT_SHA, database: "connected" });
    } catch (error) {
      return json({ status: "degraded", commit: COMMIT_SHA, database: "disconnected", error: String(error) }, { status: 503 });
    }
  }

  if (path === "/items" && req.method === "GET") {
    try {
      const items = await sql<Item[]>`SELECT id, name FROM items ORDER BY id`;
      return json({ items });
    } catch (error) {
      console.error("Error fetching items:", error);
      return json({ error: "Failed to fetch items" }, { status: 500 });
    }
  }

  if (path === "/items" && req.method === "POST") {
    try {
      const body = (await req.json()) as Partial<Item>;
      if (!body?.name || typeof body.name !== "string") return json({ error: "name required" }, { status: 400 });

      const [item] = await sql<Item[]>`
        INSERT INTO items (name)
        VALUES (${body.name})
        RETURNING id, name
      `;

      return json(item, { status: 201 });
    } catch (error) {
      console.error("Error creating item:", error);
      if (error instanceof SyntaxError) {
        return json({ error: "invalid json" }, { status: 400 });
      }
      return json({ error: "Failed to create item" }, { status: 500 });
    }
  }

  return notFound();
}

// Initialize database and start server
await initDatabase();

const server = Bun.serve({ port: PORT, fetch: handle });
console.log(`items service listening on http://localhost:${server.port}`);
console.log(`Swagger UI: http://localhost:${server.port}/docs`);
console.log(`Database: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
