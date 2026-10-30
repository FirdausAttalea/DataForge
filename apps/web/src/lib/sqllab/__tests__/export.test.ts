import { describe, expect, it } from "vitest";
import { DEMO_RESULT } from "../fixtures";
import { csvFilename, sanitizeCsvCell, toCsv, toJson, toMarkdown } from "../export";

const columns = DEMO_RESULT.columns;

describe("export helpers", () => {
  it("neutralizes spreadsheet formula injection", () => {
    expect(sanitizeCsvCell("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)");
    expect(sanitizeCsvCell("+1")).toBe("'+1");
    expect(sanitizeCsvCell("-1")).toBe("'-1");
    expect(sanitizeCsvCell("@cmd")).toBe("'@cmd");
    expect(sanitizeCsvCell("plain")).toBe("plain");
  });

  it("escapes commas, quotes, and newlines", () => {
    expect(sanitizeCsvCell("a,b")).toBe('"a,b"');
    expect(sanitizeCsvCell('a"b')).toBe('"a""b"');
    expect(sanitizeCsvCell("a\nb")).toBe('"a\nb"');
  });

  it("creates a CSV with headers and numeric values", () => {
    const csv = toCsv(columns, DEMO_RESULT.rows.slice(0, 1));
    const lines = csv.split("\n");
    expect(lines[0]).toBe("PRODUCT_ID,TOTAL_REVENUE,TOTAL_ORDERS,AVG_ORDER_VALUE");
    expect(lines[1]).toBe("PRD-9402,1428590.2,3892,367.06");
  });

  it("prefixes formula-like exported cells", () => {
    const csv = toCsv([{ name: "VALUE", type: "VARCHAR", alignment: "left" }], [
      { VALUE: "=HYPERLINK(\"http://evil\")" },
    ]);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('""http://evil""');
  });

  it("escapes pipes in Markdown", () => {
    const markdown = toMarkdown(
      [{ name: "A|B", type: "VARCHAR", alignment: "left" }],
      [{ "A|B": "x|y" }]
    );
    expect(markdown).toContain("A\\|B");
    expect(markdown).toContain("x\\|y");
    expect(markdown.split("\n")).toHaveLength(3);
  });

  it("renders JSON keyed by column name", () => {
    const json = toJson(columns, [{ PRODUCT_ID: "PRD-1", TOTAL_REVENUE: 1, TOTAL_ORDERS: 2, AVG_ORDER_VALUE: 3 }]);
    expect(JSON.parse(json)).toEqual([
      { PRODUCT_ID: "PRD-1", TOTAL_REVENUE: 1, TOTAL_ORDERS: 2, AVG_ORDER_VALUE: 3 },
    ]);
  });

  it("creates a safe CSV filename", () => {
    expect(csvFilename("query_revenue_by_product.sql")).toBe("query_revenue_by_product_results.csv");
    expect(csvFilename("../bad name.sql")).toBe("_bad_name_results.csv");
  });
});
