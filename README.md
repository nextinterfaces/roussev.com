# roussev.com Website

## Features

- **K3s Kubernetes** cluster on Hetzner Cloud
- **Nginx Ingress Controller**
- **Sample REST Service** exposed publicly with HTTPS
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

  🧊 Tilt UI:               http://localhost:10350
  🔧 Items Service:         http://localhost:8081
     - Health:              http://localhost:8081/v1/health
     - API Docs:            http://localhost:8081/docs
     - Metrics:             http://localhost:8081/metrics
  🌐 Website App:           http://localhost:8082
     - Health:              http://localhost:8082/health
  👁️  Headlamp (Read-Only):  http://localhost:8084
  📊 Jaeger UI:             http://localhost:16686
  📦 PostgreSQL:            localhost:5432
     - Connection:          psql postgresql://{.env.POSTGRES_USER}:{.env.POSTGRES_PASSWORD}@localhost:5432/
```

## Production URLs

- **Website**: https://roussev.com
- **Headlamp (Read-Only)**: https://kube.roussev.com
- **Items API**: https://app.roussev.com/items
  - Health: https://app.roussev.com/items/v1/health
  - Docs: https://app.roussev.com/items/docs
  - Metrics: https://app.roussev.com/items/metrics
- **Jaeger Tracing**: https://app.roussev.com/jaeger

## Next Steps

- Set up monitoring with Prometheus/Grafana
- Add more worker nodes for high availability
- Implement GitOps with ArgoCD or Flux
- Set up automatic backups with Velero