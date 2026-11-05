"""Charts HTTP routes."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session as DbSession

from dataforge.database import get_db
from dataforge.models.project import Project
from dataforge.services.charts import ChartService

router = APIRouter(prefix="/api/v1/charts", tags=["charts"])


class ChartEncodings(BaseModel):
    x_axis: str = Field(alias="xAxis")
    y_axis: str = Field(alias="yAxis")
    color_breakdown: str | None = Field(default=None, alias="colorBreakdown")


class ChartOptions(BaseModel):
    title: str | None = None
    legend: bool = True
    tooltip: bool = True


class CreateChartRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    type: str = Field(pattern=r"^(bar|line|area|scatter|donut|heatmap)$")
    sql_query: str = Field(min_length=1, max_length=20000)
    encodings: ChartEncodings
    options: ChartOptions | None = None


class UpdateChartRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    type: str | None = Field(default=None, pattern=r"^(bar|line|area|scatter|donut|heatmap)$")
    sql_query: str | None = Field(default=None, min_length=1, max_length=20000)
    encodings: ChartEncodings | None = None
    options: ChartOptions | None = None


class ChartOut(BaseModel):
    id: str
    project_id: str
    name: str
    description: str | None
    type: str
    sql_query: str
    encodings: dict[str, Any]
    options: dict[str, Any]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class ChartRenderOut(BaseModel):
    status: str
    option: dict[str, Any]
    row_count: int | None = None
    duration_ms: int | None = None
    message: str | None = None


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ChartOut)
def create_chart(
    project_id: str = Query(...),
    body: CreateChartRequest = None,
    db: DbSession = Depends(get_db),
) -> ChartOut:
    """Create new chart in project."""
    from uuid import UUID
    try:
        proj_uuid = UUID(project_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid project_id format.")
    
    # Verify project exists (simplified; in reality check user access)
    project = db.query(Project).filter(Project.id == proj_uuid).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    
    svc = ChartService(db)
    try:
        chart = svc.create(
            project_id=proj_uuid,
            name=body.name,
            description=body.description,
            chart_type=body.type,
            sql_query=body.sql_query,
            encodings=body.encodings.model_dump(by_alias=True),
            options=body.options.model_dump() if body.options else {},
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return ChartOut.model_validate(chart)


@router.get("/{chart_id}", response_model=ChartOut)
def get_chart(
    project_id: str = Query(...),
    chart_id: str = None,
    db: DbSession = Depends(get_db),
) -> ChartOut:
    """Get chart by ID."""
    from uuid import UUID
    try:
        proj_uuid = UUID(project_id)
        chart_uuid = UUID(chart_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid ID format.")
    
    svc = ChartService(db)
    chart = svc.get(chart_uuid, proj_uuid)
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found.")
    return ChartOut.model_validate(chart)


@router.get("/project/{project_id}", response_model=list[ChartOut])
def list_charts(
    project_id: str,
    db: DbSession = Depends(get_db),
) -> list[ChartOut]:
    """List all charts in project."""
    from uuid import UUID
    try:
        proj_uuid = UUID(project_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid project_id format.")
    
    svc = ChartService(db)
    charts = svc.list_by_project(proj_uuid)
    return [ChartOut.model_validate(c) for c in charts]


@router.patch("/{chart_id}", response_model=ChartOut)
def update_chart(
    project_id: str = Query(...),
    chart_id: str = None,
    body: UpdateChartRequest = None,
    db: DbSession = Depends(get_db),
) -> ChartOut:
    """Update chart."""
    from uuid import UUID
    try:
        proj_uuid = UUID(project_id)
        chart_uuid = UUID(chart_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid ID format.")
    
    svc = ChartService(db)
    updates = {}
    if body.name is not None:
        updates["name"] = body.name
    if body.description is not None:
        updates["description"] = body.description
    if body.type is not None:
        updates["type"] = body.type
    if body.sql_query is not None:
        updates["sql_query"] = body.sql_query
    if body.encodings is not None:
        updates["encodings"] = body.encodings.model_dump(by_alias=True)
    if body.options is not None:
        updates["options"] = body.options.model_dump()
    
    try:
        chart = svc.update(chart_uuid, proj_uuid, **updates)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found.")
    return ChartOut.model_validate(chart)


@router.delete("/{chart_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chart(
    project_id: str = Query(...),
    chart_id: str = None,
    db: DbSession = Depends(get_db),
) -> None:
    """Delete chart."""
    from uuid import UUID
    try:
        proj_uuid = UUID(project_id)
        chart_uuid = UUID(chart_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid ID format.")
    
    svc = ChartService(db)
    if not svc.delete(chart_uuid, proj_uuid):
        raise HTTPException(status_code=404, detail="Chart not found.")


@router.post("/{chart_id}/render", response_model=ChartRenderOut)
def render_chart(
    project_id: str = Query(...),
    chart_id: str = None,
    db: DbSession = Depends(get_db),
) -> ChartRenderOut:
    """Execute query and render chart."""
    from uuid import UUID
    try:
        proj_uuid = UUID(project_id)
        chart_uuid = UUID(chart_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid ID format.")
    
    svc = ChartService(db)
    chart = svc.get(chart_uuid, proj_uuid)
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found.")
    
    try:
        result = svc.execute_and_render(chart)
        return ChartRenderOut(
            status=result["status"],
            option=result["option"],
            row_count=result.get("rowCount"),
            duration_ms=result.get("durationMs"),
            message=result.get("message"),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
