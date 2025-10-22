# Quick Start: K3s on Hetzner with HTTPS

Complete setup guide for deploying a K3s cluster on Hetzner Cloud with SSL certificates.

## Fast Track (5 Minutes)

### 1. Deploy Infrastructure
```bash
cd terraform
export TF_VAR_hcloud_token="your-hetzner-api-token-here"
terraform init
terraform apply
SERVER_IP=$(terraform output -raw server_ip)
echo "Your server IP: $SERVER_IP"
```

This will:
- Create a CPX11 server in Ashburn, VA (ash datacenter)
- Install K3s with Nginx ingress controller
- Configure firewall rules
- Generate SSH keys
- Download kubeconfig

### 2. Configure DNS
Add an A record to your DNS provider:
- **Domain:** `roussev.com`
- **Type:** `A`
- **Value:** `[Your SERVER_IP from above]`
- **TTL:** `300`

### 3. Verify DNS
```bash
dig @8.8.8.8 roussev.com A +short
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

# Verify
kubectl get pods -n sample-app
kubectl get svc -n sample-app
kubectl get ingress -n sample-app
```

### 5. Wait for Certificate
```bash
kubectl get certificate -n sample-app -w
# Wait for READY = True (typically 1-2 minutes)
```

### 6. Test Your Deployment
```bash
curl https://roussev.com/api
# Expected response: "Hello from K3s on Hetzner! This is a sample REST API."
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

### Certificate Stuck in "Pending"
```bash
kubectl describe certificate sample-rest-tls -n sample-app
kubectl logs -n cert-manager -l app=cert-manager
```

### DNS Not Resolving
Wait 5-10 minutes for DNS propagation. See [DNS_setup.md](DNS_setup.md) for detailed troubleshooting.

### Test Before DNS Propagates
```bash
SERVER_IP=$(cd terraform && terraform output -raw server_ip)
curl https://roussev.com/api --resolve roussev.com:443:$SERVER_IP
```

## Detailed Documentation

For step-by-step instructions with comprehensive troubleshooting:

1. **DNS Configuration:** [DNS_setup.md](DNS_setup.md)
   - DNS setup with Hetzner DNS
   - DNS troubleshooting and verification

2. **TLS Setup:** [TLS_setup.md](TLS_setup.md)
   - cert-manager installation
   - Let's Encrypt configuration
   - Certificate troubleshooting

## Utilities

- **DNS Cache Issues:** Run `./scripts/clear-dns-cache.sh`

