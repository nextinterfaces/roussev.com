/**
 * Configuration module
 * Centralizes all environment variable access and configuration management
 */

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  max: number;
  idleTimeout: number;
  connectTimeout: number;
}

export interface ServerConfig {
  port: number;
  apiPrefix: string;
  appPrefix: string;
  commitSha: string;
}

export interface LoggingConfig {
  level: string;
  pretty: boolean;
}

export interface Config {
  server: ServerConfig;
  database: DatabaseConfig;
  logging: LoggingConfig;
}

export function loadConfig(): Config {
  const nodeEnv = process.env.NODE_ENV || "development";

  return {
    server: {
      port: Number(process.env.PORT || 8080),
      apiPrefix: "/v1",
      appPrefix: "/items",
      commitSha: process.env.COMMIT_SHA || "unknown",
    },
    database: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "postgres",
      max: 10,
      idleTimeout: 20,
      connectTimeout: 10,
    },
    logging: {
      level: process.env.LOG_LEVEL || "info",
      pretty: nodeEnv === "development" || process.env.LOG_PRETTY === "true",
    },
  };
}

