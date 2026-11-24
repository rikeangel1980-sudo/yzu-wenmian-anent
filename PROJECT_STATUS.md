# PROJECT_STATUS｜问面 V2.0 当前状态

- **项目名称**：问面 V2.0 面向课程的 AI 智能教学平台（重构）
- **当前版本**：V2.0-P11-B01-20261124
- **当前阶段**：P11 TASK-B01 已收口（功能闭环层 PASS，有条件）；pytest 15/15、真实 HTTP 登录链路通过、G1–G10 无 FAIL；准备进入 TASK-B02
- **当前里程碑**：M4 功能开发与系统验证（B01 首个可运行业务切片）
- **当前任务**：TASK-B02 账号来源、课程班级与授权范围
- **当前 Git Commit**：待 P11 提交更新
- **最近更新时间**：2026-11-24 23:50 +0800

## 已完成成果

- 完整读取 V1.3 流程、治理规范、P00-P15 阶段提示词及 PROJECT_CONTEXT / PROJECT_STATUS 模板。
- 读取并核对 V2.0 三份规范：PRD V1.0、总体技术架构 V1.0、详细设计 V1.0，以及一阶段总开发设计文档与总结报告。
- 记录 3 份规范源文件的 SHA-256，确保后续引用的是同一版本。
- 建立 `PROJECT_CONTEXT.md`、`PROJECT_STATUS.md`、最小 `AGENTS.md` 与 `docs/P00_项目启动与边界确认报告.md`。
- 登记 P00 核心假设 P00-A1 与阻断项 ARCH-CR-001；未写代码、未启动服务、未修改任何源规范。
- 用户于 12:30 确认 P00-A1：完全排除 `wenmian_buddy`，仅以 V2.0 三份规范为事实源，从零重构。
- 应用户要求提前建立 Git：SSH 认证、远端 `yzu-wenmian-anent.git`、首次提交 `e9dd201` 已推送至 `main`（详见 `docs/P00_项目启动与边界确认报告.md` §7）。
- 用户 2026-11-24 15:50 确认 **方案 A（Editorial / 杂志编辑风）为唯一开发基线，学生端与教师端统一风格与色调**；已锁定 `prototype/baseline.html`，B/C 仅作决策过程对比留档（见 `docs/P05_方案A基线确认记录.md`）。
- P06 总体架构已形成并经独立挑战：初稿 FAIL（4 BLOCKER），修订后 PASS。修正包括 G6 PoC 假 PASS 复验、身份双层、视频防快进方案、ORM 基线定案、75 项逐项追溯（见 `docs/P06_系统总体架构设计.md`）。
- P07 详细设计完成：11 个模块的数据库/ER、状态机、Pydantic API 契约、前端组件、AI 工程与 Prompt、安全与日志；用户指定 8 项硬约束逐条落实；新增 ADR-015（检索工具化、不集成 kb-memory）、ENH-009、OPEN-13/14（见 `docs/P07_系统详细设计与接口规范.md`）。
- P08 测试方案完成：75 项 MUST 逐项测试方法/预期结果；8 入口清单锁定 v0.1；500/1500 压测方法、换教材 golden set、A 基线 10 项静态门禁、独立审查计划与用户验收标准（见 `docs/P08_测试方案与验收标准.md` 与 `docs/controls/`）。
- 2026-11-24 22:36 用户明确选择「授权只读参考旧工程清单文本」路线：已从 `wenmian_buddy` 只读提取 42 问题文本与 63 条 QA 检查意图，生成 `REJECT_SAMPLES_v0.2.md`（36 入槽+6 备选+6 待新编）与 `E2E_SCENARIOS_v0.2.md`（63 改写+8 V2.0 新增）；状态 `CONTENT_DRAFT_PENDING_TEACHER`，判定仍 BLOCKED；未导入代码/页面/数据，未宣称内容锁定。
- P09 任务拆解完成：16 个任务卡（含 P10 前置门禁）均含八项字段；按纵向切片优先 MOD-BASE，关键路径 P10→B01→B02→B03→B04；75 项 MUST 全覆盖且 P08 用例逐项映射；共享核心文件冻结与 B01 唯一例外已写明（见 `docs/P09_开发任务拆解与依赖规划.md`）。
- P10 工程初始化完成（工程底座层 PASS）：Python 3.12.9 venv + 32 包锁定；FastAPI 骨架（`app/common/**` 六模块 + `app/main.py`）、sqlite3+schema_migrations（0000 已执行）、A 基线 web 派生资产；实测启动 127.0.0.1:8787、健康检查五态、OpenAPI 导出 `/api/v2/*`、pytest 5/5、G1–G10 无 FAIL（见 `docs/P10_工程初始化报告.md` 与 `docs/P10_静态门禁报告.md`）。业务功能未开发，UI 运行时判据 NOT_RUN(P13)。
- P11 TASK-B01 完成（功能闭环层 PASS 有条件）：`migrations/0001_auth.sql` 三表、`app/base/auth/**` 四端点与闸门、`web/login/**` 无侧栏改密弹层、`tests/base/test_auth.py` 10 项；15/15 pytest、真实 HTTP 登录→me→退出→复用 401、G1–G10 复核退出码 0；新增 `app.base.bootstrap:app` 组合入口避免改动冻结 `app/main.py`；OpenAPI 快照另存 `docs/evidence/`。发现 3 项真实缺陷（D-B01-01 argon2 type、D-B01-02 0000 迁移注释截断、D-B01-03 测试污染运行时库），前两项根因待 P12、第三项 CLOSED（见 `docs/P11_B01_实现报告.md`）。

## 当前阻塞

- **P00 本身无阻断**：目标、范围、环境、主要限制已写明，开放项已登记，P00-A1 已确认关闭，进入 P01。
- **P00-A1（已关闭）**：用户 12:30 确认完全排除 `D:\Projects\wenmian_buddy`，仅以 V2.0 三份规范为事实源，从零重构。
- **ARCH-CR-001 教材部分（已关闭）**：用户 12:31 确认唯一正式教材 = `docs/面点工艺学.docx`（SHA-256 已记录）；《中国名点》降级历史资产。PRD §1.2 修订登记 PRD-CR-001，在 P02 落实。
- **ARCH-CR-001 剩余部分（D3，阻断正式发布）**：教材授权范围仍未书面确认；确认前不得对外发布正式课程知识版本。OPEN-06 方向已由 Q4 确认（文本+视觉都接）；供应商/预算为配置项，学生材料出域逐次 D3 批准，课程名称已由 Q3 配置化，均不再作为 P01 阻塞。
- **PRD-CR-001（待 P02 修订）**：PRD V1.0 §1.2 需改为《面点工艺学》基线。

## 待确认/待批准事项

| ID | 事项 | 当前建议 | 决策人 | 影响 |
|---|---|---|---|---|
| OPEN-03 | 学生唯一标识与本地账号发放 | **已确认（Q5：学号唯一 + 教师 CSV/Excel 导入 + 初始密码登录）** | 用户 | 已关闭 |
| OPEN-06 | 模型供应商/API 预算/数据出域授权 | **方向已确认（Q4：文本+视觉都接）；供应商/预算配置化；出域逐次 D3 批准** | 用户 | 方向关闭 |
| OPEN-01 | 课程正式名称、专业、学期、班级 | **已确认（Q3：全部配置化，不预设）** | 用户 | 已关闭 |
| OPEN-02/04 | 首轮课堂规模、设备、局域网访问 | **已确认（Q2：本机多角色模拟，不开放局域网，R2）** | 用户 | 已关闭 |
| P00-A1 | 旧 `wenmian_buddy` 产物是否完全排除 | **已确认：完全排除，从零重建** | 用户 | 已关闭 |
| ARCH-CR-001 | 教材基线 | **已确认：`docs/面点工艺学.docx`** | 用户 | 已关闭（教材部分） |
| OPEN-02/04 | 课堂规模、设备、局域网访问 | 首轮仅本机 127.0.0.1:8787 | 用户/学校 | 部署与安全边界 |
| OPEN-03 | 学生唯一标识与账号发放 | 本地账号 + 教师导入名单 | 教师/管理员 | 名单导入、登录交付 |
| OPEN-06 | 模型、API 预算、数据出域 | 适配层先行，不写死模型；学生材料默认不出域 | 项目负责人 | AI 出题/批改/视觉 |
| OPEN-05 | 视频格式/大小/容量/保留期 | 配置化并实测 | 管理员 | 视频模块发布 |
| OPEN-07~11 | 考试制度、难度标准、实训权重、图谱边界、数据保留 | 按 PRD/详设建议默认值，模块开发前确认 | 教师/学校 | 对应业务模块发布 |
| OPEN-13 | Agentic 检索引入时序与授权边界 | P0 仅预留 `KBTool` 契约；联网兜底须单独 D3 批准 | 用户/教师 | ENH-009 是否进入开发 |
| OPEN-14 | 换教材 golden set 样本量、来源与通过阈值 | P08 定义；未锁定前 STU-005 不判通过 | 项目负责人 | 换教材验收与向量 PoC 触发 |

## 最近测试与审查结果

| 时间 | TASK-ID/Commit | 测试或审查 | 状态 | 证据位置 |
|---|---|---|---|---|
| 2026-11-24 12:46 | TASK-P01-06 / f19a3ae | V1.3 P01 完成条件自检（8 项） | **PASS** | `docs/P01_需求澄清记录.md` 自检表 |
| 2026-11-24 13:55 | TASK-P03-01 / 待提交 | PRD V1.1 独立需求审查（22 项发现） | **FAIL（退回 P02）** | `docs/P03_需求审查记录.md` 第一轮 |
| 2026-11-24 14:10 | TASK-P03-02 / 待提交 | PRD V1.2 复审（22 项全部关闭 + 结构复验） | **PASS** | `docs/P03_需求审查记录.md` 第二轮 |
| 2026-11-24 12:19 | TASK-P00-01 / e9dd201 | V1.3 P00 完成条件自检 | **PASS（仅 P00 范围）** | `docs/P00_项目启动与边界确认报告.md` |
| 2026-11-24 12:19 | TASK-P00-01 / e9dd201 | V2.0 规范文档一致性检查（教材基线） | **BLOCKED（ARCH-CR-001）** | `PROJECT_CONTEXT.md` F-07 |
| 2026-11-24 12:19 | TASK-P00-01 / e9dd201 | 工程启动、接口、UI、全量回归 | **NOT_RUN**（无源码/无服务） | 本目录实读 |
| 2026-11-24 12:19 | TASK-P00-01 / e9dd201 | 前序 4 张截图的人工观察 | **PASS（问题证据成立）** | 用户本次提供截图；已记入 `PROJECT_CONTEXT.md` F-08 |
| 2026-11-24 12:28 | Git 配置 / e9dd201 | SSH 认证连接测试 | **PASS** | `Hi rikeangel1980-sudo! successfully authenticated` |
| 2026-11-24 12:30 | Git 配置 / e9dd201 | 首次提交推送远端 main | **PASS** | 远端 `refs/heads/main` = `e9dd2017b713271ffdf25a5cecd67472e839e191` |
| 2026-11-24 12:31 | TASK-P01-01 / ec1f92c | 教材基线源文件校验值实算 | **PASS** | `docs/面点工艺学.docx` SHA-256 `5a857b6f3bdd0436de9202543dde0e6a55e5775a9b22ab13bcf472450dd42e22` |
| 2026-11-24 15:09 | TASK-P04-01 / 待提交 | PoC-01 SQLite+WAL（事务/并发/备份/中文路径/子图） | **PASS** | `poc/results/sqlite_poc_result.json` 六项全通过 |
| 2026-11-24 15:10 | TASK-P04-01 / 待提交 | PoC-02 G6 v5.1.1 渲染（含 v4 API 失效发现） | **PASS（有条件）** | `poc/results/g6_poc_result.json`；性能基准留 P08 |
| 2026-11-24 15:11 | TASK-P04-01 / 待提交 | PoC-03 FastAPI@8787 启动/路由/静态/loopback | **PASS** | `poc/results/fastapi_poc_result.json` 六项全通过 |
| 2026-11-24 15:11 | TASK-P04-01 / 待提交 | PoC-04 模型网关外部联通 | **NOT_RUN（D3 无 Key）** | `docs/P04_技术可行性与开源复用评估报告.md` §6 |
| 2026-11-24 15:12 | TASK-P04-01 / 待提交 | V1.3 P04 完成条件自检（8 项） | **PASS（有条件）** | `docs/P04_技术可行性与开源复用评估报告.md` §9 |
| 2026-11-24 15:17 | TASK-P05-01 / 待提交 | P05 原型浏览器冒烟（11 场景） | **PASS（11/11）** | `poc/results/prototype_smoke_result.json` |
| 2026-11-24 15:18 | TASK-P05-01 / 待提交 | P05 原型人工目检（4 张截图） | **PASS（修复 1 处标题缺陷后复验）** | `poc/shots/*.png` |
| 2026-11-24 15:38 | TASK-P05-R2 / 待提交 | 三套风格重构冒烟（13 场景 + 类名互不重叠校验） | **PASS（13/13）** | `poc/results/prototype_smoke_result.json` |
| 2026-11-24 15:38 | TASK-P05-R2 / 待提交 | 三套风格人工目检（6 张截图） | **PASS** | `poc/shots/v2/*.png` |
| 2026-11-24 15:56 | TASK-P05-CONFIRM / 待提交 | 方案 A 锁定基线冒烟（8 项，含 hash 绕过防护 + 师生无角色级样式覆盖） | **PASS（8/8）** | `poc/results/baseline_smoke_result.json` |
| 2026-11-24 15:57 | TASK-P05-CONFIRM / 待提交 | 锁定基线师生首页目检；修复教师指标孤行后复验 | **PASS** | `poc/shots/baseline/*.png` |
| 2026-11-24 15:57 | TASK-P05-CONFIRM / 待提交 | 原三方案冒烟回归 | **PASS（13/13）** | `poc/results/prototype_smoke_result.json` |
| 2026-11-24 16:06 | TASK-P06-01 / 待提交 | G6 PoC 严格判据复验（修正原假 PASS） | **PASS（40 节点/40 边实绘；500/1500 NOT_RUN）** | `poc/results/g6_poc_result.json`、`poc/shots/g6_strict.png` |
| 2026-11-24 16:12 | TASK-P06-01 / 待提交 | P06 架构独立挑战（26 项发现） | **初稿 FAIL → 修订后全部 CLOSED** | `docs/P06_系统总体架构设计.md` §11 |
| 2026-11-24 16:20 | TASK-P06-01 / 待提交 | P06 完成条件自检（8 项）+ 75 项需求追溯核对 | **PASS（架构层面）** | `docs/P06_系统总体架构设计.md` §10/§12 |
| 2026-11-24 22:18 | TASK-P07-01 / 待提交 | P07 用户指定 8 项硬约束落设计核对 | **PASS（设计层）** | `docs/P07_系统详细设计与接口规范.md` §6 |
| 2026-11-24 22:19 | TASK-P07-01 / 待提交 | P07 结构化自检 8 项发现（F-01~F-08） | **全 CLOSED（已回改正文）** | `docs/P07_系统详细设计与接口规范.md` §8 |
| 2026-11-24 22:20 | TASK-P07-01 / 待提交 | P07 完成条件自检；迁移/OpenAPI/UI/性能/外部联通 | **PASS（设计，有条件）**；执行项 **NOT_RUN** | `docs/P07_系统详细设计与接口规范.md` §9 |
| 2026-11-24 22:25 | TASK-P08-01 / 待提交 | 75 项 MUST 逐项测试矩阵（方法/预期/阶段/状态） | **PASS（方案）**；执行项全 **NOT_RUN** | `docs/P08_测试方案与验收标准.md` §3（75 行实计） |
| 2026-11-24 22:26 | TASK-P08-01 / 待提交 | 受控清单 42/8/71 框架与内容锁定状态 | 8 入口 **v0.1 已锁**；42/71 内容 **BLOCKED** | `docs/controls/CONTROL_INDEX.md` |
| 2026-11-24 22:27 | TASK-P08-01 / 待提交 | P08 完成条件自检与 4 项结构化发现 | **PASS（方案，有条件）**；4 项全 CLOSED | `docs/P08_测试方案与验收标准.md` §11 |
| 2026-11-24 22:36 | TASK-P08-02 / 待提交 | 用户授权窄例外：只读迁移旧工程 42 样本与 QA 检查意图 | **草案已生成（42/42、71/71 实计）**；判定仍 **BLOCKED** | `docs/controls/REJECT_SAMPLES_v0.2.md`、`E2E_SCENARIOS_v0.2.md`、`CONTROL_INDEX.md` v0.2 |
| 2026-11-24 23:20 | TASK-P09-01 / 待提交 | P09 任务卡八字段完整性（16×7 项显式字段 + 任务卡计数） | **PASS（计划层）**；实计 16 卡、每字段 16 处 | `docs/P09_开发任务拆解与依赖规划.md` §3 |
| 2026-11-24 23:21 | TASK-P09-01 / 待提交 | 75 项 MUST ↔ P09 主责任务 ↔ P08 用例交叉覆盖 | **PASS（75/75，missing 0 / extra 0）** | `docs/P09_开发任务拆解与依赖规划.md` §4 |
| 2026-11-24 23:22 | TASK-P09-01 / 待提交 | P09 完成条件自检与 4 项结构化发现 | **PASS（计划层，有条件）**；4 项全 CLOSED | `docs/P09_开发任务拆解与依赖规划.md` §6 |
| 2026-11-24 23:25 | TASK-P10-01 / 待提交 | 实测启动（127.0.0.1:8787）+ 健康检查五态 + netstat loopback | **PASS**；1s 启动、DB schema=0000、无局域网监听 | `docs/P10_工程初始化报告.md` §4 |
| 2026-11-24 23:25 | TASK-P10-01 / 待提交 | OpenAPI 导出 + 5 项 pytest 冒烟 | **PASS**；路径仅 `/api/v2/*`；pytest 5/5 | `openapi.json`、`docs/P10_工程初始化报告.md` §4 |
| 2026-11-24 23:26 | TASK-P10-01 / 待提交 | A 基线静态门禁 G1–G10（首跑 G2 误报复扫修正后） | **PASS（退出码 0）**；6 静态 PASS + 4 STRUCTURAL_PASS；运行时判据 NOT_RUN(P13) | `docs/P10_静态门禁报告.md` |
| 2026-11-24 23:28 | TASK-P10-01 / 待提交 | P10 完成条件自检 8 项 | **PASS（工程底座层）**；业务模块/UI/外部审查仍 NOT_RUN | `docs/P10_工程初始化报告.md` §8 |
| 2026-11-24 23:46 | TASK-B01 / 待提交 | pytest（P10 冒烟 5 + B01 10） | **PASS 15/15**；临时库隔离，运行时库未污染 | `tests/base/test_auth.py` |
| 2026-11-24 23:47 | TASK-B01 / 待提交 | G1–G10 对新增 `web/login/**` 复核 | **PASS（退出码 0）**；6 静态 PASS + 4 STRUCTURAL_PASS | `docs/P11_静态门禁复核.md` |
| 2026-11-24 23:48 | TASK-B01 / 待提交 | 真实服务 HTTP：登录/me/页面/资源/退出/复用 | **PASS**；仅 loopback、`schema_version=0001_auth`、复用 401 | `docs/P11_B01_实现报告.md` §3.3 |
| 2026-11-24 23:50 | TASK-B01 / 待提交 | 完成条件自检与 3 项真实缺陷登记 | **PASS（功能闭环层，有条件）**；D-B01-01/02 根因待 P12；UI/外部审查 NOT_RUN | `docs/P11_B01_实现报告.md` §4/§5 |

> 状态口径严格遵循 V1.3：PASS / FAIL / NOT_RUN / BLOCKED / WAIVED。未执行项一律写 NOT_RUN，不虚报为通过。

## 下一步任务

1. P02–P11(B01) 已收口：PRD V1.2、P03 审查、P04 评估、P05 用户确认 A 基线、P06 架构、P07 详设、P08 测试方案、P09 任务拆解、P10 工程初始化、P11 TASK-B01（功能闭环层 PASS 有条件）。
2. 进入 **P11 TASK-B02**：账号来源枚举、管理员创建教师/审核人、课程与班级、越权拦截；新增 `migrations/0002_scope.sql`、`app/base/accounts/admin_*.py`、`app/base/courses/**`、`app/base/classes/**`、`web/courses/**`、`web/accounts/**`、`tests/base/test_scope.py`。复用 B01 的 `require_full_auth` / `require_role`；资源级 `require_scope` 在 B02 实现。**不得改 B01 auth 目录与任何冻结资产。**
3. 真实阻塞（须人类处理）：42/71 已有迁移草案，但内容锁定仍需教材解析、授权书面确认与教师逐条签字（6 条样本新编、8 条新增场景、OPEN-15 旧抽签取舍）；500/1500 阈值需 P13 实测；OPEN-05 心跳参数待配置；OPEN-14 golden set 数值待确认；D3 预算与出域待批准。
4. 保留门禁：`STU-005` 在三清单 CONTENT_LOCKED 前保持 BLOCKED；`KG-014`/`NFR-007` 在 P13 阈值固化前 BLOCKED；`NFR-011` D3 数值未配置 BLOCKED；P12 Gemini 外部独立审查与 P13 人工验收均未执行，AI 不代签；浏览器版本记录留 P13。

## 下一步提示词

```text
继续 P11：按 P09 TASK-B02 任务卡实现账号来源、课程班级与授权范围。新增 migrations/0002_scope.sql、app/base/accounts/admin_*.py、app/base/courses/**、app/base/classes/**、web/courses/**、web/accounts/**、tests/base/test_scope.py；落实 account_source 枚举、AccountCreate.role 不含 student、课程 display_name 与教材名独立、停用课程不出现在学生端、归档班历史保留、学生访问教师端点/教师跨班访问 403 并写审计；实现 require_scope 资源级授权，复用 B01 会话闸门，不改冻结资产与 B01 auth 目录。完成后跑 pytest 并回填真实证据，未执行项标 NOT_RUN。
```
