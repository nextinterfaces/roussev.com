# Items Service

A simple REST API service for managing items, built with Bun and PostgreSQL.

## Features

- **RESTful API** for CRUD operations on items
- **PostgreSQL** database integration
- **Health check** endpoint with database connectivity status
- **OpenAPI/Swagger** documentation
- **OpenTelemetry** distributed tracing support
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

## Technology Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Database**: PostgreSQL with [postgres.js](https://github.com/porsager/postgres)
- **Logging**: [Pino](https://getpino.io/) - High-performance structured logging
- **Observability**: [OpenTelemetry](https://opentelemetry.io/) - Distributed tracing
- **Container**: Docker with Alpine Linux
- **Orchestration**: Kubernetes (k3s)
- **Local Development**: Task and Tilt with k3d

