/**
 * Domain models and types
 */

export interface Item {
  id: number;
  name: string;
}

export interface CreateItemDto {
  name: string;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  commit: string;
  database: "connected" | "disconnected";
  error?: string;
}

export interface ItemsListResponse {
  items: Item[];
}

