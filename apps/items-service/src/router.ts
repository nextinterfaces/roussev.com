/**
 * Router
 * HTTP request routing and handling
 */

import { trace, SpanStatusCode } from "@opentelemetry/api";
import { HealthController, ItemsController } from "./controllers.js";
import { getSwaggerHtml, getRootPageHtml, getPrometheusQueriesHtml, getTracingShowcaseHtml } from "./html.js";
import { openapi } from "./openapi.js";
import { json, notFound, html } from "./http-utils.js";
import type { ServerConfig } from "./config.js";
import { logRequest, logResponse, logError } from "./logger.js";
import { getPrometheusExporter, recordHttpRequest } from "./metrics.js";

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

    // Prometheus queries dashboard
    this.routes.push({
      method: "GET",
      path: "/prometheus-queries",
      handler: () => html(getPrometheusQueriesHtml()),
    });

    // Tracing showcase
    this.routes.push({
      method: "GET",
      path: "/tracing",
      handler: () => html(getTracingShowcaseHtml()),
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

    // Prometheus metrics endpoint
    this.routes.push({
      method: "GET",
      path: "/metrics",
      handler: () => this.handleMetrics(),
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

  /**
   * Handle Prometheus metrics endpoint
   * Returns metrics in Prometheus text format
   */
  private async handleMetrics(): Promise<Response> {
    const exporter = getPrometheusExporter();

    if (!exporter) {
      return new Response("Prometheus metrics not initialized", {
        status: 503,
        headers: { "Content-Type": "text/plain" }
      });
    }

    try {
      // The PrometheusExporter has a getMetricsRequestHandler method
      // that returns a promise with the metrics in Prometheus text format
      return new Promise((resolve) => {
        const mockReq = {} as any;
        const mockRes = {
          statusCode: 200,
          setHeader: () => {},
          end: (data: string) => {
            resolve(new Response(data, {
              status: 200,
              headers: { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" }
            }));
          }
        } as any;

        exporter.getMetricsRequestHandler(mockReq, mockRes);
      });
    } catch (error) {
      console.error("Error generating metrics:", error);
      return new Response("Error generating metrics", {
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    }
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

        // Record metrics
        if (path !== "/metrics") {
          recordHttpRequest(req.method, path, response.status, duration);
        }

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

