"""TASK-B01 认证领域服务。

要点：账号不存在也做哑哈希；学号哈希 + IP 哈希双维度限速；
must_change_password 由依赖闸门处理（见 dependencies.py）；
所有日志/响应不出现明文学号、令牌或密码。
"""
from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from app.base.accounts.repository import AccountsRepository
from app.base.auth.repository import LoginAttemptsRepository, SessionsRepository
from app.common.config import Settings
from app.common.errors import AppError
from app.common.logging import audit_line
from app.common.responses import utc_now
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError
from argon2.low_level import Type

from app.common.security import (
    hash_token,
    is_session_expired,
    new_session_token,
    session_expiry,
)


class Argon2idService:
    """B01 本地 argon2id 适配器。

    P10 冻结的 app.common.security.PasswordService 用 type=2 实例化，
    与本机 argon2-cffi 25.1.0 的 Type 枚举要求不兼容（缺陷 D-B01-01，交 P12 修）。
    B01 不改冻结文件，此处按同一策略参数直接使用 Type.ID。
    """

    def __init__(self, time_cost: int, memory_cost_kib: int, parallelism: int) -> None:
        self.hasher = PasswordHasher(
            time_cost=time_cost, memory_cost=memory_cost_kib,
            parallelism=parallelism, type=Type.ID,
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

PRE_CHANGE_PATHS = {
    "/api/v2/auth/change-password",
    "/api/v2/auth/logout",
    "/api/v2/auth/me",
}


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _minus_minutes(now: str, minutes: int) -> str:
    base = datetime.fromisoformat(now.replace("Z", "+00:00"))
    return (base - timedelta(minutes=minutes)).strftime("%Y-%m-%dT%H:%M:%SZ")


class AuthService:
    def __init__(self, settings: Settings, factory: Any, logger: Any) -> None:
        sec = settings.security
        self.accounts = AccountsRepository(factory)
        self.sessions = SessionsRepository(factory)
        self.attempts = LoginAttemptsRepository(factory)
        self.passwords = Argon2idService(
            int(sec["hash_time_cost"]), int(sec["hash_memory_cost_kib"]), int(sec["hash_parallelism"])
        )
        self.session_ttl = int(sec["session_ttl_minutes"])
        self.threshold = int(sec["login_fail_threshold"])
        self.window_minutes = int(sec["login_fail_window_minutes"])
        self.lock_minutes = int(sec["account_lock_minutes"])
        self.logger = logger
        # 哑哈希：账号不存在时仍执行一次等价 argon2id 校验，抹平时间侧信道
        self._dummy_hash = self.passwords.hash(secrets.token_urlsafe(24))

    def _audit(self, actor_id: str, actor_role: str, action: str, object_id: str,
               result: str, request_id: str, reason: str = "") -> None:
        details = {"reason": reason} if reason else {}
        self.logger.info(audit_line(
            actor_id=actor_id, actor_role=actor_role, action=action,
            object_type="account", object_id=object_id, result=result,
            request_id=request_id, details=details,
        ))

    def _is_locked(self, account: dict[str, Any] | None, now: str) -> bool:
        if not account or account["status"] != "locked" or not account["locked_until"]:
            return False
        return datetime.fromisoformat(account["locked_until"].replace("Z", "+00:00")) > \
            datetime.fromisoformat(now.replace("Z", "+00:00"))

    def login(self, student_no: str, password: str, ip: str, request_id: str) -> dict[str, Any]:
        now = utc_now()
        normalized = student_no.strip()
        student_hash = _sha256(normalized)
        ip_hash = _sha256(ip)
        account = self.accounts.get_by_student_no(normalized)
        encoded = account["password_hash"] if account else self._dummy_hash
        # 无论账号是否存在都执行校验，响应时间量级一致
        matched = self.passwords.verify(encoded, password)

        actor_id = account["account_id"] if account else "anonymous"
        actor_role = account["role"] if account else "unknown"
        actor_object = actor_id if account else student_hash[:16]

        if self._is_locked(account, now):
            self._audit(actor_id, actor_role, "login", actor_object, "denied", request_id,
                        "AUTH_ACCOUNT_LOCKED")
            raise AppError("AUTH_ACCOUNT_LOCKED", details={"locked_until": account["locked_until"]})

        if account is None or not matched or account["status"] != "active":
            self.attempts.add(student_hash, ip_hash, succeeded=False, now=now)
            by_student, by_ip = self.attempts.count_failed_since(
                student_hash, ip_hash, _minus_minutes(now, self.window_minutes)
            )
            if account is not None:
                self.accounts.update(account["account_id"], {"failed_attempts": int(account["failed_attempts"]) + 1})
            if by_student >= self.threshold or by_ip >= self.threshold:
                locked_until = session_expiry(self.lock_minutes, now)
                if account is not None:
                    self.accounts.update(account["account_id"], {
                        "status": "locked", "locked_until": locked_until,
                        "failed_attempts": by_student,
                    })
                self._audit(actor_id, actor_role, "login", actor_object, "denied", request_id,
                            "LOCK_THRESHOLD_REACHED")
            else:
                self._audit(actor_id, actor_role, "login", actor_object, "denied", request_id,
                            "AUTH_INVALID_CREDENTIALS")
            # 账号不存在、密码错误、禁用账号：同一文案、同一错误码
            raise AppError("AUTH_INVALID_CREDENTIALS")

        self.accounts.update(account["account_id"], {
            "failed_attempts": 0,
            "locked_until": None,
            "last_login_at": now,
        })
        self.attempts.add(student_hash, ip_hash, succeeded=True, now=now)
        token = new_session_token()
        csrf = new_session_token()
        expires_at = session_expiry(self.session_ttl, now)
        self.sessions.create(account["account_id"], token, csrf, expires_at, now)
        self._audit(actor_id, actor_role, "login", actor_object, "success", request_id)
        return self._me_payload(account) | {
            "session_token": token, "csrf_token": csrf, "expires_at": expires_at,
        }

    def _me_payload(self, account: dict[str, Any]) -> dict[str, Any]:
        return {
            "account_id": account["account_id"],
            "display_name": account["display_name"],
            "role": account["role"],
            "must_change_password": bool(account["must_change_password"]),
            "courses": [],  # 改密态强制为空；课程由 B02 授权后填充
        }

    def me(self, account: dict[str, Any], session_hash: str) -> dict[str, Any]:
        self.sessions.touch(session_hash, utc_now())
        return self._me_payload(account)

    def resolve_session(self, token: str) -> tuple[dict[str, Any], dict[str, Any]]:
        session_hash = hash_token(token)
        session = self.sessions.get(session_hash)
        if session is None or session["status"] != "active" or is_session_expired(session["expires_at"]):
            raise AppError("AUTH_SESSION_EXPIRED")
        account = self.accounts.get_by_id(session["account_id"])
        if account is None or account["status"] != "active":
            raise AppError("AUTH_INVALID_CREDENTIALS")
        return session, account

    def logout(self, session_hash: str, account: dict[str, Any], request_id: str) -> None:
        now = utc_now()
        self.sessions.revoke(session_hash, now)
        self._audit(account["account_id"], account["role"], "logout", account["account_id"],
                    "success", request_id)

    def change_password(self, session_hash: str, account: dict[str, Any],
                        old_password: str, new_password: str, request_id: str) -> dict[str, Any]:
        if not self.passwords.verify(account["password_hash"], old_password):
            self._audit(account["account_id"], account["role"], "change_password",
                        account["account_id"], "denied", request_id, "AUTH_INVALID_CREDENTIALS")
            raise AppError("AUTH_INVALID_CREDENTIALS")
        new_hash = self.passwords.hash(new_password)
        updated = self.accounts.update(account["account_id"], {
            "password_hash": new_hash,
            "password_algo": "argon2id",
            "must_change_password": 0,
            "failed_attempts": 0,
            "locked_until": None,
        }, expected_version=int(account["version"]))
        revoked = self.sessions.revoke_all(account["account_id"], utc_now(), except_hash=session_hash)
        self._audit(account["account_id"], account["role"], "change_password",
                    account["account_id"], "success", request_id, f"other_sessions_revoked={revoked}")
        return self._me_payload(updated)
