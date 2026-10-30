import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined;
};

export const pool =
  globalForPg.pgPool ??
  new Pool({
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "55432", 10),
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "admin123",
    database: process.env.POSTGRES_DB || "dataforge",
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

