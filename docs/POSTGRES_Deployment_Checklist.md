# PostgreSQL Deployment Checklist

Checklist for deploying PostgreSQL with Hetzner Cloud Volume to K3s cluster.

## Pre-Deployment Checklist

- [ ] Hetzner Cloud Volume created (`k3s-server-volume-1`, ID: `103823462`)
- [ ] Volume attached to `k3s-server` in Hetzner Console
- [ ] kubectl configured with cluster access
- [ ] Hetzner CSI driver installed (verify with `kubectl get pods -n kube-system | grep hcloud-csi`)
- [ ] `.env` file created with PostgreSQL credentials

## Deployment Steps

### 1. Configure PostgreSQL Credentials

Create `.env` file from example:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```bash
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=your_database_name
```

**Important**: Never commit `.env` to git!

### 2. Deploy PostgreSQL

Using Taskfile (recommended):
```bash
task deploy:postgres
```

This will:
1. Create the Kubernetes secret from your `.env` file
2. Deploy PersistentVolume and PersistentVolumeClaim
3. Deploy PostgreSQL StatefulSet
4. Wait for PostgreSQL to be ready

### 3. Verify Deployment

```bash
task postgres:status
```


### 4. Test PostgreSQL Connection

```bash
task postgres:connect
```

## Useful Commands

```bash
# View PostgreSQL logs
task k8s:logs:postgres

# Check disk usage
task postgres:disk-usage

# Port forward to access from local machine
task postgres:port-forward
# Then in another terminal:
# source .env && psql -h localhost -U $POSTGRES_USER -d $POSTGRES_DB

# Backup database
task postgres:backup

# Show PostgreSQL credentials
task postgres:show-credentials

# Describe PostgreSQL resources
task k8s:describe:postgres
```

## Troubleshooting


```bash
# pod stuck
kubectl describe pod postgres-0

# Check if volume is attached in Hetzner Console
# Verify CSI driver is running
kubectl get pods -n kube-system | grep hcloud-csi

# Check pod logs
kubectl logs postgres-0

# May need to SSH into server and check volume permissions
task ssh
lsblk
df -h
```


### Connection refused from items-service
```bash
# Verify service is accessible
kubectl get svc postgres

# Test connection from debug pod
POSTGRES_USER=$(kubectl get secret postgres-secret -o jsonpath='{.data.POSTGRES_USER}' | base64 -d)
POSTGRES_DB=$(kubectl get secret postgres-secret -o jsonpath='{.data.POSTGRES_DB}' | base64 -d)
kubectl run -it --rm debug --image=postgres:16-alpine --restart=Never -- psql -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```


## Next Steps

- [ ] Set up automated backups (CronJob)
- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Implement connection pooling (PgBouncer)
- [ ] Set up network policies to restrict access
- [ ] Configure SSL/TLS for PostgreSQL connections

