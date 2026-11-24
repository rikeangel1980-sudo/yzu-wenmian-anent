"""P11 业务组合根：在冻结的 app/main.py 之外挂载业务路由。

P10 冻结资产（app/main.py、app/common/**、config/app.toml、openapi.json）不改动；
本文件位于 app/base/** 内，是 B01 允许新增的范围。
启动：.venv/Scripts/python.exe -m uvicorn app.base.bootstrap:app --host 127.0.0.1 --port 8787
后续任务在本组合根内继续 include 各自 router；不修改 P10 文件。
"""
from __future__ import annotations

from app.base.auth.routes import page_router as auth_page_router
from app.base.auth.routes import router as auth_router
from app.main import app

app.include_router(auth_router)
app.include_router(auth_page_router)

# 显式别名，便于 uvicorn 与测试引用
application = app
