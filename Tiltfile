# Tiltfile for local development with k3d
# This orchestrates building and deploying all services locally

# Load environment variables from .env file if it exists
load('ext://dotenv', 'dotenv')
if os.path.exists('.env'):
    dotenv('.env')

# Set allowed contexts to prevent accidentally deploying to production
allow_k8s_contexts('k3d-roussev-local')

# Configure Tilt settings
update_settings(max_parallel_updates=3, k8s_upsert_timeout_secs=60)

# ============================================================================
# PostgreSQL Database
# ============================================================================

# Create PostgreSQL secret from environment variables
postgres_secret = {
    'apiVersion': 'v1',
    'kind': 'Secret',
    'metadata': {
        'name': 'postgres-secret',
        'namespace': 'default'
    },
    'type': 'Opaque',
    'stringData': {
        'POSTGRES_USER': os.getenv('POSTGRES_USER', 'postgres'),
        'POSTGRES_PASSWORD': os.getenv('POSTGRES_PASSWORD', 'postgres'),
        'POSTGRES_DB': os.getenv('POSTGRES_DB', 'itemsdb')
    }
}

k8s_yaml(encode_yaml(postgres_secret))

# Deploy PostgreSQL using local manifests
k8s_yaml('infra/k8s/local/postgres-local.yaml')

# Add port forward for PostgreSQL
k8s_resource(
    'postgres',
    port_forwards='5432:5432',
    labels=['database'],
    resource_deps=[]
)

# ============================================================================
# Observability Stack
# ============================================================================

# Deploy Jaeger for distributed tracing
k8s_yaml('infra/k8s/local/jaeger-local.yaml')

# Configure Jaeger resource
k8s_resource(
    'jaeger',
    port_forwards='16686:16686',
    labels=['observability'],
    resource_deps=[],
    links=[
        link('http://localhost:16686', 'Jaeger UI'),
    ]
)

# Deploy Prometheus for metrics collection
k8s_yaml('infra/k8s/local/prometheus-local.yaml')

# Configure Prometheus resource
k8s_resource(
    'prometheus',
    port_forwards='9090:9090',
    labels=['observability'],
    resource_deps=[],
    links=[
        link('http://localhost:9090', 'Prometheus UI'),
        link('http://localhost:9090/targets', 'Prometheus Targets'),
    ]
)

# Deploy Loki for log aggregation
k8s_yaml('infra/k8s/local/loki-local.yaml')

# Configure Loki resource
k8s_resource(
    'loki',
    port_forwards='3100:3100',
    labels=['observability'],
    resource_deps=[],
    links=[
        link('http://localhost:3100', 'Loki API'),
        link('http://localhost:3100/ready', 'Loki Health'),
    ]
)

# Deploy Promtail for log collection
k8s_yaml('infra/k8s/local/promtail-local.yaml')

# Configure Promtail resource
k8s_resource(
    'promtail',
    labels=['observability'],
    resource_deps=['loki'],
)

# Deploy Grafana for metrics visualization
k8s_yaml('infra/k8s/local/grafana-local.yaml')

# Configure Grafana resource
k8s_resource(
    'grafana',
    port_forwards='3000:3000',
    labels=['observability'],
    resource_deps=['prometheus', 'loki'],
    links=[
        link('http://localhost:3000', 'Grafana UI'),
    ]
)

# ============================================================================
# Items Service
# ============================================================================

# Build Docker image for items-service (using dev Dockerfile with hot reload)
docker_build(
    'items-service',
    context='./apps/items-service',
    dockerfile='./apps/items-service/Dockerfile.dev',
    live_update=[
        sync('./apps/items-service/src', '/app/src'),
        sync('./apps/items-service/package.json', '/app/package.json'),
        run('cd /app && bun install', trigger=['./apps/items-service/package.json']),
    ]
)

# Deploy items-service
k8s_yaml('infra/k8s/local/items-service-local.yaml')

# Configure items-service resource
k8s_resource(
    'items-service',
    port_forwards='8081:8080',
    labels=['apps'],
    resource_deps=['postgres', 'jaeger', 'prometheus'],
    links=[
        link('http://localhost:8081/v1/health', 'Health Check'),
        link('http://localhost:8081/docs', 'API Docs'),
        link('http://localhost:8081/metrics', 'Prometheus Metrics'),
    ]
)

# ============================================================================
# Website App
# ============================================================================

# Build Docker image for website-app (using dev Dockerfile with hot reload)
docker_build(
    'website-app',
    context='./apps/website-app',
    dockerfile='./apps/website-app/Dockerfile.dev',
    live_update=[
        sync('./apps/website-app/src', '/app/src'),
        sync('./apps/website-app/public', '/app/public'),
        sync('./apps/website-app/package.json', '/app/package.json'),
        run('cd /app && bun install', trigger=['./apps/website-app/package.json']),
    ]
)

# Deploy website-app
k8s_yaml('infra/k8s/local/website-app-local.yaml')

# Configure website-app resource
k8s_resource(
    'website-app',
    port_forwards='8082:8080',
    labels=['apps'],
    resource_deps=[],
    links=[
        link('http://localhost:8082', 'Website'),
        link('http://localhost:8082/health', 'Health Check'),
    ]
)

# ============================================================================
# Headlamp Kubernetes Dashboard (Read-Only)
# ============================================================================

# Deploy headlamp-readonly (public)
k8s_yaml('infra/k8s/local/headlamp-readonly-local.yaml')

# Configure headlamp-readonly resource
k8s_resource(
    'headlamp-readonly',
    port_forwards='8084:4466',
    labels=['dashboard'],
    resource_deps=[],
    links=[
        link('http://localhost:8084', 'Headlamp (Read-Only)'),
    ]
)

# ============================================================================
# Helper Functions
# ============================================================================

# Print helpful information
print("""
╔══════════════════════════════════════════════════════════════════════════╗
║                   🚀 Tilt Local Development Setup                        ║
╚══════════════════════════════════════════════════════════════════════════╝

Services will be available at:
  📦 PostgreSQL:      localhost:5432
  🔧 Items Service:   http://localhost:8081
     - Health:        http://localhost:8081/v1/health
     - API Docs:      http://localhost:8081/docs
     - Metrics:       http://localhost:8081/metrics
  🌐 Website App:     http://localhost:8082
     - Health:        http://localhost:8082/health
  👁️  Headlamp:       http://localhost:8084 (Read-Only)

  📊 Observability:
     - Jaeger UI:     http://localhost:16686
     - Prometheus:    http://localhost:9090
     - Loki:          http://localhost:3100
     - Grafana:       http://localhost:3000 (Metrics + Logs)

Press 'space' to open Tilt UI in your browser
Press 'q' to quit

Tip: Edit any source file and Tilt will automatically rebuild and redeploy!
""")

