/**
 * Items Service - Main Entry Point
 *
 * A simple REST API service for managing items, built with Bun, PostgreSQL,
 * Jaeger and OpenTelemetry.
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
import { initTelemetry } from "./telemetry.js";
initTelemetry();

import { loadConfig } from "./config.js";
import { initDatabase, initSchema, ItemsRepository } from "./database.js";
import { HealthController, ItemsController } from "./controllers.js";
import { Router } from "./router.js";

async function main() {
  try {
    const config = loadConfig();

    initDatabase(config.database);
    await initSchema();

    const itemsRepository = new ItemsRepository();
    const healthController = new HealthController(itemsRepository, config.server.commitSha);
    const itemsController = new ItemsController(itemsRepository);
    const router = new Router(config.server, healthController, itemsController);

    const server = Bun.serve({
      port: config.server.port,
      fetch: (req) => router.handle(req),
    });

    console.log(`Items service listening on http://localhost:${server.port}`);
    console.log(`Swagger UI: http://localhost:${server.port}/docs`);
    console.log(`Database: ${config.database.host}:${config.database.port}/${config.database.database}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

await main();
