import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from dataforge.config import settings

TEST_DB_NAME = "dataforge_test"


def _test_url() -> str:
    return (
        f"postgresql+psycopg://{settings.postgres_user}:{settings.postgres_password}"
        f"@{settings.postgres_host}:{settings.postgres_port}/{TEST_DB_NAME}"
    )


@pytest.fixture(scope="session", autouse=True)
def _migrated_test_db():
    url = _test_url()
    # Safety guard: never run tests against a database that is not clearly a test database.
    if not url.endswith(f"/{TEST_DB_NAME}"):
        raise RuntimeError(f"Refusing to run tests against non-test database: {url.rsplit('/', 1)[-1]}")
    cfg = Config("alembic.ini")
    cfg.set_main_option("sqlalchemy.url", url)
    command.upgrade(cfg, "head")  # upgrade only; never downgrade in tests
    yield


@pytest.fixture()
def client(monkeypatch):
    import dataforge.database as database

    engine = create_engine(_test_url(), pool_pre_ping=True)
    monkeypatch.setattr(
        database,
        "SessionLocal",
        sessionmaker(bind=engine, autoflush=False, expire_on_commit=False),
    )
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE sessions, users CASCADE"))

    from dataforge.api import app

    with TestClient(app) as c:
        yield c
    engine.dispose()