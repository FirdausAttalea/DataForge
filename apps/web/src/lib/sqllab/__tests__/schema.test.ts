import { describe, expect, it } from "vitest";
import { seedTables } from "@/lib/store/seed";
import { filterSchema, groupTablesByDatabase, typeBadgeLabel } from "../schema";

const retail = seedTables.filter((table) => table.domain === "Retail & E-commerce");

describe("schema helpers", () => {
  it("filters by table name and returns all columns", () => {
    const result = filterSchema(retail, "orders");
    expect(result.map((entry) => entry.table.name)).toContain("orders");
    expect(result.find((entry) => entry.table.name === "orders")?.columns.length).toBe(7);
  });

  it("filters by column name and keeps only matching columns", () => {
    const result = filterSchema(retail, "product_id");
    expect(result.length).toBeGreaterThan(0);
    const orders = result.find((entry) => entry.table.name === "orders");
    expect(orders?.columns.map((column) => column.name)).toEqual(["product_id"]);
  });

  it("returns no tables for an unmatched filter", () => {
    expect(filterSchema(retail, "no_such_table")).toEqual([]);
  });

  it("groups tables by database and schema", () => {
    const groups = groupTablesByDatabase(seedTables);
    expect(groups.find((group) => group.database === "analytics_prod")?.tables).toHaveLength(4);
    expect(groups.find((group) => group.database === "saas_prod")?.tables).toHaveLength(5);
  });

  it("keeps product_id VARCHAR across the retail catalog", () => {
    for (const tableName of ["orders", "products", "order_items"]) {
      const table = seedTables.find((candidate) => candidate.name === tableName);
      expect(table?.columns.find((column) => column.name === "product_id")?.dataType).toBe("VARCHAR");
    }
  });

  it("normalizes type labels", () => {
    expect(typeBadgeLabel("Decimal(10,2)")).toBe("DECIMAL(10,2)");
  });
});

