"""B01 Pydantic 契约（P07 §3.3，路径 /api/v2/auth/*）。"""
from __future__ import annotations

import tomllib
from pathlib import Path
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

_POLICY = tomllib.loads((Path(__file__).with_name("policy.toml")).read_text(encoding="utf-8"))["password"]


class LoginRequest(BaseModel):
    student_no: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=256)
    remember: bool = False


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(min_length=1, max_length=256)
    new_password: str = Field(min_length=1, max_length=256)

    @field_validator("new_password")
    @classmethod
    def check_policy(cls, value: str) -> str:
        if len(value) < int(_POLICY["min_length"]):
            raise ValueError(f"新密码至少 {_POLICY['min_length']} 位")
        if len(value) > int(_POLICY["max_length"]):
            raise ValueError(f"新密码不超过 {_POLICY['max_length']} 位")
        if _POLICY["require_digit"] and not any(c.isdigit() for c in value):
            raise ValueError("新密码须包含数字")
        if _POLICY["require_letter"] and not any(c.isalpha() for c in value):
            raise ValueError("新密码须包含字母")
        return value


class AccountBrief(BaseModel):
    account_id: UUID
    display_name: str
    role: str
    must_change_password: bool


class MeResponse(BaseModel):
    account_id: UUID
    display_name: str
    role: str
    must_change_password: bool
    courses: list = Field(default_factory=list)  # 改密态强制为空（P07 独立审查 F-08）


class LoginResponse(BaseModel):
    account: MeResponse
    session_token: str
    csrf_token: str
    expires_at: str


class Meta(BaseModel):
    request_id: str
    timestamp: str
    version: str = "v2"


class MeEnvelope(BaseModel):
    data: MeResponse
    meta: Meta


class LoginEnvelope(BaseModel):
    data: LoginResponse
    meta: Meta
