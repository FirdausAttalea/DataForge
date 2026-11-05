/**
 * API client for saved queries endpoint.
 */

import type { SavedQuery } from "@/lib/sqllab/types";

/**
 * List saved queries in a project.
 */
export async function listQueries(projectId: string): Promise<SavedQuery[]> {
  const response = await fetch(`/api/v1/queries?project_id=${projectId}`, {
    credentials: "include",
  });
  if (!response.ok) {
    console.error("listQueries failed:", response.status, response.statusText);
    return [];
  }
  const data = await response.json();
  return data.map((q: any) => ({
    id: q.id,
    projectId: q.project_id,
    workspaceId: q.workspace_id,
    name: q.name,
    title: q.title,
    sql: q.sql,
    createdAt: q.created_at,
    updatedAt: q.updated_at,
  }));
}

/**
 * Delete a saved query.
 */
export async function deleteQuery(projectId: string, queryId: string): Promise<void> {
  const response = await fetch(`/api/v1/queries?id=${queryId}&project_id=${projectId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Delete query failed: ${response.statusText}`);
  }
}
