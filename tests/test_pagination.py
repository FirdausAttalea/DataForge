import base64

import pytest

from dataforge.errors import AppError
from dataforge.pagination import (
    DEFAULT_LIMIT,
    MAX_LIMIT,
    build_page,
    clamp_limit,
    decode_cursor,
    encode_cursor,
)


def _raw_cursor(payload: bytes) -> str:
    return base64.urlsafe_b64encode(payload).decode().rstrip("=")


def test_default_limit_when_none():
    assert clamp_limit(None) == DEFAULT_LIMIT


def test_limit_at_maximum_accepted():
    assert clamp_limit(MAX_LIMIT) == MAX_LIMIT


@pytest.mark.parametrize("bad", [0, -1, MAX_LIMIT + 1, 100_000])
def test_out_of_range_limit_rejected(bad):
    with pytest.raises(AppError) as exc:
        clamp_limit(bad)
    assert exc.value.status_code == 422


def test_cursor_round_trip():
    key = {"created_at": "2026-10-20T10:00:00+00:00", "id": "abc"}
    assert decode_cursor(encode_cursor(key)) == key


def test_no_cursor_means_first_page():
    assert decode_cursor(None) is None
    assert decode_cursor("") is None


def test_malformed_cursor_rejected():
    with pytest.raises(AppError) as exc:
        decode_cursor("!!!not-base64!!!")
    assert exc.value.status_code == 422


def test_cursor_that_is_not_an_object_rejected():
    with pytest.raises(AppError):
        decode_cursor(_raw_cursor(b"[1, 2, 3]"))


def test_cursor_with_invalid_utf8_rejected():
    with pytest.raises(AppError):
        decode_cursor(_raw_cursor(b"\xff\xfe\x00"))


def test_build_page_reports_more_when_extra_row_present():
    rows = [{"id": i} for i in range(4)]  # limit 3, so one extra row
    page, cursor = build_page(rows, limit=3, key_of=lambda r: {"id": r["id"]})
    assert [r["id"] for r in page] == [0, 1, 2]
    assert decode_cursor(cursor) == {"id": 2}


def test_build_page_has_no_cursor_on_last_page():
    rows = [{"id": 0}, {"id": 1}]
    page, cursor = build_page(rows, limit=3, key_of=lambda r: {"id": r["id"]})
    assert len(page) == 2
    assert cursor is None


def test_build_page_handles_empty_result():
    page, cursor = build_page([], limit=3, key_of=lambda r: {"id": r})
    assert page == []
    assert cursor is None