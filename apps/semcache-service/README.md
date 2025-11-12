# Hello Service

A simple REST API service built with Go and Echo framework, featuring PostgreSQL database integration, OpenTelemetry tracing, and Kubernetes deployment.

## Features

- **Echo Framework** - Fast and minimalist Go web framework
- **PostgreSQL** database integration with connection pooling
- **RESTful API** for managing greetings
- **Health check** endpoint with database connectivity status
- **OpenTelemetry** distributed tracing support
- **Hot reload** in development mode with Air
- **Docker** support with development and production configurations
- **Kubernetes** ready with manifests for local and production deployments

## API Endpoints

### Health Check
```bash
GET /health
GET /v1/health
```

Returns service health status including database connectivity.

### Greetings API

#### Get all greetings
```bash
GET /v1/greetings
```

#### Create a greeting
```bash
POST /v1/greetings
Content-Type: application/json

{
  "name": "World"
}
```

#### Get a greeting by ID
```bash
GET /v1/greetings/:id
```

## Local Development

### Prerequisites

- Go 1.22 or later
- PostgreSQL (or use the k3d cluster with Tilt)
- Task (taskfile.dev)

### Run with Tilt (Recommended)

The easiest way to run the service locally is with Tilt, which handles building, deploying, and hot-reloading:

```bash
# Start the k3d cluster and all services
task local:start

# The service will be available at:
# http://localhost:8083/health
# http://localhost:8083/v1/greetings
```

### Run Standalone

```bash
# Run without database (will fail to connect)
task dev:hello-service

# Run with PostgreSQL (requires port-forward)
# In terminal 1:
task postgres:port-forward

# In terminal 2:
task dev:hello-service:postgres
```

### Manual Setup

```bash
cd apps/hello-service

# Install dependencies
go mod download

# Run the service
go run ./cmd/server/main.go
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `COMMIT_SHA` | Git commit SHA for versioning | `unknown` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_NAME` | PostgreSQL database name | `itemsdb` |
| `DB_SSLMODE` | PostgreSQL SSL mode | `disable` |
| `OTEL_ENABLED` | Enable OpenTelemetry tracing | `true` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP endpoint | `http://localhost:4318` |
| `OTEL_SERVICE_NAME` | Service name for tracing | `hello-service` |

## Docker

### Build

```bash
# Build production image
task docker:build:hello-service

# Or manually
docker build -t hello-service:local ./apps/hello-service
```

### Run

```bash
# Run the container
task docker:run:hello-service

# Or manually
docker run --rm -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=itemsdb \
  hello-service:local
```

## Kubernetes Deployment

### Local (k3d with Tilt)

The service is automatically deployed when using Tilt:

```bash
task local:start
```

### Production

```bash
# Deploy to production cluster
task deploy:hello-service

# Check deployment status
task rollout:status:hello-service

# View logs
task k8s:logs:hello-service

# Port forward to access locally
task port-forward:hello-service
```

## Testing the API

```bash
# Health check
curl http://localhost:8083/health

# Create a greeting
curl -X POST http://localhost:8083/v1/greetings \
  -H "Content-Type: application/json" \
  -d '{"name":"World"}'

# Get all greetings
curl http://localhost:8083/v1/greetings

# Get a specific greeting
curl http://localhost:8083/v1/greetings/1
```

## Database Schema

The service automatically creates the following table on startup:

```sql
CREATE TABLE IF NOT EXISTS greetings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Tech Stack

- **Language**: Go 1.22
- **Framework**: [Echo v4](https://echo.labstack.com/)
- **Database**: PostgreSQL with [lib/pq](https://github.com/lib/pq) driver
- **Observability**: OpenTelemetry for distributed tracing
- **Container**: Docker with Alpine Linux
- **Orchestration**: Kubernetes (k3s)
- **Local Development**: Task and Tilt with k3d
- **Hot Reload**: [Air](https://github.com/cosmtrek/air)

## Project Structure

```
hello-service/
├── cmd/
│   └── server/
│       └── main.go           # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go         # Configuration management
│   ├── database/
│   │   └── database.go       # Database connection and schema
│   ├── handlers/
│   │   └── handlers.go       # HTTP request handlers
│   └── models/
│       └── greeting.go       # Data models and repository
├── Dockerfile                # Production Docker image
├── Dockerfile.dev            # Development Docker image with hot reload
├── .air.toml                 # Air configuration for hot reload
├── go.mod                    # Go module dependencies
└── README.md                 # This file
```

## Development Tips

1. **Hot Reload**: When running with Tilt, any changes to `.go` files will automatically trigger a rebuild and redeploy.

2. **Database Access**: Use `task postgres:connect` to access the PostgreSQL database directly.

3. **Logs**: View service logs with `task k8s:logs:hello-service` or through the Tilt UI.

4. **Tracing**: View distributed traces in Jaeger at http://localhost:16686 when running with Tilt.

5. **Health Checks**: The `/health` endpoint includes database connectivity status, making it easy to diagnose issues.

## Troubleshooting

### Service won't start
- Check if PostgreSQL is running and accessible
- Verify database credentials in environment variables or Kubernetes secrets
- Check logs: `task k8s:logs:hello-service`

### Database connection errors
- Ensure PostgreSQL is deployed: `task deploy:postgres`
- Check PostgreSQL status: `task postgres:status`
- Verify the postgres-secret exists: `kubectl get secret postgres-secret`

### Hot reload not working
- Make sure you're using the dev Dockerfile (Dockerfile.dev)
- Check that Air is installed in the container
- Verify file sync in Tilt UI

## License

MIT

