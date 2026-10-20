"""Password hashing with Argon2id (P1-T04)."""
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

MIN_LENGTH = 12
MAX_LENGTH = 128  # Caps hashing cost; prevents oversized-input abuse.

# argon2-cffi defaults to Argon2id with library-tuned costs.
_hasher = PasswordHasher()


class PasswordPolicyError(ValueError):
    """Raised when a password does not meet the length policy."""


def validate_password(password: str) -> None:
    if len(password) < MIN_LENGTH:
        raise PasswordPolicyError(f"Password must be at least {MIN_LENGTH} characters.")
    if len(password) > MAX_LENGTH:
        raise PasswordPolicyError(f"Password must be at most {MAX_LENGTH} characters.")


def hash_password(password: str) -> str:
    validate_password(password)
    return _hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    """Return True only for a matching password. Never raises on bad input."""
    try:
        return _hasher.verify(password_hash, password)
    except (VerificationError, InvalidHashError):
        return False