import { describe, expect, it } from "vitest";
import { DEMO_SQL, getDemoSavedQuery, DEMO_PROJECT_ID } from "../fixtures";
import {
  checkBasicSyntax,
  formatCursor,
  formatSqlBasic,
  isDemoQuery,
  normalizeSql,
} from "../sql";

describe("SQL helpers", () => {
  it("recognizes the demo query despite whitespace and case", () => {
    expect(isDemoQuery(DEMO_SQL)).toBe(true);
    expect(isDemoQuery(DEMO_SQL.toUpperCase())).toBe(true);
    expect(isDemoQuery("SELECT 1;")).toBe(false);
  });

  it("normalizes whitespace", () => {
    expect(normalizeSql("  SELECT \n 1  ")).toBe("select 1");
  });

  it("flags empty input", () => {
    expect(checkBasicSyntax("   ")).toEqual({ valid: false, message: "Query is empty." });
  });

  it("checks parenthesis balance outside strings and comments", () => {
    expect(checkBasicSyntax("SELECT (1)").valid).toBe(true);
    expect(checkBasicSyntax("SELECT (1").valid).toBe(false);
    expect(checkBasicSyntax("SELECT 1)").valid).toBe(false);
    expect(checkBasicSyntax("SELECT '('").valid).toBe(true);
    expect(checkBasicSyntax("-- ( unbalanced\nSELECT 1").valid).toBe(true);
    expect(checkBasicSyntax("/* ( */ SELECT 1").valid).toBe(true);
  });

  it("flags unterminated literals and comments", () => {
    expect(checkBasicSyntax("SELECT 'abc").valid).toBe(false);
    expect(checkBasicSyntax("SELECT /* abc").valid).toBe(false);
  });

  it("uppercases keywords but leaves strings and comments untouched", () => {
    const sql = "select product_id, sum(revenue) as total -- keep this lowercase\nfrom orders where region = 'north'";
    const formatted = formatSqlBasic(sql);
    expect(formatted).toContain("SELECT");
    expect(formatted).toContain("SUM(revenue)");
    expect(formatted).toContain("AS");
    expect(formatted).toContain("FROM");
    expect(formatted).toContain("WHERE");
    expect(formatted).toContain("-- keep this lowercase");
    expect(formatted).toContain("'north'");
    expect(formatted).not.toContain("SELECT product_id, sum");
  });

  it("formats a cursor position", () => {
    expect(formatCursor({ lineNumber: 8, column: 11 })).toBe("Ln 8, Col 11");
  });

  it("only attaches the demo saved query to the seeded demo project", () => {
    expect(getDemoSavedQuery(DEMO_PROJECT_ID, "ws-1")).not.toBeNull();
    expect(getDemoSavedQuery("proj-new", "ws-1")).toBeNull();
  });
});
