from datetime import datetime, timedelta, timezone

from dataforge.security.sessions import (
    SESSION_TTL,
    hash_session_token,
    is_expired,
    new_session_token,
    session_expiry,
)


def test_tokens_are_unique():
    assert new_session_token() != new_session_token()


def test_token_has_enough_entropy():
    # 32 bytes urlsafe-encoded is 43 characters.
    assert len(new_session_token()) >= 43


def test_hash_is_deterministic_and_not_plaintext():
    t = new_session_token()
    assert hash_session_token(t) == hash_session_token(t)
    assert t not in hash_session_token(t)
    assert len(hash_session_token(t)) == 64


def test_expiry_is_seven_days_out():
    now = datetime(2026, 10, 16, tzinfo=timezone.utc)
    assert session_expiry(now) - now == SESSION_TTL


def test_expired_session_is_detected():
    now = datetime(2026, 10, 16, tzinfo=timezone.utc)
    assert is_expired(now - timedelta(seconds=1), now) is True


def test_session_at_exact_expiry_is_expired():
    now = datetime(2026, 10, 16, tzinfo=timezone.utc)
    assert is_expired(now, now) is True


def test_future_session_is_not_expired():
    now = datetime(2026, 10, 16, tzinfo=timezone.utc)
    assert is_expired(now + timedelta(minutes=1), now) is False