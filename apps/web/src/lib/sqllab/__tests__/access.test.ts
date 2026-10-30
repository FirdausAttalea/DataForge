import { describe, expect, it } from "vitest";
import { canAccessProject } from "../access";

describe("SQL Lab project authorization", () => {
  it("allows the workspace owner with a matching project", () => {
    expect(
      canAccessProject(
        { userId: "user-a", workspaceId: "ws-a" },
        { ownerId: "user-a", workspaceId: "ws-a" },
        "user-a"
      )
    ).toBe(true);
  });

  it("denies a second user's project even if they are authenticated", () => {
    expect(
      canAccessProject(
        { userId: "user-b", workspaceId: "ws-b" },
        { ownerId: "user-a", workspaceId: "ws-a" },
        "user-a"
      )
    ).toBe(false);
  });

  it("denies a project from another workspace", () => {
    expect(
      canAccessProject(
        { userId: "user-a", workspaceId: "ws-a" },
        { ownerId: "user-a", workspaceId: "ws-b" },
        "user-a"
      )
    ).toBe(false);
  });

  it("denies when the workspace is not owned by the session user", () => {
    expect(
      canAccessProject(
        { userId: "user-a", workspaceId: "ws-a" },
        { ownerId: "user-a", workspaceId: "ws-a" },
        "user-b"
      )
    ).toBe(false);
  });
});
