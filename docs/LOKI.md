# Loki - Log Aggregation

## Architecture

### Local Development
```
┌─────────────────┐
│   Kubernetes    │
│   Pod Logs      │
└────────┬────────┘
         │ collect
         ▼
    ┌─────────┐
    │Promtail │
    │ (agent) │
    └────┬────┘
         │ push
         ▼
    ┌─────────┐
    │  Loki   │
    │  :3100  │
    └────┬────┘
         │ query
         ▼
    ┌─────────┐
    │ Grafana │
    │  :3000  │
    └─────────┘
```

### Production
```
                    ┌─────────────────┐
                    │   Kubernetes    │
                    │   Pod Logs      │
                    └────────┬────────┘
                             │ collect
                             ▼
    ┌──────────────────────────────────────┐
    │         NGINX Ingress                │
    │  app.roussev.com                     │
    ├──────────────────────────────────────┤
    │  /loki        →  Loki :3100          │
    │  /grafana     →  Grafana :3000       │
    └──────────────────────────────────────┘
```

---

## Quick Start

### Local Development (Tilt)

1. **Start Tilt** (Loki is already configured):
   ```bash
   tilt up
   ```

2. **Verify Loki is running**:
   - Open Tilt UI: http://localhost:10350
   - Check that `loki` and `promtail` resources are green
   - Visit Loki health: http://localhost:3100/ready

3. **Open Grafana**:
   - URL: http://localhost:3000
   - Loki datasource is pre-configured

### Production Deployment

```bash
# Deploy Loki
task deploy:loki

# Deploy Promtail (log collector)
task deploy:promtail

# Or deploy everything
task deploy:observability
```

---

## Using Logs in Grafana

### Method 1: Explore View (Recommended for Ad-Hoc Queries)

1. **Open Grafana**:
   - Local: http://localhost:3000
   - Production: https://app.roussev.com/grafana

2. **Go to Explore**:
   - Click the compass icon (🧭) in the left sidebar
   - Select **"Loki"** from the datasource dropdown

3. **Query Logs**:
   - Use the Log browser to select labels
   - Or write LogQL queries directly

### Method 2: Dashboard Panels

Add log panels to dashboards:
1. Edit dashboard → Add panel
2. Select **Loki** as datasource
3. Write LogQL query
4. Choose visualization (Logs, Table, etc.)

---

## LogQL Query Examples

### Basic Queries

```logql
View all logs from items-service:
{app="items-service"}

View logs from a specific pod:
{pod="items-service-7d8f9b5c6-abc12"}

View logs from all apps in default namespace:
{namespace="default"}
```

### Filtering Logs

```logql
Filter by log level (JSON logs):
{app="items-service"} | json | level="error"

Search for specific text:
{app="items-service"} |= "database"

Exclude specific text:
{app="items-service"} != "health"

Case-insensitive search:
{app="items-service"} |~ "(?i)error"
```

### Advanced Queries

```logql
Error logs only:
{app="items-service"} | json | level="error"

Logs with specific trace ID (correlation with Jaeger):
{app="items-service"} | json | trace_id="abc123def456"

HTTP requests with status code:
{app="items-service"} | json | http_status_code >= 400

Rate of error logs (last 5 minutes):
rate({app="items-service"} | json | level="error" [5m])

Count logs by level:
sum by (level) (count_over_time({app="items-service"} | json [5m]))


Find slow database queries:
{app="items-service"} | json | db_duration_ms > 1000

API requests to specific endpoint:
{app="items-service"} | json | http_url="/v1/items"

Errors in the last hour:
{app="items-service"} | json | level="error" | __timestamp__ > now() - 1h
```

---

## Log Correlation

### Correlate Logs with Traces (Jaeger)

Your logs include `trace_id` and `span_id` fields automatically:

1. **Find trace ID in Jaeger**: http://localhost:16686
2. **Query logs with that trace ID**:
   ```logql
   {app="items-service"} | json | trace_id="your-trace-id-here"
   ```

### Correlate Logs with Metrics (Prometheus)

Create dashboards that show both metrics and logs side-by-side:
- Top panel: Prometheus metrics (request rate, latency)
- Bottom panel: Loki logs filtered to the same time range

---

---

## Access URLs

### Local Development
- **Loki API**: http://localhost:3100
- **Loki Health**: http://localhost:3100/ready
- **Grafana**: http://localhost:3000

### Production
- **Loki API**: https://app.roussev.com/loki
- **Grafana**: https://app.roussev.com/grafana
