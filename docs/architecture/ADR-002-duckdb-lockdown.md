# ADR-002: DuckDB Lockdown for User SQL Execution

Status: Accepted (spike verified)
Date: 16 Oct 2026
Task: P1-T02

## Context
User-authored SQL must not read or write host files, load extensions, reach the network, or change its own configuration.

## Decision
The worker loads pinned dataset views first, then applies these settings and locks configuration:
- memory_limit = 256MB, threads = 1, temp_directory = '' (no spill to disk)
- autoinstall and autoload of known extensions disabled
- allow_community_extensions = false
- enable_external_access = false
- lock_configuration = true

## Verification
Spike script: scripts/spike/duckdb_lockdown_spike.py
DuckDB version: 1.5.6
Result: 0 setting errors, 0 leaks, 0 functional failures.
Blocked: local file read, directory glob, file write, ATTACH, INSTALL, LOAD, HTTP read, re-enabling external access, changing threads after lock.
getenv is absent in this build (not a configuration block).

## Not yet covered
- Runaway-query timeouts and memory enforcement under load (P1-T29)
- Container-level network isolation for the worker (P1-T28)
- Statement validation for COPY, PRAGMA, SET, ATTACH (P1-T27)

## Consequences
- Any DuckDB upgrade requires re-running the spike before merging.
- Dataset files must be loaded by the worker before the lockdown is applied.