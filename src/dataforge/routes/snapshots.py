"""Query snapshot routes."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session as DbSession

from dataforge.database import get_db
from dataforge.services.snapshots import SnapshotService

router = APIRouter(prefix="/api/v1/snapshots", tags=["snapshots"])


class SnapshotOut(BaseModel):
    id: str
    query_id: str
    query_text: str
    limit_value: int
    row_count: int
    snapshot_data: list
    created_at: str
    updated_at: str


def _get_query_sql(db: DbSession, query_id: str, project_id: str) -> str:
    """Return SQL for a saved query, verifying it belongs to the project."""
    row = db.execute(
        text("SELECT sql FROM saved_queries WHERE id = :qid AND project_id = :pid"),
        {"qid": query_id, "pid": project_id},
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Query not found.")
    return row[0]


def _snapshot_to_dict(snapshot) -> dict:
    return {
        "id": snapshot.id,
        "query_id": snapshot.query_id,
        "query_text": snapshot.query_text,
        "limit_value": snapshot.limit_value,
        "row_count": snapshot.row_count,
        "snapshot_data": snapshot.snapshot_data,
        "created_at": snapshot.created_at.isoformat() if snapshot.created_at else "",
        "updated_at": snapshot.updated_at.isoformat() if snapshot.updated_at else "",
    }


@router.post("", response_model=SnapshotOut, status_code=status.HTTP_201_CREATED)
def create_snapshot(
    query_id: str = Query(...),
    project_id: str = Query(...),
    db: DbSession = Depends(get_db),
) -> SnapshotOut:
    """Execute query via DuckDB and persist snapshot."""
    query_text = _get_query_sql(db, query_id, project_id)
    try:
        svc = SnapshotService(db)
        snapshot = svc.create_snapshot(query_id, query_text)
        return SnapshotOut.model_validate(_snapshot_to_dict(snapshot))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/latest", response_model=SnapshotOut)
def get_latest_snapshot(
    query_id: str = Query(...),
    project_id: str = Query(...),
    db: DbSession = Depends(get_db),
) -> SnapshotOut:
    """Get most recent snapshot, verifying project ownership."""
    ownership = db.execute(
        text("SELECT 1 FROM saved_queries WHERE id = :qid AND project_id = :pid"),
        {"qid": query_id, "pid": project_id},
    ).fetchone()
    if not ownership:
        raise HTTPException(status_code=404, detail="Query not found.")

    svc = SnapshotService(db)
    snapshot = svc.get_latest_snapshot(query_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="No snapshot found for this query.")
    return SnapshotOut.model_validate(_snapshot_to_dict(snapshot))
