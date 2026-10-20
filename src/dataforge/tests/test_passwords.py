import pytest

from dataforge.security.passwords import (
    MAX_LENGTH,
    MIN_LENGTH,
    PasswordPolicyError,
    hash_password,
    verify_password,
)

GOOD = "correct-horse-battery"


def test_hash_then_verify_correct_password():
    h = hash_password(GOOD)
    assert verify_password(h, GOOD) is True


def test_verify_rejects_wrong_password():
    h = hash_password(GOOD)
    assert verify_password(h, "wrong-password-123") is False


def test_hash_uses_argon2id_format():
    assert hash_password(GOOD).startswith("$argon2id$")


def test_hash_never_contains_plaintext():
    assert GOOD not in hash_password(GOOD)


def test_same_password_produces_different_hashes():
    # Random per-hash salt: identical passwords must not produce identical hashes.
    assert hash_password(GOOD) != hash_password(GOOD)


def test_verify_returns_false_for_malformed_hash():
    assert verify_password("not-a-real-hash", GOOD) is False


def test_verify_returns_false_for_empty_hash():
    assert verify_password("", GOOD) is False


def test_rejects_password_below_minimum_length():
    with pytest.raises(PasswordPolicyError):
        hash_password("x" * (MIN_LENGTH - 1))


def test_accepts_password_at_minimum_length():
    assert verify_password(hash_password("x" * MIN_LENGTH), "x" * MIN_LENGTH)


def test_rejects_password_above_maximum_length():
    with pytest.raises(PasswordPolicyError):
        hash_password("x" * (MAX_LENGTH + 1))


def test_accepts_password_at_maximum_length():
    assert verify_password(hash_password("x" * MAX_LENGTH), "x" * MAX_LENGTH)