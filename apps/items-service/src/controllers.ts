/**
 * Controllers
 * Business logic for handling requests
 */

import { trace, SpanStatusCode } from "@opentelemetry/api";
import { ItemsRepository } from "./database";
import type { CreateItemDto, HealthResponse, ItemsListResponse } from "./models";
import { json, badRequest, internalServerError, serviceUnavailable } from "./http-utils";

/**
 * Health check controller
 */
export class HealthController {
  constructor(
    private repository: ItemsRepository,
    private commitSha: string
  ) {}

  async check(): Promise<Response> {
    const tracer = trace.getTracer("items-service");
    return await tracer.startActiveSpan("healthCheck", async (span) => {
      try {
        const isHealthy = await this.repository.healthCheck();
        
        if (isHealthy) {
          const response: HealthResponse = {
            status: "ok",
            commit: this.commitSha,
            database: "connected",
          };
          span.setStatus({ code: SpanStatusCode.OK });
          return json(response);
        } else {
          const response: HealthResponse = {
            status: "degraded",
            commit: this.commitSha,
            database: "disconnected",
          };
          span.setStatus({ code: SpanStatusCode.ERROR, message: "Database disconnected" });
          return serviceUnavailable(response);
        }
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
        
        const response: HealthResponse = {
          status: "degraded",
          commit: this.commitSha,
          database: "disconnected",
          error: String(error),
        };
        return serviceUnavailable(response);
      } finally {
        span.end();
      }
    });
  }
}

/**
 * Items controller
 */
export class ItemsController {
  constructor(private repository: ItemsRepository) {}

  /**
   * List all items
   */
  async list(): Promise<Response> {
    const tracer = trace.getTracer("items-service");
    return await tracer.startActiveSpan("listItems", async (span) => {
      try {
        const items = await this.repository.findAll();
        span.setAttribute("items.count", items.length);
        span.setStatus({ code: SpanStatusCode.OK });
        
        const response: ItemsListResponse = { items };
        return json(response);
      } catch (error) {
        console.error("Error fetching items:", error);
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
        return internalServerError("Failed to fetch items");
      } finally {
        span.end();
      }
    });
  }

  /**
   * Create a new item
   */
  async create(req: Request): Promise<Response> {
    const tracer = trace.getTracer("items-service");
    return await tracer.startActiveSpan("createItem", async (span) => {
      try {
        // Parse and validate request body
        let body: Partial<CreateItemDto>;
        try {
          body = (await req.json()) as Partial<CreateItemDto>;
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({ code: SpanStatusCode.ERROR, message: "Invalid JSON" });
          span.end();
          return badRequest("invalid json");
        }

        // Validate required fields
        if (!body?.name || typeof body.name !== "string") {
          span.setStatus({ code: SpanStatusCode.ERROR, message: "Name required" });
          span.end();
          return badRequest("name required");
        }

        // Create item
        const item = await this.repository.create({ name: body.name });
        
        span.setAttribute("item.id", item.id);
        span.setAttribute("item.name", item.name);
        span.setStatus({ code: SpanStatusCode.OK });
        
        return json(item, { status: 201 });
      } catch (error) {
        console.error("Error creating item:", error);
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
        return internalServerError("Failed to create item");
      } finally {
        span.end();
      }
    });
  }
}

