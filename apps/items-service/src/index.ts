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
import { logger, logStartup, logShutdown, logError } from "./logger.js";

async function main() {
  try {
    const config = loadConfig();

    // Log startup with configuration (excluding sensitive data)
    logStartup({
      port: config.server.port,
      apiPrefix: config.server.apiPrefix,
      appPrefix: config.server.appPrefix,
      commitSha: config.server.commitSha,
      logLevel: config.logging.level,
      database: {
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
      },
    });

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

    logger.info(
      {
        port: server.port,
        urls: {
          api: `http://localhost:${server.port}${config.server.apiPrefix}`,
          docs: `http://localhost:${server.port}/docs`,
          database: `${config.database.host}:${config.database.port}/${config.database.database}`,
        },
      },
      "Items service started successfully"
    );
  } catch (error) {
    logError(error, "Failed to start server");
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logShutdown();
  process.exit(0);
});

process.on("SIGINT", () => {
  logShutdown();
  process.exit(0);
});

await main();
