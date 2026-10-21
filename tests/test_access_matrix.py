"""Access matrix (P1-T08): every role against every protected action. To protect a new project route, add one row to ROUTES. The matrix then
checks it against owner, editor, viewer, outsider, and anonymous callers."""
import uuid

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

import dataforge.database as database
from dataforge.models.project import Project, ProjectMember
from dataforge.models.session import Session as UserSession
from dataforge.models.user import User
from dataforge.routes.deps import require_project_access
from dataforge.security.passwords import hash_password
from dataforge.security.sessions import hash_session_token, new_session_token, session_expiry

# (method, path template, minimum role required)
ROUTES = [
    ("GET", "/test/projects/{project_id}/view", "viewer"),
    ("POST", "/test/projects/{project_id}/edit", "editor"),
    ("POST", "/test/projects/{project_id}/delete", "owner"),
]

# Which caller may perform each action. None means anonymous (no session).
ROLE_RANK = {"viewer": 1, "editor": 2, "owner": 3}
CALLERS = ["owner", "editor", "viewer", "outsider", None]


def _build_app() -> FastAPI:
    app = FastAPI()

    @app.get("/test/projects/{project_id}/view")
    def view(project_id: uuid.UUID, m=Depends(require_project_access("viewer"))):
        return {"ok": True}

    @app.post("/test/projects/{project_id}/edit")
    def edit(project_id: uuid.UUID, m=Depends(require_project_access("editor"))):
        return {"ok": True}

    @app.post("/test/projects/{project_id}/delete")
    def delete(project_id: uuid.UUID, m=Depends(require_project_access("owner"))):
        return {"ok": True}

    return app


@pytest.fixture()
def world(client):
    db = database.SessionLocal()
    pw = hash_password("correct-horse-battery")
    users = {
        "owner": User(email="m-owner@example.com", password_hash=pw),
        "editor": User(email="m-editor@example.com", password_hash=pw),
        "viewer": User(email="m-viewer@example.com", password_hash=pw),
        "outsider": User(email="m-outsider@example.com", password_hash=pw),
    }
    db.add_all(users.values())
    db.commit()

    project = Project(name="Matrix project", owner_id=users["owner"].id)
    db.add(project)
    db.commit()

    db.add_all([
        ProjectMember(project_id=project.id, user_id=users["owner"].id, role="owner"),
        ProjectMember(project_id=project.id, user_id=users["editor"].id, role="editor"),
        ProjectMember(project_id=project.id, user_id=users["viewer"].id, role="viewer"),
    ])

    tokens = {}
    for name, user in users.items():
        token = new_session_token()
        db.add(UserSession(id=hash_session_token(token), user_id=user.id, expires_at=session_expiry()))
        tokens[name] = token
    db.commit()
    db.close()
    return project.id, tokens


def _expected_status(caller: str | None, required: str) -> int:
    if caller is None:
        return 401
    if caller == "outsider":
        return 404
    # Members: allowed if their role meets the requirement, otherwise 403.
    return 200 if ROLE_RANK[caller] >= ROLE_RANK[required] else 403


@pytest.mark.parametrize("method,path,required", ROUTES)
@pytest.mark.parametrize("caller", CALLERS, ids=lambda c: c or "anonymous")
def test_access_matrix(world, method, path, required, caller):
    project_id, tokens = world
    c = TestClient(_build_app())
    url = path.format(project_id=project_id)
    cookies = {"df_session": tokens[caller]} if caller else {}
    response = c.request(method, url, cookies=cookies)
    expected = _expected_status(caller, required)
    assert response.status_code == expected, (
        f"{caller or 'anonymous'} on {method} {path} (needs {required}): "
        f"expected {expected}, got {response.status_code}"
    )