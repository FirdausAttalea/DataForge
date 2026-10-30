import type { TableColumn, TableDef } from "@/lib/store";

export interface FilteredTable {
  table: TableDef;
  columns: TableColumn[];
}

/** Client-side tree filter over table names and column names. */
export function filterSchema(tables: TableDef[], search: string): FilteredTable[] {
  const needle = search.trim().toLowerCase();
  if (!needle) return tables.map((table) => ({ table, columns: table.columns }));

  return tables
    .map((table) => {
      const matchesTable = table.name.toLowerCase().includes(needle);
      const columns = matchesTable
        ? table.columns
        : table.columns.filter((column) => column.name.toLowerCase().includes(needle));
      return { table, columns };
    })
    .filter((entry) => entry.table.name.toLowerCase().includes(needle) || entry.columns.length > 0);
}

export interface DatabaseGroup {
  database: string;
  schema: string;
  tables: TableDef[];
}

export function groupTablesByDatabase(tables: TableDef[]): DatabaseGroup[] {
  const groups: DatabaseGroup[] = [];
  for (const table of tables) {
    let group = groups.find(
      (candidate) => candidate.database === table.database && candidate.schema === table.schema
    );
    if (!group) {
      group = { database: table.database, schema: table.schema, tables: [] };
      groups.push(group);
    }
    group.tables.push(table);
  }
  return groups;
}

export function typeBadgeLabel(dataType: string): string {
  return dataType.toUpperCase();
}
