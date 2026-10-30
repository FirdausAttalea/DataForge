import type { QueryCellValue, QueryColumn } from "./types";

type Row = Record<string, QueryCellValue>;

const FORMULA_PREFIX = /^[=+\-@]/;

/**
 * Neutralize spreadsheet formula injection. Quotes/commas/newlines are escaped
 * according to RFC 4180. This runs on export only and never changes the table.
 */
export function sanitizeCsvCell(value: QueryCellValue): string {
  let text = value === null ? "" : String(value);
  if (FORMULA_PREFIX.test(text)) {
    text = `'${text}`;
  }
  if (/[",\n\r]/.test(text)) {
    text = `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(columns: QueryColumn[], rows: Row[]): string {
  const header = columns.map((column) => sanitizeCsvCell(column.name)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => sanitizeCsvCell(row[column.name] ?? null)).join(",")
  );
  return [header, ...body].join("\n");
}

function escapeMarkdown(value: QueryCellValue): string {
  if (value === null) return "";
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");
}

export function toMarkdown(columns: QueryColumn[], rows: Row[]): string {
  const header = `| ${columns.map((column) => escapeMarkdown(column.name)).join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map(
    (row) => `| ${columns.map((column) => escapeMarkdown(row[column.name] ?? null)).join(" | ")} |`
  );
  return [header, divider, ...body].join("\n");
}

export function toJson(columns: QueryColumn[], rows: Row[]): string {
  const shaped = rows.map((row) => {
    const entry: Record<string, QueryCellValue> = {};
    for (const column of columns) {
      entry[column.name] = row[column.name] ?? null;
    }
    return entry;
  });
  return JSON.stringify(shaped, null, 2);
}

export function csvFilename(queryName: string): string {
  const base = queryName.replace(/\.sql$/i, "").replace(/[^a-z0-9_-]+/gi, "_");
  return `${base || "query"}_results.csv`;
}

export function downloadFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
