"""导出 OpenAPI 契约到 openapi.json（P10 交付成果；入 Git 供 P08 契约核对）。"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.main import app, SETTINGS  # noqa: E402

out = ROOT / "openapi.json"
spec = app.openapi()
out.write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
paths = list(spec.get("paths", {}).keys())
bad = [p for p in paths if not p.startswith(SETTINGS.app["api_prefix"])]
print(f"OPENAPI_EXPORTED {out} paths={len(paths)} non_prefixed={bad}")
if bad:
    raise SystemExit(2)
