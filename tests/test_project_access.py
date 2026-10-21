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


def _make_app() -> FastAPI:
    app = FastAPI()

    @app.get("/test/projects/{project_id}/view")
    def view(project_id: uuid.UUID, m=Depends(require_project_access("viewer"))):
        return {"role": m.role}

    @app.post("/test/projects/{project_id}/edit")
    def edit(project_id: uuid.UUID, m=Depends(require_project_access("editor"))):
        return {"role": m.role}

    @app.post("/test/projects/{project_id}/delete")
    def delete(project_id: uuid.UUID, m=Depends(require_project_access("owner"))):
        return {"role": m.role}

    return app


@pytest.fixture()
def world(client):
    """Seed an owner, a viewer, an outsider, a project, and a session for each."""
    db = database.SessionLocal()
    pw = hash_password("correct-horse-battery")
    owner = User(email="owner@example.com", password_hash=pw)
    viewer = User(email="viewer@example.com", password_hash=pw)
    outsider = User(email="outsider@example.com", password_hash=pw)
    db.add_all([owner, viewer, outsider])
    db.commit()

    project = Project(name="Test project", owner_id=owner.id)
    db.add(project)
    db.commit()

    db.add_all([
        ProjectMember(project_id=project.id, user_id=owner.id, role="owner"),
        ProjectMember(project_id=project.id, user_id=viewer.id, role="viewer"),
    ])

    tokens = {}
    for name, user in [("owner", owner), ("viewer", viewer), ("outsider", outsider)]:
        token = new_session_token()
        db.add(UserSession(id=hash_session_token(token), user_id=user.id, expires_at=session_expiry()))
        tokens[name] = token
    db.commit()
    db.close()
    return project.id, tokens


@pytest.fixture()
def access_client(client):
    return TestClient(_make_app())


def call(c, method, path, token=None):
    c.cookies.clear()
    if token:
        c.cookies.set("df_session", token)
    return c.request(method, path)


def test_viewer_can_view(access_client, world):
    project_id, tokens = world
    r = call(access_client, "GET", f"/test/projects/{project_id}/view", tokens["viewer"])
    assert r.status_code == 200
    assert r.json() == {"role": "viewer"}


def test_viewer_cannot_edit(access_client, world):
    project_id, tokens = world
    r = call(access_client, "POST", f"/test/projects/{project_id}/edit", tokens["viewer"])
    assert r.status_code == 403


def test_owner_can_delete(access_client, world):
    project_id, tokens = world
    r = call(access_client, "POST", f"/test/projects/{project_id}/delete", tokens["owner"])
    assert r.status_code == 200


def test_outsider_gets_404_not_403(access_client, world):
    project_id, tokens = world
    r = call(access_client, "GET", f"/test/projects/{project_id}/view", tokens["outsider"])
    assert r.status_code == 404


def test_missing_project_gives_same_404_as_non_member(access_client, world):
    _, tokens = world
    missing = uuid.uuid4()
    r = call(access_client, "GET", f"/test/projects/{missing}/view", tokens["outsider"])
    assert r.status_code == 404
    assert r.json()["detail"] == "Project not found."


def test_unauthenticated_request_gets_401(access_client, world):
    project_id, _ = world
    r = call(access_client, "GET", f"/test/projects/{project_id}/view")
    assert r.status_code == 401


def test_forged_session_gets_401(access_client, world):
    project_id, _ = world
    r = call(access_client, "GET", f"/test/projects/{project_id}/view", "forged-token")
    assert r.status_code == 401


def test_unknown_role_fails_at_definition_time():
    with pytest.raises(ValueError):
        require_project_access("admin")