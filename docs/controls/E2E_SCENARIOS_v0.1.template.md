# CTRL-F71｜71 场景端到端清单 v0.1（框架锁定，内容 BLOCKED）

> 状态：**FRAMEWORK_LOCKED / CONTENT_BLOCKED**
> 字段 schema：`scenario_id, category, precondition, steps, expected_result, priority, module_ref`
> V2.0 模块较一阶段扩充（账号、班级、考试、作业、视频、学情），分类按功能切片重新定义，不照搬一阶段分类。
> 内容 BLOCKED 原因与解锁条件见 `CONTROL_INDEX.md` §3。不得由 AI 自行编造场景后标为锁定。

## 1. 分类配额与 ID 范围

| 分类 | 条数 | ID 范围 | 覆盖范围 | 状态 |
|---|---|---|---|---|
| api | 20 | API-01 ~ API-20 | 接口契约、错误码、幂等、鉴权、越权 | BLOCKED |
| pages | 9 | PAGE-01 ~ PAGE-09 | 页面加载、导航、异常态、A 基线门禁 | BLOCKED |
| flows | 18 | FLOW-01 ~ FLOW-18 | 跨模块纵向流程（登录→导入→组卷→考试→阅卷→学情等） | BLOCKED |
| content | 6 | CONTENT-01 ~ CONTENT-06 | 教材内容、来源定位、图谱路径、视频关联 | BLOCKED |
| edge | 18 | EDGE-01 ~ EDGE-18 | 异常、安全、降级、并发、越权 | BLOCKED |
| **合计** | **71** | — | — | **BLOCKED** |

## 2. 逐条模板

每条场景须按以下结构填写，并映射到 P08 §3 的需求编号：

```markdown
| scenario_id | category | precondition | steps | expected_result | priority | module_ref | 状态 |
|---|---|---|---|---|---|---|---|
| API-01 | api | 已有教师账号与授权课程 | 1. … 2. … | 返回 …；审计 … | P0 | FND-002 | BLOCKED |
```

- `priority`：P0（阻断）/ P1（重要）/ P2（一般）。
- `module_ref`：必须引用 PRD 需求编号（如 `FND-005`、`STU-011`、`KG-014`），不允许空值。
- `steps`：可复现的具体操作，不写「按正常流程操作」这类不可验证描述。
- `expected_result`：必须包含可观测结果（响应码、页面元素、审计字段、数据变化）。

## 3. 生成约束

1. 71 条须覆盖 75 项 MUST 中的全部 P0 功能；一项需求可对应多条场景，但不得有需求无场景。
2.  flows 必须包含至少 6 条跨模块链路：登录→名单导入→课程班级授权；教材→检索→问答→来源；题库审核→组卷→考试发布→阅卷→成绩发布；作业发布→提交→AI 建议→教师终评分；图谱候选→审核→发布→回滚；视频上传→发布→播放→进度。
3. edge 必须包含会话失效、无 Key 降级、上传失败、任务超时、并发冲突、越权共 6 类。
4. 场景内容由教师/用户确认后升版至 v1.0；AI 可起草但不得自行标 CONTENT_LOCKED。

## 4. 变更记录

| 版本 | 时间 | 变更 | 操作者 |
|---|---|---|---|
| v0.1 | 2026-11-24 22:20 | 建立五类配额、ID 范围与字段 schema；内容未生成，标 BLOCKED | P08 编排层 |
