# TLS/SSL Setup with cert-manager and Let's Encrypt

This guide explains how to configure HTTPS for your K3s services using **cert-manager** and **Let's Encrypt**.

---

## Prerequisites

- K3s cluster running on Hetzner Cloud
- DNS configured and pointing to your K3s server (see [DNS_setup.md](DNS_setup.md))
- kubectl configured with kubeconfig
- roussev.com Domain name

---

## Step 1: Deploy Sample Application

First, deploy a sample application to test the SSL setup.

```bash
# Set kubeconfig
export KUBECONFIG=./terraform/kubeconfig.yaml

# Deploy the sample service
cd k8s
kubectl apply -f sample-service.yaml

# Wait for deployment to be ready
kubectl wait --namespace sample-app \
  --for=condition=available deployment/sample-rest-service \
  --timeout=300s

# Verify deployment
kubectl get pods -n sample-app
```

Expected output:
```
NAME                                   READY   STATUS    RESTARTS   AGE
sample-rest-service-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
sample-rest-service-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
```

---

## Step 2: Install cert-manager

cert-manager automates the management and issuance of TLS certificates.

```bash
export KUBECONFIG=./terraform/kubeconfig.yaml

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/instance=cert-manager \
  --timeout=300s
```

### Verify Installation

```bash
# Check cert-manager pods
kubectl get pods -n cert-manager

# Expected output: 3 pods running
# cert-manager-*
# cert-manager-cainjector-*
# cert-manager-webhook-*
```

---

## Step 3: Configure Let's Encrypt Issuers

Let's Encrypt provides free SSL certificates. We'll configure both staging (for testing) and production issuers.

```bash
# Apply the Let's Encrypt issuers
kubectl apply -f k8s/letsencrypt-issuer.yaml
```

### Verify Issuers

```bash
kubectl get clusterissuer
```

Expected output:
```
NAME                  READY   AGE
letsencrypt-prod      True    10s
letsencrypt-staging   True    10s
```

---

## Step 4: Request SSL Certificate

Certificates are automatically requested when you create an Ingress with the cert-manager annotation.

### Check Certificate Status

```bash
# Watch certificate creation
kubectl get certificate -n sample-app -w

# Expected: READY = True (takes 1-2 minutes)
```

### View Certificate Details

```bash
kubectl describe certificate sample-rest-tls -n sample-app
```

Look for:
```
Status:
  Conditions:
    Message: Certificate is up to date and has not expired
    Reason: Ready
    Status: True
    Type: Ready
  Not After: <90 days from issue>
```

---

## Step 5: Verify HTTPS Access

Once the certificate is issued, test your endpoint:

```bash
# Test HTTPS
curl https://roussev.com/api

# Expected: Hello from K3s on Hetzner! This is a sample REST API.
```

### Verify SSL Certificate

```bash
# Check certificate details
echo | openssl s_client -servername roussev.com \
  -connect roussev.com:443 2>/dev/null | \
  openssl x509 -noout -issuer -dates

# Expected issuer: C = US, O = Let's Encrypt, CN = R3
```

---

## Troubleshooting

### Certificate Stuck in "Pending"

```bash
# Check certificate status
kubectl describe certificate sample-rest-tls -n sample-app

# Check certificate request
kubectl get certificaterequest -n sample-app
kubectl describe certificaterequest -n sample-app

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager -f
```

### Common Issues

**1. DNS not propagated**
- Wait 5-10 minutes for DNS to propagate
- See [DNS_setup.md](DNS_setup.md) for DNS troubleshooting

**2. Port 80 blocked**
- Let's Encrypt uses HTTP-01 challenge (requires port 80)
- Check firewall: Port 80 should be open

**3. Rate limit hit**
- Let's Encrypt production: 5 certificates per domain per week
- Use staging issuer for testing (see below)

### Test Before DNS Propagates

See [DNS_setup.md](DNS_setup.md) for detailed instructions on testing before DNS propagates.

---

## Using Staging for Testing

To avoid hitting Let's Encrypt rate limits during testing:

### Switch to Staging

```bash
# Update ingress annotation
kubectl annotate ingress sample-rest-ingress -n sample-app \
  cert-manager.io/cluster-issuer=letsencrypt-staging --overwrite

# Delete existing certificate
kubectl delete certificate sample-rest-tls -n sample-app
kubectl delete secret sample-rest-tls -n sample-app

# Wait for new certificate
kubectl get certificate -n sample-app -w
```

### Switch to Production

```bash
# Update ingress annotation
kubectl annotate ingress sample-rest-ingress -n sample-app \
  cert-manager.io/cluster-issuer=letsencrypt-prod --overwrite

# Delete staging certificate
kubectl delete certificate sample-rest-tls -n sample-app
kubectl delete secret sample-rest-tls -n sample-app

# Wait for production certificate
kubectl get certificate -n sample-app -w
```

---

## Certificate Auto-Renewal

cert-manager automatically renews certificates 30 days before expiration.

### Monitor Renewal

```bash
# Watch cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager -f

# Check certificate expiration
kubectl get certificate -n sample-app -o wide
```

2. **Apply the ingress:**
```bash
kubectl apply -f my-app-ingress.yaml
```

3. **Wait for certificate:**
```bash
kubectl get certificate -n my-namespace -w
```

---

## Monitoring and Maintenance

### Check Service Status

```bash
# Check all components
kubectl get pods -n sample-app
kubectl get svc -n sample-app
kubectl get ingress -n sample-app
kubectl get certificate -n sample-app

# Check certificate expiration
kubectl get certificate -n sample-app -o wide

# View application logs
kubectl logs -n sample-app -l app=sample-rest-service

# Follow logs in real-time
kubectl logs -n sample-app -l app=sample-rest-service -f
```

### Certificate Expiration

```bash
# Check certificate details
kubectl describe certificate sample-rest-tls -n sample-app
```

**Note:** cert-manager automatically renews certificates 30 days before expiration.

---

## Next Steps

Once SSL is working:

1. **Deploy your actual application** (replace sample service)
2. **Add more services/paths** (see "Adding SSL to Additional Services" above)
3. **Set up monitoring** (Prometheus/Grafana)
4. **Configure backups**
5. **Add CI/CD pipeline**
6. **Create staging environment**

---

## Summary

| Component              | Description                                | Status |
|------------------------|--------------------------------------------|--------|
| Sample Application     | Test REST service                          | ✅ |
| cert-manager           | Manages certificate lifecycle              | ✅ |
| letsencrypt-prod       | Production ACME issuer (HTTP-01 challenge) | ✅ |
| letsencrypt-staging    | Staging ACME issuer (for testing)          | ✅ |
| sample-rest-tls        | TLS certificate secret                     | ✅ |
| Auto-renewal           | Renews 30 days before expiration           | ✅ |

---

## Reference

- **cert-manager Documentation:** https://cert-manager.io/docs/
- **Let's Encrypt:** https://letsencrypt.org/
- **Rate Limits:** https://letsencrypt.org/docs/rate-limits/
- **DNS Setup Guide:** [DNS_setup.md](DNS_setup.md)
- **Quick Start Guide:** [QUICK_START.md](QUICK_START.md)
