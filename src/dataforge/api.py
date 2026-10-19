from fastapi import FastAPI, Response
from sqlalchemy import create_engine, text

from dataforge.config import settings

app = FastAPI(title="DataForge API", version="0.1.0")


def check_postgres() -> bool:
    engine = create_engine(settings.database_url, pool_pre_ping=True)
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    finally:
        engine.dispose()


@app.get("/health")
def health(response: Response) -> dict:
    checks: dict[str, str] = {}
    try:
        checks["postgres"] = "ok" if check_postgres() else "error"
    except Exception:
        # Never return the exception text: it can contain the connection string.
        checks["postgres"] = "error"

    all_ok = all(v == "ok" for v in checks.values())
    if not all_ok:
        response.status_code = 503
    return {"status": "ok" if all_ok else "error", "checks": checks}