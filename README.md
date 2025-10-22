# roussev.com Website

## Features

- **K3s Kubernetes** cluster on Hetzner Cloud
- **Nginx Ingress Controller** for routing
- **Sample REST Service** exposed publicly with HTTPS
- **Terraform** for infrastructure as code
- **Let's Encrypt SSL** certificates with cert-manager

## Prerequisites

1. **Hetzner Cloud Account**
2. **Hetzner API Token**: Available in Hetzner Cloud Console > Security > API Tokens

## Quick Start

### 1. Deploy Infrastructure

See [docs/QUICK_START.md](docs/QUICK_START.md)

### 2. Set Up DNS

See [docs/DNS_Setup.md](docs/DNS_Setup.md)

### 3. Set Up TLS and Deploy Services

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