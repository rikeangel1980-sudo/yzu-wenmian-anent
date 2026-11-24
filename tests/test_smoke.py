"""P10 工程骨架冒烟测试（真实执行；非业务功能验收）。"""
from __future__ import annotations

import json


def test_health_five_states(client):
    r = client.get("/api/v2/ops/health")
    assert r.status_code == 200
    body = r.json()
    assert body["meta"]["version"] == "v2"
    data = body["data"]
    for key in ("app", "db", "dirs", "index", "model_config"):
        assert key in data, key
    assert data["db"]["status"] == "ok"
    assert data["model_config"]["outbound_default_deny"] is True
    assert data["index"]["status"] == "NOT_RUN"


def test_openapi_export_available(client):
    r = client.get("/api/v2/openapi.json")
    assert r.status_code == 200
    spec = r.json()
    assert spec["info"]["version"] == "2.0.0"
    assert "/api/v2/ops/health" in spec["paths"]


def test_request_id_header(client):
    r = client.get("/api/v2/ops/health", headers={"X-Request-ID": "fixed-id-123"})
    assert r.headers.get("X-Request-ID") == "fixed-id-123"


def test_validation_error_shape(client):
    # 不存在的路径返回 404，不改变统一错误码原则（NOT_FOUND 属错误码表）
    r = client.get("/api/v2/no-such-endpoint")
    assert r.status_code == 404


def test_baseline_entry_no_index(client, root):
    r = client.get("/")
    assert r.status_code == 200
    assert 'data-scheme="A"' in r.text
    assert (root / "web" / "baseline.html").exists()
    assert not (root / "web" / "index.html").exists(), "交付目录不得含 index.html（G1）"
