import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from dataforge.error_handlers import register_error_handlers
from dataforge.errors import AppError, ErrorCode


def _app() -> FastAPI:
    app = FastAPI()
    register_error_handlers(app)

    @app.get("/boom")
    def boom():
        raise RuntimeError("secret database password is hunter2")

    @app.get("/app-error")
    def app_error():
        raise AppError(ErrorCode.CONFLICT, "Email already registered.", 409)

    @app.get("/missing")
    def missing():
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Project not found.")

    @app.get("/number/{value}")
    def number(value: int):
        return {"value": value}

    return app


@pytest.fixture()
def c():
    return TestClient(_app(), raise_server_exceptions=False)


def test_envelope_shape_for_http_error(c):
    body = c.get("/missing").json()
    assert set(body) == {"error"}
    assert set(body["error"]) == {"code", "message", "request_id"}
    assert body["error"]["code"] == "NOT_FOUND"
    assert body["error"]["message"] == "Project not found."


def test_app_error_uses_its_own_code(c):
    body = c.get("/app-error").json()
    assert body["error"]["code"] == "CONFLICT"
    assert body["error"]["message"] == "Email already registered."


def test_unhandled_error_hides_internals(c):
    r = c.get("/boom")
    assert r.status_code == 500
    assert r.json()["error"]["code"] == "INTERNAL_ERROR"
    assert "hunter2" not in r.text
    assert "RuntimeError" not in r.text


def test_validation_error_lists_fields_without_values(c):
    r = c.get("/number/not-a-number")
    assert r.status_code == 422
    body = r.json()["error"]
    assert body["code"] == "VALIDATION_ERROR"
    assert "value" in body["message"]
    assert "not-a-number" not in r.text


def test_request_id_header_present(c):
    r = c.get("/missing")
    assert r.headers["X-Request-ID"]
    assert r.json()["error"]["request_id"] == r.headers["X-Request-ID"]