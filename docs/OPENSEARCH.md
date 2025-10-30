# OpenSearch & OpenSearch Dashboards

OpenSearch is an open-source search and analytics suite for log aggregation, full-text search, and data visualization. OpenSearch Dashboards provides a web interface for exploring and visualizing data stored in OpenSearch.

## Quick Access

### Local Development
- **OpenSearch API**: http://localhost:9200
- **OpenSearch Dashboards**: http://localhost:5601

### Production
- **OpenSearch Dashboards**: https://app.roussev.com/opensearch
- **Authentication**: None (open access)

---

## Local Development Setup

### Start with Tilt

```bash
# Start all services including OpenSearch
task local:start
```

OpenSearch and OpenSearch Dashboards will be automatically deployed and available at:
- OpenSearch API: http://localhost:9200
- OpenSearch Dashboards: http://localhost:5601

### Verify OpenSearch is Running

```bash
# Check cluster health
curl http://localhost:9200/_cluster/health?pretty

# List all indices
curl http://localhost:9200/_cat/indices?v
```

### Access OpenSearch Dashboards

1. Open http://localhost:5601 in your browser
2. No authentication required in local development
3. Start exploring your data!

---

## Production Deployment

### Deploy to Production

```bash
# Deploy OpenSearch and OpenSearch Dashboards
task deploy:opensearch
```

This will:
1. Create a StatefulSet for OpenSearch with persistent storage (10Gi)
2. Deploy OpenSearch Dashboards
3. Configure ingress at https://app.roussev.com/opensearch
4. Set up SSL/TLS with Let's Encrypt

### Access Production Dashboard

1. Navigate to https://app.roussev.com/opensearch
2. No authentication required - direct access to dashboards

---

## Architecture

### Local Environment

```
┌─────────────────────┐
│   OpenSearch        │
│   (single-node)     │
│   Port: 9200        │
│   Security: OFF     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ OpenSearch          │
│ Dashboards          │
│ Port: 5601          │
└─────────────────────┘
```

### Production Environment

```
┌─────────────────────┐
│   OpenSearch        │
│   (StatefulSet)     │
│   Port: 9200        │
│   Security: ON      │
│   Storage: 10Gi     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ OpenSearch          │
│ Dashboards          │
│ Port: 5601          │
│ Path: /opensearch   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Nginx Ingress      │
│  + Let's Encrypt    │
│  app.roussev.com    │
└─────────────────────┘
```

---

## Configuration

### Local Configuration

**File**: `infra/k8s/local/opensearch-local.yaml`

Key settings:
- **Discovery Type**: `single-node` (no clustering)
- **Security**: Disabled for easier local development
- **Memory**: 512MB heap size
- **Storage**: EmptyDir (ephemeral)

### Production Configuration

**File**: `infra/k8s/observability/opensearch-deployment.yaml`

Key settings:
- **Discovery Type**: `single-node` (can be scaled to multi-node)
- **Security**: Disabled (no authentication required)
- **Memory**: 1GB heap size (adjustable)
- **Storage**: 10Gi persistent volume
- **Init Containers**: Set vm.max_map_count and permissions

---

## Common Use Cases

### 1. Log Aggregation

Send application logs to OpenSearch for centralized logging:

```javascript
// Example: Send logs from Node.js app
const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'http://opensearch:9200'
});

await client.index({
  index: 'app-logs',
  body: {
    timestamp: new Date(),
    level: 'info',
    message: 'Application started',
    service: 'items-service'
  }
});
```

### 2. Create Index Pattern in Dashboards

1. Open OpenSearch Dashboards
2. Go to **Management** → **Index Patterns**
3. Click **Create index pattern**
4. Enter pattern (e.g., `app-logs-*`)
5. Select timestamp field
6. Click **Create**

### 3. Build Visualizations

1. Go to **Visualize** → **Create visualization**
2. Select visualization type (bar chart, line chart, etc.)
3. Choose your index pattern
4. Configure metrics and buckets
5. Save visualization

### 4. Create Dashboard

1. Go to **Dashboard** → **Create dashboard**
2. Click **Add** to add visualizations
3. Arrange and resize panels
4. Save dashboard

---

## Monitoring & Maintenance

### Check Cluster Health

```bash
# Local
curl http://localhost:9200/_cluster/health?pretty

# Production (with port-forward)
kubectl --kubeconfig=./infra/terraform/kubeconfig.yaml port-forward svc/opensearch 9200:9200
curl http://localhost:9200/_cluster/health?pretty
```

### View Indices

```bash
# List all indices
curl http://localhost:9200/_cat/indices?v

# Get index stats
curl http://localhost:9200/_stats?pretty
```

### Delete Old Indices

```bash
# Delete specific index
curl -X DELETE http://localhost:9200/old-index-name

# Delete indices older than 30 days (use Index State Management)
```

### Monitor Resource Usage

```bash
# Check pod resources
kubectl --kubeconfig=./infra/terraform/kubeconfig.yaml top pod opensearch-0

# Check storage usage
kubectl --kubeconfig=./infra/terraform/kubeconfig.yaml get pvc
```

---

## Troubleshooting

### OpenSearch Pod Not Starting

**Issue**: Pod stuck in `CrashLoopBackOff`

**Solution**: Check vm.max_map_count setting

```bash
# The init container should set this, but verify:
kubectl --kubeconfig=./infra/terraform/kubeconfig.yaml logs opensearch-0 -c increase-vm-max-map-count
```

### Out of Memory Errors

**Issue**: OpenSearch running out of memory

**Solution**: Increase heap size in deployment

```yaml
env:
  - name: OPENSEARCH_JAVA_OPTS
    value: "-Xms2g -Xmx2g"  # Increase from 1g to 2g
```

### Dashboards Can't Connect to OpenSearch

**Issue**: OpenSearch Dashboards shows connection error

**Solution**: Check OpenSearch service is running

```bash
kubectl --kubeconfig=./infra/terraform/kubeconfig.yaml get svc opensearch
kubectl --kubeconfig=./infra/terraform/kubeconfig.yaml logs deployment/opensearch-dashboards
```

### Disk Space Issues

**Issue**: OpenSearch running out of disk space

**Solution**: Delete old indices or increase PVC size

```bash
# Increase PVC size (if storage class supports it)
kubectl --kubeconfig=./infra/terraform/kubeconfig.yaml edit pvc opensearch-data-opensearch-0
```

---

## Security Considerations

⚠️ **Note**: OpenSearch is currently configured without authentication for easier access. This is suitable for internal/private networks.

### Production Recommendations

- [ ] Ensure OpenSearch is only accessible within your private network
- [ ] Use NetworkPolicies to restrict access to OpenSearch pods
- [ ] Consider enabling authentication if exposing to untrusted networks
- [ ] Set up index lifecycle management
- [ ] Configure backup and restore
- [ ] Monitor access patterns
- [ ] Enable audit logging if needed

### Enabling Security (Optional)

If you need to enable authentication in the future:

1. Set `DISABLE_SECURITY_PLUGIN: "false"` in the OpenSearch deployment
2. Set `DISABLE_SECURITY_DASHBOARDS_PLUGIN: "false"` in the Dashboards deployment
3. Add admin credentials
4. Update health check probes to use HTTPS
5. Redeploy OpenSearch

---

## Resources

- **OpenSearch Documentation**: https://opensearch.org/docs/latest/
- **OpenSearch Dashboards Guide**: https://opensearch.org/docs/latest/dashboards/
- **Security Plugin**: https://opensearch.org/docs/latest/security/
- **Index Management**: https://opensearch.org/docs/latest/im-plugin/

---

## Viewing Application Logs

The **items-service** is already configured to send logs to OpenSearch!

### Quick Start: View Items Service Logs

1. **Restart your services** (if not already running):
   ```bash
   tilt down && tilt up
   ```

2. **Generate some logs**:
   ```bash
   curl http://localhost:8081/v1/health
   curl http://localhost:8081/v1/items
   ```

3. **Create index pattern in OpenSearch Dashboards**:
   - Open http://localhost:5601
   - Go to **Management** → **Stack Management** → **Index Patterns**
   - Click **Create index pattern**
   - Enter: `items-service-logs*`
   - Select **time** as the time field
   - Click **Create**

4. **View logs**:
   - Go to **Discover**
   - Select `items-service-logs*` index pattern
   - See your application logs with trace IDs!

📖 **Detailed Guide**: See [OPENSEARCH_LOGS_SETUP.md](./OPENSEARCH_LOGS_SETUP.md) for complete instructions on:
- Creating visualizations
- Building dashboards
- Correlating logs with Jaeger traces
- Filtering and searching logs

---

## Next Steps

1. ✅ **View Application Logs**: Items-service logs are already flowing to OpenSearch
2. **Set Up Index Patterns**: Create index patterns for your data (see guide above)
3. **Build Dashboards**: Create visualizations and dashboards for monitoring
4. **Configure Alerts**: Set up alerting for important events
5. **Implement Retention Policies**: Use Index State Management for data lifecycle
6. **Add More Services**: Configure other services to send logs to OpenSearch

