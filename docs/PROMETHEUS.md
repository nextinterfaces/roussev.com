# Prometheus Metrics Setup Guide

The items-service exposes Prometheus metrics at the `/metrics` endpoint using OpenTelemetry's Prometheus exporter.

## Available Metrics

### HTTP Metrics
- `http_server_duration` - Request duration histogram (milliseconds)
- `http_server_requests_total` - Total request count

### Custom Metrics
You can add custom metrics in `apps/items-service/src/metrics.ts` using the MeterProvider.


## Testing Metrics

### Generate Traffic

```bash
for i in {1..20}; do
  curl -s http://localhost:8081/v1/health > /dev/null
  curl -s http://localhost:8081/v1/items > /dev/null
  sleep 0.5
done
```

### View Metrics

**Local Development:**
```bash
curl http://localhost:8081/metrics | grep http_server
```

**Production:**
```bash
curl https://app.roussev.com/items/metrics | grep http_server
```

**Browser:**
- Local: http://localhost:8081/metrics
- Production: https://app.roussev.com/items/metrics

## 📊 Setting Up Prometheus Server (Optional)

To collect and store these metrics over time, deploy a Prometheus server to scrape the `/metrics` endpoint.

### Option 1: Deploy Prometheus to Kubernetes

Create `infra/k8s/observability/prometheus-deployment.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: default
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'items-service'
        kubernetes_sd_configs:
          - role: pod
            namespaces:
              names:
                - default
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_label_app]
            action: keep
            regex: items-service
          - source_labels: [__meta_kubernetes_pod_ip]
            action: replace
            target_label: __address__
            replacement: $1:8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
      volumes:
      - name: config
        configMap:
          name: prometheus-config
---
apiVersion: v1
kind: Service
metadata:
  name: prometheus
  namespace: default
spec:
  type: ClusterIP
  ports:
  - port: 9090
    targetPort: 9090
  selector:
    app: prometheus
```

Deploy:
```bash
kubectl --kubeconfig=./infra/terraform/kubeconfig.yaml apply -f infra/k8s/observability/prometheus-deployment.yaml
```

### Option 2: Use Existing Prometheus

If you already have Prometheus running, add a scrape config:

```yaml
scrape_configs:
  - job_name: 'items-service'
    static_configs:
      - targets: ['items-service.default.svc.cluster.local:80']
    metrics_path: '/metrics'
    scrape_interval: 15s
```
