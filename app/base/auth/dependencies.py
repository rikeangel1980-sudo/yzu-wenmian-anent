"""B01 会话/CSRF/改密闸门依赖（P07 §3.5）。

must_change_password 是服务端授权维度，前端隐藏不算拦截。
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from fastapi import Depends, Request

from app.base.auth.service import AuthService, PRE_CHANGE_PATHS
from app.common.errors import AppError
from app.common.security import constant_time_equal, hash_token


@dataclass(frozen=True)
class SessionContext:
    service: AuthService
    session: dict[str, Any]
    account: dict[str, Any]
    token_hash: str


def auth_service(request: Request) -> AuthService:
    service = getattr(request.app.state, "auth_service", None)
    if service is None:
        service = AuthService(
            request.app.state.settings,
            request.app.state.factory,
            request.app.state.logger,
        )
        request.app.state.auth_service = service
    return service


def get_session(request: Request) -> SessionContext:
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("bearer "):
        raise AppError("AUTH_SESSION_EXPIRED")
    token = header[7:].strip()
    if not token:
        raise AppError("AUTH_SESSION_EXPIRED")
    service = auth_service(request)
    session, account = service.resolve_session(token)
    return SessionContext(service, session, account, hash_token(token))


def require_csrf(request: Request, ctx: SessionContext = Depends(get_session)) -> SessionContext:
    if not ctx.session.get("csrf_enabled", True):
        return ctx
    settings = request.app.state.settings
    if not bool(settings.security.get("csrf_enabled", True)):
        return ctx
    if request.method in {"GET", "HEAD", "OPTIONS"}:
        return ctx
    supplied = request.headers.get("x-csrf-token", "")
    if not supplied or not constant_time_equal(hash_token(supplied), ctx.session["csrf_token_hash"]):
        raise AppError("PERM_FORBIDDEN", message="CSRF 校验失败")
    return ctx


def require_full_auth(request: Request, ctx: SessionContext = Depends(get_session)) -> dict[str, Any]:
    """改密前只放行 /auth/me、/auth/logout、/auth/change-password。"""
    if ctx.account["must_change_password"] and request.url.path not in PRE_CHANGE_PATHS:
        raise AppError("PERM_PASSWORD_CHANGE_REQUIRED")
    return ctx.account


def require_role(*roles: str):
    """最小角色闸门；课程/班级维度授权由 TASK-B02 的 require_scope 扩展。"""

    def _dependency(account: dict[str, Any] = Depends(require_full_auth)) -> dict[str, Any]:
        if account["role"] not in roles:
            raise AppError("PERM_FORBIDDEN")
        return account

    return _dependency
