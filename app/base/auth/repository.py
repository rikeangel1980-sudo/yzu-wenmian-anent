"""会话与登录失败计数数据访问（TASK-B01）。

只用 app.common.db.ConnectionFactory；不泄漏 cursor；不存明文令牌/CSRF。
"""
from __future__ import annotations

from typing import Any, Mapping

from app.common.db import ConnectionFactory
from app.common.security import hash_token, new_uuid


class SessionsRepository:
    def __init__(self, factory: ConnectionFactory) -> None:
        self.factory = factory

    def create(self, account_id: str, token: str, csrf_token: str,
               expires_at: str, now: str) -> dict[str, Any]:
        row = {
            "session_id": hash_token(token),
            "account_id": account_id,
            "csrf_token_hash": hash_token(csrf_token),
            "created_at": now,
            "expires_at": expires_at,
            "last_seen_at": now,
            "status": "active",
            "revoked_at": None,
        }
        conn = self.factory.connect()
        try:
            conn.execute(
                "INSERT INTO sessions (session_id,account_id,csrf_token_hash,created_at,"
                "expires_at,last_seen_at,status,revoked_at) VALUES (?,?,?,?,?,?,?,?)",
                tuple(row.values()),
            )
            conn.commit()
            return row
        finally:
            conn.close()

    def get(self, session_id_hash: str) -> dict[str, Any] | None:
        conn = self.factory.connect()
        try:
            row = conn.execute("SELECT * FROM sessions WHERE session_id=?", (session_id_hash,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def revoke(self, session_id_hash: str, now: str) -> None:
        conn = self.factory.connect()
        try:
            conn.execute(
                "UPDATE sessions SET status='revoked', revoked_at=? "
                "WHERE session_id=? AND status='active'",
                (now, session_id_hash),
            )
            conn.commit()
        finally:
            conn.close()

    def revoke_all(self, account_id: str, now: str, *, except_hash: str | None = None) -> int:
        conn = self.factory.connect()
        try:
            if except_hash:
                cur = conn.execute(
                    "UPDATE sessions SET status='revoked', revoked_at=? "
                    "WHERE account_id=? AND status='active' AND session_id<>?",
                    (now, account_id, except_hash),
                )
            else:
                cur = conn.execute(
                    "UPDATE sessions SET status='revoked', revoked_at=? "
                    "WHERE account_id=? AND status='active'",
                    (now, account_id),
                )
            conn.commit()
            return cur.rowcount
        finally:
            conn.close()

    def touch(self, session_id_hash: str, now: str) -> None:
        conn = self.factory.connect()
        try:
            conn.execute("UPDATE sessions SET last_seen_at=? WHERE session_id=?", (now, session_id_hash))
            conn.commit()
        finally:
            conn.close()


class LoginAttemptsRepository:
    def __init__(self, factory: ConnectionFactory) -> None:
        self.factory = factory

    def add(self, student_no_hash: str, ip_hash: str, *, succeeded: bool, now: str) -> None:
        conn = self.factory.connect()
        try:
            conn.execute(
                "INSERT INTO login_attempts (attempt_id,student_no_hash,ip_hash,succeeded,created_at) "
                "VALUES (?,?,?,?,?)",
                (new_uuid("ATT"), student_no_hash, ip_hash, 1 if succeeded else 0, now),
            )
            conn.commit()
        finally:
            conn.close()

    def count_failed_since(self, student_no_hash: str, ip_hash: str, since: str) -> tuple[int, int]:
        """返回（学号维度失败数, IP 维度失败数）；仅计数，不返回明文字段。"""
        conn = self.factory.connect()
        try:
            by_student = conn.execute(
                "SELECT COUNT(*) FROM login_attempts WHERE student_no_hash=? AND succeeded=0 AND created_at>=?",
                (student_no_hash, since),
            ).fetchone()[0]
            by_ip = conn.execute(
                "SELECT COUNT(*) FROM login_attempts WHERE ip_hash=? AND succeeded=0 AND created_at>=?",
                (ip_hash, since),
            ).fetchone()[0]
            return int(by_student), int(by_ip)
        finally:
            conn.close()

    def clear_succeeded(self, student_no_hash: str, now: str) -> int:
        """成功登录不删除历史失败记录（审计需要），仅写入成功行；保留方法供运维统计。"""
        conn = self.factory.connect()
        try:
            cur = conn.execute(
                "SELECT COUNT(*) FROM login_attempts WHERE student_no_hash=? AND succeeded=1 AND created_at>=?",
                (student_no_hash, now),
            )
            return int(cur.fetchone()[0])
        finally:
            conn.close()
