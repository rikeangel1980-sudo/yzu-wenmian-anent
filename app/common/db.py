"""sqlite3 + schema_migrations 访问底座（ADR-003/004；P10 后冻结）。

Repository 只暴露 get/list/save/delete/transaction 五方法，不返回裸 cursor。
迁移从 migrations/*.sql 升序读取，记录 SHA-256、执行前后版本与审计。
"""
from __future__ import annotations

import hashlib
import sqlite3
from pathlib import Path
from typing import Any, Callable, Iterable


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


class ConnectionFactory:
    """按配置创建连接：WAL / busy_timeout / foreign_keys / 本机非同步目录。"""

    def __init__(self, db_path: Path, *, wal: bool = True, busy_timeout_ms: int = 5000,
                 foreign_keys: bool = True) -> None:
        self.db_path = db_path
        self.wal = wal
        self.busy_timeout_ms = busy_timeout_ms
        self.foreign_keys = foreign_keys

    def connect(self) -> sqlite3.Connection:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        if self.wal:
            conn.execute("PRAGMA journal_mode=WAL")
        conn.execute(f"PRAGMA busy_timeout={self.busy_timeout_ms}")
        conn.execute(f"PRAGMA foreign_keys={'ON' if self.foreign_keys else 'OFF'}")
        return conn


class MigrationRunner:
    """编号迁移；含 up/down 段与文件哈希，执行留痕。"""

    def __init__(self, factory: ConnectionFactory, migrations_dir: Path) -> None:
        self.factory = factory
        self.migrations_dir = migrations_dir

    def _ensure_table(self, conn: sqlite3.Connection) -> None:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS schema_migrations (
                 version       TEXT PRIMARY KEY,
                 file_name     TEXT NOT NULL,
                 file_sha256   TEXT NOT NULL,
                 applied_at    TEXT NOT NULL,
                 prev_version  TEXT,
                 audit_note    TEXT
               )"""
        )
        conn.commit()

    def current_version(self, conn: sqlite3.Connection) -> str | None:
        row = conn.execute("SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1").fetchone()
        return row[0] if row else None

    def _split(self, sql_text: str) -> tuple[str, str]:
        """约定：文件用 `-- +up` / `-- +down` 分隔；缺 down 视为空但登记。"""
        up, down = sql_text, ""
        marker = "-- +down"
        if marker in sql_text:
            up, down = sql_text.split(marker, 1)
        return up.strip(), down.strip()

    def migrate(self) -> list[dict[str, Any]]:
        applied: list[dict[str, Any]] = []
        conn = self.factory.connect()
        try:
            self._ensure_table(conn)
            files = sorted(self.migrations_dir.glob("[0-9]*.sql"))
            for f in files:
                version = f.stem
                exists = conn.execute(
                    "SELECT 1 FROM schema_migrations WHERE version=?", (version,)
                ).fetchone()
                if exists:
                    continue
                text = f.read_text(encoding="utf-8")
                up_sql, _ = self._split(text)
                if not up_sql:
                    continue
                prev = self.current_version(conn)
                conn.executescript(up_sql)
                conn.execute(
                    "INSERT INTO schema_migrations(version,file_name,file_sha256,applied_at,prev_version,audit_note) "
                    "VALUES (?,?,?,?,?,?)",
                    (version, f.name, _sha256(text), _utc_now(), prev, "up applied by P10 runner"),
                )
                conn.commit()
                applied.append({"version": version, "sha256": _sha256(text)})
            return applied
        finally:
            conn.close()


def _utc_now() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class Repository:
    """业务 Repository 基类：五方法，绝不外泄 cursor。"""

    def __init__(self, factory: ConnectionFactory, table: str) -> None:
        self.factory = factory
        self.table = table  # 仅白名单表名由子类传入，禁止外部字符串拼接

    def get(self, object_id: str) -> dict[str, Any] | None:
        conn = self.factory.connect()
        try:
            row = conn.execute(f"SELECT * FROM {self.table} WHERE id=?", (object_id,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def list(self, where: str = "", params: Iterable[Any] = (),
             order_by: str = "created_at DESC", limit: int = 20, offset: int = 0) -> list[dict[str, Any]]:
        suffix = f" WHERE {where}" if where else ""
        sql = f"SELECT * FROM {self.table}{suffix} ORDER BY {order_by} LIMIT ? OFFSET ?"
        conn = self.factory.connect()
        try:
            return [dict(r) for r in conn.execute(sql, (*params, limit, offset)).fetchall()]
        finally:
            conn.close()

    def save(self, values: dict[str, Any]) -> None:
        columns = ",".join(values.keys())
        marks = ",".join("?" for _ in values)
        sql = f"INSERT OR REPLACE INTO {self.table} ({columns}) VALUES ({marks})"
        conn = self.factory.connect()
        try:
            conn.execute(sql, tuple(values.values()))
            conn.commit()
        finally:
            conn.close()

    def delete(self, object_id: str, *, soft: bool = True) -> None:
        conn = self.factory.connect()
        try:
            if soft:
                conn.execute(
                    f"UPDATE {self.table} SET status='archived', deleted_at=? WHERE id=?",
                    (_utc_now(), object_id),
                )
            else:
                conn.execute(f"DELETE FROM {self.table} WHERE id=?", (object_id,))
            conn.commit()
        finally:
            conn.close()

    def transaction(self, work: Callable[[sqlite3.Connection], Any]) -> Any:
        conn = self.factory.connect()
        try:
            conn.execute("BEGIN")
            result = work(conn)
            conn.commit()
            return result
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
