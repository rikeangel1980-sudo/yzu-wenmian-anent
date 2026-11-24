"""统一错误码与异常（P07 §2.2）。P10 后冻结。"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ErrorDef:
    code: str
    http: int
    message: str


# 核心错误码表（P07 §2.2）；业务模块只引用，不新造同义码
ERRORS: dict[str, ErrorDef] = {
    "AUTH_INVALID_CREDENTIALS": ErrorDef("AUTH_INVALID_CREDENTIALS", 401, "账号或密码不正确"),
    "AUTH_ACCOUNT_LOCKED": ErrorDef("AUTH_ACCOUNT_LOCKED", 423, "账号已临时锁定"),
    "AUTH_SESSION_EXPIRED": ErrorDef("AUTH_SESSION_EXPIRED", 401, "会话已失效，请重新登录"),
    "PERM_FORBIDDEN": ErrorDef("PERM_FORBIDDEN", 403, "没有权限执行该操作"),
    "PERM_PASSWORD_CHANGE_REQUIRED": ErrorDef("PERM_PASSWORD_CHANGE_REQUIRED", 403, "需要先修改初始密码"),
    "VALID_VERSION_CONFLICT": ErrorDef("VALID_VERSION_CONFLICT", 409, "数据已被他人更新，请刷新后重试"),
    "VALID_OUT_OF_SCOPE_CITATION": ErrorDef("VALID_OUT_OF_SCOPE_CITATION", 422, "引用超出当前证据范围"),
    "AI_DEGRADED": ErrorDef("AI_DEGRADED", 503, "智能服务暂不可用"),
    "TASK_TIMEOUT": ErrorDef("TASK_TIMEOUT", 504, "任务处理超时"),
    "UPLOAD_INVALID_TYPE": ErrorDef("UPLOAD_INVALID_TYPE", 415, "文件类型不受支持"),
    "NET_OUTBOUND_DENIED": ErrorDef("NET_OUTBOUND_DENIED", 403, "出域访问未被批准"),
    "NOT_FOUND": ErrorDef("NOT_FOUND", 404, "资源不存在"),
}


class AppError(Exception):
    """所有业务异常的统一基类。"""

    def __init__(
        self,
        code: str,
        message: str | None = None,
        details: dict[str, Any] | None = None,
        http: int | None = None,
    ) -> None:
        defect = ERRORS.get(code)
        self.code = code
        self.http = http if http is not None else (defect.http if defect else 500)
        self.message = message if message is not None else (defect.message if defect else "服务内部错误")
        self.details: dict[str, Any] = details if details is not None else {}
        super().__init__(self.message)

    def to_body(self, request_id: str) -> dict[str, Any]:
        return {
            "error": {
                "code": self.code,
                "message": self.message,
                "details": self.details,
                "request_id": request_id,
            }
        }
