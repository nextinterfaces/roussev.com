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
        .link-icon {
            width: 20px;
            height: 20px;
            vertical-align: middle;
            margin-right: 8px;
            display: inline-block;
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
            <p>
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/grafana/grafana-original.svg" class="link-icon" alt="Grafana">
                <a href="/grafana/d/items-service-metrics/items-service-metrics" target="_blank">Grafana</a> - Metrics dashboard
            </p>
            <p>
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prometheus/prometheus-original.svg" class="link-icon" alt="Prometheus">
                <a href="/items/prometheus-queries" target="_blank">Prometheus queries</a>
            </p>
            <p>
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prometheus/prometheus-original.svg" class="link-icon" alt="Prometheus">
                <a href="/items/metrics" target="_blank">Prometheus raw metrics</a>
            </p>
            <p>
                <svg class="link-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#60D0E4"/>
                    <path d="M2 17L12 22L22 17" stroke="#60D0E4" stroke-width="2"/>
                    <path d="M2 12L12 17L22 12" stroke="#60D0E4" stroke-width="2"/>
                </svg>
                <a href="/jaeger" target="_blank">Jaeger</a> - Distributed tracing
            </p>
            <p>
                <svg class="link-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#60D0E4"/>
                    <path d="M2 17L12 22L22 17" stroke="#60D0E4" stroke-width="2"/>
                    <path d="M2 12L12 17L22 12" stroke="#60D0E4" stroke-width="2"/>
                </svg>
                <a href="/items/tracing" target="_blank">Tracing Showcase</a> - Learn about trace IDs and spans
            </p>
            <p>
                <svg class="link-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="20" height="3" fill="#F5A800"/>
                    <rect x="2" y="10" width="20" height="3" fill="#F5A800"/>
                    <rect x="2" y="16" width="20" height="3" fill="#F5A800"/>
                </svg>
                <a href="/grafana/explore?orgId=1&left=%7B%22datasource%22:%22loki%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22expr%22:%22%7Bapp%3D%5C%22items-service%5C%22%7D%22%7D%5D,%22range%22:%7B%22from%22:%22now-1h%22,%22to%22:%22now%22%7D%7D" target="_blank">Loki</a> - Log aggregation
            </p>

            <p><strong>Docs:</strong></p>
            <p>
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swagger/swagger-original.svg" class="link-icon" alt="Swagger">
                <a href="/items/docs" target="_blank">Open API / Swagger Docs</a>
            </p>

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

    %% Observability
    subgraph ObsLayer["Observability Stack"]
        Prometheus[Prometheus Metrics]
        Jaeger[Jaeger Tracing]
        Grafana[Grafana Dashboards]

        subgraph LogPipeline["Logs Pipeline"]
            Promtail[Promtail / FluentBit Log Agent]
            LogStore[Loki / OpenSearch / Elastic]
        end
    end

    %% Data Layer (bottom)
    subgraph DataLayer["Data Layer"]
        DB[(PostgreSQL Database)]
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
    Promtail -.->|reads logs| Logs
    Promtail -->|pushes logs| LogStore
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

    style Promtail fill:#1f78b4,stroke:#145684,stroke-width:2px,color:#fff
    style LogStore fill:#7cb342,stroke:#558b2f,stroke-width:2px,color:#fff
    style LogPipeline fill:#ffffff,stroke:#999,stroke-width:1px,color:#000

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

export function getTracingShowcaseHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Items Service - Distributed Tracing Showcase</title>
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
            border-bottom: 2px solid #60d0e4;
            padding-bottom: 10px;
        }
        .section h3 {
            color: #333;
            margin-top: 20px;
        }
        .code-box {
            background: #f8f9fa;
            border: 1px solid #e1e4e8;
            border-radius: 4px;
            padding: 15px;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 13px;
            margin: 10px 0;
            overflow-x: auto;
        }
        .highlight {
            background: #fff3cd;
            padding: 2px 4px;
            border-radius: 3px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #60d0e4;
            color: #000;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
            transition: background 0.2s;
            margin: 5px;
            border: none;
            cursor: pointer;
        }
        .btn:hover {
            background: #4db8ca;
        }
        .btn-secondary {
            background: #e85d04;
            color: white;
        }
        .btn-secondary:hover {
            background: #dc2f02;
        }
        .demo-area {
            background: #e8f4f8;
            border: 2px solid #60d0e4;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .log-output {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 12px;
            max-height: 400px;
            overflow-y: auto;
            margin: 10px 0;
        }
        .trace-id {
            color: #4ec9b0;
            font-weight: bold;
        }
        .span-id {
            color: #ce9178;
            font-weight: bold;
        }
        .info-box {
            background: #d1ecf1;
            border-left: 4px solid #0c5460;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .warning-box {
            background: #fff3cd;
            border-left: 4px solid #856404;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .card {
            background: white;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            padding: 20px;
        }
        .card h4 {
            margin-top: 0;
            color: #333;
        }
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 13px;
        }
        .step {
            margin: 20px 0;
            padding-left: 30px;
            position: relative;
        }
        .step::before {
            content: attr(data-step);
            position: absolute;
            left: 0;
            top: 0;
            background: #60d0e4;
            color: #000;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Distributed Tracing Showcase</h1>
        <p class="subtitle">Learn how to use trace IDs and spans to debug and monitor your distributed systems</p>

        <div class="section">
            <h2>What is Distributed Tracing?</h2>
            <p>Distributed tracing helps you understand the flow of requests through your system. Each request gets a unique <strong>trace ID</strong>, and each operation within that request creates a <strong>span</strong>.</p>

            <div class="grid">
                <div class="card">
                    <h4>🆔 Trace ID</h4>
                    <p>A unique identifier for the entire request journey across all services.</p>
                    <div class="code-box">
                        <span class="trace-id">7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c</span>
                    </div>
                </div>
                <div class="card">
                    <h4>📊 Span ID</h4>
                    <p>A unique identifier for a specific operation within a trace.</p>
                    <div class="code-box">
                        <span class="span-id">1a2b3c4d5e6f7a8b</span>
                    </div>
                </div>
                <div class="card">
                    <h4>🔗 Parent Span</h4>
                    <p>Links spans together to show the hierarchy of operations.</p>
                    <div class="code-box">
                        <span class="span-id">0f1e2d3c4b5a6978</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Interactive Demo</h2>
            <div class="demo-area">
                <h3>Generate a Traced Request</h3>
                <p>Click the button below to make a request to the items API. Then check the logs and Jaeger to see the trace!</p>

                <button class="btn" onclick="makeTracedRequest()">🚀 Make Request to /v1/items</button>
                <button class="btn btn-secondary" onclick="makeHealthCheck()">❤️ Health Check</button>
                <button class="btn" onclick="createItem()">➕ Create Item</button>

                <div id="response-output"></div>
            </div>
        </div>

        <div class="section">
            <h2>How to View Traces</h2>

            <div class="step" data-step="1">
                <h3>Make a Request</h3>
                <p>First, make a request to any endpoint:</p>
                <div class="code-box">curl https://app.roussev.com/items/v1/items</div>
            </div>

            <div class="step" data-step="2">
                <h3>Check the Logs</h3>
                <p>View the application logs to see the trace ID and span ID:</p>
                <div class="code-box">kubectl logs -n default deployment/items-service --tail=50</div>
                <p>Look for fields like:</p>
                <div class="log-output">
{
  "level": "info",
  "time": "2024-01-15T10:30:45.123Z",
  "msg": "Incoming request",
  <span class="trace-id">"trace_id": "7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c"</span>,
  <span class="span-id">"span_id": "1a2b3c4d5e6f7a8b"</span>,
  "http": {
    "method": "GET",
    "url": "/v1/items"
  }
}
                </div>
            </div>

            <div class="step" data-step="3">
                <h3>Open Jaeger UI</h3>
                <p>Navigate to Jaeger to visualize the trace:</p>
                <a href="/jaeger" target="_blank" class="btn">Open Jaeger UI</a>
                <div class="info-box">
                    <strong>💡 Tip:</strong> In Jaeger, select "items-service" from the Service dropdown and click "Find Traces" to see recent traces.
                </div>
            </div>

            <div class="step" data-step="4">
                <h3>Search by Trace ID</h3>
                <p>Copy the trace ID from the logs and paste it into Jaeger's search box to see the complete trace with all spans:</p>
                <div class="code-box">
                    Jaeger UI → Search → Trace ID: <span class="trace-id">7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Understanding Spans in Items Service</h2>
            <p>Our service creates multiple spans for each request to track different operations:</p>

            <div class="grid">
                <div class="card">
                    <h4>🌐 HTTP Request Span</h4>
                    <p>The root span for the entire HTTP request</p>
                    <div class="code-box">GET /v1/items</div>
                    <p><small>Created in: <code>router.ts</code></small></p>
                </div>
                <div class="card">
                    <h4>📋 List Items Span</h4>
                    <p>Tracks the business logic for listing items</p>
                    <div class="code-box">listItems</div>
                    <p><small>Created in: <code>controllers.ts</code></small></p>
                </div>
                <div class="card">
                    <h4>🗄️ Database Query Span</h4>
                    <p>Automatically tracked by PostgreSQL instrumentation</p>
                    <div class="code-box">SELECT * FROM items</div>
                    <p><small>Auto-instrumented</small></p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Correlating Logs with Traces</h2>
            <p>Every log entry includes the trace ID and span ID, making it easy to correlate logs with traces:</p>

            <div class="warning-box">
                <strong>🔍 Use Case:</strong> When debugging an issue, copy the trace ID from an error log and search for it in Jaeger to see the complete request flow and identify where the problem occurred.
            </div>

            <h3>Example: Finding Slow Requests</h3>
            <div class="step" data-step="1">
                <p>Search Loki for slow requests:</p>
                <div class="code-box">{app="items-service"} | json | duration_ms > 1000</div>
            </div>
            <div class="step" data-step="2">
                <p>Copy the <code>trace_id</code> from the log entry</p>
            </div>
            <div class="step" data-step="3">
                <p>Search Jaeger with that trace ID to see which span took the most time</p>
            </div>
        </div>

        <div class="section">
            <h2>Useful Links</h2>
            <div class="grid">
                <div class="card">
                    <h4>🔍 Jaeger</h4>
                    <p>Distributed tracing UI</p>
                    <a href="/jaeger" target="_blank" class="btn">Open Jaeger</a>
                </div>
                <div class="card">
                    <h4>📊 Grafana</h4>
                    <p>Metrics and dashboards</p>
                    <a href="/grafana" target="_blank" class="btn">Open Grafana</a>
                </div>
                <div class="card">
                    <h4>📝 Loki</h4>
                    <p>Log aggregation and search</p>
                    <a href="/grafana/explore?orgId=1&left=%7B%22datasource%22:%22loki%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22expr%22:%22%7Bapp%3D%5C%22items-service%5C%22%7D%22%7D%5D,%22range%22:%7B%22from%22:%22now-1h%22,%22to%22:%22now%22%7D%7D" target="_blank" class="btn">Open Loki</a>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Code Examples</h2>
            <h3>Creating a Custom Span</h3>
            <p>Here's how we create spans in the items service:</p>
            <div class="code-box">import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("items-service");

async function myOperation() {
  return await tracer.startActiveSpan("myOperation", async (span) => {
    try {
      // Add custom attributes
      span.setAttribute("custom.attribute", "value");

      // Your business logic here
      const result = await doSomething();

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  });
}</div>

            <h3>Logging with Trace Context</h3>
            <p>Automatically include trace IDs in your logs:</p>
            <div class="code-box">import { createLoggerWithTrace } from "./logger.js";

const log = createLoggerWithTrace({ userId: 123 });
log.info("User action completed");

// Output includes trace_id and span_id automatically:
// {
//   "trace_id": "7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c",
//   "span_id": "1a2b3c4d5e6f7a8b",
//   "userId": 123,
//   "msg": "User action completed"
// }</div>
        </div>
    </div>

    <script>
        async function makeTracedRequest() {
            const output = document.getElementById('response-output');
            output.innerHTML = '<p>Making request...</p>';

            try {
                const response = await fetch('/items/v1/items');
                const data = await response.json();

                output.innerHTML = \`
                    <h4>✅ Request Successful!</h4>
                    <div class="info-box">
                        <p><strong>Status:</strong> \${response.status}</p>
                        <p><strong>Items Count:</strong> \${data.items?.length || 0}</p>
                        <p><strong>Next Steps:</strong></p>
                        <ol>
                            <li>Check the browser console for trace information</li>
                            <li>View logs: <code>kubectl logs -n default deployment/items-service --tail=20</code></li>
                            <li>Open <a href="/jaeger" target="_blank">Jaeger UI</a> and search for recent traces</li>
                        </ol>
                    </div>
                    <div class="code-box">\${JSON.stringify(data, null, 2)}</div>
                \`;

                console.log('Response:', data);
                console.log('Check Jaeger for trace: /jaeger');
            } catch (error) {
                output.innerHTML = \`
                    <div class="warning-box">
                        <h4>❌ Request Failed</h4>
                        <p>\${error.message}</p>
                    </div>
                \`;
            }
        }

        async function makeHealthCheck() {
            const output = document.getElementById('response-output');
            output.innerHTML = '<p>Checking health...</p>';

            try {
                const response = await fetch('/items/v1/health');
                const data = await response.json();

                output.innerHTML = \`
                    <h4>✅ Health Check Complete!</h4>
                    <div class="info-box">
                        <p><strong>Status:</strong> \${data.status}</p>
                        <p><strong>Database:</strong> \${data.database}</p>
                        <p><strong>Commit:</strong> \${data.commit}</p>
                    </div>
                    <div class="code-box">\${JSON.stringify(data, null, 2)}</div>
                \`;
            } catch (error) {
                output.innerHTML = \`
                    <div class="warning-box">
                        <h4>❌ Health Check Failed</h4>
                        <p>\${error.message}</p>
                    </div>
                \`;
            }
        }

        async function createItem() {
            const output = document.getElementById('response-output');
            output.innerHTML = '<p>Creating item...</p>';

            const itemName = \`Test Item \${new Date().toISOString()}\`;

            try {
                const response = await fetch('/items/v1/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: itemName })
                });
                const data = await response.json();

                output.innerHTML = \`
                    <h4>✅ Item Created!</h4>
                    <div class="info-box">
                        <p><strong>ID:</strong> \${data.id}</p>
                        <p><strong>Name:</strong> \${data.name}</p>
                        <p>This request created multiple spans:</p>
                        <ul>
                            <li>HTTP POST span</li>
                            <li>createItem business logic span</li>
                            <li>Database INSERT span</li>
                        </ul>
                        <p>View them all in <a href="/jaeger" target="_blank">Jaeger</a>!</p>
                    </div>
                    <div class="code-box">\${JSON.stringify(data, null, 2)}</div>
                \`;
            } catch (error) {
                output.innerHTML = \`
                    <div class="warning-box">
                        <h4>❌ Failed to Create Item</h4>
                        <p>\${error.message}</p>
                    </div>
                \`;
            }
        }
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

