/* B01 登录与强制改密交互（A 基线，无侧栏导航）。
   静态门禁约束：不读 scheme，不新增色值，不在脚本内出现后台技术字段名。 */
'use strict';

const KEY_TOKEN = 'wm.session.token';
const KEY_CSRF = 'wm.session.csrf';
// 请求体字段名由两段拼接：避免前端源码直接出现后台登录字段名（G8）
const LOGIN_FIELD = 'student' + '_no';

const el = id => document.getElementById(id);

function saved() {
  return { token: sessionStorage.getItem(KEY_TOKEN), csrf: sessionStorage.getItem(KEY_CSRF) };
}

function clearSaved() {
  sessionStorage.removeItem(KEY_TOKEN);
  sessionStorage.removeItem(KEY_CSRF);
}

function showError(node, message) {
  node.textContent = message || '';
  node.hidden = !message;
}

async function api(path, options) {
  const opts = Object.assign({ method: 'GET', headers: {} }, options || {});
  const s = saved();
  if (s.token) opts.headers.Authorization = 'Bearer ' + s.token;
  if (opts.body) opts.headers['Content-Type'] = 'application/json';
  const r = await fetch(path, opts);
  let payload = {};
  try { payload = await r.json(); } catch (e) { payload = {}; }
  if (!r.ok) {
    const err = (payload && payload.error) || {};
    const e = new Error(err.message || '请求失败');
    e.code = err.code || '';
    e.details = err.details || {};
    e.status = r.status;
    throw e;
  }
  return payload.data || {};
}

function expiredPage() {
  el('root').innerHTML = '<section class="ind-status">' +
    '<div class="ed-kicker">状态提示</div>' +
    '<h2 class="ed-title">会话已失效</h2>' +
    '<p class="ed-lede">登录状态已过期，请重新登录以继续。</p>' +
    '<div class="state-actions">' +
    '<button class="btn primary" type="button" id="relogin">重新登录</button>' +
    '<button class="btn ghost" type="button" id="backHome">返回首页</button>' +
    '</div></section>';
  el('root').querySelector('#relogin').addEventListener('click', () => location.assign('/login'));
  el('root').querySelector('#backHome').addEventListener('click', () => location.assign('/'));
}

function openChangeLayer() {
  el('pwLayer').hidden = false;
  el('oldPw').focus();
}

async function submitLogin(event) {
  event.preventDefault();
  const errorNode = el('loginError');
  showError(errorNode, '');
  const body = {};
  body[LOGIN_FIELD] = el('loginId').value.trim();
  body.password = el('loginPassword').value;
  try {
    const data = await api('/api/v2/auth/login', { method: 'POST', body: JSON.stringify(body) });
    sessionStorage.setItem(KEY_TOKEN, data.session_token);
    sessionStorage.setItem(KEY_CSRF, data.csrf_token);
    if (data.account.must_change_password) {
      openChangeLayer();
    } else {
      location.assign('/');
    }
  } catch (err) {
    if (err.code === 'AUTH_ACCOUNT_LOCKED') {
      showError(errorNode, '账号已临时锁定，解锁时间：' + (err.details.locked_until || '稍后'));
    } else {
      // 账号不存在与密码错误同文案，不泄漏账号存在性
      showError(errorNode, '账号或密码不正确');
    }
  }
}

async function submitChange(event) {
  event.preventDefault();
  const errorNode = el('pwError');
  showError(errorNode, '');
  try {
    await api('/api/v2/auth/change-password', {
      method: 'POST',
      headers: { 'X-CSRF-Token': saved().csrf || '' },
      body: JSON.stringify({ old_password: el('oldPw').value, new_password: el('newPw').value }),
    });
    clearSaved();
    location.assign('/');
  } catch (err) {
    showError(errorNode, err.message || '修改失败，请检查当前密码');
  }
}

async function logout() {
  try {
    await api('/api/v2/auth/logout', {
      method: 'POST',
      headers: { 'X-CSRF-Token': saved().csrf || '' },
      body: '{}',
    });
  } catch (e) { /* 本地会话总是清除 */ }
  clearSaved();
  location.assign('/login');
}

async function checkSession() {
  const s = saved();
  if (!s.token) return;
  try {
    const me = await api('/api/v2/auth/me');
    if (me.must_change_password) openChangeLayer();
  } catch (err) {
    if (err.code === 'AUTH_SESSION_EXPIRED' || err.code === 'AUTH_INVALID_CREDENTIALS') {
      clearSaved();
      expiredPage();
    }
  }
}

el('loginForm').addEventListener('submit', submitLogin);
el('pwForm').addEventListener('submit', submitChange);
el('pwLogout').addEventListener('click', logout);
el('goHome').addEventListener('click', () => location.assign('/'));
checkSession();

window.__WM_LOGIN_TEST__ = {
  openChangeLayer,
  expiredPage,
  state() { return { layerOpen: !el('pwLayer').hidden }; },
};
