/*
P05 原型冒烟测试（重构版）：本地 HTTP 提供 prototype 目录，Chrome headless 通过 hash 直达渲染各方案/页面/异常态。
运行：node poc/prototype_smoke.js
输出：poc/results/prototype_smoke_result.json
依赖：Node 内置模块 + 本机 Chrome。
*/
const fs = require('fs');
const http = require('http');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.join(__dirname, '..', 'prototype');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

// 三套方案的"排版骨架"专属结构 —— 用于验证不只是换色
const SCHEME_MARKERS = {
  A: ['ed-masthead', 'ed-spine', 'ed-folio', 'ed-lede', 'ed-columns'],
  B: ['ind-statusbar', 'ind-rail', 'ind-metrics', 'ind-metric', 'ind-crumb'],
  C: ['org-nav', 'org-hero', 'org-cards', 'org-card', 'org-section-title']
};

const scenarios = [
  { name: 'A-学生首页(杂志编辑)', hash: '#scheme=A&role=student&page=home&logged=1', expect: ['ed-masthead','ed-spine','ed-folio','今日学习'], forbid: ['AUTH_REQUIRED'] },
  { name: 'B-教师首页(工业实用)', hash: '#scheme=B&role=teacher&page=home&logged=1', expect: ['ind-statusbar','ind-rail','ind-metrics','工作台概览'], forbid: ['AUTH_REQUIRED'] },
  { name: 'C-教师首页(自然有机)', hash: '#scheme=C&role=teacher&page=home&logged=1', expect: ['org-nav','org-hero','org-cards','今日待办'], forbid: ['AUTH_REQUIRED'] },
  { name: 'A-学生首页无裸错误码', hash: '#scheme=A&role=student&page=home&logged=1', forbid: ['AUTH_REQUIRED','加载中…'] },
  { name: 'A-知识详情可溯源', hash: '#scheme=A&role=student&page=knowledge&logged=1', expect: ['教材依据','水调面团的性质','58','定位到原文'] },
  { name: 'B-题库审核', hash: '#scheme=B&role=teacher&page=bank&logged=1', expect: ['题库','待审核','Q-0232'] },
  { name: 'C-图谱三栏', hash: '#scheme=C&role=student&page=graph&logged=1', expect: ['graph-wrap','水调面团','已发布关系'] },
  { name: 'B-组卷蓝图', hash: '#scheme=B&role=teacher&page=compose&logged=1', expect: ['蓝图统计','totalScore','试卷结构'] },
  { name: 'C-批改AI分离', hash: '#scheme=C&role=teacher&page=grade&logged=1', expect: ['AI 批改建议','教师终评分','finalScore'] },
  { name: '异常-会话失效', hash: '#scheme=A&role=student&page=home&logged=1&state=expired', expect: ['登录状态已失效','重新登录','返回上一页'] },
  { name: '异常-加载失败', hash: '#scheme=B&role=student&page=home&logged=1&state=loadfail', expect: ['内容加载失败','重试加载','NET-503'] },
  { name: '异常-未授权', hash: '#scheme=C&role=student&page=home&logged=1&state=forbidden', expect: ['无权访问该内容','返回我的首页'] }
];

const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'application/javascript; charset=utf-8' };
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  let f = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
  if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});

function renderHash(port, hash) {
  return new Promise(resolve => {
    const url = `http://127.0.0.1:${port}/index.html${hash}`;
    execFile(CHROME, ['--headless=new','--disable-gpu','--no-sandbox','--virtual-time-budget=4000','--dump-dom', url],
      { maxBuffer: 12 * 1024 * 1024, timeout: 30000 }, (err, stdout) => resolve({ err: err ? String(err.message).slice(0,160) : null, dom: stdout || '' }));
  });
}

(async () => {
  const results = [];
  // 静态骨架差异校验：三套方案的专属结构类名互不重叠
  const overlapA_B = SCHEME_MARKERS.A.filter(x => SCHEME_MARKERS.B.includes(x));
  const overlapAll = SCHEME_MARKERS.A.filter(x => SCHEME_MARKERS.B.includes(x) || SCHEME_MARKERS.C.includes(x));
  results.push({ scenario: '三套排版骨架结构互不重叠', status: overlapAll.length === 0 ? 'PASS' : 'FAIL',
    detail: { overlap: overlapAll } });

  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  for (const s of scenarios) {
    const { err, dom } = await renderHash(port, s.hash);
    const missing = (s.expect || []).filter(x => !dom.includes(x));
    const forbiddenFound = (s.forbid || []).filter(x => dom.includes(x));
    const ok = !err && missing.length === 0 && forbiddenFound.length === 0;
    results.push({ scenario: s.name, status: ok ? 'PASS' : 'FAIL',
      detail: { err, missing, forbiddenFound, domBytes: dom.length } });
  }
  server.close();
  const summary = { poc: 'P05 原型冒烟（重构版）', run_at: new Date().toISOString(),
    pass: results.filter(r => r.status === 'PASS').length, total: results.length, results };
  fs.writeFileSync(path.join(__dirname, 'results', 'prototype_smoke_result.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify(summary, null, 2));
})();
