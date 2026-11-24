"""配置装载（P07 §2；P10 后冻结）。密钥不入配置库，仅 key_ref 引用名。"""
from __future__ import annotations

import tomllib
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class Settings:
    raw: dict[str, Any]
    root: Path

    @property
    def app(self) -> dict[str, Any]:
        return self.raw["app"]

    @property
    def db(self) -> dict[str, Any]:
        return self.raw["db"]

    @property
    def logging(self) -> dict[str, Any]:
        return self.raw["logging"]

    @property
    def security(self) -> dict[str, Any]:
        return self.raw["security"]

    @property
    def outbound(self) -> dict[str, Any]:
        return self.raw["outbound"]

    def path(self, key: str) -> Path:
        """把配置中的相对路径解析到工程根目录。"""
        value = self.raw["db"]["path"] if key == "db" else self.raw["logging"]["dir"]
        p = Path(value)
        return p if p.is_absolute() else self.root / p


def load_settings(root: Path | None = None) -> Settings:
    base = root or Path(__file__).resolve().parent.parent.parent
    cfg = base / "config" / "app.toml"
    with cfg.open("rb") as fh:
        raw = tomllib.load(fh)
    return Settings(raw=raw, root=base)
