"""Read-only SQL execution for the SQL Lab prototype.

The service runs against a deterministic, in-memory DuckDB database that mirrors
the tables advertised by the frontend catalog. It is intentionally sample data:
the catalog row counts describe the production source, while this local database
contains enough rows to make ad-hoc exploration meaningful.

Only a single read-only statement is accepted. DuckDB external access is disabled
so a query cannot read local files or reach the network.
"""

from __future__ import annotations

import datetime as dt
import decimal
import json
import math
import random
import re
import threading
import time
from typing import Any

import duckdb

MAX_ROWS = 1_000
MAX_SQL_LENGTH = 20_000

_ALLOWED_START = {"SELECT", "WITH", "EXPLAIN", "DESCRIBE", "SHOW", "SUMMARIZE"}
_FORBIDDEN = re.compile(
    r"\b(insert|update|delete|merge|drop|alter|create|truncate|attach|detach|copy|"
    r"export|import|install|load|pragma|set|call|vacuum|checkpoint|grant|revoke|replace)\b",
    re.IGNORECASE,
)

_lock = threading.Lock()
_connection: duckdb.DuckDBPyConnection | None = None


class QueryValidationError(ValueError):
    """Raised when a statement is empty, multi-statement, or not read-only."""


def _mask_literals_and_comments(sql: str) -> str:
    """Replace string literals and comments with spaces, preserving positions.

    The masked string is only used for keyword checks; the original statement is
    the one executed by DuckDB.
    """

    out = list(sql)
    i = 0
    length = len(sql)
    in_single = False
    in_double = False
    in_line_comment = False
    in_block_comment = False

    while i < length:
        char = sql[i]
        nxt = sql[i + 1] if i + 1 < length else ""

        if in_line_comment:
            if char == "\n":
                in_line_comment = False
            else:
                out[i] = " "
            i += 1
            continue

        if in_block_comment:
            out[i] = " "
            if char == "*" and nxt == "/":
                out[i + 1] = " "
                in_block_comment = False
                i += 2
                continue
            i += 1
            continue

        if in_single:
            out[i] = " "
            if char == "'" and nxt == "'":
                out[i + 1] = " "
                i += 2
                continue
            if char == "'":
                in_single = False
            i += 1
            continue

        if in_double:
            out[i] = " "
            if char == '"' and nxt == '"':
                out[i + 1] = " "
                i += 2
                continue
            if char == '"':
                in_double = False
            i += 1
            continue

        if char == "-" and nxt == "-":
            out[i] = " "
            out[i + 1] = " "
            in_line_comment = True
            i += 2
            continue
        if char == "/" and nxt == "*":
            out[i] = " "
            out[i + 1] = " "
            in_block_comment = True
            i += 2
            continue
        if char == "'":
            out[i] = " "
            in_single = True
            i += 1
            continue
        if char == '"':
            out[i] = " "
            in_double = True
            i += 1
            continue

        i += 1

    return "".join(out)


def _semicolons(sql: str) -> list[int]:
    """Return semicolon offsets outside string literals and comments."""

    positions: list[int] = []
    masked = _mask_literals_and_comments(sql)
    for index, char in enumerate(masked):
        if char == ";":
            positions.append(index)
    return positions


def validate_statement(sql: str) -> str:
    """Validate and normalize one read-only SQL statement."""

    if not isinstance(sql, str) or not sql.strip():
        raise QueryValidationError("Enter a SELECT query to run.")
    if len(sql) > MAX_SQL_LENGTH:
        raise QueryValidationError(
            f"Queries are limited to {MAX_SQL_LENGTH:,} characters."
        )

    statement = sql.strip()
    semicolons = _semicolons(statement)
    if len(semicolons) > 1:
        raise QueryValidationError("Only one SQL statement can run at a time.")
    if len(semicolons) == 1:
        position = semicolons[0]
        tail = statement[position + 1 :]
        if _mask_literals_and_comments(tail).strip():
            raise QueryValidationError("Only one SQL statement can run at a time.")
        statement = statement[:position].rstrip()
        if not statement:
            raise QueryValidationError("Enter a SELECT query to run.")

    masked = _mask_literals_and_comments(statement)
    match = re.match(r"\s*([A-Za-z_]+)", masked)
    if match is None or match.group(1).upper() not in _ALLOWED_START:
        raise QueryValidationError(
            "SQL Lab only runs read-only SELECT queries in this environment."
        )
    if _FORBIDDEN.search(masked):
        raise QueryValidationError(
            "SQL Lab only runs read-only SELECT queries in this environment."
        )

    return statement


def _random_datetime(rng: random.Random, start: dt.datetime, days: int) -> dt.datetime:
    value = start + dt.timedelta(
        days=rng.randint(0, days),
        hours=rng.randint(0, 23),
        minutes=rng.randint(0, 59),
        seconds=rng.randint(0, 59),
    )
    return value.replace(microsecond=0)


def _random_date(rng: random.Random, start: dt.date, days: int) -> dt.date:
    return start + dt.timedelta(days=rng.randint(0, days))


def _sql_literal(value: Any) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float, decimal.Decimal)):
        return str(value)
    text = str(value).replace("'", "''")
    return f"'{text}'"


def _insert_rows(
    connection: duckdb.DuckDBPyConnection, table: str, rows: list[tuple[Any, ...]]
) -> None:
    """Insert generated rows in bulk.

    DuckDB's executemany is row-at-a-time and visibly slow for tens of thousands
    of rows; multi-row VALUES keeps first-query startup fast. All values come
    from the deterministic generator above, never from request input.
    """

    chunk_size = 1000
    for start in range(0, len(rows), chunk_size):
        chunk = rows[start : start + chunk_size]
        values = ",".join(
            "(" + ",".join(_sql_literal(value) for value in row) + ")" for row in chunk
        )
        connection.execute(f"INSERT INTO {table} VALUES {values}")


def _seed(connection: duckdb.DuckDBPyConnection) -> None:
    rng = random.Random(20261030)
    start_date = dt.date(2023, 1, 1)

    first_names = [
        "Avery",
        "Jordan",
        "Riley",
        "Casey",
        "Morgan",
        "Taylor",
        "Jamie",
        "Quinn",
        "Alex",
        "Sam",
        "Noah",
        "Mia",
        "Ethan",
        "Sofia",
        "Liam",
        "Ava",
        "Lucas",
        "Emma",
        "Mateo",
        "Isla",
    ]
    last_names = [
        "Nguyen",
        "Patel",
        "Garcia",
        "Kim",
        "Smith",
        "Johnson",
        "Brown",
        "Lee",
        "Martinez",
        "Davis",
        "Lopez",
        "Wilson",
        "Clark",
        "Lewis",
        "Walker",
        "Hall",
        "Young",
        "King",
        "Wright",
        "Scott",
    ]
    countries = [
        "United States",
        "Canada",
        "United Kingdom",
        "Germany",
        "France",
        "Australia",
        "Japan",
        "Singapore",
        "Brazil",
        "India",
    ]
    regions = ["North America", "Europe", "APAC", "LATAM"]
    segments = ["Consumer", "SMB", "Enterprise"]
    categories = [
        "Electronics",
        "Home & Kitchen",
        "Sports & Outdoors",
        "Beauty",
        "Apparel",
    ]
    plans = ["Basic", "Pro", "Enterprise"]
    event_types = ["page_view", "login", "signup", "export", "upgrade"]
    actions = ["login", "view_dashboard", "run_query", "export_csv", "invite_member"]
    tiers = ["Free", "Pro", "Enterprise"]
    billing_statuses = ["paid", "paid", "paid", "pending", "failed"]
    channels = ["Google Ads", "Meta", "LinkedIn", "Email", "Organic"]

    connection.execute(
        """
        CREATE TABLE products (
            product_id VARCHAR PRIMARY KEY,
            name VARCHAR,
            category VARCHAR,
            price DECIMAL(10,2),
            inventory INTEGER,
            created_at TIMESTAMP
        )
        """
    )
    products: list[tuple[Any, ...]] = []
    for index in range(1, 121):
        price = decimal.Decimal(rng.randint(999, 49999)) / decimal.Decimal(100)
        products.append(
            (
                f"PRD-{1000 + index}",
                f"{rng.choice(categories)} Item {index:03d}",
                rng.choice(categories),
                price,
                rng.randint(0, 900),
                _random_datetime(rng, dt.datetime(2023, 1, 1), 700),
            )
        )
    _insert_rows(connection, "products", products)

    connection.execute(
        """
        CREATE TABLE customers (
            customer_id INTEGER PRIMARY KEY,
            email VARCHAR,
            first_name VARCHAR,
            last_name VARCHAR,
            signup_date DATE,
            country VARCHAR,
            segment VARCHAR,
            lifetime_value DECIMAL(12,2)
        )
        """
    )
    customers: list[tuple[Any, ...]] = []
    for customer_id in range(1, 401):
        first = rng.choice(first_names)
        last = rng.choice(last_names)
        customers.append(
            (
                customer_id,
                f"{first.lower()}.{last.lower()}{customer_id}@example.com",
                first,
                last,
                _random_date(rng, start_date, 900),
                rng.choice(countries),
                rng.choice(segments),
                decimal.Decimal(rng.randint(0, 2500000)) / decimal.Decimal(100),
            )
        )
    _insert_rows(connection, "customers", customers)

    connection.execute(
        """
        CREATE TABLE orders (
            order_id INTEGER PRIMARY KEY,
            customer_id INTEGER,
            order_date TIMESTAMP,
            product_id VARCHAR,
            quantity INTEGER,
            revenue DECIMAL(10,2),
            region VARCHAR
        )
        """
    )
    orders: list[tuple[Any, ...]] = []
    order_items: list[tuple[Any, ...]] = []
    item_id = 0
    for order_id in range(1, 6001):
        product = products[rng.randrange(len(products))]
        product_id = product[0]
        price = product[3]
        quantity = rng.randint(1, 5)
        revenue = (price * quantity).quantize(decimal.Decimal("0.01"))
        orders.append(
            (
                order_id,
                rng.randint(1, 400),
                _random_datetime(rng, dt.datetime(2023, 1, 1), 1200),
                product_id,
                quantity,
                revenue,
                rng.choice(regions),
            )
        )
        for _ in range(rng.randint(1, 2)):
            item_id += 1
            order_items.append(
                (
                    item_id,
                    order_id,
                    product_id,
                    quantity,
                    price,
                )
            )
    _insert_rows(connection, "orders", orders)
    connection.execute(
        """
        CREATE TABLE order_items (
            order_item_id INTEGER PRIMARY KEY,
            order_id INTEGER,
            product_id VARCHAR,
            quantity INTEGER,
            unit_price DECIMAL(10,2)
        )
        """
    )
    _insert_rows(connection, "order_items", order_items)

    connection.execute(
        """
        CREATE TABLE subscriptions (
            subscription_id INTEGER PRIMARY KEY,
            customer_id INTEGER,
            start_date DATE,
            end_date DATE,
            plan VARCHAR
        )
        """
    )
    subscriptions: list[tuple[Any, ...]] = []
    for subscription_id in range(1, 601):
        start = _random_date(rng, start_date, 900)
        end = (
            start + dt.timedelta(days=rng.randint(30, 730))
            if rng.random() < 0.35
            else None
        )
        subscriptions.append(
            (subscription_id, rng.randint(1, 400), start, end, rng.choice(plans))
        )
    _insert_rows(connection, "subscriptions", subscriptions)

    connection.execute(
        """
        CREATE TABLE events (
            event_id BIGINT PRIMARY KEY,
            user_id INTEGER,
            event_type VARCHAR,
            timestamp TIMESTAMP,
            properties JSON
        )
        """
    )
    events: list[tuple[Any, ...]] = []
    for event_id in range(1, 3001):
        events.append(
            (
                event_id,
                rng.randint(1, 400),
                rng.choice(event_types),
                _random_datetime(rng, dt.datetime(2024, 1, 1), 900),
                json.dumps(
                    {
                        "source": rng.choice(["web", "mobile", "api"]),
                        "success": rng.random() > 0.1,
                    }
                ),
            )
        )
    _insert_rows(connection, "events", events)

    connection.execute(
        """
        CREATE TABLE activity_logs (
            log_id BIGINT PRIMARY KEY,
            user_id INTEGER,
            action VARCHAR,
            timestamp TIMESTAMP,
            details JSON
        )
        """
    )
    logs: list[tuple[Any, ...]] = []
    for log_id in range(1, 2001):
        logs.append(
            (
                log_id,
                rng.randint(1, 400),
                rng.choice(actions),
                _random_datetime(rng, dt.datetime(2024, 1, 1), 900),
                json.dumps({"ip": f"10.0.{rng.randint(0, 255)}.{rng.randint(1, 254)}"}),
            )
        )
    _insert_rows(connection, "activity_logs", logs)

    connection.execute(
        """
        CREATE TABLE orgs (
            org_id INTEGER PRIMARY KEY,
            name VARCHAR,
            created_at TIMESTAMP,
            tier VARCHAR,
            active BOOLEAN
        )
        """
    )
    orgs: list[tuple[Any, ...]] = []
    for org_id in range(1, 121):
        orgs.append(
            (
                org_id,
                f"Org {org_id:03d}",
                _random_datetime(rng, dt.datetime(2023, 1, 1), 900),
                rng.choice(tiers),
                rng.random() > 0.15,
            )
        )
    _insert_rows(connection, "orgs", orgs)

    connection.execute(
        """
        CREATE TABLE billings (
            billing_id INTEGER PRIMARY KEY,
            org_id INTEGER,
            amount DECIMAL(12,2),
            period DATE,
            status VARCHAR
        )
        """
    )
    billings: list[tuple[Any, ...]] = []
    for billing_id in range(1, 2401):
        period = dt.date(2024 + rng.randint(0, 2), rng.randint(1, 12), 1)
        billings.append(
            (
                billing_id,
                rng.randint(1, 120),
                decimal.Decimal(rng.randint(4900, 250000)) / decimal.Decimal(100),
                period,
                rng.choice(billing_statuses),
            )
        )
    _insert_rows(connection, "billings", billings)

    connection.execute(
        """
        CREATE TABLE campaigns (
            campaign_id INTEGER PRIMARY KEY,
            name VARCHAR,
            channel VARCHAR,
            start_date DATE,
            budget DECIMAL(12,2)
        )
        """
    )
    campaigns: list[tuple[Any, ...]] = []
    for campaign_id in range(1, 41):
        campaigns.append(
            (
                campaign_id,
                f"{rng.choice(channels)} Campaign {campaign_id:02d}",
                rng.choice(channels),
                _random_date(rng, start_date, 900),
                decimal.Decimal(rng.randint(100000, 5000000)) / decimal.Decimal(100),
            )
        )
    _insert_rows(connection, "campaigns", campaigns)

    connection.execute(
        """
        CREATE TABLE conversions (
            conversion_id INTEGER PRIMARY KEY,
            campaign_id INTEGER,
            user_id INTEGER,
            date DATE,
            revenue DECIMAL(10,2)
        )
        """
    )
    conversions: list[tuple[Any, ...]] = []
    for conversion_id in range(1, 1201):
        conversions.append(
            (
                conversion_id,
                rng.randint(1, 40),
                rng.randint(1, 400),
                _random_date(rng, start_date, 1200),
                decimal.Decimal(rng.randint(1500, 90000)) / decimal.Decimal(100),
            )
        )
    _insert_rows(connection, "conversions", conversions)

    connection.execute(
        """
        CREATE TABLE ad_spends (
            spend_id INTEGER PRIMARY KEY,
            campaign_id INTEGER,
            channel VARCHAR,
            date DATE,
            amount DECIMAL(10,2)
        )
        """
    )
    spends: list[tuple[Any, ...]] = []
    for spend_id in range(1, 1201):
        spends.append(
            (
                spend_id,
                rng.randint(1, 40),
                rng.choice(channels),
                _random_date(rng, start_date, 1200),
                decimal.Decimal(rng.randint(500, 25000)) / decimal.Decimal(100),
            )
        )
    _insert_rows(connection, "ad_spends", spends)


def get_connection() -> duckdb.DuckDBPyConnection:
    """Return the lazily initialized sample database."""

    global _connection
    if _connection is None:
        connection = duckdb.connect(database=":memory:")
        connection.execute("SET enable_external_access=false")
        _seed(connection)
        _connection = connection
    return _connection


def reset_connection() -> None:
    """Drop the singleton (used by tests)."""

    global _connection
    with _lock:
        if _connection is not None:
            _connection.close()
            _connection = None


def _display_type(duckdb_type: Any) -> str:
    name = str(duckdb_type).upper()
    replacements = {
        "BIGINT": "BIGINT",
        "INTEGER": "INT",
        "SMALLINT": "INT",
        "TINYINT": "INT",
        "HUGEINT": "BIGINT",
        "UBIGINT": "BIGINT",
        "UINTEGER": "INT",
        "USMALLINT": "INT",
        "UTINYINT": "INT",
        "FLOAT": "FLOAT",
        "DOUBLE": "DOUBLE",
        "BOOLEAN": "BOOLEAN",
        "DATE": "DATE",
        "TIME": "TIME",
        "TIMESTAMP": "TIMESTAMP",
        "TIMESTAMP WITH TIME ZONE": "TIMESTAMP",
        "VARCHAR": "VARCHAR",
        "JSON": "JSON",
        "BLOB": "BLOB",
        "UUID": "UUID",
    }
    if name.startswith("DECIMAL"):
        return name
    return replacements.get(name, name)


def _is_numeric(display_type: str) -> bool:
    return display_type.startswith(
        (
            "INT",
            "BIGINT",
            "SMALLINT",
            "TINYINT",
            "HUGEINT",
            "DECIMAL",
            "DOUBLE",
            "FLOAT",
            "NUMERIC",
            "REAL",
        )
    )


def _cell(value: Any) -> str | int | float | None:
    if value is None:
        return None
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return None if not math.isfinite(value) else value
    if isinstance(value, decimal.Decimal):
        return float(value)
    if isinstance(value, (dt.datetime, dt.date, dt.time)):
        return (
            value.isoformat(sep=" ")
            if isinstance(value, dt.datetime)
            else value.isoformat()
        )
    if isinstance(value, (bytes, bytearray, memoryview)):
        return bytes(value).hex()
    return str(value)


def _dedupe_names(description: list[tuple[Any, ...]]) -> list[str]:
    names: list[str] = []
    counts: dict[str, int] = {}
    for entry in description:
        base = str(entry[0])
        counts[base] = counts.get(base, 0) + 1
        names.append(base if counts[base] == 1 else f"{base}_{counts[base]}")
    return names


def run_query(sql: str) -> dict[str, Any]:
    """Execute one read-only query and return a serializable result."""

    statement = validate_statement(sql)
    started = time.perf_counter()

    try:
        with _lock:
            connection = get_connection()
            cursor = connection.cursor()
            try:
                cursor.execute(statement)
                if cursor.description is None:
                    raise QueryValidationError(
                        "SQL Lab only runs queries that return rows."
                    )
                description = list(cursor.description)
                raw_rows = cursor.fetchmany(MAX_ROWS + 1)
            finally:
                cursor.close()
    except QueryValidationError:
        raise
    except duckdb.Error as exc:
        message = str(exc).strip() or "The query could not be executed."
        raise QueryValidationError(message) from exc

    truncated = len(raw_rows) > MAX_ROWS
    raw_rows = raw_rows[:MAX_ROWS]
    names = _dedupe_names(description)
    columns = [
        {
            "name": name,
            "type": _display_type(entry[1]),
            "alignment": "right" if _is_numeric(_display_type(entry[1])) else "left",
        }
        for name, entry in zip(names, description, strict=True)
    ]
    rows = [
        {name: _cell(value) for name, value in zip(names, raw_row, strict=True)}
        for raw_row in raw_rows
    ]

    duration_ms = max(1, round((time.perf_counter() - started) * 1000))
    estimated_bytes = sum(len(name) + 16 for name in names) * max(len(rows), 1)

    return {
        "status": "success" if rows else "empty",
        "columns": columns,
        "rows": rows,
        "rowCount": len(rows),
        "durationMs": duration_ms,
        "engineVersion": f"DuckDB {duckdb.__version__}",
        "memoryMb": round(max(0.1, estimated_bytes / (1024 * 1024)), 2),
        "truncated": truncated,
    }
