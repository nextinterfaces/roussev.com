/**
 * HTTP utilities
 * Helper functions for creating HTTP responses
 */

/**
 * Create a JSON response
 */
export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

/**
 * Create a 404 Not Found response
 */
export function notFound(): Response {
  return json({ error: "not found" }, { status: 404 });
}

/**
 * Create a 400 Bad Request response
 */
export function badRequest(message: string): Response {
  return json({ error: message }, { status: 400 });
}

/**
 * Create a 500 Internal Server Error response
 */
export function internalServerError(message: string): Response {
  return json({ error: message }, { status: 500 });
}

/**
 * Create a 503 Service Unavailable response
 */
export function serviceUnavailable(data: unknown): Response {
  return json(data, { status: 503 });
}

/**
 * Create an HTML response
 */
export function html(content: string): Response {
  return new Response(content, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

