/**
 * Prometheus Metrics Module
 * Provides Prometheus metrics collection using OpenTelemetry
 * 
 * Features:
 * - Prometheus metrics exporter
 * - HTTP metrics endpoint at /metrics
 * - Integration with OpenTelemetry SDK
 * - Custom metrics support
 */

import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import type { Histogram, Counter, Meter } from "@opentelemetry/api";

const PROMETHEUS_PORT = parseInt(process.env.PROMETHEUS_PORT || "9464", 10);
const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME || "items-service";
const OTEL_SERVICE_VERSION = process.env.OTEL_SERVICE_VERSION || "1.0.0";

let prometheusExporter: PrometheusExporter | null = null;
let meterProvider: MeterProvider | null = null;
let meter: Meter | null = null;

// HTTP metrics
let httpRequestDuration: Histogram | null = null;
let httpRequestCount: Counter | null = null;

/**
 * Initialize Prometheus metrics exporter
 * This sets up the Prometheus exporter and meter provider
 */
export function initPrometheusMetrics() {
  try {
    // Configure resource with service information
    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: OTEL_SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: OTEL_SERVICE_VERSION,
    });

    // Create Prometheus exporter
    // Note: The exporter will NOT start its own HTTP server
    // We'll expose metrics through our existing HTTP server
    prometheusExporter = new PrometheusExporter({
      // Don't start a separate HTTP server
      preventServerStart: true,
    });

    // Create meter provider with Prometheus exporter
    meterProvider = new MeterProvider({
      resource,
      readers: [prometheusExporter],
    });

    // Create meter for recording metrics
    meter = meterProvider.getMeter(OTEL_SERVICE_NAME, OTEL_SERVICE_VERSION);

    // Create HTTP metrics instruments
    httpRequestDuration = meter.createHistogram("http_server_duration", {
      description: "HTTP request duration in milliseconds",
      unit: "ms",
    });

    httpRequestCount = meter.createCounter("http_server_requests_total", {
      description: "Total number of HTTP requests",
      unit: "1",
    });

    console.log("Prometheus metrics initialized");
    console.log(`Service: ${OTEL_SERVICE_NAME} v${OTEL_SERVICE_VERSION}`);
    console.log("Metrics will be available at /metrics endpoint");

    return prometheusExporter;
  } catch (error) {
    console.error("Failed to initialize Prometheus metrics:", error);
    return null;
  }
}

/**
 * Get the Prometheus exporter instance
 */
export function getPrometheusExporter(): PrometheusExporter | null {
  return prometheusExporter;
}

/**
 * Get the meter provider instance
 */
export function getMeterProvider(): MeterProvider | null {
  return meterProvider;
}

/**
 * Record HTTP request metrics
 */
export function recordHttpRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number
) {
  if (!httpRequestDuration || !httpRequestCount) {
    return;
  }

  const attributes = {
    method,
    route: path,
    status_code: statusCode.toString(),
  };

  httpRequestDuration.record(durationMs, attributes);
  httpRequestCount.add(1, attributes);
}

/**
 * Shutdown Prometheus metrics
 */
export async function shutdownPrometheusMetrics() {
  if (meterProvider) {
    try {
      await meterProvider.shutdown();
      console.log("Prometheus metrics shut down successfully");
    } catch (error) {
      console.error("Error shutting down Prometheus metrics:", error);
    }
  }
}

