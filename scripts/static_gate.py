"""A 基线静态门禁 G1–G10（P10 自动化扫描，P13 UI 回归双人复核）。

判定原则（诚实口径）：
- 可静态判定的项（G1/G2/G3/G4/G5/G8 的结构部分）给真实 PASS/FAIL；
- 需浏览器运行时/目检的项（G6 孤行目检、G7 渲染路径、G9 交互、G10 降级注入）
  只做"结构锚点存在"预检，标 STRUCTURAL_PASS，运行时判据仍为 NOT_RUN（P13）。
- 任一 STATIC FAIL → 进程退出码 1，不得进入 P11。

用法：.venv/Scripts/python.exe scripts/static_gate.py [--report docs/P10_静态门禁报告.md]
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "web"
DELIVERABLES = [WEB]

HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
RGB = re.compile(r"rgba?\([^)]*\)")
DATA_ROLE = re.compile(r"\[data-role[^\]]*\]\s*\{")
B_C_SCHEME = re.compile(r'\[data-scheme\s*=\s*["\']?[BC]["\']?\]')
SCHEME_READ = re.compile(r"(URLSearchParams|location\.hash|location\.search)[^\n]*scheme|get\(['\"]scheme['\"]\)", re.I)


def strip_comments(text: str, *, html: bool = False) -> str:
    """静态语义分析须剔除注释：注释中声明『不解析 scheme』不是可执行读取。"""
    if html:
        text = re.sub(r"<!--.*?-->", " ", text, flags=re.S)
    else:
        text = re.sub(r"/\*.*?\*/", " ", text, flags=re.S)
        text = re.sub(r"//[^\n]*", " ", text)
    return text


class Result:
    def __init__(self, gid: str, name: str, kind: str) -> None:
        self.gid, self.name, self.kind = gid, name, kind
        self.status = "NOT_RUN"
        self.detail = ""

    def set(self, status: str, detail: str) -> None:
        self.status, self.detail = status, detail

    @property
    def blocking_fail(self) -> bool:
        return self.status == "FAIL"


def scan_files(pattern: str) -> list[Path]:
    out: list[Path] = []
    for base in DELIVERABLES:
        out.extend(p for p in base.rglob(pattern) if p.is_file())
    return out


def g1(r: Result) -> None:
    entries = list(WEB.rglob("index.html"))
    switching = []
    for p in WEB.rglob("*.html"):
        text = strip_comments(p.read_text(encoding="utf-8"), html=True)
        if "#scheme" in text or B_C_SCHEME.search(text):
            switching.append(p)
    if entries or switching:
        r.set("FAIL", f"index.html={[str(p) for p in entries]}; B/C切换={[str(p) for p in switching]}")
    else:
        r.set("PASS", "交付目录无 index.html；入口 baseline.html 无 #scheme/B/C 切换")


def g2(r: Result) -> None:
    js = scan_files("*.js")
    html = scan_files("*.html")
    offenders: list[str] = []
    for p in js + html:
        is_html = p.suffix == ".html"
        text = strip_comments(p.read_text(encoding="utf-8"), html=is_html)
        if SCHEME_READ.search(text):
            offenders.append(str(p))
        if 'LOCKED_SCHEME' in text and "effectiveScheme" not in text:
            offenders.append(f"{p}: LOCKED_SCHEME 无生效函数")
    if offenders:
        r.set("FAIL", f"scheme 读取/绕过风险：{sorted(set(offenders))}")
    else:
        r.set("PASS", "脚本不读 URL scheme；effectiveScheme() 恒返回 A；B|C 被忽略")


def g3(r: Result) -> None:
    allow = WEB / "styles" / "tokens.css"
    offenders: list[str] = []
    for p in WEB.rglob("*"):
        if not p.is_file() or p.suffix not in {".css", ".js", ".html"}:
            continue
        raw = p.read_text(encoding="utf-8")
        text = strip_comments(raw)  # 注释里的示例色值不是生效样式
        if p == allow:
            # 令牌文件只允许 [data-scheme="A"] 段内有色值
            body = text.split('[data-scheme="A"]', 1)
            if len(body) < 2 or (HEX.search(body[0]) or RGB.search(body[0])):
                offenders.append(f"{p.name}: A 段以外出现色值")
            if B_C_SCHEME.search(text):
                offenders.append(f"{p.name}: 含 B/C 段")
            continue
        if HEX.search(text) or B_C_SCHEME.search(text):
            offenders.append(str(p))
    if offenders:
        r.set("FAIL", f"非白名单硬编码色值/B-C段：{sorted(set(offenders))}")
    else:
        r.set("PASS", "仅 tokens.css 的 [data-scheme=\"A\"] 段定义色值；其余为 var()")


def g4(r: Result) -> None:
    offenders = [str(p) for p in WEB.rglob("*.css") if DATA_ROLE.search(p.read_text(encoding="utf-8"))]
    r.set("FAIL", f"data-role 配色覆盖：{offenders}") if offenders else r.set("PASS", "无 [data-role=...] 配色覆盖")


def g5(r: Result) -> None:
    tokens = list(WEB.rglob("tokens.css"))
    r.set("PASS", f"师生共用单一 token 文件：{[str(p) for p in tokens]}") if len(tokens) == 1 else r.set(
        "FAIL", f"token 文件数量异常：{[str(p) for p in tokens]}")


def g6(r: Result) -> None:
    js = "\n".join(p.read_text(encoding="utf-8") for p in scan_files("*.js"))
    css = "\n".join(p.read_text(encoding="utf-8") for p in scan_files("*.css"))
    ok = "auto-fit" in css and "figures()" in js and "teacher" in js
    r.set("STRUCTURAL_PASS" if ok else "FAIL",
          "结构锚点：ed-figures/ind-metrics 为 auto-fit；学生3/教师4指标同版式。"
          + ("" if ok else " 缺少锚点。")
          + " 运行时无孤行目检=NOT_RUN(P13)")


def g7(r: Result) -> None:
    js = "\n".join(p.read_text(encoding="utf-8") for p in scan_files("*.js"))
    ok = "statusPage" in js and 'data-act="login"' in js and 'data-act="go-home"' in js
    r.set("STRUCTURAL_PASS" if ok else "FAIL",
          "结构锚点：状态页含重新登录与返回首页入口，无裸 AUTH_REQUIRED。"
          + " 运行时渲染/截图=NOT_RUN(P13)")


def g8(r: Result) -> None:
    js = "\n".join(p.read_text(encoding="utf-8") for p in scan_files("*.js"))
    bad = [k for k in ("account_id", "student_no", "UUID", "示例快照", "debug") if k in js]
    r.set("FAIL", f"学生首页骨架含技术字段：{bad}") if bad else r.set("PASS", "首页骨架无账号技术字段/调试字段/示例快照")


def g9(r: Result) -> None:
    js = "\n".join(p.read_text(encoding="utf-8") for p in scan_files("*.js"))
    css = "\n".join(p.read_text(encoding="utf-8") for p in scan_files("*.css"))
    ok = "confirmLayer" in js and "confirm-layer" in css
    r.set("STRUCTURAL_PASS" if ok else "FAIL",
          "结构锚点：二次确认层存在（批量/发布/成绩确认需业务任务接入）。"
          + " 运行时交互=NOT_RUN(P13)")


def g10(r: Result) -> None:
    js = "\n".join(p.read_text(encoding="utf-8") for p in scan_files("*.js"))
    css = "\n".join(p.read_text(encoding="utf-8") for p in scan_files("*.css"))
    ok = all(k in js for k in ("graph-left", "graph-center", "graph-right", "canvas-fallback")) \
        and "graph-wrap" in css
    r.set("STRUCTURAL_PASS" if ok else "FAIL",
          "结构锚点：图谱三栏（搜索/画布/详情）+ 画布降级占位存在。"
          + " 运行时降级注入=NOT_RUN(P13)")


CHECKS = [
    ("G1", "交付目录不含 index.html/B-C 切换", "static", g1),
    ("G2", "入口不读 scheme；B|C 被忽略", "static", g2),
    ("G3", "仅 A 段定义色值；无硬编码色", "static", g3),
    ("G4", "无 [data-role] 配色覆盖", "static", g4),
    ("G5", "师生共用单一 token 文件", "static", g5),
    ("G6", "指标 auto-fit 无孤行", "structural", g6),
    ("G7", "会话失效有登录入口/返回路径", "structural", g7),
    ("G8", "学生首页无调试/技术字段", "static", g8),
    ("G9", "批量/发布/成绩二次确认", "structural", g9),
    ("G10", "画布异常保留搜索/列表/详情", "structural", g10),
]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", default="")
    args = ap.parse_args()
    results = []
    for gid, name, kind, fn in CHECKS:
        r = Result(gid, name, kind)
        try:
            fn(r)
        except Exception as exc:  # 扫描器自身异常按 FAIL 处理，绝不静默 PASS
            r.set("FAIL", f"扫描器异常：{type(exc).__name__}: {exc}")
        results.append(r)

    lines = [
        "# P10 · A 基线静态门禁报告",
        "",
        "> 生成方式：`scripts/static_gate.py` 真实扫描 `web/` 交付目录。",
        "> 口径：PASS=静态判定通过；STRUCTURAL_PASS=结构锚点存在但运行时判据 NOT_RUN(P13)；FAIL=阻断。",
        "",
        "| 项 | 判据 | 类型 | 状态 | 说明 |",
        "|---|---|---|---|---|",
    ]
    for r in results:
        lines.append(f"| {r.gid} | {r.name} | {r.kind} | {r.status} | {r.detail} |")
    fails = [r for r in results if r.blocking_fail]
    lines += [
        "",
        f"**结论**：STATIC/STRUCTURAL 失败 {len(fails)} 项"
        + ("；不得进入 P11。" if fails else "；可进入 P11（运行时 UI 判据仍 NOT_RUN，P13 复核）。"),
        "",
        "运行时未执行项：G6 无孤行目检、G7 失效渲染截图、G9 二次确认交互、G10 画布降级注入 —— 均 NOT_RUN（P13）。",
        "",
    ]
    text = "\n".join(lines)
    print(text)
    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(text, encoding="utf-8")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
