# Deploy Kubernetes Services

This guide explains how to deploy services to K3s cluster.

## Deploy Sample Application

First, deploy a sample application to test the SSL/TLS setup.

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

or use `cd k8s && ./deploy.sh`

## Next Steps

**Continue to:** [TLS_setup.md](TLS_setup.md) 