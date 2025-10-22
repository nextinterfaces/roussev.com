# roussev.com website

## Features

- **K3s Kubernetes** cluster on Hetzner Cloud
- **Location**: Ashburn, VA, USA (ash) us-east
- **Server Type**: CPX11
- **Nginx Ingress Controller** 
- **Sample REST Service** exposed publicly with HTTPS
- **Terraform setup** infrastructure as code
- **Let's Encrypt SSL** certificates with cert-manager

## Prerequisites

1. **Hetzner Cloud Account**
2. **Hetzner API Token**: Hetzner Cloud Console > Security > API Tokens

## Quick Start

### 1. Deploy Infrastructure

See `docs/QUICK_START.md`

### 2. Setup DNS

See `docs/DNS_Setup.md`

### 3. Setup TLS

See `docs/TLS_setup.md`

### 3. Deploy Services

```bash
cd ../k8s
./deploy.sh
```

### Other Next Steps

- Deploy a real application
- Set up monitoring with Prometheus/Grafana
- Configure persistent storage with Longhorn or Hetzner Cloud Volumes
- Add more worker nodes for high availability
- Implement GitOps with ArgoCD or Flux
- Set up automatic backups with Velero

## License

MIT

## Support

For issues with:
- **Hetzner Cloud**: https://docs.hetzner.com/cloud/
- **K3s**: https://docs.k3s.io/
- **Nginx Ingress**: https://kubernetes.github.io/ingress-nginx/

