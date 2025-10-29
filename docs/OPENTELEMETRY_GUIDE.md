# OpenTelemetry Guide

OpenTelemetry integration for distributed tracing in items-service.

## What is OpenTelemetry?

**OpenTelemetry (OTel)** creates **traces** - records of requests as they flow through your system.

**Key Concepts:**

- **Trace**: The complete journey of a request through your system
- **Span**: A single operation within a trace (e.g., HTTP request, database query)
- **Attributes**: Key-value pairs that provide context (e.g., HTTP method, status code)
- **Events**: Timestamped logs within a span
- **Exceptions**: Errors that occurred during a span
## Use Cases

**Find Performance Bottlenecks:**
- Identify slow database queries
- Measure endpoint response times
- Pinpoint time-consuming operations

**Debug Issues:**
- See operation sequence leading to errors
- View exception details and stack traces
- Understand request context

**Analyze Behavior:**
- Count database queries per endpoint
- Track typical response times
- Identify frequently called operations

## Generate Test Traces

```bash
# Health check
curl http://localhost:8081/v1/health

# List items
curl http://localhost:8081/v1/items

# Create an item
curl -X POST http://localhost:8081/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name":"test-item"}'
```

## What's Captured

**HTTP Requests:**
- Operation: `GET /v1/items`, `POST /v1/items`
- Attributes: method, URL, status code, host

**Database Operations:**
- SQL queries and duration
- Connection details
- Query parameters (sanitized)

**Custom Attributes:**
- `items.count`: Number of items returned
- `item.id`: Item ID
- `item.name`: Item name

**Errors:**
- Exception type and message
- Stack trace
- Error context

## Common Workflows

**Debug Slow Endpoint:**
1. Search for endpoint traces
2. Sort by duration (longest first)
3. Check timeline for bottlenecks

**Investigate Errors:**
1. Filter by `error=true` tag
2. View exception details
3. Check request context

**Analyze Database Usage:**
1. Open any trace
2. Count database spans
3. Look for N+1 query patterns

## Filtering Traces

**By Duration:** `minDuration=100ms maxDuration=1s`

**By Tags:** `http.status_code=500`, `http.method=POST`

**By Time:** Use time picker for specific periods

## Health Indicators

**Good:**
- Requests < 100ms
- Few errors
- Consistent timing
- Minimal DB queries

**Warning:**
- High variance in response times
- N+1 query problems
- Frequent errors

**Critical:**
- Timeouts
- Cascading failures
- Slow database queries (> 1s)

## Troubleshooting

**No Traces Appearing:**

1. Check OpenTelemetry is enabled:
   ```bash
   kubectl get deployment items-service -o yaml | grep OTEL_ENABLED
   ```

2. Check items-service logs for "OpenTelemetry initialized"

3. Verify Jaeger is running:
   ```bash
   kubectl get pods | grep jaeger
   ```

4. Test connectivity:
   ```bash
   kubectl exec -it <items-service-pod> -- curl http://jaeger:4318
   ```

**Missing Information:**

Set `OTEL_LOG_LEVEL=debug` for detailed logs

**Performance Impact:**

- ~1-5ms overhead per request
- Minimal impact on production

## Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [OpenTelemetry JavaScript SDK](https://opentelemetry.io/docs/instrumentation/js/)


