"""密码哈希、CSRF、request_id 工具（P07 §2.5；P10 后冻结）。

会话/令牌查询段按 P09 约定留给 TASK-B01 补写，P10 不实现会话逻辑。
argon2id 优先，参数配置化；禁止 SHA/MD5 存密码。
"""
from __future__ import annotations

import hmac
import secrets
import uuid
from typing import Any

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError


class PasswordService:
    def __init__(self, time_cost: int, memory_cost_kib: int, parallelism: int) -> None:
        self.hasher = PasswordHasher(
            time_cost=time_cost,
            memory_cost=memory_cost_kib,
            parallelism=parallelism,
            type=2,  # argon2id
        )

    def hash(self, plain: str) -> str:
        return self.hasher.hash(plain)

    def verify(self, encoded: str, plain: str) -> bool:
        try:
            return self.hasher.verify(encoded, plain)
        except (VerifyMismatchError, VerificationError):
            return False

    def needs_rehash(self, encoded: str) -> bool:
        return self.hasher.check_needs_rehash(encoded)


def new_uuid(prefix: str = "") -> str:
    """业务主键是 UUID；prefix 仅作人类可读前缀，不参与身份。"""
    return f"{prefix}_{uuid.uuid4()}" if prefix else str(uuid.uuid4())


def new_request_id() -> str:
    return uuid.uuid4().hex


def new_csrf_token() -> str:
    return secrets.token_urlsafe(32)


def constant_time_equal(a: str, b: str) -> bool:
    return hmac.compare_digest(a, b)


# ---- TASK-B01 会话查询段占位（P10 不实现；B01 唯一允许补写的区域） ----
# def create_session(...) / def lookup_session(...) / def revoke_session(...)
