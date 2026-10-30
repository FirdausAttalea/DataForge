import { Suspense } from "react";
import { getBusinessCases, getTables } from "@/lib/store";
import { NewProjectForm } from "./NewProjectForm";

export default function NewProjectPage() {
  const cases = getBusinessCases();
  const tables = getTables();
  return (
    <Suspense>
      <NewProjectForm cases={cases} tables={tables} />
    </Suspense>
  );
}
