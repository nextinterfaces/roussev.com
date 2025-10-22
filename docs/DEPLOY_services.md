# Deploy k8s services

This guide explains how to deploy


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

Expected output:
```
NAME                                   READY   STATUS    RESTARTS   AGE
sample-rest-service-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
sample-rest-service-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
```

**Continue to:** [TLS_setup.md](TLS_setup.md) 