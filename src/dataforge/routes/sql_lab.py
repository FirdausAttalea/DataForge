"""SQL Lab query endpoint.

This route is called by the Next.js server, not directly by the browser. The
Next server authenticates the session and checks project access before proxying
the statement here with a shared internal token.
"""

from __future__ import annotations

import hmac

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, Field

from dataforge.config import settings
from dataforge.services import sql_lab

router = APIRouter(prefix="/api/v1/sql-lab", tags=["sql-lab"])

INTERNAL_HEADER = "X-DataForge-Internal"


class QueryRequest(BaseModel):
    sql: str = Field(min_length=1, max_length=sql_lab.MAX_SQL_LENGTH)
    project_id: str | None = Field(default=None, alias="projectId")


@router.post("/query")
def run_query(
    body: QueryRequest,
    internal_token: str | None = Header(default=None, alias=INTERNAL_HEADER),
) -> dict:
    expected = settings.sql_lab_internal_token
    if not internal_token or not hmac.compare_digest(internal_token, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        )

    try:
        return sql_lab.run_query(body.sql)
    except sql_lab.QueryValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
