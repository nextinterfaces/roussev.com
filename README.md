# K3s on Hetzner Cloud with Nginx Ingress

This project deploys a K3s Kubernetes cluster on Hetzner Cloud in Ashburn, VA, USA with nginx ingress controller and a sample REST service.

## Features

- **K3s Kubernetes** cluster on Hetzner Cloud
- **Location**: Ashburn, VA, USA (ash) - US East location
- **Server Type**: CPX11 (cheapest option: 2 vCPU, 2GB RAM, ~€5/month)
- **Nginx Ingress Controller** for routing traffic
- **Sample REST Service** exposed publicly with HTTPS
- **Automated setup** with Terraform and cloud-init
- **Let's Encrypt SSL** certificates with cert-manager

## Prerequisites

1. **Hetzner Cloud Account**: Sign up at https://www.hetzner.com/cloud
2. **Hetzner API Token**: Create one in your Hetzner Cloud Console under Security > API Tokens
3. **Terraform**: Install from https://www.terraform.io/downloads
4. **kubectl**: Install from https://kubernetes.io/docs/tasks/tools/

## Project Structure

```
.
├── terraform/
│   ├── main.tf           # Main Terraform configuration
│   ├── variables.tf      # Variable definitions
│   ├── outputs.tf        # Output definitions
│   └── cloud-init.yaml   # K3s installation script
├── k8s/
│   ├── sample-service.yaml  # Sample REST service manifests
│   └── deploy.sh            # Deployment script
└── README.md
```

## Quick Start

### 1. Set up Hetzner API Token

Export your Hetzner Cloud API token:

```bash
export TF_VAR_hcloud_token="your-hetzner-api-token-here"
```

Or create a `terraform/terraform.tfvars` file:

```hcl
hcloud_token = "your-hetzner-api-token-here"
```

### 2. Deploy Infrastructure

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```

This will:
- Create a CPX11 server in Ashburn, VA (ash)
- Install K3s with nginx ingress controller
- Configure firewall rules
- Generate SSH keys
- Download kubeconfig

The deployment takes about 2-3 minutes.

### 3. Verify Cluster

```bash
export KUBECONFIG=$(pwd)/kubeconfig.yaml
kubectl get nodes
kubectl get pods -A
```

### 4. Setup DNS

See `docs/Hetzner_DNS_Setup.md` for detailed instructions.

Find the server IP and add it to Hetzner DNS

### 4. Deploy Sample Service

```bash
cd ../k8s
./deploy.sh
```

This deploys a sample REST service that responds with a greeting message.

### 5. Access the Service

Get the service URL:

```bash
cd ../terraform
terraform output sample_service_url
```

Test the service:

```bash
curl $(terraform output -raw sample_service_url)
```

You should see: `Hello from K3s on Hetzner! This is a sample REST API.`

## Outputs

After `terraform apply`, you'll get:

- **server_ip**: Public IP address of the server
- **ssh_command**: Command to SSH into the server
- **kubeconfig_path**: Path to the kubeconfig file
- **sample_service_url**: URL to access the sample REST service

## DNS Configuration

You'll need to configure your domain to point to the server:

1. Get your server IP: `cd terraform && terraform output server_ip`
2. Add an **A record** in your domain registrar:
   - **Host**: `@` (for root domain) or your subdomain
   - **Type**: `A`
   - **Value**: Your server IP address
   - **TTL**: 300 or Auto

3. Verify DNS propagation using a public DNS resolver:
   ```bash
   # Check DNS from Google's public DNS
   dig @8.8.8.8 roussev.com A

   # Or use nslookup
   nslookup roussev.com 8.8.8.8
   ```

4. Test connectivity before applying certificates:
   ```bash
   cd terraform
   SERVER_IP=$(terraform output -raw server_ip)
   curl -v https://roussev.com/api --resolve roussev.com:443:$SERVER_IP
   ```

## Customization

### Change Server Type

Edit `terraform/variables.tf` or pass variable:

```bash
terraform apply -var="server_type=cpx21"
```

Available types: cpx11, cpx21, cpx31, cpx41, cpx51 (or cax11, cax21, cax31, cax41 for ARM)

### Change Location

```bash
terraform apply -var="location=ash"
```

Available locations: ash (Ashburn, VA), fsn1 (Falkenstein), nbg1 (Nuremberg), hel1 (Helsinki), hil (Hillsboro, OR)

### Deploy Your Own Service

1. Create your Kubernetes manifests in `k8s/`
2. Update the Ingress to use your service
3. Apply with `kubectl apply -f your-service.yaml`

## Accessing the Cluster

### Via kubectl

```bash
export KUBECONFIG=./terraform/kubeconfig.yaml
kubectl get all -A
```

### Via SSH

```bash
ssh -i terraform/ssh_key.pem root@$(cd terraform && terraform output -raw server_ip)
```

On the server, kubectl is pre-configured:

```bash
kubectl get nodes
```

## Monitoring

Check nginx ingress controller:

```bash
kubectl get pods -n ingress-nginx
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
```

Check sample service:

```bash
kubectl get pods -n sample-app
kubectl logs -n sample-app -l app=sample-rest-service
```

## Cleanup

To destroy all resources:

```bash
cd terraform
terraform destroy
```

This will:
- Delete the server
- Remove firewall rules
- Delete SSH keys from Hetzner
- Clean up local files

## Cost Estimation

- **CPX11 Server**: ~€5/month (~€0.007/hour)
- **Traffic**: 20 TB included
- **Backups**: Optional, ~€1/month

Total: ~€5/month for the cheapest setup

## Troubleshooting

### K3s not ready

SSH into the server and check:

```bash
ssh -i terraform/ssh_key.pem root@<server-ip>
systemctl status k3s
journalctl -u k3s -f
```

### Ingress not working

Check nginx ingress controller:

```bash
kubectl get pods -n ingress-nginx
kubectl describe ingress -n sample-app
```

### Can't access service

1. Verify the service is running: `kubectl get pods -n sample-app`
2. Check ingress: `kubectl get ingress -n sample-app`
3. Test from the server: `curl localhost/api`
4. Check firewall rules in Hetzner Console

## Security Notes

- SSH key is auto-generated and stored in `terraform/ssh_key.pem`
- Keep your Hetzner API token secure
- The firewall allows SSH (22), HTTP (80), HTTPS (443), and K3s API (6443)
- For production, consider:
  - Using a proper domain with TLS/SSL
  - Restricting SSH access by IP
  - Enabling Hetzner Cloud Firewall rules
  - Setting up monitoring and backups

## Next Steps

### Add HTTPS with cert-manager and Let's Encrypt

To enable HTTPS with automatic SSL certificate management:

#### 1. Install cert-manager

```bash
export KUBECONFIG=./terraform/kubeconfig.yaml

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --namespace cert-manager --for=condition=ready pod --selector=app.kubernetes.io/instance=cert-manager --timeout=300s
```

#### 2. Verify DNS Configuration

Before requesting certificates, verify your DNS is properly configured:

```bash
# Check DNS from public resolver (Google DNS)
dig @8.8.8.8 roussev.com A

# You should see your server IP in the ANSWER section
# Example output:
# roussev.com.    300    IN    A    37.27.200.27
```

Alternative verification:
```bash
nslookup roussev.com 8.8.8.8
```

#### 3. Create Let's Encrypt ClusterIssuer

Create a file `k8s/letsencrypt-issuer.yaml`:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    # Let's Encrypt production server
    server: https://acme-v02.api.letsencrypt.org/directory
    # Email for certificate expiration notifications
    email: your-email@roussev.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    # Let's Encrypt staging server (for testing)
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: your-email@roussev.com
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
    - http01:
        ingress:
          class: nginx
```

**Important**: Replace `your-email@roussev.com` with your actual email address!

Apply it:

```bash
kubectl apply -f k8s/letsencrypt-issuer.yaml
```

#### 4. Update Ingress with TLS

Update your `k8s/sample-service.yaml` ingress section:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sample-rest-ingress
  namespace: sample-app
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - roussev.com
    secretName: sample-rest-tls
  rules:
  - host: roussev.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: sample-rest-service
            port:
              number: 80
```

Apply the updated ingress:

```bash
kubectl apply -f k8s/sample-service.yaml
```

#### 5. Verify Certificate

```bash
# Check certificate status (wait for "Ready" status)
kubectl get certificate -n sample-app

# Check certificate details
kubectl describe certificate sample-rest-tls -n sample-app

# Check cert-manager logs if issues
kubectl logs -n cert-manager -l app=cert-manager
```

The certificate should be issued within 1-2 minutes. Look for `Certificate issued successfully`.

#### 6. Test HTTPS

First, verify DNS resolution from a public resolver:

```bash
# Check DNS from Google's public DNS
dig @8.8.8.8 roussev.com A

# Should return your server IP
```

Test the service with explicit IP resolution (useful before DNS fully propagates):

```bash
# Get your server IP
cd terraform
SERVER_IP=$(terraform output -raw server_ip)

# Test with explicit resolution (replace IP with your actual server IP)
curl -v https://roussev.com/api --resolve roussev.com:443:$SERVER_IP
```

Once DNS is fully propagated, test normally:

```bash
# Test HTTP (should redirect to HTTPS)
curl http://roussev.com/api

# Test HTTPS
curl https://roussev.com/api

# Verify certificate details
curl -vI https://roussev.com/api 2>&1 | grep -A 10 "SSL certificate"
```

Expected response: `Hello from K3s on Hetzner! This is a sample REST API.`

**Note**: Let's Encrypt has rate limits (5 certificates per domain per week). Use `letsencrypt-staging` for testing, then switch to `letsencrypt-prod` for production.

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

