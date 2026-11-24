"""问面 V2.0 应用入口（P10 工程骨架）。

仅提供工程底座：健康检查、统一异常、request_id、静态 A 基线托管。
业务路由由 P11 各任务按 app/base、app/knowledge 等子包挂载；本文件 P10 后冻结。
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.common.config import Settings, load_settings
from app.common.db import ConnectionFactory, MigrationRunner
from app.common.errors import AppError
from app.common.logging import configure_logging
from app.common.responses import API_VERSION, error_response, success
from app.common.security import new_request_id

SETTINGS: Settings = load_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    s: Settings = app.state.settings
    logger = configure_logging(s.logging["level"], s.path("logging"), s.logging["redact_fields"])
    factory = ConnectionFactory(
        s.path("db"),
        wal=s.db["wal"],
        busy_timeout_ms=s.db["busy_timeout_ms"],
        foreign_keys=s.db["foreign_keys"],
    )
    runner = MigrationRunner(factory, s.root / s.db["migrations_dir"])
    applied = runner.migrate()
    app.state.factory = factory
    app.state.logger = logger
    logger.info({"event": "startup", "migrations_applied": [m["version"] for m in applied]})
    yield
    logger.info({"event": "shutdown"})


app = FastAPI(
    title="问面 V2.0 教学助手",
    version=SETTINGS.app["version"],
    openapi_url=SETTINGS.app["openapi_path"],
    docs_url="/api/v2/docs",
    redoc_url=None,
    lifespan=lifespan,
)
app.state.settings = SETTINGS


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    rid = request.headers.get("X-Request-ID") or new_request_id()
    request.state.request_id = rid
    response = await call_next(request)
    response.headers["X-Request-ID"] = rid
    return response


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return error_response(exc, getattr(request.state, "request_id", new_request_id()))


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    body = {
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "请求参数校验失败",
            "details": exc.errors(),
            "request_id": getattr(request.state, "request_id", new_request_id()),
        }
    }
    return JSONResponse(status_code=422, content=body)


@app.get(f"{SETTINGS.app['api_prefix']}/ops/health")
def health(request: Request):
    """五态健康检查（P08 api01）：应用/DB/目录/索引/模型配置，不含 Key 明文。"""
    s: Settings = request.app.state.settings
    factory: ConnectionFactory = request.app.state.factory
    db_status = "ok"
    schema_version = None
    try:
        conn = factory.connect()
        row = conn.execute("SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1").fetchone()
        schema_version = row[0] if row else None
        conn.close()
    except Exception:
        db_status = "degraded"
    dirs = {
        "logs": s.path("logging").exists(),
        "data": s.path("db").parent.exists(),
        "migrations": (s.root / s.db["migrations_dir"]).exists(),
    }
    return success({
        "app": {"status": "ok", "version": s.app["version"]},
        "db": {"status": db_status, "schema_version": schema_version},
        "dirs": dirs,
        "index": {"status": "NOT_RUN", "note": "MOD-KNOW 由 P11 任务建立"},
        "model_config": {
            "enabled": s.raw["ai"]["model_gateway_enabled"],
            "key_ref": s.outbound["key_ref"],
            "outbound_default_deny": s.outbound["default_deny"],
        },
    }, request.state.request_id)


# A 基线静态资产：只挂载 web/ 派生目录；根目录返回 baseline.html（无 index.html，G1）
WEB_ROOT = Path(__file__).resolve().parent.parent / "web"
app.mount("/assets", StaticFiles(directory=WEB_ROOT), name="assets")


@app.get("/", include_in_schema=False)
def baseline_entry():
    return FileResponse(WEB_ROOT / "baseline.html")
