"""Auth business logic (P1-T05). No FastAPI imports here."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession

from dataforge.models.session import Session as UserSession
from dataforge.models.user import User
from dataforge.security.passwords import hash_password, verify_password
from dataforge.security.sessions import (
    hash_session_token,
    is_expired,
    new_session_token,
    session_expiry,
)


class AuthError(Exception):
    """Generic auth failure. Never reveal whether the email exists."""


def normalize_email(email: str) -> str:
    return email.strip().lower()


def register_user(db: DbSession, email: str, password: str) -> User:
    email = normalize_email(email)
    if db.scalar(select(User).where(User.email == email)) is not None:
        raise AuthError("Registration failed.")
    user = User(email=email, password_hash=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: DbSession, email: str, password: str) -> str:
    """Return a raw session token. Store only its hash."""
    user = db.scalar(select(User).where(User.email == normalize_email(email)))
    # Verify even when the user is missing, so response timing does not reveal existence.
    stored_hash = user.password_hash if user else _DUMMY_HASH
    password_ok = verify_password(stored_hash, password)
    if user is None or not user.is_active or not password_ok:
        raise AuthError("Invalid email or password.")

    token = new_session_token()
    db.add(UserSession(
        id=hash_session_token(token),
        user_id=user.id,
        expires_at=session_expiry(),
    ))
    db.commit()
    return token


def logout_session(db: DbSession, token: str) -> None:
    row = db.get(UserSession, hash_session_token(token))
    if row is not None:
        db.delete(row)
        db.commit()


def get_user_for_token(db: DbSession, token: str) -> User | None:
    row = db.get(UserSession, hash_session_token(token))
    if row is None or is_expired(row.expires_at):
        return None
    return db.get(User, row.user_id)


# A valid Argon2 hash of a random value, used only to equalize login timing.
_DUMMY_HASH = hash_password("timing-equalizer-not-a-real-password-0")