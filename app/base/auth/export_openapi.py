"""导出 B01 组合后的 OpenAPI 快照（不覆盖 P10 冻结的 openapi.json）。

用法：.venv/Scripts/python.exe -m app.base.auth.export_openapi
"""
from __future__ import annotations

import json
from pathlib import Path

from app.base.bootstrap import app

OUT = Path(__file__).resolve().parents[3] / "docs" / "evidence" / "P11_auth_openapi.json"


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    spec = app.openapi()
    OUT.write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"WROTE {OUT} paths={list(spec['paths'])}")


if __name__ == "__main__":
    main()
