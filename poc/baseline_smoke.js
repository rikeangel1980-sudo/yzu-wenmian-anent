/*
P05 确认基线冒烟：baseline.html 强制方案 A；师生共用同一套 A tokens（无角色级配色覆盖）。
运行：node poc/baseline_smoke.js
输出：poc/results/baseline_smoke_result.json
*/
const fs = require('fs');
const http = require('http');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.join(__dirname, '..', 'prototype');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'application/javascript; charset=utf-8' };

const scenarios = [
  { name: '基线-学生首页（hash 强行切 B 应被忽略）', hash: '#scheme=B&role=student&page=home&logged=1',
    expect: ['data-scheme="A"','data-locked="1"','ed-masthead','ed-spine','今日学习','A 杂志编辑 · 已锁定'],
    forbid: ['ind-statusbar','org-nav','data-scheme="B"','AUTH_REQUIRED'] },
  { name: '基线-教师首页（hash 强行切 C 应被忽略）', hash: '#scheme=C&role=teacher&page=home&logged=1',
    expect: ['data-scheme="A"','data-locked="1"','ed-masthead','ed-spine','教学工作台'],
    forbid: ['org-hero','ind-rail','data-scheme="C"'] },
  { name: '基线-教师题库仍为 A 风格', hash: '#role=teacher&page=bank&logged=1',
    expect: ['ed-masthead','题库','Q-0232','待审核'], forbid: ['ind-metric','org-card'] },
  { name: '基线-知识详情可溯源', hash: '#role=student&page=knowledge&logged=1',
    expect: ['教材依据','面点工艺学','58','定位到原文'], forbid: ['AUTH_REQUIRED'] },
  { name: '基线-异常态会话失效', hash: '#role=student&page=home&logged=1&state=expired',
    expect: ['data-scheme="A"','登录状态已失效','重新登录'], forbid: ['AUTH_REQUIRED'] }
];

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  let f = path.join(ROOT, urlPath === '/' ? 'baseline.html' : urlPath);
  if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});

function renderHash(port, hash) {
  return new Promise(resolve => {
    const url = `http://127.0.0.1:${port}/baseline.html${hash}`;
    execFile(CHROME, ['--headless=new','--disable-gpu','--no-sandbox','--virtual-time-budget=4000','--dump-dom', url],
      { maxBuffer: 12 * 1024 * 1024, timeout: 30000 }, (err, stdout) =>
      resolve({ err: err ? String(err.message).slice(0,160) : null, dom: stdout || '' }));
  });
}

(async () => {
  const results = [];
  // 静态校验 1：无角色级配色覆盖 —— 学生/教师色调必然一致
  const cssFiles = ['tokens.css','base.css','schemes.css'].map(f => fs.readFileSync(path.join(ROOT,'styles',f),'utf8')).join('\n');
  const roleSelectors = (cssFiles.match(/\[data-role[^\]]*\]/g) || []);
  results.push({ scenario:'静态-无角色级样式覆盖（师生同色调）', status: roleSelectors.length===0?'PASS':'FAIL',
    detail:{ roleSelectors } });
  // 静态校验 2：A 方案补齐状态色 token，徽章不跳出色调
  const aBlock = (cssFiles.match(/\[data-scheme="A"\]\{[\s\S]*?\}/) || [''])[0];
  const needed = ['--ok','--warn','--danger','--accent','--bg','--text'];
  const missingTokens = needed.filter(t => !aBlock.includes(t+':'));
  results.push({ scenario:'静态-A 方案状态色与色调 token 完整', status: missingTokens.length===0?'PASS':'FAIL',
    detail:{ missingTokens } });
  // 静态校验 3：锁定逻辑存在且优先于 hash
  const js = fs.readFileSync(path.join(ROOT,'scripts','main.js'),'utf8');
  const lockOK = js.includes('const LOCK_A') && js.includes("if(LOCK_A)S.scheme='A'");
  results.push({ scenario:'静态-基线锁优先于 hash', status: lockOK?'PASS':'FAIL', detail:{ lockOK } });

  await new Promise(r => server.listen(0,'127.0.0.1',r));
  const port = server.address().port;
  for (const s of scenarios) {
    const { err, dom } = await renderHash(port, s.hash);
    const missing = (s.expect||[]).filter(x => !dom.includes(x));
    const forbiddenFound = (s.forbid||[]).filter(x => dom.includes(x));
    results.push({ scenario:s.name, status:(!err && !missing.length && !forbiddenFound.length)?'PASS':'FAIL',
      detail:{ err, missing, forbiddenFound, domBytes:dom.length } });
  }
  server.close();
  const summary = { poc:'P05 方案 A 确认基线冒烟（师生统一）', run_at:new Date().toISOString(),
    pass:results.filter(r=>r.status==='PASS').length, total:results.length, results };
  fs.writeFileSync(path.join(__dirname,'results','baseline_smoke_result.json'), JSON.stringify(summary,null,2),'utf8');
  console.log(JSON.stringify(summary,null,2));
})();
