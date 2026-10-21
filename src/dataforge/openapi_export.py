"""Render the API contract to docs/api/openapi.json (P1-T12).

Regenerate after any API change:
    uv run python -m dataforge.openapi_export
"""
import json
from pathlib import Path

from dataforge.api import app

OUTPUT = Path(__file__).resolve().parents[2] / "docs" / "api" / "openapi.json"


def render() -> str:
    # sort_keys keeps the file stable, so diffs show only real contract changes.
    return json.dumps(app.openapi(), indent=2, sort_keys=True) + "\n"


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(render(), encoding="utf-8")
    print(f"wrote {OUTPUT}")


if __name__ == "__main__":
    main()