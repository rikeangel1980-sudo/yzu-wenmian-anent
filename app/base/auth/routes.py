"""B01 四个认证端点 + 登录页（A 基线，无侧栏）。"""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, Request
from fastapi.responses import FileResponse

from app.base.auth.dependencies import (
    SessionContext,
    auth_service,
    get_session,
    require_csrf,
    require_full_auth,
)
from app.base.auth.models import (
    ChangePasswordRequest,
    LoginEnvelope,
    LoginRequest,
    MeEnvelope,
    MeResponse,
)
from app.base.auth.service import AuthService
from app.common.responses import success

router = APIRouter(prefix="/api/v2/auth", tags=["auth"])
page_router = APIRouter(tags=["auth-page"])
WEB_LOGIN = Path(__file__).resolve().parents[3] / "web" / "login"


@router.post("/login", response_model=LoginEnvelope)
def login(payload: LoginRequest, request: Request) -> dict:
    service: AuthService = auth_service(request)
    ip = request.client.host if request.client else "unknown"
    data = service.login(payload.student_no, payload.password, ip, request.state.request_id)
    return success({
        "account": MeResponse(**data),
        "session_token": data["session_token"],
        "csrf_token": data["csrf_token"],
        "expires_at": data["expires_at"],
    }, request.state.request_id)


@router.get("/me", response_model=MeEnvelope)
def me(request: Request, ctx: SessionContext = Depends(get_session),
       _account: dict = Depends(require_full_auth)) -> dict:
    payload = ctx.service.me(ctx.account, ctx.token_hash)
    return success(MeResponse(**payload), request.state.request_id)


@router.post("/logout")
def logout(request: Request, ctx: SessionContext = Depends(require_csrf)) -> dict:
    ctx.service.logout(ctx.token_hash, ctx.account, request.state.request_id)
    return success({"revoked": True}, request.state.request_id)


@router.post("/change-password", response_model=MeEnvelope)
def change_password(payload: ChangePasswordRequest, request: Request,
                    ctx: SessionContext = Depends(require_csrf)) -> dict:
    data = ctx.service.change_password(
        ctx.token_hash, ctx.account, payload.old_password, payload.new_password,
        request.state.request_id,
    )
    return success(MeResponse(**data), request.state.request_id)


@page_router.get("/login", include_in_schema=False)
def login_page() -> FileResponse:
    return FileResponse(WEB_LOGIN / "login.html")
