import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, JSON, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from dataforge.db import Base

CHART_TYPES = ("bar", "line", "area", "scatter", "donut", "heatmap")


class Chart(Base):
    __tablename__ = "charts"
    __table_args__ = (
        CheckConstraint(f"type IN ({', '.join(repr(t) for t in CHART_TYPES)})", name="ck_charts_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    type: Mapped[str] = mapped_column(String(16), nullable=False)
    sql_query: Mapped[str] = mapped_column(String(20000), nullable=False)
    # encodings: x_axis, y_axis, color_breakdown, etc
    encodings: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    # chart options: title, legend, tooltip, etc
    options: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
