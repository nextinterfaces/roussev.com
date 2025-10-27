// src/index.ts
import postgres from "postgres";

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

const openapi = {
  openapi: "3.0.3",
  info: { title: "items API", version: "1.0.1", description: "Simple items service built with Bun" },
  servers: [{ url: API_PREFIX }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" }, commit: { type: "string" } } } } },
          },
        },
      },
    },
    "/items": {
      get: {
        summary: "List items",
        responses: {
          "200": {
            description: "Array of items",
            content: { "application/json": { schema: { type: "object", properties: { items: { type: "array", items: { $ref: "#/components/schemas/Item" } } } } } },
          },
        },
      },
      post: {
        summary: "Create item",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] } } },
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Item" } } } },
          "400": { description: "Invalid input" },
        },
      },
    },
    "/test1": {
      get: {
        summary: "Test endpoint",
        responses: {
          "200": {
            description: "Test response",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" } } } } },
          },
        },
      },
    },
  },
  components: {
    schemas: { Item: { type: "object", properties: { id: { type: "integer" }, name: { type: "string" } }, required: ["id", "name"] } },
  },
} as const;

const swaggerHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>items API – Swagger UI</title>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({ url: '${APP_PREFIX}${API_PREFIX}/openapi.json', dom_id: '#swagger-ui' });
      };
    </script>
  </body>
</html>`;

async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url);
  let path = url.pathname;

  // Swagger UI & OpenAPI JSON
  if (path === "/docs" && req.method === "GET") return new Response(swaggerHtml, { headers: { "content-type": "text/html; charset=utf-8" } });
  if (path === `${API_PREFIX}/openapi.json` && req.method === "GET") return json(openapi);

  // if (!path.startsWith(API_PREFIX)) return notFound();
  path = path.slice(API_PREFIX.length) || "/";

  if (path === "/test1" && req.method === "GET") return json({ status: "test1" });

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
