# ADR-003: Password Hashing with Argon2id

Status: Accepted
Date: 16 Oct 2026
Task: P1-T04

## Context
DataForge stores user passwords. Passwords must be hashed with a memory-hard algorithm, resist GPU attacks, and never be stored or logged in plain text.

## Decision
- Use Argon2id via argon2-cffi with library default parameters.
- Enforce a minimum length of 12 and a maximum length of 128 characters. The maximum prevents oversized inputs from consuming CPU during hashing.
- Expose hash_password and verify_password only. verify_password returns False for malformed hashes and never raises on bad input.

## Alternatives considered
- bcrypt: widely used, but it truncates input at 72 bytes and is not memory-hard.
- PBKDF2: acceptable, but weaker against GPU attacks than Argon2id.

## Consequences
- Hashes start with $argon2id$, so they can be upgraded later with rehash-on-login.
- Parameters are fixed by the library version. Changing them requires a rehash plan.
- Password policy is length-only in P0. Complexity rules are not enforced.

## Verification
Unit tests: tests/test_passwords.py (11 tests, all passing on 16 Oct 2026).