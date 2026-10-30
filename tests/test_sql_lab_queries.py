"""SQL Lab query endpoint: read-only enforcement and result shape."""

INTERNAL_HEADERS = {"X-DataForge-Internal": "dataforge-local-dev"}


def test_query_requires_internal_token(client):
    response = client.post("/api/v1/sql-lab/query", json={"sql": "SELECT 1 AS n"})
    assert response.status_code == 401


def test_query_rejects_unknown_internal_token(client):
    response = client.post(
        "/api/v1/sql-lab/query",
        json={"sql": "SELECT 1 AS n"},
        headers={"X-DataForge-Internal": "wrong"},
    )
    assert response.status_code == 401


def test_select_returns_columns_and_rows(client):
    response = client.post(
        "/api/v1/sql-lab/query",
        json={"sql": "SELECT 1 AS n, 'hello' AS label"},
        headers=INTERNAL_HEADERS,
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert payload["rowCount"] == 1
    assert payload["rows"] == [{"n": 1, "label": "hello"}]
    assert payload["columns"][0]["alignment"] == "right"
    assert payload["columns"][1]["alignment"] == "left"


def test_query_reads_catalog_table(client):
    response = client.post(
        "/api/v1/sql-lab/query",
        json={
            "sql": (
                "SELECT region, COUNT(*) AS orders "
                "FROM orders GROUP BY region ORDER BY region"
            )
        },
        headers=INTERNAL_HEADERS,
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert payload["rowCount"] == 4
    assert {"region", "orders"} == {column["name"] for column in payload["columns"]}


def test_empty_result_is_reported_as_empty(client):
    response = client.post(
        "/api/v1/sql-lab/query",
        json={"sql": "SELECT * FROM orders WHERE order_id < 0"},
        headers=INTERNAL_HEADERS,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "empty"


def test_large_result_is_capped(client):
    response = client.post(
        "/api/v1/sql-lab/query",
        json={"sql": "SELECT * FROM range(0, 2500) AS t(n)"},
        headers=INTERNAL_HEADERS,
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["rowCount"] == 1000
    assert payload["truncated"] is True


def test_mutation_is_rejected(client):
    response = client.post(
        "/api/v1/sql-lab/query",
        json={"sql": "DELETE FROM orders"},
        headers=INTERNAL_HEADERS,
    )
    assert response.status_code == 400
    assert "read-only" in response.json()["error"]["message"]


def test_multi_statement_is_rejected(client):
    response = client.post(
        "/api/v1/sql-lab/query",
        json={"sql": "SELECT 1; SELECT 2;"},
        headers=INTERNAL_HEADERS,
    )
    assert response.status_code == 400
    assert "one SQL statement" in response.json()["error"]["message"]


def test_external_file_access_is_blocked(client):
    response = client.post(
        "/api/v1/sql-lab/query",
        json={"sql": "SELECT * FROM read_csv_auto('C:/Windows/win.ini')"},
        headers=INTERNAL_HEADERS,
    )
    assert response.status_code == 400


def test_blank_query_is_rejected(client):
    response = client.post(
        "/api/v1/sql-lab/query",
        json={"sql": "   "},
        headers=INTERNAL_HEADERS,
    )
    assert response.status_code == 400
