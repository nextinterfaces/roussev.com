// OpenTelemetry configuration
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { initPrometheusMetrics, shutdownPrometheusMetrics } from "./metrics.js";

// Configuration from environment variables
const OTEL_ENABLED = process.env.OTEL_ENABLED !== "false"; // Default to true
const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318";
const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME || "items-service";
const OTEL_SERVICE_VERSION = process.env.OTEL_SERVICE_VERSION || "1.0.0";
const OTEL_LOG_LEVEL = process.env.OTEL_LOG_LEVEL || "info";

if (OTEL_LOG_LEVEL === "debug") {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
} else if (OTEL_LOG_LEVEL === "verbose") {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.VERBOSE);
}

let sdk: NodeSDK | null = null;

export function initTelemetry() {
  if (!OTEL_ENABLED) {
    console.log("OpenTelemetry is disabled");
    return;
  }

  try {
    // Configure the trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
      headers: {},
    });

    // Configure resource with service information
    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: OTEL_SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: OTEL_SERVICE_VERSION,
    });

    sdk = new NodeSDK({
      resource,
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable instrumentations that might not work well with Bun
          "@opentelemetry/instrumentation-fs": {
            enabled: false,
          },
          // Enable HTTP instrumentation
          "@opentelemetry/instrumentation-http": {
            enabled: true,
          },
          // Enable PostgreSQL instrumentation
          "@opentelemetry/instrumentation-pg": {
            enabled: true,
          },
        }),
      ],
    });

    sdk.start();

    console.log(`OpenTelemetry initialized`);
    console.log(`Service: ${OTEL_SERVICE_NAME} v${OTEL_SERVICE_VERSION}`);
    console.log(`Endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT}`);

    // Initialize Prometheus metrics
    initPrometheusMetrics();

    // Handle graceful shutdown
    process.on("SIGTERM", async () => {
      await shutdownTelemetry();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      await shutdownTelemetry();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to initialize OpenTelemetry:", error);
  }
}

export async function shutdownTelemetry() {
  // Shutdown Prometheus metrics
  await shutdownPrometheusMetrics();

  // Shutdown OpenTelemetry SDK
  if (sdk) {
    try {
      await sdk.shutdown();
      console.log("OpenTelemetry shut down successfully");
    } catch (error) {
      console.error("Error shutting down OpenTelemetry:", error);
    }
  }
}

