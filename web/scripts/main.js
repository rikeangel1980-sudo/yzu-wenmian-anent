/* =========================================================
   问面 V2.0 交付版前端骨架（P10 工程初始化）
   - 沿用 P05 方案 A · Editorial 基线的 ed-* 真实类名
   - 锁定 A；不读取 scheme 参数；URL 带 scheme=B|C 一律忽略（G2）
   - 无硬编码色值、无 [data-role] 配色覆盖（G3/G4）
   - 仅提供结构锚点；业务页面由 P11 各任务扩展，此处不实现业务数据
   ========================================================= */
'use strict';

const LOCKED_SCHEME = 'A';
const S = { role: 'student', page: 'home', logged: false, forceState: null };

/* 明确不解析 location.search / location.hash 中的 scheme；
   任何分享链接都不足以改变视觉基线。 */
function effectiveScheme() { return LOCKED_SCHEME; }

const el = id => document.getElementById(id);

const I = {
  home: '<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>',
  book: '<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h7v16H4zM13 4h7v16h-7z"/></svg>',
  graph: '<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 7l3 9M16 7l-3 9"/></svg>',
  user: '<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>'
};

const NAV = [
  ['home', '首页', I.home],
  ['course', '课程', I.book],
  ['graph', '图谱', I.graph],
  ['me', '我的', I.user]
];

/* 状态页：会话失效/未登录必须给登录入口与返回路径（G7） */
function statusPage(kind) {
  const map = {
    anonymous: ['尚未登录', '登录后查看课程内容与学习进度。'],
    expired: ['会话已失效', '登录状态已过期，请重新登录以继续。'],
    loading: ['正在载入', '正在准备课堂内容…'],
    error: ['加载失败', '暂时无法加载，请稍后重试或返回首页。']
  };
  const [title, desc] = map[kind] || map.error;
  const actions = (kind === 'expired' || kind === 'anonymous')
    ? '<button class="btn primary" data-act="login">重新登录</button><button class="btn ghost" data-act="go-home">返回首页</button>'
    : '<button class="btn" data-act="go-home">返回首页</button>';
  return `<section class="ind-status">
    <div class="ed-kicker">状态提示</div>
    <h2 class="ed-title" style="font-size:28px">${title}</h2>
    <p class="ed-lede">${desc}</p>
    <div class="actions">${actions}</div>
  </section>`;
}

/* 首页：学生 3 项 / 教师 4 项指标，共用 ed-figures（auto-fit，无孤行 G6） */
function figures() {
  const items = S.role === 'teacher'
    ? [['发布作业', '12'], ['待批阅', '38'], ['班级数', '3'], ['学情预警', '5']]
    : [['在学课程', '2'], ['待完成', '6'], ['掌握度', '68%']];
  return `<div class="ed-figures">${items.map(([l, n]) =>
    `<div><div class="n tabnums">${n}</div><div class="l">${l}</div></div>`).join('')}</div>`;
}

function homePage() {
  return `<div class="page-head">教学首页 · ${S.role === 'teacher' ? '教师' : '学生'}</div>
    <h1 class="ed-title">问面</h1>
    <p class="ed-lede">中国名点课程 · 智能教学助手。内容以当前教材版本为准，引用可回溯到证据。</p>
    ${figures()}
    <div class="ed-columns">
      <div class="ed-column"><div class="ed-kicker">学习动态</div>
        <div class="item-list">
          <div class="issue"><span class="no tabnums">01</span><h4 style="display:inline">课程概览</h4><div class="meta">从课程目录进入知识单元</div></div>
          <div class="issue"><span class="no tabnums">02</span><h4 style="display:inline">知识图谱</h4><div class="meta">按证据查看概念关系</div></div>
        </div>
      </div>
      <div class="ed-column"><div class="ed-kicker">公告</div>
        <div class="ed-quote">本页为工程骨架，业务数据将在后续开发任务中接入。<span class="cite">来源：系统</span></div>
      </div>
    </div>`;
}

/* 图谱页：三栏结构；画布异常时保留搜索、列表与详情（G10） */
function graphPage() {
  return `<div class="page-head">知识图谱</div>
    <div class="graph-wrap">
      <div class="graph-left"><div class="ed-kicker">搜索</div><p class="muted">节点检索（占位）</p></div>
      <div class="graph-center"><div class="canvas-fallback">画布渲染失败时仍可浏览列表与详情</div></div>
      <div class="graph-right"><div class="ed-kicker">详情</div><p class="muted">节点详情（占位）</p></div>
    </div>`;
}

function inner() {
  if (S.page === 'graph') return graphPage();
  return homePage();
}

function shell(body) {
  const nav = NAV.map(([k, label, ico]) =>
    `<button data-go="${k}" class="${S.page === k ? 'on' : ''}" title="${label}">${ico}<span>${label}</span></button>`).join('');
  return `<header class="ed-masthead">
      <div class="brand">问面<small>WENMIAN · V2.0</small></div>
      <div class="issue">方案 A · 师生统一 Editorial</div>
      <div class="spacer"></div>
      <div class="role">${S.role === 'teacher' ? '教师端' : '学生端'}</div>
    </header>
    <div class="ed-shell">
      <nav class="ed-spine"><div class="vol">VOL. 01</div>${nav}</nav>
      <main class="ed-main">${body}</main>
    </div>
    <div class="confirm-layer" id="confirmLayer" role="dialog" aria-modal="true"></div>`;
}

/* forceState 优先：异常态不被首页分支绕过 */
function render() {
  document.body.setAttribute('data-scheme', effectiveScheme());
  if (!S.logged || S.forceState) {
    el('root').innerHTML = statusPage(S.forceState || 'anonymous');
    return;
  }
  el('root').innerHTML = shell(inner());
  window.__WM_STATE__ = {
    scheme: effectiveScheme(), role: S.role, page: S.page,
    locked: true, logged: S.logged, state: S.forceState
  };
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-go],[data-act]');
  if (!b) return;
  if (b.hasAttribute('data-go')) { S.page = b.dataset.go; S.forceState = null; render(); return; }
  const act = b.dataset.act;
  if (act === 'login') { S.logged = true; S.forceState = null; render(); }
  else if (act === 'go-home') { S.page = 'home'; S.forceState = null; render(); }
});

/* 测试钩子：仅内存态，不写后端；供 P13 注入异常态断言 */
window.__WM_TEST__ = {
  setState(patch) { Object.assign(S, patch); render(); },
  state() { return { ...S }; }
};

render();
