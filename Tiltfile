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
# Jaeger (OpenTelemetry Collector)
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

# ============================================================================
# OpenSearch & OpenSearch Dashboards
# ============================================================================

# Deploy OpenSearch and OpenSearch Dashboards for log aggregation
k8s_yaml('infra/k8s/local/opensearch-local.yaml')

# Configure OpenSearch resource
k8s_resource(
    'opensearch',
    port_forwards='9200:9200',
    labels=['observability'],
    resource_deps=[],
    links=[
        link('http://localhost:9200', 'OpenSearch API'),
    ]
)

# Configure OpenSearch Dashboards resource
k8s_resource(
    'opensearch-dashboards',
    port_forwards='5601:5601',
    labels=['observability'],
    resource_deps=['opensearch'],
    links=[
        link('http://localhost:5601', 'OpenSearch Dashboards'),
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
    resource_deps=['postgres', 'jaeger', 'opensearch'],
    links=[
        link('http://localhost:8081/v1/health', 'Health Check'),
        link('http://localhost:8081/docs', 'API Docs'),
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
  🌐 Website App:     http://localhost:8082
     - Health:        http://localhost:8082/health
  📊 Jaeger UI:       http://localhost:16686
  🔍 OpenSearch:      http://localhost:9200
  📊 OpenSearch Dashboards: http://localhost:5601

Press 'space' to open Tilt UI in your browser
Press 'q' to quit

Tip: Edit any source file and Tilt will automatically rebuild and redeploy!
""")

