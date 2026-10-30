import { describe, expect, it } from "vitest";
import {
  filterRows,
  formatCurrency,
  formatNumber,
  formatRelativeTime,
  getAriaSort,
  nextSort,
  pageRows,
  sortRows,
} from "../results";

const rows = [
  { PRODUCT_ID: "PRD-2", TOTAL_REVENUE: 200, TOTAL_ORDERS: 20 },
  { PRODUCT_ID: "PRD-1", TOTAL_REVENUE: 100, TOTAL_ORDERS: 100 },
  { PRODUCT_ID: "PRD-3", TOTAL_REVENUE: 300, TOTAL_ORDERS: 5 },
];

describe("results helpers", () => {
  it("sorts numeric columns in both directions", () => {
    expect(sortRows(rows, "TOTAL_REVENUE", "asc").map((row) => row.PRODUCT_ID)).toEqual([
      "PRD-1",
      "PRD-2",
      "PRD-3",
    ]);
    expect(sortRows(rows, "TOTAL_REVENUE", "desc").map((row) => row.PRODUCT_ID)).toEqual([
      "PRD-3",
      "PRD-2",
      "PRD-1",
    ]);
  });

  it("sorts strings naturally and does not mutate input", () => {
    const sorted = sortRows(rows, "PRODUCT_ID", "asc");
    expect(sorted[0].PRODUCT_ID).toBe("PRD-1");
    expect(rows[0].PRODUCT_ID).toBe("PRD-2");
  });

  it("keeps nulls last", () => {
    const withNull = [...rows, { PRODUCT_ID: "NULL", TOTAL_REVENUE: null, TOTAL_ORDERS: 0 }];
    expect(sortRows(withNull, "TOTAL_REVENUE", "desc").at(-1)?.PRODUCT_ID).toBe("NULL");
    expect(sortRows(withNull, "TOTAL_REVENUE", "asc").at(-1)?.PRODUCT_ID).toBe("NULL");
  });

  it("filters rows case-insensitively across every cell", () => {
    expect(filterRows(rows, "prd-2")).toHaveLength(1);
    expect(filterRows(rows, "300")).toHaveLength(1);
    expect(filterRows(rows, "missing")).toHaveLength(0);
    expect(filterRows(rows, "")).toHaveLength(3);
  });

  it("formats numbers and USD currency", () => {
    expect(formatNumber(3892)).toBe("3,892");
    expect(formatNumber("PRD-2")).toBe("PRD-2");
    expect(formatNumber(null)).toBe("—");
    expect(formatCurrency(1428590.2)).toBe("$1,428,590.20");
    expect(formatCurrency(367.06)).toBe("$367.06");
    expect(formatCurrency(null)).toBe("—");
  });

  it("reports relative saved times", () => {
    const now = Date.parse("2026-10-30T12:00:00Z");
    expect(formatRelativeTime("2026-10-30T11:58:00Z", now)).toBe("2m ago");
    expect(formatRelativeTime("2026-10-30T11:59:50Z", now)).toBe("just now");
    expect(formatRelativeTime("2026-10-30T10:00:00Z", now)).toBe("2h ago");
  });

  it("toggles sort direction and exposes aria-sort values", () => {
    const first = nextSort({ column: "TOTAL_REVENUE", direction: "desc" }, "TOTAL_REVENUE");
    expect(first.direction).toBe("asc");
    expect(getAriaSort(first, "TOTAL_REVENUE")).toBe("ascending");
    expect(getAriaSort(first, "TOTAL_ORDERS")).toBe("none");
    expect(nextSort(first, "TOTAL_ORDERS")).toEqual({ column: "TOTAL_ORDERS", direction: "desc" });
  });

  it("paginates rows with a one-based page number", () => {
    expect(pageRows([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);
    expect(pageRows([1, 2, 3], 1, 2)).toEqual([1, 2]);
  });
});
