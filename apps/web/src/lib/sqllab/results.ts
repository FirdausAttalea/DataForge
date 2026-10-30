import type {
  QueryCellValue,
  QueryColumn,
  ResultsSort,
  SortDirection,
} from "./types";

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNumber(value: QueryCellValue): string {
  if (value === null || value === "") return "—";
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return numberFormatter.format(numeric);
}

export function formatCurrency(value: QueryCellValue): string {
  if (value === null || value === "") return "—";
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return currencyFormatter.format(numeric);
}

export function formatDuration(ms: number): string {
  return `${Math.max(0, Math.round(ms))}ms`;
}

export function formatMemory(mb: number): string {
  return `${Number.isInteger(mb) ? mb.toFixed(1) : mb.toFixed(1)} MB`;
}

export function formatRelativeTime(iso: string, nowMs = Date.now()): string {
  const diff = Math.max(0, nowMs - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1m ago";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function compareValues(a: QueryCellValue, b: QueryCellValue): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  const aNumber = typeof a === "number" ? a : Number(a);
  const bNumber = typeof b === "number" ? b : Number(b);
  if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) return aNumber - bNumber;
  return String(a).localeCompare(String(b), "en", { numeric: true, sensitivity: "base" });
}

export function sortRows(
  rows: Array<Record<string, QueryCellValue>>,
  column: string,
  direction: SortDirection
): Array<Record<string, QueryCellValue>> {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const aValue = a[column] ?? null;
    const bValue = b[column] ?? null;
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    return compareValues(aValue, bValue) * multiplier;
  });
}

export function filterRows(
  rows: Array<Record<string, QueryCellValue>>,
  search: string
): Array<Record<string, QueryCellValue>> {
  const needle = search.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((row) =>
    Object.values(row).some((value) =>
      String(value ?? "").toLowerCase().includes(needle)
    )
  );
}

export function nextSort(
  current: ResultsSort,
  column: string
): ResultsSort {
  if (current.column !== column) return { column, direction: "desc" };
  return { column, direction: current.direction === "desc" ? "asc" : "desc" };
}

export function getAriaSort(
  sort: ResultsSort,
  column: string
): "ascending" | "descending" | "none" {
  if (sort.column !== column) return "none";
  return sort.direction === "asc" ? "ascending" : "descending";
}

/** Coerce catalog/result cell text for display without ever using HTML. */
export function cellText(value: QueryCellValue): string {
  if (value === null) return "—";
  return String(value);
}

export function columnLabels(columns: QueryColumn[]): string[] {
  return columns.map((column) => column.name);
}

export function pageRows<T>(rows: T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(1, page);
  return rows.slice((safePage - 1) * pageSize, safePage * pageSize);
}
