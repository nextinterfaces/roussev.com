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

// Initialize OpenTelemetry first, before any other imports
import { initTelemetry } from "./telemetry.js";
initTelemetry();

// Import application modules
import { loadConfig } from "./config.js";
import { initDatabase, initSchema, ItemsRepository } from "./database.js";
import { HealthController, ItemsController } from "./controllers.js";
import { Router } from "./router.js";

/**
 * Bootstrap and start the application
 */
async function main() {
  try {
    // Load configuration
    const config = loadConfig();

    // Initialize database connection
    initDatabase(config.database);
    await initSchema();

    // Initialize repositories
    const itemsRepository = new ItemsRepository();

    // Initialize controllers
    const healthController = new HealthController(itemsRepository, config.server.commitSha);
    const itemsController = new ItemsController(itemsRepository);

    // Initialize router
    const router = new Router(config.server, healthController, itemsController);

    // Start HTTP server
    const server = Bun.serve({
      port: config.server.port,
      fetch: (req) => router.handle(req),
    });

    // Log startup information
    console.log(`✅ Items service listening on http://localhost:${server.port}`);
    console.log(`📚 Swagger UI: http://localhost:${server.port}/docs`);
    console.log(`🗄️  Database: ${config.database.host}:${config.database.port}/${config.database.database}`);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the application
await main();
