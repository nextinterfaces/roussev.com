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

export function getRootPageHtml(apiPrefix: string): string {
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
        <!-- Profile Header -->
        <div class="profile-header">
            <div class="profile-path">items-service/README.md</div>
        </div>

        <!-- Profile Content -->
        <article class="profile-content">
            <h1>Items Service</h1>

            <p>A simple REST API service for managing items, built with Bun and PostgreSQL.</p>

            <p><a href="/docs" target="_blank">Swagger Docs</a></p>

            <p><strong>API Endpoints:</strong></p>
            <p><a href="${apiPrefix}/health" target="_blank">${apiPrefix}/health</a> - Service and database health check</p>
            <p><a href="${apiPrefix}/items" target="_blank">${apiPrefix}/items</a> - List all items</p>
        </article>
    </div>
</body>
</html>`;
}

