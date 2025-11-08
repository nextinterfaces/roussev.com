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
    <style>
        .architecture-diagram {
            margin: 2rem 0;
            padding: 1.5rem;
            background: var(--bg-secondary, #f5f5f5);
            border-radius: 8px;
            overflow-x: auto;
        }
        .architecture-diagram h2 {
            margin-top: 0;
            margin-bottom: 1rem;
            color: var(--text-primary, #333);
        }
        @media (prefers-color-scheme: dark) {
            .architecture-diagram {
                background: var(--bg-secondary, #1a1a1a);
            }
        }
    </style>
</head>
<body>
    <div class="profile-container">
        <div class="profile-header">
            <div class="profile-path">items-service/README.md</div>
        </div>

        <article class="profile-content">
            <h1>Items Service</h1>

            <p>A simple REST service built with Bun, Postgre and OpenTelemetry.</p>

            <p><strong>Observability:</strong></p>
            <p><a href="/grafana/d/items-service-metrics/items-service-metrics" target="_blank">Grafana</a> - Metrics dashboard</p>
            <p><a href="/items/prometheus-queries" target="_blank">Prometheus queries</a></p>
            <p><a href="/items/metrics" target="_blank">Prometheus raw metrics</a></p>
            <p><a href="/jaeger" target="_blank">Jaeger</a> - Distributed tracing</p>

            <p><strong>Docs:</strong></p>
            <p><a href="/items/docs" target="_blank">Open API / Swagger Docs</a></p>

            <p><strong>API Endpoints:</strong></p>
            <p><a href="/items/v1/health" target="_blank">/v1/health</a> - Service and database health check</p>
            <p><a href="/items/v1/items" target="_blank">/v1/items</a> - List all items</p>

            <div class="architecture-diagram">
                <h2>Architecture</h2>
                <pre class="mermaid">
graph TB
    %% Client
    subgraph ClientLayer["Client Layer"]
        Client[HTTP Client]
    end

    %% Application
    subgraph AppLayer["Application Layer"]
        App[items-service]
        ItemsEndpoint[/items endpoint/]
        MetricsEndpoint[/metrics endpoint/]
        OTel[OpenTelemetry SDK]
        Logs[Application Logs]
    end

    %% Data Layer
    subgraph DataLayer["Data Layer"]
        DB[(PostgreSQL Database)]
    end

    %% Observability
    subgraph ObsLayer["Observability Stack"]
        Prometheus[Prometheus Metrics]
        Jaeger[Jaeger Tracing]
        Grafana[Grafana Dashboards]
        LogStore[Loki / OpenSearch / Elastic]
    end

    %% Request Flow
    Client -->|HTTP requests| App
    App --> ItemsEndpoint
    ItemsEndpoint -->|SQL queries| DB

    %% Metrics Flow
    App --> MetricsEndpoint
    Prometheus -.->|scrapes metrics| MetricsEndpoint
    Grafana -.->|reads metrics| Prometheus

    %% Tracing Flow
    App -->|trace spans| OTel
    OTel -->|OTLP| Jaeger
    Grafana -.->|trace links| Jaeger

    %% Logs Flow
    App -->|stdout logs| Logs
    Logs -.->|log agent| LogStore
    Grafana -.->|logs query| LogStore

    %% Styling
    style App fill:#e85d04,stroke:#dc2f02,stroke-width:3px,color:#fff
    style ItemsEndpoint fill:#ffba08,stroke:#faa307,stroke-width:2px,color:#000
    style MetricsEndpoint fill:#ffba08,stroke:#faa307,stroke-width:2px,color:#000
    style OTel fill:#f5a800,stroke:#d89000,stroke-width:2px,color:#000
    style Logs fill:#6c757d,stroke:#495057,stroke-width:2px,color:#fff
    style DB fill:#336791,stroke:#2d5a7b,stroke-width:2px,color:#fff
    style Prometheus fill:#e6522c,stroke:#c93a1f,stroke-width:2px,color:#fff
    style Jaeger fill:#60d0e4,stroke:#4db8ca,stroke-width:2px,color:#000
    style Grafana fill:#f46800,stroke:#d85600,stroke-width:2px,color:#fff
    style LogStore fill:#7cb342,stroke:#558b2f,stroke-width:2px,color:#fff

                </pre>
            </div>
        </article>
    </div>

    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({
            startOnLoad: true,
            theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'
        });
    </script>
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
        <h1>Prometheus Metrics Dashboard</h1>

        <h2 style="margin-top: 30px; color: #333;">Basic Metrics</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Service Health</h3>
                <p>Check if items-service is up and being scraped</p>
                <div class="query-box">up{job="items-service"}</div>
                <a href="/prometheus/graph?g0.expr=up%7Bjob%3D%22items-service%22%7D&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>

            <div class="metric-card">
                <h3>Total HTTP Requests</h3>
                <p>Total number of HTTP requests since startup</p>
                <div class="query-box">http_server_requests_total</div>
                <a href="/prometheus/graph?g0.expr=http_server_requests_total&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>

            <div class="metric-card">
                <h3>Requests by Endpoint</h3>
                <p>HTTP requests grouped by route</p>
                <div class="query-box">http_server_requests_total{route="/v1/items"}</div>
                <a href="/prometheus/graph?g0.expr=http_server_requests_total%7Broute%3D%22%2Fv1%2Fitems%22%7D&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>
        </div>

        <h2 style="margin-top: 30px; color: #333;">Request Rate (RPS)</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Overall Request Rate</h3>
                <p>Requests per second over the last 5 minutes</p>
                <div class="query-box">rate(http_server_requests_total[5m])</div>
                <a href="/prometheus/graph?g0.expr=rate(http_server_requests_total%5B5m%5D)&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>

            <div class="metric-card">
                <h3>Request Rate by Endpoint</h3>
                <p>RPS grouped by route and method</p>
                <div class="query-box">sum by(route, method) (rate(http_server_requests_total[5m]))</div>
                <a href="/prometheus/graph?g0.expr=sum%20by(route%2C%20method)%20(rate(http_server_requests_total%5B5m%5D))&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>

            <div class="metric-card">
                <h3>Request Rate by Status Code</h3>
                <p>RPS grouped by HTTP status code</p>
                <div class="query-box">sum by(status_code) (rate(http_server_requests_total[5m]))</div>
                <a href="/prometheus/graph?g0.expr=sum%20by(status_code)%20(rate(http_server_requests_total%5B5m%5D))&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>
        </div>

        <h2 style="margin-top: 30px; color: #333;">Latency Metrics</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Average Response Time</h3>
                <p>Mean request duration in milliseconds</p>
                <div class="query-box">rate(http_server_duration_sum[5m]) / rate(http_server_duration_count[5m])</div>
                <a href="/prometheus/graph?g0.expr=rate(http_server_duration_sum%5B5m%5D)%20%2F%20rate(http_server_duration_count%5B5m%5D)&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>

            <div class="metric-card">
                <h3>P95 Latency</h3>
                <p>95th percentile response time</p>
                <div class="query-box">histogram_quantile(0.95, rate(http_server_duration_bucket[5m]))</div>
                <a href="/prometheus/graph?g0.expr=histogram_quantile(0.95%2C%20rate(http_server_duration_bucket%5B5m%5D))&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>

            <div class="metric-card">
                <h3>P99 Latency</h3>
                <p>99th percentile response time</p>
                <div class="query-box">histogram_quantile(0.99, rate(http_server_duration_bucket[5m]))</div>
                <a href="/prometheus/graph?g0.expr=histogram_quantile(0.99%2C%20rate(http_server_duration_bucket%5B5m%5D))&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>

            <div class="metric-card">
                <h3>P50 Latency (Median)</h3>
                <p>50th percentile response time</p>
                <div class="query-box">histogram_quantile(0.50, rate(http_server_duration_bucket[5m]))</div>
                <a href="/prometheus/graph?g0.expr=histogram_quantile(0.50%2C%20rate(http_server_duration_bucket%5B5m%5D))&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>
        </div>

        <h2 style="margin-top: 30px; color: #333;">Error Monitoring</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Error Rate (5xx)</h3>
                <p>Rate of server errors</p>
                <div class="query-box">rate(http_server_requests_total{status_code=~"5.."}[5m])</div>
                <a href="/prometheus/graph?g0.expr=rate(http_server_requests_total%7Bstatus_code%3D~%225..%22%7D%5B5m%5D)&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>

            <div class="metric-card">
                <h3>Client Error Rate (4xx)</h3>
                <p>Rate of client errors</p>
                <div class="query-box">rate(http_server_requests_total{status_code=~"4.."}[5m])</div>
                <a href="/prometheus/graph?g0.expr=rate(http_server_requests_total%7Bstatus_code%3D~%224..%22%7D%5B5m%5D)&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>

            <div class="metric-card">
                <h3>Error Percentage</h3>
                <p>Percentage of requests that failed</p>
                <div class="query-box">sum(rate(http_server_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_server_requests_total[5m])) * 100</div>
                <a href="/prometheus/graph?g0.expr=sum(rate(http_server_requests_total%7Bstatus_code%3D~%225..%22%7D%5B5m%5D))%20%2F%20sum(rate(http_server_requests_total%5B5m%5D))%20*%20100&g0.tab=0&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h"
                   class="btn" target="_blank">Open</a>
            </div>
        </div>

        <div class="section" style="margin-top: 30px;">
            <h2>Generate Test Traffic</h2>
            <p>Before viewing metrics, generate some traffic:</p>
            <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto;"><code>for i in {1..50}; do
  curl -s https://app.roussev.com/items/v1/health > /dev/null
  curl -s https://app.roussev.com/items/v1/items > /dev/null
  sleep 0.5
done</code></pre>
        </div>

    </div>
</body>
</html>`;
}

