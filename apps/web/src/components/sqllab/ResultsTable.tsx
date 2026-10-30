"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cellText, formatCurrency, formatNumber, getAriaSort } from "@/lib/sqllab/results";
import type { QueryColumn, QueryCellValue, ResultsSort, SortDirection } from "@/lib/sqllab/types";

interface ResultsTableProps {
  columns: QueryColumn[];
  rows: Array<Record<string, QueryCellValue>>;
  sort: ResultsSort;
  onSort: (column: string) => void;
  page: number;
  pageSize: number;
  totalRows: number;
}

function isCurrencyColumn(column: QueryColumn): boolean {
  return column.alignment === "right" && /REVENUE|VALUE|AMOUNT|PRICE|COST/i.test(column.name);
}

function isChipColumn(column: QueryColumn): boolean {
  return column.alignment === "left" && /(^|_)ID$/i.test(column.name);
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (direction === "asc") return <ArrowUp size={12} aria-hidden="true" />;
  if (direction === "desc") return <ArrowDown size={12} aria-hidden="true" />;
  return <ArrowUpDown size={12} className="text-slate-300" aria-hidden="true" />;
}

export function ResultsTable({
  columns,
  rows,
  sort,
  onSort,
  page,
  pageSize,
  totalRows,
}: ResultsTableProps) {
  const offset = (Math.max(1, page) - 1) * pageSize;

  return (
    <div className="max-h-[460px] min-h-[160px] overflow-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-xs">
        <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
          <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
            <th scope="col" className="w-12 px-3 py-2.5 text-right font-semibold">
              #
            </th>
            {columns.map((column) => {
              const direction =
                sort.column === column.name ? sort.direction : null;
              return (
                <th
                  key={column.name}
                  scope="col"
                  aria-sort={getAriaSort(sort, column.name)}
                  className={`px-3 py-2.5 font-semibold ${column.alignment === "right" ? "text-right" : "text-left"}`}
                >
                  <button
                    type="button"
                    onClick={() => onSort(column.name)}
                    className={`inline-flex items-center gap-1 whitespace-nowrap rounded text-[10px] uppercase tracking-wide transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      direction ? "text-indigo-600" : ""
                    }`}
                    aria-label={`Sort by ${column.name.replace(/_/g, " ")}`}
                  >
                    {column.name}
                    <SortIcon direction={direction} />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-sm text-slate-500">
                No rows match this search.
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={`${offset + rowIndex}-${String(row[columns[0]?.name] ?? rowIndex)}`}
                className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80"
              >
                <td className="px-3 py-2.5 text-right font-mono text-[11px] tabular-nums text-slate-400">
                  {offset + rowIndex + 1}
                </td>
                {columns.map((column) => {
                  const value = row[column.name] ?? null;
                  const chip = isChipColumn(column);
                  return (
                    <td
                      key={column.name}
                      className={`px-3 py-2.5 ${column.alignment === "right" ? "text-right tabular-nums" : "text-left"}`}
                    >
                      {chip ? (
                        <span className="inline-flex rounded bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-700">
                          {cellText(value)}
                        </span>
                      ) : (
                        <span
                          className={`font-mono text-[11px] ${
                            column.alignment === "right" ? "font-medium text-slate-700" : "text-slate-600"
                          }`}
                        >
                          {isCurrencyColumn(column) ? formatCurrency(value) : formatNumber(value)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalRows > 0 && (
        <span className="sr-only" aria-live="polite">
          Showing {rows.length} of {totalRows} filtered rows.
        </span>
      )}
    </div>
  );
}
