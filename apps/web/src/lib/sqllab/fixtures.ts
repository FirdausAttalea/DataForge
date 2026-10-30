// PROTOTYPE DATA ONLY. These fixtures are never used as a real SQL engine.
// The demo result is returned only when the editor text matches the demo query.

import type { QueryResult, SavedQuery } from "./types";

/** The seeded retail project that ships with the prototype store. */
export const DEMO_PROJECT_ID = "proj-1793247777404";

export const DEMO_SQL = `
-- Calculate top revenue generating products across all sales channels
SELECT
  product_id,
  SUM(revenue) AS total_revenue,
  COUNT(order_id) AS total_orders,
  ROUND(AVG(revenue), 2) AS avg_order_value
FROM orders
GROUP BY product_id
ORDER BY total_revenue DESC
LIMIT 10;`;

export const DEMO_QUERY_TITLE = "Quarterly Revenue by Product";

export const DEMO_ENGINE = {
  name: "DuckDB v0.10.1",
  latencyMs: 142,
  version: "DuckDB 0.10.1",
  memoryUsedGb: 3.2,
  memoryTotalGb: 16,
} as const;

export const DEMO_RESULT: QueryResult = {
  status: "success",
  columns: [
    { name: "PRODUCT_ID", type: "VARCHAR", alignment: "left" },
    { name: "TOTAL_REVENUE", type: "DECIMAL(10,2)", alignment: "right" },
    { name: "TOTAL_ORDERS", type: "INT", alignment: "right" },
    { name: "AVG_ORDER_VALUE", type: "DECIMAL(10,2)", alignment: "right" },
  ],
  rows: [
    { PRODUCT_ID: "PRD-9402", TOTAL_REVENUE: 1428590.2, TOTAL_ORDERS: 3892, AVG_ORDER_VALUE: 367.06 },
    { PRODUCT_ID: "PRD-4109", TOTAL_REVENUE: 1194320.0, TOTAL_ORDERS: 2410, AVG_ORDER_VALUE: 495.57 },
    { PRODUCT_ID: "PRD-8821", TOTAL_REVENUE: 984112.5, TOTAL_ORDERS: 1822, AVG_ORDER_VALUE: 540.13 },
    { PRODUCT_ID: "PRD-3190", TOTAL_REVENUE: 842500.0, TOTAL_ORDERS: 2910, AVG_ORDER_VALUE: 289.52 },
    { PRODUCT_ID: "PRD-5021", TOTAL_REVENUE: 791240.75, TOTAL_ORDERS: 1540, AVG_ORDER_VALUE: 513.79 },
    { PRODUCT_ID: "PRD-1024", TOTAL_REVENUE: 652190.1, TOTAL_ORDERS: 2150, AVG_ORDER_VALUE: 303.34 },
    { PRODUCT_ID: "PRD-7731", TOTAL_REVENUE: 590440.0, TOTAL_ORDERS: 1310, AVG_ORDER_VALUE: 450.72 },
    { PRODUCT_ID: "PRD-6088", TOTAL_REVENUE: 512890.0, TOTAL_ORDERS: 1120, AVG_ORDER_VALUE: 457.94 },
    { PRODUCT_ID: "PRD-2219", TOTAL_REVENUE: 488720.6, TOTAL_ORDERS: 980, AVG_ORDER_VALUE: 498.69 },
    { PRODUCT_ID: "PRD-9104", TOTAL_REVENUE: 442100.0, TOTAL_ORDERS: 890, AVG_ORDER_VALUE: 496.74 },
  ],
  rowCount: 10,
  durationMs: 118,
  engineVersion: DEMO_ENGINE.version,
  memoryMb: 4.2,
};

/** A typed saved-query fixture attached only to the seeded demo project. */
export function getDemoSavedQuery(projectId: string, workspaceId: string): SavedQuery | null {
  if (projectId !== DEMO_PROJECT_ID) return null;
  const updatedAt = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  return {
    id: `sq-demo-${projectId}`,
    projectId,
    workspaceId,
    name: "query_revenue_by_product.sql",
    title: DEMO_QUERY_TITLE,
    sql: DEMO_SQL,
    updatedAt,
    createdAt: updatedAt,
  };
}
