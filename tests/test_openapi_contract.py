import json

from dataforge.openapi_export import OUTPUT, render


def test_committed_contract_matches_code():
    committed = OUTPUT.read_text(encoding="utf-8")
    assert committed == render(), (
        "The API contract changed. Regenerate and commit it with: "
        "uv run python -m dataforge.openapi_export"
    )


def test_contract_includes_expected_routes():
    paths = json.loads(render())["paths"]
    assert "/health" in paths
    assert "/api/v1/auth/login" in paths
    assert "/api/v1/auth/logout" in paths