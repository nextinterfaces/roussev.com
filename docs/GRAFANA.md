# Grafana Guide

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

## Overview

Grafana is configured to visualize metrics from Prometheus, which scrapes metrics from the items-service `/metrics` endpoint. The observability stack includes:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and dashboards
- **Jaeger**: Distributed tracing (already configured)

---

### Access URLs

- **Grafana UI**: http://localhost:3000
- **Prometheus UI**: http://localhost:9090
- **Items Service Metrics**: http://localhost:8081/metrics

### Pre-configured Dashboard

The "Items Service Metrics" dashboard includes:
- HTTP Request Rate (requests per second)
- HTTP Request Duration (p95 latency)
- Total Requests counter
- Average Response Time

### Example PromQL Queries

**Request rate by endpoint:**
```promql
sum(rate(http_server_requests_total[5m])) by (route, method)
```

**95th percentile latency:**
```promql
histogram_quantile(0.95, sum(rate(http_server_duration_bucket[5m])) by (le, route))
```

**Average response time:**
```promql
sum(rate(http_server_duration_sum[5m])) / sum(rate(http_server_duration_count[5m]))
```

**Total requests:**
```promql
sum(http_server_requests_total)
```

**Error rate (5xx):**
```promql
(sum(rate(http_server_requests_total{status_code=~"5.."}[5m])) or vector(0)) / sum(rate(http_server_requests_total[5m])) * 100
```

**Requests by status code:**
```promql
sum(rate(http_server_requests_total[5m])) by (status_code)
```

**Request rate for specific endpoint:**
```promql
sum(rate(http_server_requests_total{route="/v1/items"}[5m]))
```

**4xx error rate:**
```promql
sum(rate(http_server_requests_total{status_code=~"4.."}[5m])) by (status_code)
```

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