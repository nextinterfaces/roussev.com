# Jaeger Distributed Tracing

Jaeger is deployed for distributed tracing and observability of the items-service. This guide covers deployment, configuration, and usage.

---

## Quick Start

### Deploy Jaeger

```bash
task deploy:jaeger
```

### View Traces

1. Open **https://app.roussev.com/jaeger**
2. Select the service from Service dropdown
3. Click **"Find Traces"**

### Generate Test Traces

```bash
# Make some requests to generate traces
curl https://app.roussev.com/items/v1/health
curl https://app.roussev.com/items/v1/items
curl -X POST https://app.roussev.com/items/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name":"test item"}'
```

---

## Architecture

```
┌─────────────────┐
│  Items Service  │
│  (OTEL enabled) │
└────────┬────────┘
         │ OTLP/HTTP
         │ :4318
         ▼
┌─────────────────┐
│     Jaeger      │
│  (all-in-one)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│      Jaeger UI          │
│ app.roussev.com/jaeger  │
│  (publicly accessible)  │
└─────────────────────────┘
```

**Components:**
- **Items Service**: Sends traces via OpenTelemetry Protocol (OTLP)
- **Jaeger v2**: All-in-one binary that includes collector, query, and UI
- **OTLP Receivers**: Receives traces on port 4318 (HTTP) and 4317 (gRPC)
- **Jaeger UI**: Web interface for viewing and analyzing traces
- **Storage**: In-memory (configurable to use Elasticsearch, Cassandra, etc.)

---

## Configuration

### Jaeger Deployment

Location: `infra/k8s/observability/jaeger-deployment.yaml`

**Key settings:**
- **Image**: `jaegertracing/jaeger:2.11.0` (Jaeger v2)
- **Storage**: In-memory (default for all-in-one mode)
- **Resources**: 512Mi-1Gi memory, 200m-500m CPU
- **Base Path**: `/jaeger` (configured via command-line args)

**Ports:**
- `16686`: Jaeger UI
- `4318`: OTLP HTTP collector
- `4317`: OTLP gRPC collector

**Configuration (Jaeger v2):**
Jaeger v2 uses command-line arguments instead of environment variables:
```yaml
args:
  - "--set=receivers.otlp.protocols.grpc.endpoint=0.0.0.0:4317"
  - "--set=receivers.otlp.protocols.http.endpoint=0.0.0.0:4318"
  - "--set=extensions.jaeger_query.base_path=/jaeger"
```

**Note:** Jaeger v2 uses the OpenTelemetry Collector configuration format. OTLP is enabled by default in all-in-one mode.

### Items Service Configuration

Location: `infra/k8s/apps/items-service-deployment.yaml`

**OpenTelemetry environment variables:**
```yaml
- name: OTEL_ENABLED
  value: "true"
- name: OTEL_SERVICE_NAME
  value: "items-service"
- name: OTEL_SERVICE_VERSION
  value: "1.0.0"
- name: OTEL_EXPORTER_OTLP_ENDPOINT
  value: "http://jaeger:4318"
- name: OTEL_LOG_LEVEL
  value: "info"
```

### Ingress Configuration

**URL**: `https://app.roussev.com/jaeger`

**Features:**
- Path-based routing (shares domain with items-service)
- HTTPS with Let's Encrypt certificate (shared with items-service)
- Publicly accessible (no authentication required)

**Annotations:**
```yaml
nginx.ingress.kubernetes.io/ssl-redirect: "true"
cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

---

## What You Can See in Jaeger

### 1. Request Timeline
- Total request duration
- Time spent in each operation
- Database query performance
- HTTP request/response timing

### 2. Request Details
- HTTP method, URL, status code
- Request headers and parameters
- Database queries executed
- Error messages and stack traces

### 3. Service Dependencies
- Which services call which
- Request flow through the system
- Performance bottlenecks

### 4. Custom Attributes
The items-service adds custom attributes like:
- `items.count`: Number of items returned
- `item.id`: Item ID for specific operations
- `db.query`: Database queries executed

---

## Storage Options

### Current: In-Memory Storage

**Cons:**
- Traces are lost on pod restart
- Limited to 10,000 traces
- Not suitable for high-traffic

### Production Storage Options

- Elasticsearch, Cassandra or Badger