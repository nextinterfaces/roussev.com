// openapi.ts - OpenAPI specification for the items service

export const openapi = {
  openapi: "3.0.3",
  info: { title: "items API", version: "1.0.1", description: "Simple items service built with Bun" },
  servers: [{ url: "/v1" }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" }, commit: { type: "string" } } } } },
          },
        },
      },
    },
    "/items": {
      get: {
        summary: "List items",
        responses: {
          "200": {
            description: "Array of items",
            content: { "application/json": { schema: { type: "object", properties: { items: { type: "array", items: { $ref: "#/components/schemas/Item" } } } } } },
          },
        },
      },
      post: {
        summary: "Create item",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] } } },
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Item" } } } },
          "400": { description: "Invalid input" },
        },
      },
    },
    "/test1": {
      get: {
        summary: "Test endpoint",
        responses: {
          "200": {
            description: "Test response",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" } } } } },
          },
        },
      },
    },
  },
  components: {
    schemas: { Item: { type: "object", properties: { id: { type: "integer" }, name: { type: "string" } }, required: ["id", "name"] } },
  },
} as const;

