import { getTables } from "@/lib/store";
import type { TableDef } from "@/lib/store/types";
import DatasetsShell from "./DatasetsShell";

export default function DatasetsPage() {
  const tables = getTables();
  return <DatasetsShell tables={tables} />;
}
