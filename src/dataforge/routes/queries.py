"""Saved queries HTTP routes."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session as DbSession

from dataforge.database import get_db
from dataforge.models.project import Project

router = APIRouter(prefix="/api/v1/queries", tags=["queries"])


class SavedQueryOut(BaseModel):
    id: str
    project_id: str
    workspace_id: str
    name: str
    title: str
    sql: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


@router.get("", response_model=list[SavedQueryOut])
def list_queries(
    project_id: str = Query(...),
    db: DbSession = Depends(get_db),
) -> list[SavedQueryOut]:
    """List all saved queries in a project."""
    from uuid import UUID
    try:
        proj_uuid = UUID(project_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid project_id format.")
    
    # Verify project exists
    project = db.query(Project).filter(Project.id == proj_uuid).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    
    # Query from saved_queries table
    from sqlalchemy import text
    result = db.execute(
        text("""
            SELECT id, project_id, workspace_id, name, title, sql, created_at, updated_at
            FROM saved_queries
            WHERE project_id = :project_id
            ORDER BY updated_at DESC
        """),
        {"project_id": str(proj_uuid)}
    )
    
    rows = result.fetchall()
    if not rows:
        return []
    
    return [
        SavedQueryOut(
            id=row[0],
            project_id=str(row[1]),
            workspace_id=str(row[2]),
            name=row[3],
            title=row[4],
            sql=row[5],
            created_at=row[6].isoformat() if row[6] else "",
            updated_at=row[7].isoformat() if row[7] else "",
        )
        for row in rows
    ]
