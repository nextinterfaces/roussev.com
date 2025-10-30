# OpenSearch Logs Setup Guide

This guide shows you how to view logs from your items-service in OpenSearch Dashboards.

## Overview

The items-service is now configured to send structured logs to OpenSearch using Pino. Logs include:
- HTTP requests and responses
- Database operations
- Error messages
- OpenTelemetry trace IDs for correlation with Jaeger

## Quick Start

### 1. Restart Your Services

After the configuration changes, restart your local environment:

```bash
# Stop Tilt
tilt down

# Start Tilt again
tilt up
```

The items-service will now send logs to OpenSearch automatically.

### 2. Generate Some Logs

Make a few requests to generate logs:

```bash
# Health check
curl http://localhost:8081/v1/health

# List items
curl http://localhost:8081/v1/items

# Create an item
curl -X POST http://localhost:8081/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "Testing logs"}'
```

### 3. Create Index Pattern in OpenSearch Dashboards

1. **Open OpenSearch Dashboards**: http://localhost:5601

2. **Navigate to Index Patterns**:
   - Click the hamburger menu (☰) in the top left
   - Go to **Management** → **Stack Management**
   - Click **Index Patterns** under "OpenSearch Dashboards"

3. **Create Index Pattern**:
   - Click **Create index pattern**
   - Enter index pattern: `items-service-logs*`
   - Click **Next step**

4. **Configure Time Field**:
   - Select **time** as the time field
   - Click **Create index pattern**

### 4. View Logs in Discover

1. **Navigate to Discover**:
   - Click the hamburger menu (☰)
   - Click **Discover**

2. **Select Your Index Pattern**:
   - Make sure `items-service-logs*` is selected in the dropdown

3. **View Your Logs**:
   - You should see logs from items-service
   - Adjust the time range in the top right if needed (e.g., "Last 15 minutes")

## Log Structure

Each log entry includes:

```json
{
  "time": "2024-10-30T12:34:56.789Z",
  "level": "info",
  "msg": "Request completed",
  "service": "items-service",
  "environment": "development",
  "pid": 1,
  "hostname": "items-service-abc123",
  "trace_id": "1234567890abcdef",
  "span_id": "abcdef123456",
  "http": {
    "method": "GET",
    "url": "/v1/items",
    "status_code": 200,
    "duration_ms": 45
  }
}
```

### Key Fields

- **time**: Timestamp of the log entry
- **level**: Log level (info, warn, error, debug)
- **msg**: Log message
- **service**: Service name (items-service)
- **environment**: Environment (development, production)
- **trace_id**: OpenTelemetry trace ID (for correlation with Jaeger)
- **span_id**: OpenTelemetry span ID
- **http**: HTTP request/response details
- **db**: Database operation details (when applicable)
- **err**: Error details (when applicable)

## Filtering and Searching

### Search by Log Level

In the search bar, enter:
```
level: "error"
```

### Search by HTTP Method

```
http.method: "POST"
```

### Search by Status Code

```
http.status_code: 500
```

### Search by Trace ID

```
trace_id: "your-trace-id-here"
```

### Search by Message

```
msg: "Request completed"
```

### Combine Filters

```
level: "error" AND http.status_code: 500
```

## Creating Visualizations

### 1. Request Count Over Time

1. Go to **Visualize** → **Create visualization**
2. Select **Line** chart
3. Choose `items-service-logs*` index pattern
4. **Y-axis**: Count
5. **X-axis**: Date Histogram on `time` field
6. Save as "Request Count Over Time"

### 2. Requests by HTTP Method

1. Go to **Visualize** → **Create visualization**
2. Select **Pie** chart
3. Choose `items-service-logs*` index pattern
4. **Slice size**: Count
5. **Split slices**: Terms on `http.method.keyword`
6. Save as "Requests by HTTP Method"

### 3. Error Rate

1. Go to **Visualize** → **Create visualization**
2. Select **Line** chart
3. Choose `items-service-logs*` index pattern
4. **Y-axis**: Count
5. **X-axis**: Date Histogram on `time` field
6. Add filter: `level: "error"`
7. Save as "Error Rate"

### 4. Response Time Distribution

1. Go to **Visualize** → **Create visualization**
2. Select **Histogram** chart
3. Choose `items-service-logs*` index pattern
4. **Y-axis**: Count
5. **X-axis**: Histogram on `http.duration_ms`
6. Save as "Response Time Distribution"

## Creating a Dashboard

1. Go to **Dashboard** → **Create dashboard**
2. Click **Add** → **Add from library**
3. Select the visualizations you created:
   - Request Count Over Time
   - Requests by HTTP Method
   - Error Rate
   - Response Time Distribution
4. Arrange the panels as desired
5. Save as "Items Service Monitoring"

## Correlating Logs with Traces

Since logs include OpenTelemetry trace IDs, you can correlate logs with traces in Jaeger:

1. **Find a trace ID in OpenSearch Dashboards**:
   - In Discover, expand a log entry
   - Copy the `trace_id` value

2. **Search in Jaeger**:
   - Open Jaeger UI: http://localhost:16686
   - Paste the trace ID in the search box
   - View the full distributed trace

3. **Or vice versa**:
   - Find a trace in Jaeger
   - Copy the trace ID
   - Search in OpenSearch Dashboards: `trace_id: "your-trace-id"`
   - See all logs related to that trace

## Advanced: Custom Log Queries

### Find Slow Requests

```
http.duration_ms: >1000
```

### Find Database Errors

```
level: "error" AND db: *
```

### Find Requests from Specific Path

```
http.url: "/v1/items"
```

### Time Range Queries

Use the time picker in the top right to filter by time range:
- Last 15 minutes
- Last 1 hour
- Last 24 hours
- Custom range

## Troubleshooting

### No Logs Appearing

1. **Check if OpenSearch is running**:
   ```bash
   curl http://localhost:9200/_cluster/health?pretty
   ```

2. **Check if index exists**:
   ```bash
   curl http://localhost:9200/_cat/indices?v | grep items-service
   ```

3. **Check items-service logs**:
   ```bash
   kubectl logs -l app=items-service -f
   ```

4. **Verify environment variable**:
   ```bash
   kubectl get deployment items-service -o yaml | grep OPENSEARCH_ENABLED
   ```

### Logs Not Updating

1. **Refresh the Discover page**
2. **Adjust time range** to "Last 15 minutes"
3. **Check if items-service is generating logs**:
   ```bash
   curl http://localhost:8081/v1/health
   ```

### Index Pattern Not Found

1. Make sure you've generated some logs first
2. Wait a few seconds for logs to be indexed
3. Check if the index exists:
   ```bash
   curl http://localhost:9200/_cat/indices?v
   ```

## Production Setup

For production, the same configuration applies. After deploying:

```bash
# Deploy OpenSearch
task deploy:opensearch

# Deploy items-service (with updated config)
task deploy:items-service

# Access OpenSearch Dashboards
open https://app.roussev.com/opensearch
```

No authentication required - direct access to dashboards.

Then follow the same steps to create index patterns and dashboards.

## Best Practices

1. **Set up Index Lifecycle Management**: Automatically delete old logs after 30 days
2. **Create Alerts**: Set up alerts for error rates, slow requests, etc.
3. **Use Saved Searches**: Save common queries for quick access
4. **Create Multiple Dashboards**: Different dashboards for different purposes (monitoring, debugging, etc.)
5. **Add More Services**: Configure other services to send logs to OpenSearch
6. **Correlate with Traces**: Always use trace IDs to correlate logs with distributed traces

## Next Steps

1. ✅ Create index pattern for items-service logs
2. ✅ View logs in Discover
3. ✅ Create visualizations for monitoring
4. ✅ Build a dashboard
5. ✅ Correlate logs with Jaeger traces
6. 🔄 Add more services to send logs to OpenSearch
7. 🔄 Set up alerting for critical errors
8. 🔄 Configure index lifecycle management


