/**
 * Controllers
 * Business logic for handling requests
 */

import { trace, SpanStatusCode } from "@opentelemetry/api";
import { ItemsRepository } from "./database.js";
import type { CreateItemDto, HealthResponse, ItemsListResponse } from "./models.js";
import { json, badRequest, internalServerError, serviceUnavailable } from "./http-utils.js";
import { createLoggerWithTrace, logError } from "./logger.js";

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
          const log = createLoggerWithTrace();
          log.warn("Health check failed: database disconnected");

          const response: HealthResponse = {
            status: "degraded",
            commit: this.commitSha,
            database: "disconnected",
          };
          span.setStatus({ code: SpanStatusCode.ERROR, message: "Database disconnected" });
          return serviceUnavailable(response);
        }
      } catch (error) {
        logError(error, "Health check failed with exception");
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

export class ItemsController {
  constructor(private repository: ItemsRepository) {}

  async list(): Promise<Response> {
    const tracer = trace.getTracer("items-service");
    return await tracer.startActiveSpan("listItems", async (span) => {
      try {
        const items = await this.repository.findAll();
        span.setAttribute("items.count", items.length);
        span.setStatus({ code: SpanStatusCode.OK });

        const log = createLoggerWithTrace({ itemCount: items.length });
        log.debug("Items fetched successfully");

        const response: ItemsListResponse = { items };
        return json(response);
      } catch (error) {
        logError(error, "Error fetching items");
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
        return internalServerError("Failed to fetch items");
      } finally {
        span.end();
      }
    });
  }

  async create(req: Request): Promise<Response> {
    const tracer = trace.getTracer("items-service");
    return await tracer.startActiveSpan("createItem", async (span) => {
      try {
        let body: Partial<CreateItemDto>;
        try {
          body = (await req.json()) as Partial<CreateItemDto>;
        } catch (error) {
          const log = createLoggerWithTrace();
          log.warn({ error: String(error) }, "Invalid JSON in create item request");
          span.recordException(error as Error);
          span.setStatus({ code: SpanStatusCode.ERROR, message: "Invalid JSON" });
          span.end();
          return badRequest("invalid json");
        }

        if (!body?.name || typeof body.name !== "string") {
          const log = createLoggerWithTrace();
          log.warn("Create item request missing required field: name");
          span.setStatus({ code: SpanStatusCode.ERROR, message: "Name required" });
          span.end();
          return badRequest("name required");
        }

        const item = await this.repository.create({ name: body.name });

        span.setAttribute("item.id", item.id);
        span.setAttribute("item.name", item.name);
        span.setStatus({ code: SpanStatusCode.OK });

        const log = createLoggerWithTrace({ itemId: item.id, itemName: item.name });
        log.info("Item created successfully");

        return json(item, { status: 201 });
      } catch (error) {
        logError(error, "Error creating item");
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
        return internalServerError("Failed to create item");
      } finally {
        span.end();
      }
    });
  }
}

