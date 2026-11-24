# AGENTS｜问面 V2.0 工程规则（P10 工程初始化版）

> 本文件在 P00 建立，P10 补充开发环境、命令与自动化检查；事实源优先级与禁止事项不推翻。

## 1. 唯一工作目录

- 工程根目录：`D:\Projects\wenmian`。
- 所有新增代码、测试、报告与交付物写入该目录。
- `D:\Projects\wenmian_buddy` 为前序产物目录，用户已于 2026-11-24 12:30 确认完全排除；不得读取、导入或作为基线，也不得参考其页面结构。如确需参考，必须用户重新明确授权并记录原因。
- Git 仓库：`git@github.com:rikeangel1980-sudo/yzu-wenmian-anent.git`，分支 `main`；首次提交 `e9dd201` 为 P00 文档基线，非应用源码。提交前核对工作区，不得把密钥、`.workbuddy/` 或外部规范副本提交入库。

## 2. 事实源优先级

1. 用户当前明确指令与限制。
2. V1.3 标准中的强制门禁（尤其测试状态口径与人工授权）。
3. `docs/` 下 V2.0 PRD、总体架构、详细设计三份规范（同一版本以 SHA-256 识别）。
4. 《问面_一阶段总开发设计文档与总结报告》。
5. `PROJECT_CONTEXT.md` 中标注的假设与 OPEN 事项。

低层事实不得覆盖高层约束。文档之间冲突时，登记为 CR/OPEN，不得静默择一实现。

## 3. 阶段与状态

- 严格按 P00 → P01 → P02 → P03 → … 推进；每个阶段完成后更新 `PROJECT_STATUS.md`。
- 阶段/任务状态与测试状态分开记录。测试状态只允许：PASS、FAIL、NOT_RUN、BLOCKED、WAIVED。
- 未执行的测试、未做的审查、未跑的服务一律写 NOT_RUN；不得用“已完成”“已验证”等模糊表述替代证据。

## 4. 业务红线

- AI 不得代替教师确认题目、评分、成绩、图谱权威关系或做任何人类签字。
- 教材基线冲突 ARCH-CR-001 未解决前，不发布正式课程知识版本、不重建正式题库/图谱。
- 学生个人信息、成绩、原始提交与视频默认不出域；密钥不进入前端、Git、日志与导出包。
- 权限、审核状态、快照、成绩确认与引用校验必须在服务端执行；前端隐藏按钮不算权限控制。
- 一阶段 `judge_rejection()` 单一入口、42 样本拒答探针、接口/探针一致 42/42、入口一致 8/8 为必须继承的回归门槛。

## 5. UI 验收要求

- 有 UI 的阶段必须展示实际运行页面，不接受“文字描述已完成”。
- 页面布局以 V2.0 PRD 的信息架构和 §13 交互规范为准；学生学习端与教师工作台分属不同导航，不得混排。
- 未登录/会话失效必须呈现清晰的登录入口与恢复路径，不得只显示裸 `AUTH_REQUIRED` 加空白“加载中”。
- 教师批量操作、成绩发布、内容发布必须有二次确认与影响范围提示。

## 6. 沟通与交付

- 中文输出；结构化、可追溯、证据优先；一次只追问一个关键缺口。
- 常规技术决策自主完成并记录依据；D3 事项只准备方案，不自行批准或执行。

## 7. 开发环境与命令（P10 建立）

- **Python 基线**：`py -3` = Python 3.12.9；项目虚拟环境 `.venv/`（已锁定，见 `requirements.lock`）。所有运行/测试用 `.venv/Scripts/python.exe`。
- **启动**：`.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8787`。仅 loopback，禁止改 `--host 0.0.0.0`（NFR-001）。
- **健康检查**：`curl http://127.0.0.1:8787/api/v2/ops/health`（五态：应用/DB/目录/索引/模型配置）。
- **测试**：`.venv/Scripts/python.exe -m pytest tests/ -q`。
- **导出契约**：`.venv/Scripts/python.exe scripts/export_openapi.py` → `openapi.json`（入 Git，P08 据此核对）。
- **静态门禁**：`.venv/Scripts/python.exe scripts/static_gate.py --report docs/P10_静态门禁报告.md`；退出码非 0 不得进入 P11。

## 8. 冻结资产与允许修改范围（P10 后生效）

- `app/common/**`（errors/responses/db/logging/security/config）：P10 建立后冻结；仅 TASK-B01 可补写 `security.py` 会话查询段，之后永久冻结。
- `config/app.toml`、`pyproject.toml`、`requirements.lock`、`openapi.json`：P10 独占；后续任务只读，配置新增走独立配置文件。
- `web/styles/tokens.css`：唯一色值来源（仅 `[data-scheme="A"]` 段）；禁止新增色值或 `[data-role=...]` 配色。
- `prototype/**`：决策过程资产，不进入交付；B/C 方案禁止复制到 `web/`（静态门禁 G1–G4 拦截）。
- 各 P11 任务只在自己的目录内新增（`app/base/**`、`web/login/**` 等），不得改上述冻结资产。

## 9. 数据库与迁移约定（P10 落地）

- SQLite 通过 `app.common.db.ConnectionFactory` 创建（WAL/busy_timeout/foreign_keys）；业务代码不得自建连接。
- 迁移文件 `migrations/[0-9]*.sql` 升序执行，含 `-- +up` / `-- +down` 段；由 `MigrationRunner` 记录 SHA-256 与版本，禁止无迁移直改 Schema。
- Repository 只用 `get/list/save/delete/transaction` 五方法，不允许裸 cursor 外泄。
