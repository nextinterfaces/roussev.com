// html.ts - HTML templates for the items service

const API_PREFIX = "/v1";

export function getSwaggerHtml(appPrefix: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>items API – Swagger UI</title>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({ url: '${appPrefix}${API_PREFIX}/openapi.json', dom_id: '#swagger-ui' });
      };
    </script>
  </body>
</html>`;
}

export function getRootPageHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <title>Items Service</title>
    <link rel="stylesheet" href="https://roussev.com/styles.css">
</head>
<body>
    <div class="profile-container">
        <div class="profile-header">
            <div class="profile-path">items-service/README.md</div>
        </div>

        <article class="profile-content">
            <h1>Items Service</h1>

            <p>A simple REST API service for managing items, built with Bun, Postgre, Jaeger and OpenTelemetry.</p>

            <p><strong>Observability:</strong></p>
            <p><a href="https://app.roussev.com/grafana/d/items-service-metrics/items-service-metrics" target="_blank">Grafana</a> - Metrics dashboard</p>
            <p><a href="/jaeger" target="_blank">Jaeger</a> - Distributed tracing</p>
            <p><a href="/items/metrics" target="_blank">Metrics Endpoint</a> - Raw Prometheus metrics</p>
            <p><a href="/items/prometheus-queries" target="_blank">Prometheus Queries</a> - Preconfigured metric queries</p>
            <p><a href="/prometheus" target="_blank">Prometheus</a> - Metrics collection</p>

            <p><strong>Documentation:</strong></p>
            <p><a href="/items/docs" target="_blank">Open API / Swagger Docs</a></p>

            <p><strong>API Endpoints:</strong></p>
            <p><a href="/items/v1/health" target="_blank">/v1/health</a> - Service and database health check</p>
            <p><a href="/items/v1/items" target="_blank">/v1/items</a> - List all items</p>
        </article>
    </div>
</body>
</html>`;
}

export function getPrometheusQueriesHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Items Service - Prometheus Metrics</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric-card h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 16px;
        }
        .metric-card p {
            margin: 0 0 15px 0;
            color: #666;
            font-size: 14px;
        }
        .query-box {
            background: #f8f9fa;
            border: 1px solid #e1e4e8;
            border-radius: 4px;
            padding: 10px;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 13px;
            margin-bottom: 10px;
            word-break: break-all;
        }
        .btn {
            display: inline-block;
            padding: 8px 16px;
            background: #e85d04;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
            transition: background 0.2s;
        }
        .btn:hover {
            background: #dc2f02;
        }
        .section {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            margin-top: 0;
            color: #333;
            border-bottom: 2px solid #e85d04;
            padding-bottom: 10px;
        }
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Items Service - Prometheus Metrics Dashboard</h1>
        <p class="subtitle">Quick links to preconfigured Prometheus queries</p>

        <div class="section">
            <h2>🚀 Quick Start</h2>
            <p>Click any "Open in Prometheus" button below to view the metric in the Prometheus UI.</p>
            <p><strong>Prometheus URL:</strong> <a href="/prometheus" target="_blank">/prometheus</a></p>
        </div>

        <h2 style="margin-top: 30px; color: #333;">📊 Basic Metrics</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Service Health</h3>
                <p>Check if items-service is up and being scraped</p>
                <div class="query-box">up{job="items-service"}</div>
                <a href="/prometheus/graph?g0.expr=up%7Bjob%3D%22items-service%22%7D&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>

            <div class="metric-card">
                <h3>Total HTTP Requests</h3>
                <p>All HTTP requests received by the service</p>
                <div class="query-box">http_server_requests_total</div>
                <a href="/prometheus/graph?g0.expr=http_server_requests_total&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>

            <div class="metric-card">
                <h3>Requests by Endpoint</h3>
                <p>HTTP requests grouped by route</p>
                <div class="query-box">http_server_requests_total{route="/v1/items"}</div>
                <a href="/prometheus/graph?g0.expr=http_server_requests_total%7Broute%3D%22%2Fv1%2Fitems%22%7D&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>
        </div>

        <h2 style="margin-top: 30px; color: #333;">📈 Request Rate (RPS)</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Overall Request Rate</h3>
                <p>Requests per second over the last 5 minutes</p>
                <div class="query-box">rate(http_server_requests_total[5m])</div>
                <a href="/prometheus/graph?g0.expr=rate(http_server_requests_total%5B5m%5D)&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>

            <div class="metric-card">
                <h3>Request Rate by Endpoint</h3>
                <p>RPS grouped by route and method</p>
                <div class="query-box">sum by(route, method) (rate(http_server_requests_total[5m]))</div>
                <a href="/prometheus/graph?g0.expr=sum%20by(route%2C%20method)%20(rate(http_server_requests_total%5B5m%5D))&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>

            <div class="metric-card">
                <h3>Request Rate by Status Code</h3>
                <p>RPS grouped by HTTP status code</p>
                <div class="query-box">sum by(status_code) (rate(http_server_requests_total[5m]))</div>
                <a href="/prometheus/graph?g0.expr=sum%20by(status_code)%20(rate(http_server_requests_total%5B5m%5D))&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>
        </div>

        <h2 style="margin-top: 30px; color: #333;">⏱️ Latency Metrics</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Average Response Time</h3>
                <p>Mean request duration in milliseconds</p>
                <div class="query-box">rate(http_server_duration_sum[5m]) / rate(http_server_duration_count[5m])</div>
                <a href="/prometheus/graph?g0.expr=rate(http_server_duration_sum%5B5m%5D)%20%2F%20rate(http_server_duration_count%5B5m%5D)&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>

            <div class="metric-card">
                <h3>P95 Latency</h3>
                <p>95th percentile response time</p>
                <div class="query-box">histogram_quantile(0.95, rate(http_server_duration_bucket[5m]))</div>
                <a href="/prometheus/graph?g0.expr=histogram_quantile(0.95%2C%20rate(http_server_duration_bucket%5B5m%5D))&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>

            <div class="metric-card">
                <h3>P99 Latency</h3>
                <p>99th percentile response time</p>
                <div class="query-box">histogram_quantile(0.99, rate(http_server_duration_bucket[5m]))</div>
                <a href="/prometheus/graph?g0.expr=histogram_quantile(0.99%2C%20rate(http_server_duration_bucket%5B5m%5D))&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>

            <div class="metric-card">
                <h3>P50 Latency (Median)</h3>
                <p>50th percentile response time</p>
                <div class="query-box">histogram_quantile(0.50, rate(http_server_duration_bucket[5m]))</div>
                <a href="/prometheus/graph?g0.expr=histogram_quantile(0.50%2C%20rate(http_server_duration_bucket%5B5m%5D))&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>
        </div>

        <h2 style="margin-top: 30px; color: #333;">🚨 Error Monitoring</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Error Rate (5xx)</h3>
                <p>Rate of server errors</p>
                <div class="query-box">rate(http_server_requests_total{status_code=~"5.."}[5m])</div>
                <a href="/prometheus/graph?g0.expr=rate(http_server_requests_total%7Bstatus_code%3D~%225..%22%7D%5B5m%5D)&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>

            <div class="metric-card">
                <h3>Client Error Rate (4xx)</h3>
                <p>Rate of client errors</p>
                <div class="query-box">rate(http_server_requests_total{status_code=~"4.."}[5m])</div>
                <a href="/prometheus/graph?g0.expr=rate(http_server_requests_total%7Bstatus_code%3D~%224..%22%7D%5B5m%5D)&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>

            <div class="metric-card">
                <h3>Error Percentage</h3>
                <p>Percentage of requests that failed</p>
                <div class="query-box">sum(rate(http_server_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_server_requests_total[5m])) * 100</div>
                <a href="/prometheus/graph?g0.expr=sum(rate(http_server_requests_total%7Bstatus_code%3D~%225..%22%7D%5B5m%5D))%20%2F%20sum(rate(http_server_requests_total%5B5m%5D))%20*%20100&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open in Prometheus</a>
            </div>
        </div>

        <div class="section" style="margin-top: 30px;">
            <h2>🧪 Generate Test Traffic</h2>
            <p>Before viewing metrics, generate some traffic to your service:</p>
            <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto;"><code>for i in {1..50}; do
  curl -s /items/v1/health > /dev/null
  curl -s /items/v1/items > /dev/null
  sleep 0.5
done</code></pre>
        </div>

        <div class="section">
            <h2>📚 Useful Tips</h2>
            <ul>
                <li>Use the <strong>Graph</strong> tab to see time series data</li>
                <li>Use the <strong>Table</strong> tab to see current values</li>
                <li>Adjust the time range using the time picker</li>
                <li>Click on legend items to toggle series visibility</li>
                <li>Use <code>Ctrl+Space</code> in the query box for autocomplete</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
}

