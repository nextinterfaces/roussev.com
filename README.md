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

## Task Runner

This project uses [Task](https://taskfile.dev/) to common development workflows, Run `task` to see all available tasks.

## Quick Start

See [docs/QUICK_START.md](docs/QUICK_START.md)

## Next Steps

- Set up monitoring with Prometheus/Grafana
- Add more worker nodes for high availability
- Implement GitOps with ArgoCD or Flux
- Set up automatic backups with Velero