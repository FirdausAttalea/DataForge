"""Chart service for creating, updating, and rendering charts."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from dataforge.models.chart import Chart
from dataforge.services import sql_lab


class ChartService:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        project_id: uuid.UUID,
        name: str,
        chart_type: str,
        sql_query: str,
        encodings: dict[str, Any],
        options: dict[str, Any] | None = None,
        description: str | None = None,
    ) -> Chart:
        """Create new chart."""
        sql_lab.validate_statement(sql_query)  # Validate query before saving
        
        chart = Chart(
            project_id=project_id,
            name=name,
            description=description,
            type=chart_type,
            sql_query=sql_query,
            encodings=encodings,
            options=options or {},
        )
        self.db.add(chart)
        self.db.commit()
        self.db.refresh(chart)
        return chart

    def get(self, chart_id: uuid.UUID, project_id: uuid.UUID) -> Chart | None:
        """Get chart by ID (verify project access)."""
        return self.db.scalar(
            select(Chart).where(
                Chart.id == chart_id,
                Chart.project_id == project_id,
            )
        )

    def list_by_project(self, project_id: uuid.UUID) -> list[Chart]:
        """List all charts in project."""
        return self.db.scalars(
            select(Chart).where(Chart.project_id == project_id).order_by(Chart.created_at.desc())
        ).all()

    def update(
        self,
        chart_id: uuid.UUID,
        project_id: uuid.UUID,
        **kwargs: Any,
    ) -> Chart | None:
        """Update chart fields."""
        chart = self.get(chart_id, project_id)
        if not chart:
            return None
        
        # Validate SQL if changed
        if "sql_query" in kwargs:
            sql_lab.validate_statement(kwargs["sql_query"])
        
        for key, value in kwargs.items():
            if hasattr(chart, key):
                setattr(chart, key, value)
        
        self.db.commit()
        self.db.refresh(chart)
        return chart

    def delete(self, chart_id: uuid.UUID, project_id: uuid.UUID) -> bool:
        """Delete chart."""
        chart = self.get(chart_id, project_id)
        if not chart:
            return False
        
        self.db.delete(chart)
        self.db.commit()
        return True

    def execute_and_render(self, chart: Chart) -> dict[str, Any]:
        """Execute query and return chart data + ECharts config."""
        query_result = sql_lab.run_query(chart.sql_query)
        
        if query_result["status"] != "success" or not query_result["rows"]:
            return {
                "status": "error" if query_result["status"] == "error" else "empty",
                "message": "No data to display",
                "option": {},
            }
        
        columns = query_result["columns"]
        rows = query_result["rows"]
        
        # Build ECharts config based on chart type + encodings
        option = self._build_echarts_option(
            chart.type,
            columns,
            rows,
            chart.encodings,
            chart.options,
        )
        
        return {
            "status": "success",
            "option": option,
            "rowCount": query_result["rowCount"],
            "durationMs": query_result["durationMs"],
            "columns": columns,
            "rows": rows,
        }

    def _build_echarts_option(
        self,
        chart_type: str,
        columns: list[dict[str, Any]],
        rows: list[dict[str, Any]],
        encodings: dict[str, Any],
        options: dict[str, Any],
    ) -> dict[str, Any]:
        """Build ECharts option from query result and encodings."""
        x_axis_col = encodings.get("xAxis")
        y_axis_col = encodings.get("yAxis")
        color_col = encodings.get("colorBreakdown")
        
        if not x_axis_col or not y_axis_col:
            return {}
        
        col_names = [col["name"] for col in columns]
        if x_axis_col not in col_names or y_axis_col not in col_names:
            return {}
        
        # Group data by color breakdown if specified
        if color_col and color_col in col_names:
            grouped = {}
            for row in rows:
                group_key = row.get(color_col)
                if group_key not in grouped:
                    grouped[group_key] = []
                grouped[group_key].append(row)
        else:
            grouped = {"series": rows}
        
        x_data = sorted(set(row.get(x_axis_col) for row in rows if row.get(x_axis_col) is not None))
        
        series_list = []
        for group_label, group_rows in grouped.items():
            y_values = []
            for x_val in x_data:
                matching = [r.get(y_axis_col) for r in group_rows if r.get(x_axis_col) == x_val]
                y_values.append(matching[0] if matching else None)
            
            series_list.append({
                "name": str(group_label) if group_label != "series" else "",
                "type": self._echarts_type(chart_type),
                "data": y_values,
                **({"stack": "total"} if chart_type == "area" else {}),
            })
        
        option = {
            "title": {"text": options.get("title", "")},
            "tooltip": {"trigger": "axis"},
            "legend": {"data": [s["name"] for s in series_list if s["name"]]},
            "xAxis": {"type": "category", "data": [str(x) for x in x_data]},
            "yAxis": {"type": "value"},
            "series": series_list,
            **({"grid": {"containLabel": True}} if chart_type in ("bar", "line", "area") else {}),
        }
        
        return option

    @staticmethod
    def _echarts_type(chart_type: str) -> str:
        """Map chart type to ECharts series type."""
        mapping = {
            "bar": "bar",
            "line": "line",
            "area": "line",
            "scatter": "scatter",
            "donut": "pie",
            "heatmap": "heatmap",
        }
        return mapping.get(chart_type, "bar")
