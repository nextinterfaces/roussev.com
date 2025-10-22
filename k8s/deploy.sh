#!/bin/bash
set -e

# Check if kubeconfig exists
if [ ! -f "../terraform/kubeconfig.yaml" ]; then
    echo "Error: kubeconfig.yaml not found in terraform directory"
    echo "Please run 'terraform apply' first"
    exit 1
fi

export KUBECONFIG="../terraform/kubeconfig.yaml"

echo "Deploying sample REST service to K3s cluster..."

# Apply the manifests
kubectl apply -f sample-service.yaml

echo ""
echo "Waiting for deployment to be ready..."
kubectl wait --namespace sample-app --for=condition=available deployment/sample-rest-service --timeout=300s

echo ""
echo "Deployment complete!"
echo ""
echo "Service status:"
kubectl get pods -n sample-app
echo ""
kubectl get svc -n sample-app
echo ""
kubectl get ingress -n sample-app

echo ""
echo "To get the service URL, run:"
echo "  cd ../terraform && terraform output sample_service_url"

