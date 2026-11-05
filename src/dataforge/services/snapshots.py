"""Query snapshot service."""

import re
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session as DbSession

from dataforge.models.query_snapshot import QuerySnapshot
from dataforge.services.sql_lab import run_query, QueryValidationError


class SnapshotService:
    def __init__(self, db: DbSession):
        self.db = db

    def extract_limit(self, sql: str) -> int:
        """Extract LIMIT value from SQL query. Return 100 if not found."""
        match = re.search(r'\bLIMIT\s+(\d+)\b', sql, re.IGNORECASE)
        if match:
            return int(match.group(1))
        return 100

    def execute_query(self, sql: str) -> tuple[list[dict[str, Any]], int]:
        """Execute SQL via DuckDB and return (rows, row_count)."""
        result = run_query(sql)
        rows = result.get("rows", [])
        return rows, len(rows)

    def create_snapshot(self, query_id: str, query_text: str) -> QuerySnapshot:
        """Execute query and create snapshot."""
        limit_value = self.extract_limit(query_text)

        # Append LIMIT only if not already present
        if re.search(r'\bLIMIT\s+\d+\b', query_text, re.IGNORECASE):
            limited_sql = query_text
        else:
            limited_sql = f"{query_text.rstrip(';')} LIMIT {limit_value}"

        rows, row_count = self.execute_query(limited_sql)

        snapshot = QuerySnapshot(
            id=f"snap-{int(datetime.utcnow().timestamp() * 1000)}",
            query_id=query_id,
            query_text=query_text,
            limit_value=limit_value,
            row_count=row_count,
            snapshot_data=rows,
        )

        self.db.add(snapshot)
        self.db.commit()
        self.db.refresh(snapshot)

        return snapshot

    def get_latest_snapshot(self, query_id: str) -> QuerySnapshot | None:
        """Get most recent snapshot for a query."""
        return self.db.query(QuerySnapshot).filter(
            QuerySnapshot.query_id == query_id
        ).order_by(QuerySnapshot.updated_at.desc()).first()

