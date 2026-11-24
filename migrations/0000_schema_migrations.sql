-- 0000 基线迁移：应用元信息表（全模块共享，非业务表）
-- 约定：-- +up 之前为升级段，-- +down 之后为回滚段；文件 SHA-256 由 MigrationRunner 记录。
-- +up
CREATE TABLE IF NOT EXISTS app_meta (
  meta_key   TEXT PRIMARY KEY,
  meta_value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
-- +down
DROP TABLE IF EXISTS app_meta;
