"""Project membership and role rules (P1-T07). No FastAPI imports here."""
import uuid

from sqlalchemy.orm import Session as DbSession

from dataforge.models.project import ProjectMember

ROLE_RANK: dict[str, int] = {"viewer": 1, "editor": 2, "owner": 3}


def get_membership(db: DbSession, project_id: uuid.UUID, user_id: uuid.UUID) -> ProjectMember | None:
    return db.get(ProjectMember, (project_id, user_id))


def role_satisfies(actual_role: str, required_role: str) -> bool:
    if required_role not in ROLE_RANK:
        raise ValueError(f"Unknown required role: {required_role}")
    return ROLE_RANK.get(actual_role, 0) >= ROLE_RANK[required_role]