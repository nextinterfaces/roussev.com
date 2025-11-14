# roussev.com Website

## Features

- **K3s Kubernetes** cluster on Hetzner Cloud
- **Nginx Ingress Controller**
- **Terraform** for infrastructure as code
- **Let's Encrypt SSL** certificates with cert-manager
- **Distributed Tracing** with Jaeger and OpenTelemetry

## Prerequisites

1. **Hetzner Cloud Account**
2. **Hetzner API Token**: Available in Hetzner Cloud Console > Security > API Tokens


## Local Development
This project uses [Task](https://taskfile.dev/) to common development workflows, Run `task` to see all available tasks.

```bash
task local:setup
task local:start

Tilt UI:               http://localhost:10350

Jaeger UI:             http://localhost:16686
PostgreSQL:            localhost:5432
     - Connection:          psql postgresql://{.env.POSTGRES_USER}:{.env.POSTGRES_PASSWORD}@localhost:5432/
```

## Production Links

- **Website**: https://roussev.com
- **Monitoring and services**: https://app.roussev.com/
- **Items service**: https://app.roussev.com/items/docs
- **Semantic Cache service**: https://app.roussev.com/semcache/docs