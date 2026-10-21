"""Cursor pagination helpers (P1-T11). Cursors are opaque, validated, and bounded."""
import base64
import json
from collections.abc import Callable, Sequence
from typing import Any, TypeVar

from dataforge.errors import AppError, ErrorCode

DEFAULT_LIMIT = 20
MAX_LIMIT = 100

T = TypeVar("T")


def clamp_limit(limit: int | None) -> int:
    """Return a safe page size, or reject values outside 1 to MAX_LIMIT."""
    if limit is None:
        return DEFAULT_LIMIT
    if limit < 1 or limit > MAX_LIMIT:
        raise AppError(
            ErrorCode.VALIDATION_ERROR,
            f"limit must be between 1 and {MAX_LIMIT}.",
            422,
        )
    return limit


def encode_cursor(key: dict[str, Any]) -> str:
    raw = json.dumps(key, separators=(",", ":"), sort_keys=True, default=str).encode()
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def decode_cursor(cursor: str | None) -> dict[str, Any] | None:
    """Return the sort key stored in a cursor, or None when no cursor was given."""
    if not cursor:
        return None
    padded = cursor + "=" * (-len(cursor) % 4)
    try:
        value = json.loads(base64.urlsafe_b64decode(padded.encode()))
    except ValueError:  # covers bad base64, bad JSON, and bad UTF-8
        raise AppError(ErrorCode.VALIDATION_ERROR, "Invalid cursor.", 422)
    if not isinstance(value, dict):
        raise AppError(ErrorCode.VALIDATION_ERROR, "Invalid cursor.", 422)
    return value


def build_page(
    rows: Sequence[T],
    limit: int,
    key_of: Callable[[T], dict[str, Any]],
) -> tuple[list[T], str | None]:
    """Take the extra row fetched by the query and return (page rows, next cursor)."""
    has_more = len(rows) > limit
    page = list(rows[:limit])
    next_cursor = encode_cursor(key_of(page[-1])) if has_more and page else None
    return page, next_cursor