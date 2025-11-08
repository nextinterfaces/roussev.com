/**
 * Logging module
 * Provides structured logging with Pino
 * 
 * Features:
 * - Structured JSON logging in production
 * - Pretty-printed logs in development
 * - Configurable log levels
 * - Request ID tracking
 * - OpenTelemetry trace context integration
 * - Child loggers with context
 */

import pino from "pino";
import { trace, context } from "@opentelemetry/api";

const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const NODE_ENV = process.env.NODE_ENV || "development";

// Determine if we should use pretty printing
const usePrettyPrint = NODE_ENV === "development" || process.env.LOG_PRETTY === "true";

/**
 * Create the base logger configuration
 */
const loggerConfig: pino.LoggerOptions = {
  level: LOG_LEVEL,
  // Add timestamp to all logs
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    },
    bindings: (bindings) => {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
      };
    },
  },
  // Serialize error objects
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  base: {
    service: process.env.OTEL_SERVICE_NAME || "items-service",
    environment: NODE_ENV,
  },
};

/**
 * Create the logger instance with optional pretty printing
 */
export const logger = usePrettyPrint
  ? pino(
      loggerConfig,
      pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
          ignore: "pid,hostname",
          singleLine: false,
          messageFormat: "{msg}",
        },
      })
    )
  : pino(loggerConfig);

/**
 * Get OpenTelemetry trace context for correlation
 */
function getTraceContext() {
  const span = trace.getActiveSpan();
  if (span) {
    const spanContext = span.spanContext();
    return {
      trace_id: spanContext.traceId,
      span_id: spanContext.spanId,
      trace_flags: spanContext.traceFlags,
    };
  }
  return {};
}

/**
 * Create a child logger with additional context
 * This is useful for adding request-specific or operation-specific context
 */
export function createChildLogger(context: Record<string, any>) {
  return logger.child(context);
}

/**
 * Create a logger with OpenTelemetry trace context
 * This automatically includes trace_id and span_id in logs for correlation
 */
export function createLoggerWithTrace(additionalContext?: Record<string, any>) {
  const traceContext = getTraceContext();
  return logger.child({ ...traceContext, ...additionalContext });
}

/**
 * Log an HTTP request
 */
export function logRequest(req: Request, additionalContext?: Record<string, any>) {
  const url = new URL(req.url);
  const log = createLoggerWithTrace({
    ...additionalContext,
    http: {
      method: req.method,
      url: url.pathname,
      query: url.search,
      host: url.host,
    },
  });
  
  log.info("Incoming request");
}

/**
 * Log an HTTP response
 */
export function logResponse(
  req: Request,
  res: Response,
  duration: number,
  additionalContext?: Record<string, any>
) {
  const url = new URL(req.url);
  const log = createLoggerWithTrace({
    ...additionalContext,
    http: {
      method: req.method,
      url: url.pathname,
      status_code: res.status,
      duration_ms: duration,
    },
  });
  
  if (res.status >= 500) {
    log.error("Request failed");
  } else if (res.status >= 400) {
    log.warn("Request error");
  } else {
    log.info("Request completed");
  }
}

/**
 * Log a database operation
 */
export function logDatabaseOperation(
  operation: string,
  duration: number,
  additionalContext?: Record<string, any>
) {
  const log = createLoggerWithTrace({
    ...additionalContext,
    db: {
      operation,
      duration_ms: duration,
    },
  });
  
  log.debug("Database operation completed");
}

/**
 * Log an error with full context
 */
export function logError(
  error: Error | unknown,
  message: string,
  additionalContext?: Record<string, any>
) {
  const log = createLoggerWithTrace(additionalContext);
  log.error({ err: error }, message);
}

/**
 * Log application startup
 */
export function logStartup(config: Record<string, any>) {
  logger.info({ config }, "Application starting");
}

/**
 * Log application shutdown
 */
export function logShutdown() {
  logger.info("Application shutting down");
}

export default logger;

