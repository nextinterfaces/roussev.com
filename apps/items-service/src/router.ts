/**
 * Router
 * HTTP request routing and handling
 */

import { trace, SpanStatusCode } from "@opentelemetry/api";
import { HealthController, ItemsController } from "./controllers.js";
import { getSwaggerHtml, getRootPageHtml } from "./html.js";
import { openapi } from "./openapi.js";
import { json, notFound, html } from "./http-utils.js";
import type { ServerConfig } from "./config.js";
import { logRequest, logResponse, logError } from "./logger.js";

type RouteHandler = (req: Request) => Promise<Response> | Response;

interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];

  constructor(
    private config: ServerConfig,
    private healthController: HealthController,
    private itemsController: ItemsController
  ) {
    this.registerRoutes();
  }

  private registerRoutes(): void {
    // Root page
    this.routes.push({
      method: "GET",
      path: "/",
      handler: () => html(getRootPageHtml()),
    });

    // Swagger UI
    this.routes.push({
      method: "GET",
      path: "/docs",
      handler: () => html(getSwaggerHtml(this.config.appPrefix)),
    });

    // OpenAPI spec
    this.routes.push({
      method: "GET",
      path: `${this.config.apiPrefix}/openapi.json`,
      handler: () => json(openapi),
    });

    // Health check
    this.routes.push({
      method: "GET",
      path: `${this.config.apiPrefix}/health`,
      handler: () => this.healthController.check(),
    });

    // List items
    this.routes.push({
      method: "GET",
      path: `${this.config.apiPrefix}/items`,
      handler: () => this.itemsController.list(),
    });

    // Create item
    this.routes.push({
      method: "POST",
      path: `${this.config.apiPrefix}/items`,
      handler: (req) => this.itemsController.create(req),
    });
  }

  private findRoute(method: string, path: string): Route | undefined {
    return this.routes.find((route) => route.method === method && route.path === path);
  }

  async handle(req: Request): Promise<Response> {
    const tracer = trace.getTracer("items-service");
    const url = new URL(req.url);
    const path = url.pathname;
    const startTime = Date.now();

    return await tracer.startActiveSpan(`${req.method} ${path}`, async (span) => {
      try {
        span.setAttributes({
          "http.method": req.method,
          "http.url": url.toString(),
          "http.target": path,
          "http.scheme": url.protocol.replace(":", ""),
          "http.host": url.host,
        });

        logRequest(req);

        // Find and execute matching route
        const route = this.findRoute(req.method, path);
        const response = route ? await route.handler(req) : notFound();

        const duration = Date.now() - startTime;
        // Set response status on span
        span.setAttribute("http.status_code", response.status);
        span.setAttribute("http.duration_ms", duration);

        if (response.status >= 400) {
          span.setStatus({ code: SpanStatusCode.ERROR, message: `HTTP ${response.status}` });
        } else {
          span.setStatus({ code: SpanStatusCode.OK });
        }

        logResponse(req, response, duration);

        return response;
      } catch (error) {
        logError(error, "Request handler error");
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}

