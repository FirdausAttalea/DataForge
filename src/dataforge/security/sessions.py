"""Server-side session tokens (P1-T05). Only the SHA-256 hash of a token is stored."""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

SESSION_TTL = timedelta(days=7)
TOKEN_BYTES = 32  # 256 bits of randomness


def new_session_token() -> str:
    return secrets.token_urlsafe(TOKEN_BYTES)


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def session_expiry(now: datetime | None = None) -> datetime:
    return (now or datetime.now(timezone.utc)) + SESSION_TTL


def is_expired(expires_at: datetime, now: datetime | None = None) -> bool:
    return expires_at <= (now or datetime.now(timezone.utc))