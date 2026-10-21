"""Reusable FastAPI dependencies for authentication and project access (P1-T07)."""
import uuid
from collections.abc import Callable

from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session as DbSession

from dataforge.database import get_db
from dataforge.models.project import ProjectMember
from dataforge.models.user import User
from dataforge.services import auth as auth_service
from dataforge.services import projects as project_service


def get_current_user(
    df_session: str | None = Cookie(default=None),
    db: DbSession = Depends(get_db),
) -> User:
    user = auth_service.get_user_for_token(db, df_session) if df_session else None
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return user


def require_project_access(minimum_role: str) -> Callable[..., ProjectMember]:
    # Fail at startup, not on the first request, if a route uses an unknown role.
    if minimum_role not in project_service.ROLE_RANK:
        raise ValueError(f"Unknown required role: {minimum_role}")

    def dependency(
        project_id: uuid.UUID,
        user: User = Depends(get_current_user),
        db: DbSession = Depends(get_db),
    ) -> ProjectMember:
        membership = project_service.get_membership(db, project_id, user.id)
        if membership is None:
            # Same response whether the project is missing or the user is not a member.
            raise HTTPException(status_code=404, detail="Project not found.")
        if not project_service.role_satisfies(membership.role, minimum_role):
            raise HTTPException(status_code=403, detail="Insufficient project role.")
        return membership

    return dependency