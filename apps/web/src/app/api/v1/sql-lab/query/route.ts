import { NextRequest, NextResponse } from "next/server";
import {
  getProjectById,
  getWorkspacesByOwner,
} from "@/lib/store";
import { canAccessProject } from "@/lib/sqllab/access";
import type { QueryResult } from "@/lib/sqllab/types";

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8000";
const INTERNAL_TOKEN =
  process.env.SQL_LAB_INTERNAL_TOKEN ?? "dataforge-local-dev";
const MAX_SQL_LENGTH = 20_000;

interface ErrorBody {
  detail?: unknown;
  error?: { message?: unknown };
}

function errorResponse(
  code: string,
  message: string,
  status: number
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("df_session");
  if (!sessionCookie?.value) {
    return errorResponse("UNAUTHENTICATED", "Not authenticated.", 401);
  }

  const userId = sessionCookie.value.split(".")[0];
  const workspaces = await getWorkspacesByOwner(userId);
  const workspace =
    workspaces.find((candidate) => candidate.setupCompleted) ?? workspaces[0];
  if (!workspace) {
    return errorResponse("NOT_FOUND", "Workspace not found.", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Invalid JSON body.", 400);
  }

  const payload = body as { projectId?: unknown; sql?: unknown };
  if (typeof payload.projectId !== "string" || !payload.projectId) {
    return errorResponse("VALIDATION_ERROR", "projectId is required.", 400);
  }
  if (typeof payload.sql !== "string" || !payload.sql.trim()) {
    return errorResponse("VALIDATION_ERROR", "Enter a query to run.", 400);
  }
  if (payload.sql.length > MAX_SQL_LENGTH) {
    return errorResponse(
      "VALIDATION_ERROR",
      `Queries are limited to ${MAX_SQL_LENGTH.toLocaleString("en-US")} characters.`,
      400
    );
  }

  const project = await getProjectById(payload.projectId);
  if (
    !project ||
    !canAccessProject(
      { userId, workspaceId: workspace.id },
      project,
      workspace.ownerId
    )
  ) {
    return errorResponse("NOT_FOUND", "Project not found.", 404);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_ORIGIN}/api/v1/sql-lab/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-DataForge-Internal": INTERNAL_TOKEN,
      },
      body: JSON.stringify({ projectId: project.id, sql: payload.sql }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return errorResponse(
      "SERVICE_UNAVAILABLE",
      "The SQL service is unavailable. Make sure the API server is running on port 8000.",
      503
    );
  }

  let data: unknown;
  try {
    data = await upstream.json();
  } catch {
    return errorResponse(
      "SERVICE_UNAVAILABLE",
      "The SQL service returned an unreadable response.",
      502
    );
  }

  if (!upstream.ok) {
    const error = data as ErrorBody;
    const message =
      typeof error.detail === "string"
        ? error.detail
        : typeof error.error?.message === "string"
          ? error.error.message
          : "The query could not be executed.";
    return errorResponse(
      upstream.status === 400 ? "QUERY_ERROR" : "SERVICE_UNAVAILABLE",
      message,
      upstream.status === 400 ? 400 : 502
    );
  }

  const result = data as QueryResult;
  if (
    !result ||
    !Array.isArray(result.columns) ||
    !Array.isArray(result.rows) ||
    (result.status !== "success" && result.status !== "empty")
  ) {
    return errorResponse(
      "SERVICE_UNAVAILABLE",
      "The SQL service returned an invalid result.",
      502
    );
  }

  return NextResponse.json(result);
}
