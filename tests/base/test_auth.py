"""TASK-B01 真实测试证据（HTTP + 单元 + 静态断言）。

运行：.venv/Scripts/python.exe -m pytest tests/base/test_auth.py -q
使用独立临时数据库，避免污染 P10 运行时 data/wenmian.db。
"""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.base.accounts.repository import AccountsRepository
from app.base.auth.dependencies import SessionContext, require_full_auth
from app.base.auth.repository import LoginAttemptsRepository
from app.base.auth.service import Argon2idService, AuthService
from app.base.bootstrap import app
from app.common.db import ConnectionFactory
from app.common.errors import AppError
from app.common.security import hash_token, new_uuid

ROOT = Path(__file__).resolve().parents[2]
SENTINEL_ID = "SNO-SENTINEL-7788"
GOOD_PASSWORD = "Passw0rd!"


def _make_account(factory: ConnectionFactory, *, student_no: str = SENTINEL_ID,
                  password: str = GOOD_PASSWORD, must_change: bool = False,
                  role: str = "student") -> dict:
    service_hash = Argon2idService(2, 16384, 2).hash(password)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return AccountsRepository(factory).create({
        "account_id": new_uuid(),
        "student_no": student_no,
        "display_name": "测试账号",
        "role": role,
        "account_source": "roster_import",
        "password_hash": service_hash,
        "password_algo": "argon2id",
        "must_change_password": 1 if must_change else 0,
        "status": "active",
        "created_at": now,
        "updated_at": now,
    })


@pytest.fixture()
def auth_client(tmp_path):
    from dataclasses import replace
    # 让 lifespan 也使用临时库：否则 TestClient 启动会先迁移真实 data/wenmian.db
    original = app.state.settings
    raw = {k: dict(v) if isinstance(v, dict) else v for k, v in original.raw.items()}
    raw["db"]["path"] = str(tmp_path / "lifespan.db")
    raw["logging"]["dir"] = str(tmp_path / "logs")
    app.state.settings = replace(original, raw=raw)
    try:
        with TestClient(app) as client:
            factory = app.state.factory
            app.state.auth_service = None
            yield client, factory
    finally:
        app.state.settings = original


def _login(client: TestClient, student_no: str, password: str):
    return client.post("/api/v2/auth/login", json={"student_no": student_no, "password": password})


def _bearer(token: str) -> dict:
    return {"Authorization": "Bearer " + token}


def _session_context(service: AuthService, token: str) -> SessionContext:
    session, account = service.resolve_session(token)
    return SessionContext(service, session, account, hash_token(token))


def test_0001_migration_tables(auth_client):
    _, factory = auth_client
    conn = factory.connect()
    try:
        versions = [r[0] for r in conn.execute("SELECT version FROM schema_migrations ORDER BY version")]
        assert any(v.startswith("0001") for v in versions)
        tables = {r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        assert {"accounts", "sessions", "login_attempts"} <= tables
        cols = {r[1] for r in conn.execute("PRAGMA table_info(login_attempts)")}
        assert "student_no_hash" in cols and "student_no" not in cols
        scols = {r[1] for r in conn.execute("PRAGMA table_info(sessions)")}
        assert "csrf_token_hash" in scols and "csrf_token" not in scols
    finally:
        conn.close()


def test_login_success_me_logout_and_reuse(auth_client):
    client, factory = auth_client
    acc = _make_account(factory)
    response = _login(client, SENTINEL_ID, GOOD_PASSWORD)
    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["account"]["role"] == "student"
    assert data["account"]["must_change_password"] is False
    assert data["account"]["courses"] == []
    assert data["session_token"] and data["csrf_token"]
    assert SENTINEL_ID not in response.text and GOOD_PASSWORD not in response.text

    token, csrf = data["session_token"], data["csrf_token"]
    me = client.get("/api/v2/auth/me", headers=_bearer(token))
    assert me.status_code == 200
    assert me.json()["data"]["account_id"] == acc["account_id"]

    out = client.post("/api/v2/auth/logout", headers={**_bearer(token), "X-CSRF-Token": csrf})
    assert out.status_code == 200
    reuse = client.get("/api/v2/auth/me", headers=_bearer(token))
    assert reuse.status_code == 401
    assert reuse.json()["error"]["code"] == "AUTH_SESSION_EXPIRED"


def test_missing_account_and_wrong_password_same_error(auth_client, monkeypatch):
    client, factory = auth_client
    _make_account(factory)
    service: AuthService = app.state.auth_service or AuthService(
        app.state.settings, factory, app.state.logger)
    calls = {"n": 0}
    original = service.passwords.verify

    def spy(encoded, plain):
        calls["n"] += 1
        return original(encoded, plain)

    monkeypatch.setattr(service.passwords, "verify", spy)
    app.state.auth_service = service
    wrong = _login(client, SENTINEL_ID, "WrongPass1")
    missing = _login(client, "SNO-NOT-EXIST-001", "WrongPass1")
    assert wrong.status_code == missing.status_code == 401
    assert wrong.json()["error"]["code"] == missing.json()["error"]["code"] == "AUTH_INVALID_CREDENTIALS"
    assert wrong.json()["error"]["message"] == missing.json()["error"]["message"]
    # 账号不存在也执行一次哑哈希校验（时间侧信道抹平）
    assert calls["n"] == 2


def test_dual_dimension_rate_limit_and_locked_correct_password(auth_client):
    client, factory = auth_client
    _make_account(factory)
    for _ in range(5):
        r = _login(client, SENTINEL_ID, "WrongPass1")
        assert r.status_code == 401
    locked = _login(client, SENTINEL_ID, GOOD_PASSWORD)
    assert locked.status_code == 423
    assert locked.json()["error"]["code"] == "AUTH_ACCOUNT_LOCKED"
    assert "locked_until" in locked.json()["error"]["details"]

    # 双维度计数：同学号不同 IP 累加；不同学号同 IP 不互相累加
    attempts = LoginAttemptsRepository(factory)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    student_a = "A" * 64
    student_b = "B" * 64
    attempts.add(student_a, "ip-x", succeeded=False, now=now)
    attempts.add(student_a, "ip-y", succeeded=False, now=now)
    attempts.add(student_b, "ip-x", succeeded=False, now=now)
    since = (datetime.now(timezone.utc) - timedelta(minutes=15)).strftime("%Y-%m-%dT%H:%M:%SZ")
    by_a, by_ip_x = attempts.count_failed_since(student_a, "ip-x", since)
    assert by_a == 2 and by_ip_x == 2
    by_b, _ = attempts.count_failed_since(student_b, "ip-z", since)
    assert by_b == 1


def test_must_change_password_whitelist_server_side(auth_client):
    client, factory = auth_client
    _make_account(factory, must_change=True)
    login = _login(client, SENTINEL_ID, GOOD_PASSWORD)
    assert login.status_code == 200
    token = login.json()["data"]["session_token"]
    csrf = login.json()["data"]["csrf_token"]

    me = client.get("/api/v2/auth/me", headers=_bearer(token))
    assert me.status_code == 200
    assert me.json()["data"]["courses"] == []

    service: AuthService = AuthService(app.state.settings, factory, app.state.logger)
    ctx = _session_context(service, token)
    forbidden = SimpleNamespace(url=SimpleNamespace(path="/api/v2/grades"))
    with pytest.raises(AppError) as exc:
        require_full_auth(forbidden, ctx)
    assert exc.value.code == "PERM_PASSWORD_CHANGE_REQUIRED"

    changed = client.post("/api/v2/auth/change-password", headers={**_bearer(token), "X-CSRF-Token": csrf},
                          json={"old_password": GOOD_PASSWORD, "new_password": "NewPassw0rd"})
    assert changed.status_code == 200, changed.text
    assert changed.json()["data"]["must_change_password"] is False
    require_full_auth(forbidden, _session_context(service, token))  # 通过后不再拦截


def test_change_password_revokes_other_sessions_and_old_password_fails(auth_client):
    client, factory = auth_client
    _make_account(factory)
    first = _login(client, SENTINEL_ID, GOOD_PASSWORD).json()["data"]
    second = _login(client, SENTINEL_ID, GOOD_PASSWORD).json()["data"]
    changed = client.post(
        "/api/v2/auth/change-password",
        headers={**_bearer(second["session_token"]), "X-CSRF-Token": second["csrf_token"]},
        json={"old_password": GOOD_PASSWORD, "new_password": "NewPassw0rd"},
    )
    assert changed.status_code == 200
    stale = client.get("/api/v2/auth/me", headers=_bearer(first["session_token"]))
    assert stale.status_code == 401
    old_login = _login(client, SENTINEL_ID, GOOD_PASSWORD)
    assert old_login.status_code == 401
    new_login = _login(client, SENTINEL_ID, "NewPassw0rd")
    assert new_login.status_code == 200


def test_csrf_required_and_argon2id_storage(auth_client):
    client, factory = auth_client
    _make_account(factory)
    data = _login(client, SENTINEL_ID, GOOD_PASSWORD).json()["data"]
    no_csrf = client.post("/api/v2/auth/logout", headers=_bearer(data["session_token"]))
    assert no_csrf.status_code == 403
    conn = factory.connect()
    try:
        stored = conn.execute("SELECT password_hash FROM accounts WHERE student_no=?", (SENTINEL_ID,)).fetchone()[0]
        assert stored.startswith("$argon2id$")
    finally:
        conn.close()


def test_no_plaintext_in_response_or_log(auth_client, tmp_path):
    client, factory = auth_client
    _make_account(factory)
    response = _login(client, SENTINEL_ID, GOOD_PASSWORD)
    assert SENTINEL_ID not in response.text
    assert GOOD_PASSWORD not in response.text
    log_file = tmp_path / "logs" / "app.log"
    if log_file.exists():
        tail = log_file.read_text(encoding="utf-8", errors="ignore")[-200000:]
        assert SENTINEL_ID not in tail
        assert GOOD_PASSWORD not in tail


def test_login_page_has_no_sidebar_nav():
    html = (ROOT / "web" / "login" / "login.html").read_text(encoding="utf-8")
    assert "<nav" not in html
    assert "ed-spine" not in html
    assert 'id="pwLayer"' in html


def test_openapi_contract_snapshot(auth_client):
    client, _ = auth_client
    spec = client.get("/api/v2/openapi.json").json()
    for path in ("/api/v2/auth/login", "/api/v2/auth/logout", "/api/v2/auth/me",
                 "/api/v2/auth/change-password"):
        assert path in spec["paths"], path
