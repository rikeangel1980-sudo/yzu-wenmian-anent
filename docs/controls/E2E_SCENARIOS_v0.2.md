# CTRL-F71｜71 场景端到端清单 v0.2（迁移草案，待教师逐条确认）

> 状态：**CONTENT_DRAFT_PENDING_TEACHER**（不是 CONTENT_LOCKED）
> 授权依据：用户 2026-11-24 明确授权「仅只读参考旧工程清单文本，不导入代码/页面/数据」。本文件只迁移检查意图与场景描述，不迁移脚本、页面、截图或数据文件。
> 来源：`wenmian_buddy/wenmian/docs/qa/experience_report_raw.json`（api 20 / pages 9 / flows 14 / content 5 / edge 15）与 `问面_全流程体验测试报告.md`。

## 1. 口径核对（必须如实阅读）

- 旧报告写「71 项 = 接口 20 + 页面 9 + 交互 14 + 内容 5 + 边界 15 + 拒答专项 42」，但逐条原始清单只有 **63 条**（20+9+14+5+15）；差值 **8** 实为「入口一致性 8/8」。42 样本是独立专项。
- 本草案沿用 P08 v0.1 的 71 槽位（20+9+18+6+18）：**63 条**旧检查意图迁入并改写为 V2.0 目标，**8 条**为 V2.0 新增场景（FLOW-15~18、CONTENT-06、EDGE-16~18）。
- 旧清单中的 chunks/cases/nodes 等运行数值、旧页面标题、旧接口路径一律**不作为新工程期望值**；草案只写结构性可观测结果。
- 旧「评委抽签」相关 3 项（API-15、FLOW-13、FLOW-14）在 V2.0 API 契约中无对应定义，标为「待产品确认」，不预设 PASS。

## 2. 71 条草案

Columns: `scenario_id | category | 草案目标/步骤 | 草案预期（可观测） | 旧来源 | module_ref | 状态`

| scenario_id | category | 草案目标/步骤 | 草案预期（可观测） | 旧来源 | module_ref | 状态 |
|---|---|---|---|---|---|---|
| API-01 | api | GET /api/v2/ops/health | 200；应用/DB/目录/索引/模型配置五态齐全，不含 Key 明文 | OLD-api-01 /api/health | FND-010 | DRAFT_PENDING_TEACHER |
| API-02 | api | GET /api/v2/knowledge/chapters | 200；返回 textbook_version 与 parse_report 摘要，不含旧运行数值 | OLD-api-02 /api/kb/stats | FND-003 | DRAFT_PENDING_TEACHER |
| API-03 | api | GET /api/v2/knowledge/search?scope=case | 200；hits 含 evidence_id 与版本，走 KBTool.search | OLD-api-03 /api/cases | STU-006 | DRAFT_PENDING_TEACHER |
| API-04 | api | GET /api/v2/knowledge/chapters | 200；章节树层级完整，与 parse_report 一致 | OLD-api-04 /api/course/tree | FND-003 | DRAFT_PENDING_TEACHER |
| API-05 | api | GET /api/v2/graph/list | 200；无 canvas 也可读节点/边列表，作为渲染降级路径 | OLD-api-05 /api/graph | KG-013 | DRAFT_PENDING_TEACHER |
| API-06 | api | GET /api/v2/knowledge/search?scope=case | 200；案例条目带来源定位字段 | OLD-api-06 /api/atlas | FND-005 | DRAFT_PENDING_TEACHER |
| API-07 | api | GET /api/v2/knowledge/search?scope=case&tag=training | 200；实训可用案例列表非空且经授权 | OLD-api-07 /api/coach/cases | STU-014 | DRAFT_PENDING_TEACHER |
| API-08 | api | POST /api/v2/formula/calculate（先取有效案例） | 有效案例 200；无效案例 404/422，错误文案可行动 | OLD-api-08 /api/calc/cases | STU-014 | DRAFT_PENDING_TEACHER |
| API-09 | api | GET /api/v2/teacher/analytics | 200；带 sample_count/metric_definition/updated_at，无模拟数据混入 | OLD-api-09 /api/demo/stats | FND-010 | DRAFT_PENDING_TEACHER |
| API-10 | api | GET /api/v2/ops/health（model_config 段） | 200；模型配置状态可见但 Key 仅显示引用名 | OLD-api-10 /api/vision/status | NFR-010 | DRAFT_PENDING_TEACHER |
| API-11 | api | GET /api/v2/knowledge/search?q=水饺 | 200；返回 evidence_ids，检索词脱敏落审计 | OLD-api-11 /api/search?q=水饺 | STU-006 | DRAFT_PENDING_TEACHER |
| API-12 | api | GET /api/v2/knowledge/search?q=面团 | 200；同上 | OLD-api-12 /api/search?q=面团 | STU-006 | DRAFT_PENDING_TEACHER |
| API-13 | api | GET /api/v2/knowledge/search?q=酵母 | 200；同上 | OLD-api-13 /api/search?q=酵母 | STU-006 | DRAFT_PENDING_TEACHER |
| API-14 | api | GET /api/v2/knowledge/search?q=中国名点 | 200；同上 | OLD-api-14 /api/search?q=中国名点 | STU-006 | DRAFT_PENDING_TEACHER |
| API-15 | api | V2.0 对应能力待产品确认（旧「评委抽签」未在新 API 契约中定义） | 不预设 PASS；须先确认是否保留，再定义接口与用例 | OLD-api-15 /api/demo/draw | 待确认 | DRAFT_PENDING_TEACHER |
| API-16 | api | POST /api/v2/training/{id}/report | 200；报告基于真实步骤数据；不存在会话 404 | OLD-api-16 /api/diagnose | STU-014 | DRAFT_PENDING_TEACHER |
| API-17 | api | POST /api/v2/formula/calculate | 200；比例因子生效，单位与换算口径一致 | OLD-api-17 /api/calc/scale | STU-014 | DRAFT_PENDING_TEACHER |
| API-18 | api | POST /api/v2/qa/ask（教材内问题） | 200；verdict=accept；引用由服务端按 evidence_id 渲染 | OLD-api-18 /api/agent/chat 教材内 | STU-005 | DRAFT_PENDING_TEACHER |
| API-19 | api | POST /api/v2/qa/ask（越界问题） | 200；verdict=boundary；无越界来源卡片 | OLD-api-19 /api/agent/chat 越界 | STU-005 | DRAFT_PENDING_TEACHER |
| API-20 | api | POST /api/v2/ai/outbound-approval（空 body） | 422；缺失字段明确；未批准不得调用出域模型 | OLD-api-20 /api/vision/photo 空请求 | NFR-011 | DRAFT_PENDING_TEACHER |
| PAGE-01 | pages | 教材问答页（学生端） | A 基线 ed-columns + item-list + cite；首页仅学习内容，无调试字段 | OLD-page-01 / 知识问答 | FND-006 | DRAFT_PENDING_TEACHER |
| PAGE-02 | pages | 课程目录/知识单元页 | 章节树→正文；来源字段缺失标「待核实」 | OLD-page-02 /course | FND-003 | DRAFT_PENDING_TEACHER |
| PAGE-03 | pages | 图谱页 | G6 v5 六项严格判据；渲染失败降级为 /graph/list | OLD-page-03 /starmap | KG-014 | DRAFT_PENDING_TEACHER |
| PAGE-04 | pages | 案例/资源页 | 网格→详情；每条含来源定位 | OLD-page-04 /atlas | FND-005 | DRAFT_PENDING_TEACHER |
| PAGE-05 | pages | 分步实训报告页 | 步骤→报告；报告只基于真实事件 | OLD-page-05 /coach | STU-014 | DRAFT_PENDING_TEACHER |
| PAGE-06 | pages | 配方换算页 | 倍数/主料/总量/自定义四模式可用 | OLD-page-06 /calc | STU-014 | DRAFT_PENDING_TEACHER |
| PAGE-07 | pages | 问题诊断页 | 现象→诊断；空现象给可行动提示 | OLD-page-07 /diag | STU-014 | DRAFT_PENDING_TEACHER |
| PAGE-08 | pages | 视频/视觉页 | 未批准出域或无 Key 时显示边界提示，不发起模型调用 | OLD-page-08 /vision | NFR-011 | DRAFT_PENDING_TEACHER |
| PAGE-09 | pages | 教师工作台 | A 基线教师四项指标 auto-fit 无孤行；师生同风格同色调 | OLD-page-09 /demo（V2.0 无对应功能，槽位改由教师工作台填充，须教师确认） | TCH-001 | DRAFT_PENDING_TEACHER |
| FLOW-01 | flows | 教材问答：提问→答案+引用 | 回答与来源卡片并列；引用 ID 可展开 | OLD-flow-01 C1 | STU-006 | DRAFT_PENDING_TEACHER |
| FLOW-02 | flows | 教材问答：多轮追问 | 显示本轮证据版本；换教材版本后旧回答标历史 | OLD-flow-02 C1b | STU-007 | DRAFT_PENDING_TEACHER |
| FLOW-03 | flows | 课程知识：点章节→正文 | 正文字数与章节树节点对应 | OLD-flow-03 C2a | FND-003 | DRAFT_PENDING_TEACHER |
| FLOW-04 | flows | 图谱：局部渲染与搜索 | G6 render() Promise resolve 后判 PASS；六项严格判据全绿 | OLD-flow-04 C2b | KG-014 | DRAFT_PENDING_TEACHER |
| FLOW-05 | flows | 图谱：搜索定位节点 | 搜索后命中节点可见且位置有限值 | OLD-flow-05 C2c | KG-010 | DRAFT_PENDING_TEACHER |
| FLOW-06 | flows | 图谱：列表降级路径 | 禁用 canvas 时 /graph/list 可读，提示可行动 | OLD-flow-06 C3（旧 3D 星图；V2.0 形态待确认） | KG-013 | DRAFT_PENDING_TEACHER |
| FLOW-07 | flows | 案例：网格→详情→返回 | 来源定位可点；返回保留原任务上下文 | OLD-flow-07 C4 | STU-014 | DRAFT_PENDING_TEACHER |
| FLOW-08 | flows | 实训：案例选择层可见可点 | 无「空承诺」入口 | OLD-flow-08 C5a | STU-009 | DRAFT_PENDING_TEACHER |
| FLOW-09 | flows | 实训：作答→提示→看答案→报告 | 步骤完整；报告由真实事件生成 | OLD-flow-09 C5b | STU-014 | DRAFT_PENDING_TEACHER |
| FLOW-10 | flows | 配方换算：四种模式 | 四模式均可复算，单位一致 | OLD-flow-10 C6 | STU-014 | DRAFT_PENDING_TEACHER |
| FLOW-11 | flows | 问题诊断：输入现象→出诊断 | 诊断结果与教材证据关联，无臆造边 | OLD-flow-11 C7 | STU-014 | DRAFT_PENDING_TEACHER |
| FLOW-12 | flows | 多模态：页面就绪状态 | 状态与模型配置一致；未配置时明确提示 | OLD-flow-12 C8 | NFR-011 | DRAFT_PENDING_TEACHER |
| FLOW-13 | flows | 抽签：抽取案例+路径 | V2.0 未定义该能力，须先确认是否保留再写步骤 | OLD-flow-13 C9 | 待确认 | DRAFT_PENDING_TEACHER |
| FLOW-14 | flows | 抽签：再抽一次 | 同上，不预设 PASS | OLD-flow-14 C9b | 待确认 | DRAFT_PENDING_TEACHER |
| FLOW-15 | flows | 登录→名单导入预览→提交→课程班级授权 | 学生账号仅来自名单；不产生教师账号；审计逐条留痕 | V2.0 新增（MOD-BASE） | FND-002 | DRAFT_PENDING_TEACHER |
| FLOW-16 | flows | 题库审核→组卷→考试发布→阅卷→成绩更正 | 试卷自包含快照；更正留痕；发布后只追加 | V2.0 新增（MOD-QEX） | STU-011 | DRAFT_PENDING_TEACHER |
| FLOW-17 | flows | 作业发布→提交→AI 建议→教师终评→发布 | 三栏原件/建议/终评分；教师确认才发布 | V2.0 新增（MOD-ASG） | TCH-008 | DRAFT_PENDING_TEACHER |
| FLOW-18 | flows | 视频上传→发布→播放心跳→进度 | 分片鉴权；大跳转作废；连续区间并集≥90% 才完成 | V2.0 新增（MOD-VID） | VID-005 | DRAFT_PENDING_TEACHER |
| CONTENT-01 | content | 页面可见文本无旧课程名残留 | 九类页面扫描：无旧课程名、无调试字段、无示例快照 | OLD-content-01 D1 | FND-006 | DRAFT_PENDING_TEACHER |
| CONTENT-02 | content | 数据口径快照 | 页面与接口同源；带 updated_at；不出现旧运行数值 | OLD-content-02 D2 | FND-010 | DRAFT_PENDING_TEACHER |
| CONTENT-03 | content | 证据引用抽检 | evidence_id 可回溯；_cite_overflow 生效；无越界来源 | OLD-content-03 D3 | STU-006 | DRAFT_PENDING_TEACHER |
| CONTENT-04 | content | 视觉硬闸门人工验证 | 需真实图片/视频；转人工，AI 不代签 | OLD-content-04 D4 | NFR-012 | DRAFT_PENDING_TEACHER |
| CONTENT-05 | content | 章节树完整性 | 章节→知识单元→证据片段层级校验；parse_report 可复算 | OLD-content-05 D5 | FND-003 | DRAFT_PENDING_TEACHER |
| CONTENT-06 | content | 换教材版本一致性 | textbook_version 的 SHA-256 与 parse_report 对应；原子切换可回滚 | V2.0 新增（MOD-KNOW） | FND-004 | DRAFT_PENDING_TEACHER |
| EDGE-01 | edge | 空搜索词 | 200/400 依契约；结果为空且有明确提示 | OLD-edge-01 | FND-007 | DRAFT_PENDING_TEACHER |
| EDGE-02 | edge | 超长搜索词（800 字） | 不崩溃；限长或截断有明确文案 | OLD-edge-02 | NFR-004 | DRAFT_PENDING_TEACHER |
| EDGE-03 | edge | XSS 注入 | 转义后无脚本执行；审计记录脱敏 | OLD-edge-03 | NFR-005 | DRAFT_PENDING_TEACHER |
| EDGE-04 | edge | 不存在的案例 | 404；文案可行动 | OLD-edge-04 | STU-014 | DRAFT_PENDING_TEACHER |
| EDGE-05 | edge | 不存在的实训会话 | 404；提示重新开始的路径 | OLD-edge-05 | STU-010 | DRAFT_PENDING_TEACHER |
| EDGE-06 | edge | 不存在的换算案例 | 404；不返回空结果冒充成功 | OLD-edge-06 | STU-014 | DRAFT_PENDING_TEACHER |
| EDGE-07 | edge | 不存在的章节 | 404；不泄漏其他课程章节 | OLD-edge-07 | FND-003 | DRAFT_PENDING_TEACHER |
| EDGE-08 | edge | 图谱渲染失败降级 | 六项严格判据任一失败即判 FAIL，并切换列表降级 | OLD-edge-08 | KG-014 | DRAFT_PENDING_TEACHER |
| EDGE-09 | edge | 问答空 body | 422；字段缺失明确 | OLD-edge-09 | STU-005 | DRAFT_PENDING_TEACHER |
| EDGE-10 | edge | 问答空问题 | 400；提示可行动 | OLD-edge-10 | STU-005 | DRAFT_PENDING_TEACHER |
| EDGE-11 | edge | 超长问题（3000 字） | 限长或截断；不绕过域词闸门 | OLD-edge-11 | NFR-004 | DRAFT_PENDING_TEACHER |
| EDGE-12 | edge | 实训作答空 body | 422；session_id 缺失明确 | OLD-edge-12 | STU-009 | DRAFT_PENDING_TEACHER |
| EDGE-13 | edge | 诊断空 body | 422；symptom 缺失明确 | OLD-edge-13 | STU-014 | DRAFT_PENDING_TEACHER |
| EDGE-14 | edge | 诊断空现象 | 400；给出示例现象 | OLD-edge-14 | STU-014 | DRAFT_PENDING_TEACHER |
| EDGE-15 | edge | 换算不存在案例 | 404；与 API-08 口径一致 | OLD-edge-15 | STU-014 | DRAFT_PENDING_TEACHER |
| EDGE-16 | edge | 改密前越权访问 | must_change_password=1 时除改密/退出/最小 me 外一律 403 | V2.0 新增（MOD-BASE） | FND-002 | DRAFT_PENDING_TEACHER |
| EDGE-17 | edge | 无 Key / 出域未批准降级 | 不发起出域调用；返回教学边界通知书与教师入口 | V2.0 新增（MOD-AI） | NFR-011 | DRAFT_PENDING_TEACHER |
| EDGE-18 | edge | 并发冲突与重复提交 | 幂等键生效；不产生重复成绩/重复提交 | V2.0 新增（MOD-QEX/ASG） | NFR-006 | DRAFT_PENDING_TEACHER |

## 3. 教师确认要求

1. 逐条确认目标、步骤、预期结果是否适用于 V2.0 与当前教材；不适用则改写，不由 AI 自行定稿。
2. 标注「待产品确认」的 3 条须先决定是否保留旧能力，再定义接口与步骤。
3. 8 条 V2.0 新增场景须由教师/项目负责人确认优先级与验收口径。
4. 全部确认并签字后升版 v1.0 与 CONTENT_LOCKED；在此之前 `STU-005`、`NFR-006` 相关回归项保持 BLOCKED。

## 4. 变更记录

| 版本 | 时间 | 变更 | 操作者 |
|---|---|---|---|
| v0.1 | 2026-11-24 22:20 | 建立五类配额、ID 范围与字段 schema；内容 BLOCKED | P08 编排层 |
| v0.2 | 2026-11-24 22:36 | 经用户授权只读迁移旧清单：63 条检查意图改写为 V2.0 草案，新增 8 条 V2.0 场景；状态改为待教师确认 | P08 编排层 |
