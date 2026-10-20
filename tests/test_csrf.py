from dataforge.security.csrf import new_csrf_token, tokens_match


def test_tokens_are_unique():
    assert new_csrf_token() != new_csrf_token()


def test_matching_tokens_accepted():
    t = new_csrf_token()
    assert tokens_match(t, t) is True


def test_mismatched_tokens_rejected():
    assert tokens_match(new_csrf_token(), new_csrf_token()) is False


def test_missing_cookie_rejected():
    assert tokens_match(None, new_csrf_token()) is False


def test_missing_header_rejected():
    assert tokens_match(new_csrf_token(), None) is False


def test_empty_values_rejected():
    assert tokens_match("", "") is False