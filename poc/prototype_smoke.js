/*
P05 原型冒烟测试：Chrome headless 通过 hash 直达渲染各方案/页面/异常态，校验真实 DOM 输出。
运行：node poc/prototype_smoke.js
输出：poc/results/prototype_smoke_result.json
依赖：Node 内置模块 + 本机 Chrome（不引入 npm 包）。
*/
const fs = require('fs');
const http = require('http');
const path = require('path');
const { execFile } = require('child_process');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'prototype', 'index.html'), 'utf8');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const scenarios = [
  { name: '登录页默认', hash: '', expect: ['登录工作台', 'P05 原型控制台'] },
  { name: 'A-学生首页', hash: '#scheme=A&role=student&page=home&logged=1', expect: ['学习首页', '我的课程', '待办与提醒'] },
  { name: 'A-学生首页无裸错误码', hash: '#scheme=A&role=student&page=home&logged=1', expect: ['学习首页'], forbid: ['AUTH_REQUIRED'] },
  { name: 'B-教师工作台', hash: '#scheme=B&role=teacher&page=home&logged=1', expect: ['工作台首页', '待审核候选题', 'AI 辅助出题'] },
  { name: 'C-教师题库', hash: '#scheme=C&role=teacher&page=bank&logged=1', expect: ['题库', '待审核', 'AI 出题'] },
  { name: 'A-图谱三栏', hash: '#scheme=A&role=student&page=graph&logged=1', expect: ['知识图谱', '课程结构', '相邻关系'] },
  { name: '教师-组卷蓝图', hash: '#scheme=B&role=teacher&page=compose&logged=1', expect: ['蓝图统计', '总分', '试卷结构'] },
  { name: '教师-批改AI分离', hash: '#scheme=B&role=teacher&page=grade&logged=1', expect: ['AI 批改建议', '教师终评分', '原件保留'] },
  { name: '异常-会话失效', hash: '#scheme=A&role=student&page=home&logged=1&state=expired', expect: ['登录状态已失效', '重新登录', '返回上一页'] },
  { name: '异常-加载失败', hash: '#scheme=A&role=student&page=home&logged=1&state=loadfail', expect: ['内容加载失败', '重试加载', 'NET-503'] },
  { name: '异常-未授权', hash: '#scheme=A&role=student&page=home&logged=1&state=forbidden', expect: ['无权访问该内容', '授权'] }
];

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(HTML);
});

function renderHash(port, hash) {
  return new Promise(resolve => {
    const url = `http://127.0.0.1:${port}/${hash}`;
    execFile(CHROME, ['--headless=new','--disable-gpu','--no-sandbox','--virtual-time-budget=3500','--dump-dom', url],
      { maxBuffer: 12 * 1024 * 1024, timeout: 30000 }, (err, stdout) => {
        resolve({ err: err ? String(err.message).slice(0,160) : null, dom: stdout || '' });
      });
  });
}

(async () => {
  const results = [];
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
  const summary = { poc: 'P05 原型冒烟', run_at: new Date().toISOString(),
    pass: results.filter(r => r.status === 'PASS').length, total: results.length, results };
  const out = path.join(__dirname, 'results', 'prototype_smoke_result.json');
  fs.writeFileSync(out, JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify(summary, null, 2));
})();
