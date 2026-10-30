// PROTOTYPE SQL Lab types. The executor is mocked; see lib/sqllab/executor.ts.

export type QueryColumnAlignment = "left" | "right";
export type QueryResultStatus = "success" | "empty" | "error";
export type QueryCellValue = string | number | null;

export interface QueryColumn {
  /** Display name, e.g. PRODUCT_ID. */
  name: string;
  /** Display type, e.g. VARCHAR or DECIMAL(10,2). */
  type: string;
  alignment: QueryColumnAlignment;
}

export interface QueryError {
  message: string;
  /** 1-based line number when the prototype knows it. */
  line?: number;
}

export interface QueryResult {
  status: QueryResultStatus;
  columns: QueryColumn[];
  rows: Array<Record<string, QueryCellValue>>;
  rowCount: number;
  durationMs: number;
  engineVersion: string;
  memoryMb: number;
  /** True when the service capped the result set at its row limit. */
  truncated?: boolean;
  error?: QueryError;
}

export type SortDirection = "asc" | "desc";

export interface ResultsSort {
  column: string;
  direction: SortDirection;
}

export interface SavedQuery {
  id: string;
  projectId: string;
  workspaceId: string;
  /** File/tab name, e.g. query_revenue_by_product.sql. */
  name: string;
  /** Human title shown in the query header. */
  title: string;
  sql: string;
  updatedAt: string;
  createdAt: string;
}

export interface QueryTab {
  id: string;
  savedQueryId?: string;
  name: string;
  title: string;
  sql: string;
  savedSql: string;
  updatedAt?: string;
}

export type RunStatus =
  | "idle"
  | "running"
  | "success"
  | "empty"
  | "error"
  | "timeout"
  | "cancelled";

export interface HistoryEntry {
  id: string;
  sqlPreview: string;
  status: "success" | "error";
  rows: number;
  durationMs: number;
  executedAt: string;
}
