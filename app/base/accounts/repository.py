"""账号数据访问（TASK-B01 账号部分）。

只用 ConnectionFactory，不自建 sqlite3 连接，不泄漏 cursor。
"""
from __future__ import annotations

from typing import Any, Mapping

from app.common.db import ConnectionFactory
from app.common.security import new_uuid


class AccountsRepository:
    def __init__(self, factory: ConnectionFactory) -> None:
        self.factory = factory

    def get_by_id(self, account_id: str) -> dict[str, Any] | None:
        conn = self.factory.connect()
        try:
            row = conn.execute("SELECT * FROM accounts WHERE account_id=?", (account_id,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def get_by_student_no(self, student_no: str) -> dict[str, Any] | None:
        conn = self.factory.connect()
        try:
            row = conn.execute("SELECT * FROM accounts WHERE student_no=?", (student_no,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def create(self, values: Mapping[str, Any]) -> dict[str, Any]:
        record = dict(values)
        record.setdefault("account_id", new_uuid())
        columns = ",".join(record.keys())
        marks = ",".join("?" for _ in record)
        conn = self.factory.connect()
        try:
            conn.execute(f"INSERT INTO accounts ({columns}) VALUES ({marks})", tuple(record.values()))
            conn.commit()
            return dict(conn.execute(
                "SELECT * FROM accounts WHERE account_id=?", (record["account_id"],)
            ).fetchone())
        finally:
            conn.close()

    def update(self, account_id: str, changes: Mapping[str, Any],
               *, expected_version: int | None = None) -> dict[str, Any]:
        """带可选乐观锁的字段更新；仅白名单列由调用方传入。"""
        if not changes:
            return self.get_by_id(account_id)  # type: ignore[return-value]
        patch = dict(changes)
        patch["updated_at"] = patch.get("updated_at", _utc_now())
        current = self.get_by_id(account_id)
        if current is None:
            from app.common.errors import AppError
            raise AppError("NOT_FOUND")
        patch["version"] = int(current["version"]) + 1
        sets = ",".join(f"{k}=?" for k in patch)
        params: list[Any] = list(patch.values())
        where = "account_id=?"
        params.append(account_id)
        if expected_version is not None:
            where += " AND version=?"
            params.append(expected_version)
        conn = self.factory.connect()
        try:
            cur = conn.execute(f"UPDATE accounts SET {sets} WHERE {where}", params)
            if cur.rowcount != 1:
                from app.common.errors import AppError
                raise AppError("VALID_VERSION_CONFLICT")
            conn.commit()
            return dict(conn.execute("SELECT * FROM accounts WHERE account_id=?", (account_id,)).fetchone())
        finally:
            conn.close()


def _utc_now() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
