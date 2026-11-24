-- 0001 B01 认证基线：账号、会话、登录失败计数
-- 依据：P07 §3.1；独立审查 F-01（学号哈希计数）/F-02（CSRF 哈希入库）
-- 约定：升级段为分隔标记之后的 SQL，回滚段位于文件末尾（标记本身不重复写在注释里）。
-- +up
CREATE TABLE IF NOT EXISTS accounts (
  account_id            TEXT PRIMARY KEY,
  student_no            TEXT UNIQUE,
  display_name          TEXT NOT NULL,
  role                  TEXT NOT NULL CHECK (role IN ('admin','teacher','student','reviewer')),
  account_source        TEXT NOT NULL CHECK (account_source IN ('admin_created','roster_import')),
  password_hash         TEXT NOT NULL,
  password_algo         TEXT NOT NULL DEFAULT 'argon2id',
  must_change_password  INTEGER NOT NULL DEFAULT 0 CHECK (must_change_password IN (0,1)),
  status                TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','disabled','locked')),
  failed_attempts       INTEGER NOT NULL DEFAULT 0,
  locked_until          TEXT,
  last_login_at         TEXT,
  created_by            TEXT,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL,
  version               INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_accounts_role_status ON accounts(role, status);

CREATE TABLE IF NOT EXISTS sessions (
  session_id      TEXT PRIMARY KEY,
  account_id      TEXT NOT NULL REFERENCES accounts(account_id),
  csrf_token_hash TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  expires_at      TEXT NOT NULL,
  last_seen_at    TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','revoked','expired')),
  revoked_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_account ON sessions(account_id, status);

CREATE TABLE IF NOT EXISTS login_attempts (
  attempt_id      TEXT PRIMARY KEY,
  student_no_hash TEXT NOT NULL,
  ip_hash         TEXT NOT NULL,
  succeeded       INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_student ON login_attempts(student_no_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_hash, created_at);
-- +down
DROP INDEX IF EXISTS idx_login_attempts_ip;
DROP INDEX IF EXISTS idx_login_attempts_student;
DROP TABLE IF EXISTS login_attempts;
DROP INDEX IF EXISTS idx_sessions_account;
DROP TABLE IF EXISTS sessions;
DROP INDEX IF EXISTS idx_accounts_role_status;
DROP TABLE IF EXISTS accounts;
