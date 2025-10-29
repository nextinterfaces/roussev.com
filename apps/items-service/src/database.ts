import postgres from "postgres";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import type { DatabaseConfig } from "./config.js";
import type { Item, CreateItemDto } from "./models.js";

let sql: ReturnType<typeof postgres> | null = null;

export function initDatabase(config: DatabaseConfig): ReturnType<typeof postgres> {
  if (sql) {
    return sql;
  }

  sql = postgres({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    max: config.max,
    idle_timeout: config.idleTimeout,
    connect_timeout: config.connectTimeout,
  });

  return sql;
}

export function getDatabase(): ReturnType<typeof postgres> {
  if (!sql) {
    throw new Error("Database not initialized. Call initDatabase first.");
  }
  return sql;
}

export async function initSchema(): Promise<void> {
  const tracer = trace.getTracer("items-service");
  return await tracer.startActiveSpan("initDatabase", async (span) => {
    try {
      const db = getDatabase();
      await db`
        CREATE TABLE IF NOT EXISTS items (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log("Database initialized successfully");
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      console.error("Failed to initialize database:", error);
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
      throw error;
    } finally {
      span.end();
    }
  });
}

export class ItemsRepository {
  private readonly db: ReturnType<typeof postgres>;

  constructor() {
    this.db = getDatabase();
  }

  async findAll(): Promise<Item[]> {
    return await this.db<Item[]>`
      SELECT id, name 
      FROM items 
      ORDER BY id
    `;
  }

  async create(dto: CreateItemDto): Promise<Item> {
    const [item] = await this.db<Item[]>`
      INSERT INTO items (name)
      VALUES (${dto.name})
      RETURNING id, name
    `;
    return item;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.db`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

