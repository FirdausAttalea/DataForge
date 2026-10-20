"""CSRF double-submit token helpers (P1-T06)."""
import hmac
import secrets

CSRF_COOKIE = "df_csrf"
CSRF_HEADER = "X-CSRF-Token"
CSRF_TOKEN_BYTES = 32


def new_csrf_token() -> str:
    return secrets.token_urlsafe(CSRF_TOKEN_BYTES)


def tokens_match(cookie_value: str | None, header_value: str | None) -> bool:
    """Constant-time comparison. Missing values never match."""
    if not cookie_value or not header_value:
        return False
    return hmac.compare_digest(cookie_value.encode(), header_value.encode())