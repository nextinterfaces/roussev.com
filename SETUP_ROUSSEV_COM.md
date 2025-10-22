# Setting Up roussev.com with K3s on Hetzner Cloud

This guide walks you through setting up roussev.com with HTTPS certificates on your K3s cluster.

## Prerequisites

- Hetzner Cloud account with API token
- Access to roussev.com DNS settings (domain registrar or DNS provider)
- Terraform installed locally
- kubectl installed locally

## Step 1: Deploy Infrastructure

1. **Navigate to terraform directory:**
   ```bash
   cd terraform
   ```

2. **Initialize and apply Terraform:**
   ```bash
   terraform init
   terraform apply
   ```

3. **Get your server IP:**
   ```bash
   terraform output server_ip
   ```
   
   Save this IP address - you'll need it for DNS configuration.

## Step 2: Configure DNS

You need to point roussev.com to your server's IP address.

### Option A: Using Hetzner DNS (Recommended)

If you use Hetzner as your DNS provider:

1. Go to [Hetzner DNS Console](https://dns.hetzner.com/)
2. Select your zone `roussev.com`
3. Add or update the A record:
   - **Name:** `@` (for root domain)
   - **Type:** `A`
   - **Value:** Your server IP from Step 1
   - **TTL:** `300`

### Option B: Using Another DNS Provider

1. Log in to your domain registrar or DNS provider
2. Navigate to DNS settings for roussev.com
3. Add or update an A record:
   - **Host/Name:** `@` or leave blank (for root domain)
   - **Type:** `A`
   - **Value:** Your server IP from Step 1
   - **TTL:** `300` or `Auto`

### Verify DNS Propagation

Wait 2-5 minutes, then verify DNS is working:

```bash
# Check DNS from Google's public DNS
dig @8.8.8.8 roussev.com A

# Or use nslookup
nslookup roussev.com 8.8.8.8
```

You should see your server IP in the response.

## Step 3: Deploy Sample Application

1. **Set kubeconfig:**
   ```bash
   export KUBECONFIG=./terraform/kubeconfig.yaml
   ```

2. **Deploy the sample service:**
   ```bash
   cd ../k8s
   kubectl apply -f sample-service.yaml
   ```

3. **Wait for deployment:**
   ```bash
   kubectl wait --namespace sample-app --for=condition=available deployment/sample-rest-service --timeout=300s
   ```

## Step 4: Install cert-manager

cert-manager will automatically obtain and renew SSL certificates from Let's Encrypt.

1. **Install cert-manager:**
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
   ```

2. **Wait for cert-manager to be ready:**
   ```bash
   kubectl wait --namespace cert-manager --for=condition=ready pod --selector=app.kubernetes.io/instance=cert-manager --timeout=300s
   ```

3. **Verify cert-manager is running:**
   ```bash
   kubectl get pods -n cert-manager
   ```

## Step 5: Configure Let's Encrypt Issuers

1. **Apply the Let's Encrypt issuers:**
   ```bash
   kubectl apply -f letsencrypt-issuer.yaml
   ```

2. **Verify issuers are created:**
   ```bash
   kubectl get clusterissuer
   ```

You should see both `letsencrypt-prod` and `letsencrypt-staging`.

## Step 6: Request SSL Certificate

The certificate will be automatically requested when you apply the ingress (already done in Step 3).

1. **Check certificate status:**
   ```bash
   kubectl get certificate -n sample-app
   ```

   Wait until you see `READY = True`. This usually takes 1-2 minutes.

2. **Check certificate details:**
   ```bash
   kubectl describe certificate sample-rest-tls -n sample-app
   ```

3. **If there are issues, check cert-manager logs:**
   ```bash
   kubectl logs -n cert-manager -l app=cert-manager
   ```

## Step 7: Test Your Setup

1. **Test with explicit IP resolution (before DNS fully propagates):**
   ```bash
   SERVER_IP=$(cd ../terraform && terraform output -raw server_ip)
   curl -v https://roussev.com/api --resolve roussev.com:443:$SERVER_IP
   ```

2. **Once DNS is propagated, test normally:**
   ```bash
   # Test HTTPS
   curl https://roussev.com/api
   
   # Verify certificate
   curl -vI https://roussev.com/api 2>&1 | grep -A 10 "SSL certificate"
   ```

3. **Test in browser:**
   Open https://roussev.com/api in your browser. You should see:
   - Valid SSL certificate (green padlock)
   - Message: "Hello from K3s on Hetzner! This is a sample REST API."

## Troubleshooting

### DNS Not Resolving

```bash
# Check DNS from multiple resolvers
dig @8.8.8.8 roussev.com A
dig @1.1.1.1 roussev.com A

# Check your local DNS cache
dig roussev.com A
```

If DNS isn't resolving, wait longer (up to 24 hours for full propagation) or check your DNS provider settings.

### Certificate Not Issuing

1. **Check certificate status:**
   ```bash
   kubectl describe certificate sample-rest-tls -n sample-app
   ```

2. **Check certificate request:**
   ```bash
   kubectl get certificaterequest -n sample-app
   kubectl describe certificaterequest -n sample-app
   ```

3. **Check cert-manager logs:**
   ```bash
   kubectl logs -n cert-manager -l app=cert-manager -f
   ```

4. **Common issues:**
   - DNS not propagated yet - wait and try again
   - Firewall blocking port 80 (needed for HTTP-01 challenge)
   - Rate limit hit - use `letsencrypt-staging` for testing

### Using Staging for Testing

If you want to test without hitting Let's Encrypt rate limits:

1. **Update ingress to use staging:**
   ```bash
   kubectl annotate ingress sample-rest-ingress -n sample-app \
     cert-manager.io/cluster-issuer=letsencrypt-staging --overwrite
   ```

2. **Delete existing certificate:**
   ```bash
   kubectl delete certificate sample-rest-tls -n sample-app
   kubectl delete secret sample-rest-tls -n sample-app
   ```

3. **Wait for new certificate:**
   ```bash
   kubectl get certificate -n sample-app -w
   ```

4. **Switch back to production when ready:**
   ```bash
   kubectl annotate ingress sample-rest-ingress -n sample-app \
     cert-manager.io/cluster-issuer=letsencrypt-prod --overwrite
   kubectl delete certificate sample-rest-tls -n sample-app
   kubectl delete secret sample-rest-tls -n sample-app
   ```

### Ingress Not Working

```bash
# Check ingress status
kubectl get ingress -n sample-app
kubectl describe ingress sample-rest-ingress -n sample-app

# Check nginx ingress controller
kubectl get pods -n ingress-nginx
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
```

## Monitoring

### Check Application Status

```bash
# Check pods
kubectl get pods -n sample-app

# Check logs
kubectl logs -n sample-app -l app=sample-rest-service

# Check service
kubectl get svc -n sample-app
```

### Check Certificate Expiration

```bash
# View certificate details
kubectl get certificate -n sample-app -o wide

# Check certificate expiration date
echo | openssl s_client -servername roussev.com -connect roussev.com:443 2>/dev/null | openssl x509 -noout -dates
```

cert-manager will automatically renew certificates 30 days before expiration.

## Adding More Services

To add additional services to roussev.com:

1. **Create your deployment and service**
2. **Add an ingress rule:**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
  namespace: my-namespace
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - roussev.com
    secretName: my-app-tls
  rules:
  - host: roussev.com
    http:
      paths:
      - path: /my-app
        pathType: Prefix
        backend:
          service:
            name: my-app-service
            port:
              number: 80
```

## Next Steps

- Add subdomains (e.g., api.roussev.com, www.roussev.com)
- Set up monitoring with Prometheus/Grafana
- Configure backups
- Add CI/CD pipeline
- Set up staging environment

## Important Notes

- **Let's Encrypt Rate Limits:** 5 certificates per domain per week. Use staging for testing.
- **Certificate Renewal:** Automatic, happens 30 days before expiration
- **DNS TTL:** Lower TTL (300s) allows faster changes but more DNS queries
- **Firewall:** Port 80 must be open for HTTP-01 challenge (already configured)

