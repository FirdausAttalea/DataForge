"""DuckDB lockdown spike (P1-T02). Standalone check, not application code."""
import tempfile
from pathlib import Path

import duckdb


def main() -> int:
    tmp = Path(tempfile.mkdtemp(prefix="df_spike_"))
    data = tmp / "orders.csv"
    data.write_text("order_id,amount\n1,10.5\n2,20.0\n", encoding="utf-8")

    print(f"DuckDB version: {duckdb.__version__}")
    con = duckdb.connect(database=":memory:")

    # Load data while file access is still allowed. This is the only file read the worker should ever do.
    con.execute(f"CREATE TABLE orders AS SELECT * FROM read_csv('{data.as_posix()}')")

    # Lockdown. lock_configuration must come last, or later SET statements will fail.
    lockdown = [
        "SET memory_limit = '256MB'",
        "SET threads = 1",
        "SET temp_directory = ''",
        "SET autoinstall_known_extensions = false",
        "SET autoload_known_extensions = false",
        "SET allow_community_extensions = false",
        "SET enable_external_access = false",
        "SET lock_configuration = true",
    ]
    setting_failures = 0
    print("\n== Applying lockdown ==")
    for stmt in lockdown:
        try:
            con.execute(stmt)
            print(f"OK     {stmt}")
        except duckdb.Error as e:
            setting_failures += 1
            print(f"ERROR  {stmt}\n       {e}")

    print("\n== Read-back of settings ==")
    for name in ["memory_limit", "threads", "enable_external_access", "lock_configuration"]:
        try:
            value = con.execute(f"SELECT current_setting('{name}')").fetchone()[0]
            print(f"{name} = {value}")
        except duckdb.Error as e:
            print(f"{name} = <unreadable: {e}>")

    # Each of these must be BLOCKED. If any returns rows, that is a security failure.
    must_fail = {
        "read local file (read_csv)": f"SELECT * FROM read_csv('{data.as_posix()}')",
        "read local file (read_text)": f"SELECT * FROM read_text('{data.as_posix()}')",
        "list directory (glob)": f"SELECT * FROM glob('{tmp.as_posix()}/*')",
        "write file (COPY TO)": f"COPY (SELECT 1 AS x) TO '{(tmp / 'out.csv').as_posix()}'",
        "attach database file": f"ATTACH '{(tmp / 'x.db').as_posix()}' AS x",
        "install extension": "INSTALL httpfs",
        "load extension": "LOAD httpfs",
        "network read (http)": "SELECT * FROM read_csv('https://example.com/data.csv')",
        "re-enable external access": "SET enable_external_access = true",
        "change threads after lock": "SET threads = 8",
        "read environment variable": "SELECT getenv('PATH')",
    }

    # This must SUCCEED, proving the loaded data is still usable.
    must_succeed = {"query loaded table": "SELECT count(*) FROM orders"}

    leaks = 0
    print("\n== Escape corpus: must be BLOCKED ==")
    for name, sql in must_fail.items():
        try:
            rows = con.execute(sql).fetchall()
            leaks += 1
            print(f"LEAK   {name}: returned {rows[:3]}")
        except duckdb.Error as e:
            print(f"DENIED {name}\n       {str(e).splitlines()[0]}")

    print("\n== Must SUCCEED ==")
    ok_failures = 0
    for name, sql in must_succeed.items():
        try:
            print(f"PASS   {name}: {con.execute(sql).fetchone()}")
        except duckdb.Error as e:
            ok_failures += 1
            print(f"FAIL   {name}: {e}")

    print("\n== Summary ==")
    print(f"Setting errors: {setting_failures}")
    print(f"Leaks (security failures): {leaks}")
    print(f"Functional failures: {ok_failures}")
    return 0 if (setting_failures == 0 and leaks == 0 and ok_failures == 0) else 1


if __name__ == "__main__":
    raise SystemExit(main())