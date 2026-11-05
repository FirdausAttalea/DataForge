import uuid
from datetime import datetime

from sqlalchemy import Integer, String, func, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from dataforge.db import Base


class QuerySnapshot(Base):
    __tablename__ = "query_snapshots"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: f"snap-{int(uuid.uuid4().int / 1e24)}")
    # No ORM-level FK — saved_queries is managed by Next.js/raw SQL, not mapped here
    query_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    query_text: Mapped[str] = mapped_column(String(20000), nullable=False)
    limit_value: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    row_count: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot_data: Mapped[list] = mapped_column(JSON, nullable=False, server_default="[]")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
