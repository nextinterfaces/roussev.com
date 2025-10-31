# Items Service

A simple REST API service for managing items, built with Bun and PostgreSQL.

## Features

- **RESTful API** for CRUD operations on items
- **PostgreSQL** database integration
- **Health check** endpoint with database connectivity status
- **OpenAPI/Swagger** documentation
- **OpenTelemetry** distributed tracing support
- **Prometheus** metrics collection and export
- **Structured Logging** with Pino for high-performance logging
- **Hot reload** in development mode
- **Docker** support with development and production configurations

## API Endpoints

### Health Check
- `GET /v1/health` - Check service and database health
- `GET /v1/items` - List all items
- `POST /v1/items` - Create a new item
- `GET /docs` - Swagger UI for interactive API documentation
- `GET /v1/openapi.json` - OpenAPI specification
- `GET /metrics` - Prometheus metrics endpoint

## Local Development

### Using Tilt
```bash
task local:setup
task local:start
```

Access the service at:
- Service: http://localhost:8081
- Health Check: http://localhost:8081/v1/health
- API Docs: http://localhost:8081/docs
- Metrics: http://localhost:8081/metrics


#### PostgreSQL Database (Port 5432)
- **Host**: localhost
- **Port**: 5432
- **Connection String**: `psql postgresql://{.env.POSTGRES_USER}:{.env.POSTGRES_PASSWORD}@localhost:5432/{.env.POSTGRES_DB}`

#### Jaeger (Distributed Tracing)
- **Jaeger UI**: http://localhost:16686
- **Jaeger API**: http://localhost:16686/api/services
- **Search Traces**: http://localhost:16686/api/traces?service=items-service&limit=20
- **OTLP HTTP Endpoint**: http://localhost:4318/v1/traces (POST only - for sending traces)
- **OTLP gRPC Endpoint**: localhost:4317 (gRPC protocol - for sending traces)

#### Quick Test Commands
```bash
# Test items service health
curl http://localhost:8081/v1/health

# List all items
curl http://localhost:8081/v1/items

# Create a new item
curl -X POST http://localhost:8081/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name":"test-item"}'

# View Prometheus metrics
curl http://localhost:8081/metrics

# Connect to PostgreSQL
psql postgresql://{.env.POSTGRES_USER}:{.env.POSTGRES_PASSWORD}@localhost:5432/{.env.POSTGRES_DB}

# View traces in Jaeger
open http://localhost:16686
```

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Database**: PostgreSQL
- **Logging**: [Pino](https://getpino.io/) - structured logging
- **Observability**:
  - OpenTelemetry - distributed tracing
  - Prometheus - metrics collection and export
- **Container**: Docker with Alpine Linux
- **Orchestration**: Kubernetes (k3s)
- **Local Development**: Task and Tilt with k3d

