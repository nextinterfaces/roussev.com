# Quick Start: K3s on Hetzner with HTTPS

Complete setup guide for deploying K3s on Hetzner Cloud with SSL certificates.

## Fast Track (5 minutes)

### 1. Deploy Infrastructure
```bash
cd terraform
terraform apply
SERVER_IP=$(terraform output -raw server_ip)
echo "Your server IP: $SERVER_IP"
```

### 2. Configure DNS
Add this A record to your DNS provider:
- **Domain:** `roussev.com`
- **Type:** `A`
- **Value:** `[Your SERVER_IP from above]`
- **TTL:** `300`

### 3. Verify DNS
```bash
dig @8.8.8.8 roussev.com A
# Should return your server IP
```

### 4. Deploy Application & SSL
```bash
export KUBECONFIG=./terraform/kubeconfig.yaml

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
kubectl wait --namespace cert-manager --for=condition=ready pod --selector=app.kubernetes.io/instance=cert-manager --timeout=300s

# Deploy Let's Encrypt issuers
cd ../k8s
kubectl apply -f letsencrypt-issuer.yaml

# Deploy application
kubectl apply -f sample-service.yaml
```

### 5. Wait for Certificate
```bash
kubectl get certificate -n sample-app -w
# Wait for READY = True (1-2 minutes)
```

### 6. Test
```bash
curl https://roussev.com/api
# Should return: "Hello from K3s on Hetzner! This is a sample REST API."
```

## Status Checks

```bash
# Check everything
kubectl get pods -n sample-app
kubectl get certificate -n sample-app
kubectl get ingress -n sample-app

# Check cert-manager
kubectl get pods -n cert-manager
```

## Troubleshooting

### Certificate stuck in "Pending"
```bash
kubectl describe certificate sample-rest-tls -n sample-app
kubectl logs -n cert-manager -l app=cert-manager
```

### DNS not resolving
Wait 5-10 minutes for DNS propagation, then:
```bash
dig @8.8.8.8 roussev.com A
```

### Test before DNS propagates
```bash
SERVER_IP=$(cd terraform && terraform output -raw server_ip)
curl -v https://roussev.com/api --resolve roussev.com:443:$SERVER_IP
```

## Detailed Documentation

For step-by-step instructions with troubleshooting:

1. **DNS Configuration:** [docs/DNS_Setup.md](docs/DNS_Setup.md)
   - Infrastructure deployment
   - DNS setup (Hetzner DNS)
   - DNS troubleshooting

2. **SSL/TLS Setup:** [docs/TLS_setup.md](docs/TLS_setup.md)
   - Application deployment
   - cert-manager installation
   - Let's Encrypt configuration
   - Certificate troubleshooting

### Utilities

- **DNS Cache Issues:** Run `./scripts/clear-dns-cache.sh`

