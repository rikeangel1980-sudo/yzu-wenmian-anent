# CTRL-S42｜42 样本拒答探针清单 v0.2（迁移草案，待教师逐条确认）

> 状态：**CONTENT_DRAFT_PENDING_TEACHER**（不是 CONTENT_LOCKED）
> 授权依据：用户 2026-11-24 明确授权「仅只读参考旧工程清单文本，不导入代码/页面/数据」。本文件只迁移问题文本与分类意图，不迁移旧实现、旧页面、旧数据文件。
> 来源：`wenmian_buddy/wenmian/docs/qa/reject_probe.json` 与 `scripts/probe_reject.py` 中的清单文本段；旧工程的覆盖率、score、命中标题等运行值一律不作为新工程期望值。
> 解锁条件见 `CONTROL_INDEX.md` §3：教材解析抽检 + 授权书面确认 + 教师逐条签字，缺一项不得升版为 CONTENT_LOCKED。

## 1. 迁移口径（必须如实阅读）

| 项 | 旧清单 | 本草案 v0.2 |
|---|---|---|
| 数量 | 域内 18 + 域外 24 = 42 | 42 个槽位（沿用 v0.1 分类配额） |
| 来自旧清单 | 42 条问题文本 | **36 条**直接迁入对应槽位 |
| 需新编 | 无 | **6 条**（S19–S20 域内同义 2 条；S35–S38 多轮指代 4 条）——旧清单没有这些类别，AI 不代编 |
| 备选池 | — | 6 条旧域外样本未被槽位采用，保留在 §3，可由教师替换 |
| 期望判定 | 拒答 true/false | 草案映射为新判据 `accept` / `boundary` / `insufficient`，须教师确认 |
| 证据定位 | 旧标题字符串 | 一律留空，待新教材解析后由教师填 evidence_id 与章节定位 |

> 口径提醒：一阶段报告中的 42 样本是**独立专项**；8 入口一致性在 `QA_ENTRYPOINTS_v0.1.md`；71 场景在 `E2E_SCENARIOS_v0.2.md`。三者不得互相顶替。

## 2. 42 槽位迁移草案

Columns: `sample_id | 分类 | 问题文本（草案） | expected_verdict（草案） | 旧来源 | 旧判因参考 | 新教材证据ID | 教师确认 | 状态`

| sample_id | 分类 | 问题文本（草案） | expected_verdict（草案） | 旧来源 | 旧判因参考 | 新教材证据ID | 教师确认 | 状态 |
|---|---|---|---|---|---|---|---|---|
| S01 | 域内明确 | 中国名点有哪些主要特点？ | accept（待确认） | IN01 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S02 | 域内明确 | 水饺的面团怎么调制？ | accept（待确认） | IN02 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S03 | 域内明确 | 面包面团发酵要注意什么？ | accept（待确认） | IN03 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S04 | 域内明确 | 馅心制作的基本要求是什么？ | accept（待确认） | IN05 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S05 | 域内明确 | 扬州面点有什么特色？ | accept（待确认） | IN06 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S06 | 域内明确 | 小笼包的馅心怎么调？ | accept（待确认） | IN10 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S07 | 域内明确 | 面点成型有哪些方法？ | accept（待确认） | IN11 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S08 | 域内明确 | 拉面的面团要揉到什么程度？ | accept（待确认） | IN13 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S09 | 域内明确 | 月饼的糖浆怎么熬？ | accept（待确认） | IN14 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S10 | 域内明确 | 包子蒸出来塌陷是什么原因？ | accept（待确认） | IN15 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S11 | 域内明确 | 发酵面团放多少酵母合适？ | accept（待确认） | IN16 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S12 | 域内明确 | 糯米饭怎么做才不夹生？ | accept（待确认） | IN18 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S13 | 域内同义/口语化 | 油酥面团怎么起酥？ | accept（待确认） | IN04 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S14 | 域内同义/口语化 | 蒸饺和水饺有什么区别？ | accept（待确认） | IN07 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S15 | 域内同义/口语化 | 面团为什么要醒发？ | accept（待确认） | IN08 | 旧 expanded=true（同义扩展救回；教材用「饧面」） | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S16 | 域内同义/口语化 | 怎么样让汤包皮薄不破？ | accept（待确认） | IN09 | 旧 expanded=true（同义扩展救回；拆在「制皮」「破损」多处） | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S17 | 域内同义/口语化 | 面团太软粘手怎么办？ | accept（待确认） | IN12 | none | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S18 | 域内同义/口语化 | 油条怎么才能蓬松？ | accept（待确认） | IN17 | 旧 expanded=true（同义扩展救回；教材用「膨松」） | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S19 | 域内同义/口语化 | 待新编（旧清单无对应类别，AI 不代编） | accept（待确认） | 无 | 无 | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S20 | 域内同义/口语化 | 待新编（旧清单无对应类别，AI 不代编） | accept（待确认） | 无 | 无 | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S21 | 域外明确 | 今天上海的天气怎么样？ | boundary（待确认） | OUT01 | domain | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S22 | 域外明确 | 明天北京的天气如何？ | boundary（待确认） | OUT02 | domain | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S23 | 域外明确 | 红烧肉怎么做？ | insufficient（待确认） | OUT03 | low_coverage | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S24 | 域外明确 | 怎么用Python写爬虫？ | boundary（待确认） | OUT05 | domain | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S25 | 域外明确 | 帮我写一篇英语作文 | boundary（待确认） | OUT06 | domain | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S26 | 域外明确 | 股票明天会涨吗？ | boundary（待确认） | OUT07 | domain | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S27 | 域外明确 | 我想退课怎么办？ | boundary（待确认） | OUT08 | domain | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S28 | 域外明确 | 明天几点上课？ | boundary（待确认） | OUT09 | domain | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S29 | 边界/跨章节 | 上海有什么旅游景点？ | boundary（待确认） | OUT13 | domain | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S30 | 边界/跨章节 | 今天是什么节日？ | boundary（待确认） | OUT24 | domain | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S31 | 边界/跨章节 | 北京有哪些好吃的火锅？ | insufficient（待确认） | OUT10 | low_coverage | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S32 | 边界/跨章节 | 帮我订一张去广州的机票 | insufficient（待确认） | OUT11 | low_coverage | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S33 | 边界/跨章节 | 明天要不要带伞？ | boundary（待确认） | OUT20 | domain | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S34 | 边界/跨章节 | 帮我翻译一段英文 | boundary（待确认） | OUT22 | domain | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S35 | 多轮指代 | 待新编（旧清单无对应类别，AI 不代编） | accept（待确认，需含上文） | 无 | 无 | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S36 | 多轮指代 | 待新编（旧清单无对应类别，AI 不代编） | accept（待确认，需含上文） | 无 | 无 | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S37 | 多轮指代 | 待新编（旧清单无对应类别，AI 不代编） | accept（待确认，需含上文） | 无 | 无 | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S38 | 多轮指代 | 待新编（旧清单无对应类别，AI 不代编） | accept（待确认，需含上文） | 无 | 无 | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S39 | 无证据/空召回 | 世界杯谁夺冠了？ | insufficient（待确认） | OUT04 | low_coverage | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S40 | 无证据/空召回 | 这道题数学怎么解？ | insufficient（待确认） | OUT12 | low_coverage | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S41 | 无证据/空召回 | 帮我写份检讨书 | insufficient（待确认） | OUT16 | low_coverage | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |
| S42 | 无证据/空召回 | iPhone 最新款多少钱？ | insufficient（待确认） | OUT18 | low_coverage | 待填 | 待教师逐条确认 | DRAFT_PENDING_TEACHER |

> S13、S14、S17 被归入「域内同义/口语化」是依据问题用词与教材术语差异的迁移推断（旧清单未标 expanded），须教师确认。
> S29–S34 的分类沿用 v0.1「边界/跨章节」，但迁入的旧样本实际是「词面重合导致误命中」的边界型域外问句；分类是否恰当须教师确认，不能默认通过。

## 3. 旧清单备选池（未被槽位采用，供教师替换）

| 旧来源 | 问题文本 | 旧判因参考 | 可用作 | 状态 |
|---|---|---|---|---|
| OUT14 | 推荐一部好看的电影 | domain | 域外明确/边界候选 | 备选，未计入 42 |
| OUT15 | 如何申请美国签证？ | domain | 域外明确/边界候选 | 备选，未计入 42 |
| OUT17 | 今年GDP增速是多少？ | low_coverage | 域外明确/边界候选 | 备选，未计入 42 |
| OUT19 | 怎么给手机刷机？ | domain | 域外明确/边界候选 | 备选，未计入 42 |
| OUT21 | 广州天气怎么样？ | domain | 域外明确/边界候选 | 备选，未计入 42 |
| OUT23 | 现在几点了？ | domain | 域外明确/边界候选 | 备选，未计入 42 |

## 4. 教师确认要求

1. 逐行确认「问题文本是否适用于新教材」「expected_verdict 是否正确」「新教材证据 ID 与章节定位」；不适用则改写或换入 §3 备选。
2. S19–S20、S35–S38 共 6 条须由教师新编；AI 不得自行补写后置为锁定。
3. 确认完成后由教师/项目负责人签字并升版 v1.0；签字不由 AI 代签。
4. 三清单未全部升版 CONTENT_LOCKED 前，`STU-005` 保持 BLOCKED。

## 5. 变更记录

| 版本 | 时间 | 变更 | 操作者 |
|---|---|---|---|
| v0.1 | 2026-11-24 22:20 | 建立配额、字段 schema 与 42 个 ID；内容 BLOCKED | P08 编排层 |
| v0.2 | 2026-11-24 22:35 | 经用户授权只读迁移旧清单文本：36 条入槽、6 条入备选池、6 槽待新编；状态改为待教师确认 | P08 编排层 |
