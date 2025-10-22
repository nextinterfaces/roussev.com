# roussev.com Website

## Features

- **K3s Kubernetes** cluster on Hetzner Cloud
- **Nginx Ingress Controller**
- **Sample REST Service** exposed publicly with HTTPS
- **Terraform** for infrastructure as code
- **Let's Encrypt SSL** certificates with cert-manager

## Prerequisites

1. **Hetzner Cloud Account**
2. **Hetzner API Token**: Available in Hetzner Cloud Console > Security > API Tokens

## Quick Start

See [docs/QUICK_START.md](docs/QUICK_START.md)

## Detailed Docs

See [docs/DNS_Setup.md](docs/DNS_Setup.md)
See [docs/DEPLOY_services.md](docs/DEPLOY_services.md)
See [docs/TLS_setup.md](docs/TLS_setup.md)

## Next Steps

- Deploy a real application
- Set up monitoring with Prometheus/Grafana
- Configure persistent storage with Longhorn or Hetzner Cloud Volumes
- Add more worker nodes for high availability
- Implement GitOps with ArgoCD or Flux
- Set up automatic backups with Velero

## License

MIT