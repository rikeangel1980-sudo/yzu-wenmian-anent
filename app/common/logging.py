"""脱敏日志（P07 §2.5；P10 后冻结）。

写日志前对敏感字段做遮蔽；令牌/密码/Key/学号不进日志，用 account_id 与 request_id 追溯。
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any


class RedactingFilter(logging.Filter):
    def __init__(self, fields: list[str]) -> None:
        super().__init__()
        self.fields = {f.lower() for f in fields}

    def _redact(self, obj: Any) -> Any:
        if isinstance(obj, dict):
            return {
                k: ("***REDACTED***" if str(k).lower() in self.fields else self._redact(v))
                for k, v in obj.items()
            }
        if isinstance(obj, (list, tuple)):
            return [self._redact(v) for v in obj]
        return obj

    def filter(self, record: logging.LogRecord) -> bool:
        try:
            if isinstance(record.msg, (dict, list)):
                record.msg = self._redact(record.msg)
            if record.args:
                record.args = tuple(self._redact(a) for a in record.args) \
                    if isinstance(record.args, tuple) else self._redact(record.args)
        except Exception:
            record.msg = "[redaction error: message suppressed]"
            record.args = ()
        return True


def configure_logging(level: str, log_dir: Path, redact_fields: list[str]) -> logging.Logger:
    log_dir.mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger("wenmian")
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    logger.handlers.clear()
    fmt = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    fh = logging.FileHandler(log_dir / "app.log", encoding="utf-8")
    fh.setFormatter(fmt)
    sh = logging.StreamHandler()
    sh.setFormatter(fmt)
    redactor = RedactingFilter(redact_fields)
    for h in (fh, sh):
        h.addFilter(redactor)
        logger.addHandler(h)
    logger.propagate = False
    return logger


def audit_line(actor_id: str, actor_role: str, action: str, object_type: str,
               object_id: str, result: str, request_id: str,
               details: dict[str, Any] | None = None) -> str:
    """FND-008 审计最小字段；details 经 RedactingFilter 之外的路径时也应避免敏感键。"""
    return json.dumps({
        "actor_id": actor_id,
        "actor_role": actor_role,
        "action": action,
        "object_type": object_type,
        "object_id": object_id,
        "result": result,
        "details_json": details or {},
        "request_id": request_id,
    }, ensure_ascii=False)
