import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { QueryTab } from "@/lib/sqllab/types";
import { EditorTabs } from "../EditorTabs";

const tabs: QueryTab[] = [
  {
    id: "a",
    name: "query_a.sql",
    title: "Query A",
    sql: "SELECT 1",
    savedSql: "SELECT 1",
  },
  {
    id: "b",
    name: "query_b.sql",
    title: "Query B",
    sql: "SELECT 2 -- edited",
    savedSql: "SELECT 2",
  },
];

describe("EditorTabs", () => {
  it("navigates tabs with arrow keys and exposes the tablist semantics", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <EditorTabs
        tabs={tabs}
        activeTabId="a"
        onSelect={onSelect}
        onAdd={vi.fn()}
        onClose={vi.fn()}
        memoryUsedGb={3.2}
        memoryTotalGb={16}
        fullscreen={false}
        onToggleFullscreen={vi.fn()}
      />
    );

    const first = screen.getByRole("tab", { name: /query_a.sql/ });
    expect(first).toHaveAttribute("aria-selected", "true");
    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("marks only dirty tabs and closes with a labelled button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <EditorTabs
        tabs={tabs}
        activeTabId="b"
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onClose={onClose}
        memoryUsedGb={3.2}
        memoryTotalGb={16}
        fullscreen={false}
        onToggleFullscreen={vi.fn()}
      />
    );

    expect(screen.getAllByLabelText("Unsaved changes")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Close query_b.sql" }));
    expect(onClose).toHaveBeenCalledWith("b");
  });
});
