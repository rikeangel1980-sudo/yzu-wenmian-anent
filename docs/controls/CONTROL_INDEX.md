# CONTROL_INDEX｜问面 V2.0 受控清单索引

> 建立时间：2026-11-24 22:20 +0800
> 本文件是判定「受控清单是否已锁定」的唯一入口。未在此登记的清单不视为受控附件。
> 状态口径：FRAMEWORK_LOCKED（框架锁定）/ CONTENT_LOCKED（内容锁定）/ BLOCKED / SUPERSEDED。

## 1. 索引

| 清单 ID | 名称 | 版本 | 框架状态 | 内容状态 | 文件 | 锁定人 | 备注 |
|---|---|---|---|---|---|---|---|
| CTRL-E08 | 问答入口一致性清单 | v0.1 | FRAMEWORK_LOCKED | **CONTENT_LOCKED（仅设计约定，待 P11 实现核对）** | `QA_ENTRYPOINTS_v0.1.md` | P08 编排层 | 8 条入口来自 P07 API 契约与 PRD；P11 实现后须核对，变化则升版 |
| CTRL-S42 | 42 样本拒答探针清单 | v0.1 | FRAMEWORK_LOCKED | **BLOCKED** | `REJECT_SAMPLES_v0.1.template.md` | 待教师签字 | 分类/条数/字段已定；题目文本未生成 |
| CTRL-F71 | 71 场景端到端清单 | v0.1 | FRAMEWORK_LOCKED | **BLOCKED** | `E2E_SCENARIOS_v0.1.template.md` | 待教师签字 | 分类/条数/字段已定；逐条步骤未生成 |
| CTRL-GOLD | 换教材 golden set | v0.1 | FRAMEWORK_LOCKED | **BLOCKED** | 见 `docs/P08_测试方案与验收标准.md` §6 | 待教师/项目负责人确认 | 样本量/来源/阈值未定（OPEN-14） |

## 2. 判定规则

1. `STU-005` 的通过，以 CTRL-S42 / CTRL-E08 / CTRL-F71 均为 CONTENT_LOCKED 为前提；`NFR-006` 自身用例可执行，但其中涉及能力契约回归的子项在三项清单锁定前不判通过。
2. 三项一致性（42 样本准确率、接口-探针一致性、入口一致性）任一不通过，准确率视为无效。
3. 框架锁定不等于内容锁定；BLOCKED 项不得在测试报告中改写为 PASS 或「基本通过」。
4. AI 不得代替教师或项目负责人在清单上签字。

## 3. 解锁条件（CTRL-S42 / CTRL-F71）

| # | 条件 | 当前状态 |
|---|---|---|
| 1 | 新教材解析完成并通过教师抽检（`parse_report`） | NOT_RUN |
| 2 | 教材授权范围书面确认（ARCH-CR-001 剩余部分） | NOT_RUN（D3） |
| 3 | 教师逐条确认 42 样本与 71 场景内容并签字 | NOT_RUN |
| 4 | 若用旧资产清单作参考，须用户重新明确授权并记录原因，只提取清单文本 | NOT_RUN（P00-A1 当前禁止） |

## 4. 变更记录

| 版本 | 时间 | 变更 | 操作者 |
|---|---|---|---|
| v0.1 | 2026-11-24 22:20 | 建立索引；锁定 8 入口设计约定；42/71/golden set 仅框架锁定 | P08 编排层 |
