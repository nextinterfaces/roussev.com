# Grafana Guide


---

## Overview

Grafana is configured to visualize metrics from Prometheus, which scrapes metrics from the items-service `/metrics` endpoint. The observability stack includes:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and dashboards
- **Jaeger**: Distributed tracing (already configured)

---
## Architecture

### Local Development
```
┌─────────────────┐
│  items-service  │
│   :8081/metrics │
└────────┬────────┘
         │ scrape
         ▼
    ┌─────────┐
    │Prometheus│
    │  :9090   │
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
                    │  items-service  │
                    │   /items/metrics│
                    └────────┬────────┘
                             │ scrape
                             ▼
    ┌──────────────────────────────────────┐
    │         NGINX Ingress                │
    │  app.roussev.com                     │
    ├──────────────────────────────────────┤
    │  /prometheus  →  Prometheus :9090    │
    │  /grafana     →  Grafana :3000       │
    │  /jaeger      →  Jaeger :16686       │
    └──────────────────────────────────────┘
```

### Import Dashboard

#### Step 1: Login to Grafana
- **Production:** https://app.roussev.com/grafana
- **Local:** http://localhost:3000

#### Step 2: Import Dashboard
1. Click **"+"** icon (left sidebar) → **"Import dashboard"**
2. Click **"Upload JSON file"**
3. Select: `infra/k8s/observability/grafana-dashboard-items-service.json`
4. **⚠️ IMPORTANT:** Select **"Prometheus"** from the data source dropdown
5. Click **"Import"**

**Dashboard URL:**
```
https://app.roussev.com/grafana/d/items-service-metrics/items-service-metrics
```

### 🎯 Generate Test Traffic

```bash
# Production
for i in {1..100}; do
  curl -s https://app.roussev.com/items/v1/health > /dev/null
  curl -s https://app.roussev.com/items/v1/items > /dev/null
  sleep 0.5
done
```

---

### Access URLs

- **Grafana UI**: http://localhost:3000
- **Prometheus UI**: http://localhost:9090
- **Items Service Metrics**: http://localhost:8081/metrics


### Example PromQL Queries


```promql
Request rate by endpoint:
sum(rate(http_server_requests_total[5m])) by (route, method)

95th percentile latency:
histogram_quantile(0.95, sum(rate(http_server_duration_bucket[5m])) by (le, route))

Average response time:
sum(rate(http_server_duration_sum[5m])) / sum(rate(http_server_duration_count[5m]))

Total requests:
sum(http_server_requests_total)

Error rate (5xx):
(sum(rate(http_server_requests_total{status_code=~"5.."}[5m])) or vector(0)) / sum(rate(http_server_requests_total[5m])) * 100

Requests by status code:
sum(rate(http_server_requests_total[5m])) by (status_code)

Request rate for specific endpoint:
sum(rate(http_server_requests_total{route="/v1/items"}[5m]))

4xx error rate:
sum(rate(http_server_requests_total{status_code=~"4.."}[5m])) by (status_code)
```
