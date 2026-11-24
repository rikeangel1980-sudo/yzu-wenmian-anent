"""统一响应包络（P07 §2.2）。P10 后冻结。"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi.responses import JSONResponse

from .errors import AppError

API_VERSION = "v2"


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def success(data: Any, request_id: str, *, total: int | None = None) -> dict[str, Any]:
    meta: dict[str, Any] = {
        "request_id": request_id,
        "timestamp": utc_now(),
        "version": API_VERSION,
    }
    if total is not None:
        meta["total"] = total
    return {"data": data, "meta": meta}


def error_response(exc: AppError, request_id: str) -> JSONResponse:
    return JSONResponse(status_code=exc.http, content=exc.to_body(request_id))
