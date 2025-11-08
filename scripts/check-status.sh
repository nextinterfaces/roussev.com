#!/bin/bash
# Status check script for app.roussev.com services
# Usage: ./scripts/check-status.sh [local|prod]
# Default: prod

set -e

# Determine environment
ENV=${1:-prod}

if [ "$ENV" = "local" ]; then
    BASE_URL="http://localhost:8081"
    GRAFANA_URL="http://localhost:3000"
    JAEGER_URL="http://localhost:16686"
    PROMETHEUS_URL="http://localhost:9090"
    KUBECONFIG_PATH="${HOME}/.kube/config"
    ENV_NAME="LOCAL (k3d)"
elif [ "$ENV" = "prod" ]; then
    BASE_URL="https://app.roussev.com/items"
    GRAFANA_URL="https://app.roussev.com/grafana"
    JAEGER_URL="https://app.roussev.com/jaeger"
    PROMETHEUS_URL="https://app.roussev.com/prometheus"
    # Get the script directory to find kubeconfig relative to project root
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
    KUBECONFIG_PATH="$PROJECT_ROOT/infra/terraform/kubeconfig.yaml"
    ENV_NAME="PRODUCTION (Hetzner)"
else
    echo "Usage: $0 [local|prod]"
    exit 1
fi

echo "=================================================="
echo "🔍 Service Status Check for app.roussev.com"
echo "Environment: $ENV_NAME"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is responding
check_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}

    echo -n "Checking $name... "

    # Use curl with timeout and get response code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$url" 2>/dev/null || echo "timeout")

    if [ "$response_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ OK${NC} (${response_time}s)"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $response_code)"
        return 1
    fi
}

# Check if kubeconfig exists
if [ -f "$KUBECONFIG_PATH" ]; then
    export KUBECONFIG="$KUBECONFIG_PATH"

    echo "📦 Kubernetes Pods Status:"
    echo "----------------------------"
    kubectl get pods -o wide 2>/dev/null | grep -E "NAME|items-service|grafana|jaeger|prometheus|postgres" || echo "No pods found or kubectl not configured"
    echo ""

    echo "💾 Resource Usage:"
    echo "----------------------------"
    kubectl top pods 2>/dev/null | grep -E "NAME|items-service|grafana|jaeger|prometheus" || echo "Metrics not available"
    echo ""
else
    echo "⚠️  Kubeconfig not found at: $KUBECONFIG_PATH"
    echo "Skipping Kubernetes checks..."
    echo ""
fi

echo "🌐 Service Health Checks:"
echo "----------------------------"

# Check items-service
check_endpoint "Items Service Health" "$BASE_URL/v1/health"
check_endpoint "Items Service API" "$BASE_URL/v1/items"
check_endpoint "Items Service Metrics" "$BASE_URL/metrics"

# Check Grafana
check_endpoint "Grafana" "$GRAFANA_URL/api/health"

# Check Jaeger
check_endpoint "Jaeger UI" "$JAEGER_URL/"

# Check Prometheus
check_endpoint "Prometheus" "$PROMETHEUS_URL/-/ready"

echo ""
echo "📊 Items Service Details:"
echo "----------------------------"
curl -s "$BASE_URL/v1/health" | jq . 2>/dev/null || echo "Could not fetch health details"

echo ""
echo "🔗 Quick Links:"
echo "----------------------------"
if [ "$ENV" = "local" ]; then
    echo "Items Service:"
    echo "  - Health:  $BASE_URL/v1/health"
    echo "  - API:     $BASE_URL/v1/items"
    echo "  - Docs:    $BASE_URL/docs"
    echo "  - Metrics: $BASE_URL/metrics"
    echo ""
    echo "Observability:"
    echo "  - Grafana:    $GRAFANA_URL (admin/admin)"
    echo "  - Jaeger:     $JAEGER_URL"
    echo "  - Prometheus: $PROMETHEUS_URL"
else
    echo "Items Service:"
    echo "  - Health:  $BASE_URL/v1/health"
    echo "  - API:     $BASE_URL/v1/items"
    echo "  - Docs:    $BASE_URL/docs"
    echo "  - Metrics: $BASE_URL/metrics"
    echo ""
    echo "Observability:"
    echo "  - Grafana:    $GRAFANA_URL"
    echo "  - Jaeger:     $JAEGER_URL"
    echo "  - Prometheus: $PROMETHEUS_URL"
fi
echo ""

echo "=================================================="
echo "📝 Troubleshooting Commands:"
echo "=================================================="
echo ""
if [ "$ENV" = "local" ]; then
    echo "View logs:"
    echo "  kubectl logs -f deployment/items-service"
    echo "  kubectl logs -f deployment/grafana"
    echo "  kubectl logs -f deployment/jaeger"
    echo "  kubectl logs -f deployment/prometheus"
    echo ""
    echo "Describe pod:"
    echo "  kubectl describe pod -l app=items-service"
    echo ""
    echo "Restart service:"
    echo "  kubectl rollout restart deployment/items-service"
    echo ""
    echo "Check Tilt status:"
    echo "  tilt get uiresources"
else
    echo "View logs:"
    echo "  kubectl --kubeconfig=$KUBECONFIG_PATH logs -f deployment/items-service"
    echo "  kubectl --kubeconfig=$KUBECONFIG_PATH logs -f deployment/grafana"
    echo "  kubectl --kubeconfig=$KUBECONFIG_PATH logs -f deployment/jaeger"
    echo "  kubectl --kubeconfig=$KUBECONFIG_PATH logs -f deployment/prometheus"
    echo ""
    echo "Describe pod:"
    echo "  kubectl --kubeconfig=$KUBECONFIG_PATH describe pod -l app=items-service"
    echo ""
    echo "Restart service:"
    echo "  kubectl --kubeconfig=$KUBECONFIG_PATH rollout restart deployment/items-service"
    echo ""
    echo "Check deployment status:"
    echo "  task k8s:status"
fi
echo ""

