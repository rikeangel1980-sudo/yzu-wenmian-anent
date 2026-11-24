/* =========================================================
   问面 V2.0 P05 原型 · 重构版（frontend-design 方法论）
   三套方案：A 杂志编辑 / B 工业实用 / C 自然有机
   数据驱动渲染；分享同一份数据与交互，视觉由各自 CSS 决定
   ========================================================= */
const S={scheme:'A',role:'student',page:'home',logged:false,forceState:null};
const el=id=>document.getElementById(id);

const I={
  home:'<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>',
  book:'<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h7v16H4zM13 4h7v16h-7z"/></svg>',
  graph:'<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 7l3 9M16 7l-3 9M8.5 6h7"/></svg>',
  video:'<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 10l4-3v10l-4-3z"/></svg>',
  task:'<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/></svg>',
  bank:'<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h16v4H4zM4 11h16v4H4zM4 17h16v3H4z"/></svg>',
  chart:'<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  user:'<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>',
  search:'<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  bell:'<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9a6 6 0 0112 0c0 7 3 7 3 9H3c0-2 3-2 3-9zM10 21h4"/></svg>',
  edit:'<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20h4l10-10-4-4L4 16zM14 6l4 4"/></svg>',
  clock:'<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};

const DATA={
  courses:[
    {name:'面点工艺学',term:'2026 秋',teacher:'王acct老师',progress:68,ch:'面'},
    {name:'中式面点实训',term:'2026 秋',teacher:'李指导教师',progress:42,ch:'实'},
    {name:'烘焙工艺基础',term:'2026 秋',teacher:'王acct老师',progress:15,ch:'烘'}
  ],
  todos:[
    {t:'第四章 水调面团 · 单元测验',m:'截止 11-28 23:59 · 剩余 2 天',page:'quiz'},
    {t:'作业：和面温度控制实训报告',m:'截止 12-01 · 待提交',page:'task'},
    {t:'观看视频：揉面技法示范',m:'进度 45% · 继续学习',page:'videos'},
    {t:'错题回顾：面团筋性判断（3 题）',m:'来源于上次测验',page:'knowledge'}
  ],
  knowledge:{
    title:'水调面团的性质',tags:['知识点','第三章','难点'],
    def:'水调面团是以水与面粉调制而成的面团，因水温不同分为冷水面、温水面和烫面，其面筋形成程度与制品特性差异显著。',
    src:'《面点工艺学》第三章 第一节「水调面团的性质」，第 58–61 页。原文：水温直接影响面粉中蛋白质的变性与面筋的生成量……',
    points:['冷水面筋力强、韧性好，适合水饺、面条','温水面可塑性适中，适合蒸饺、花卷','烫面面筋被破坏、柔软，适合烫面饺、烧卖']
  },
  graphNodes:[
    {id:'n1',t:'水调面团',x:150,y:140,d:'章节'},
    {id:'n2',t:'冷水面',x:30,y:60,d:'知识点'},
    {id:'n3',t:'温水面',x:250,y:60,d:'知识点'},
    {id:'n4',t:'烫面',x:340,y:190,d:'知识点'},
    {id:'n5',t:'面筋形成',x:140,y:280,d:'知识点'},
    {id:'n6',t:'和面工艺',x:20,y:370,d:'工艺'},
    {id:'n7',t:'水饺制品',x:290,y:370,d:'案例'}
  ],
  graphEdges:[['n1','n2'],['n1','n3'],['n1','n4'],['n1','n5'],['n5','n6'],['n2','n7']],
  videos:[
    {t:'和面工艺与水温控制',d:'12:36',tag:'已发布',p:68},
    {t:'揉面技法：三揉三醒',d:'08:54',tag:'已发布',p:45},
    {t:'烫面制品成型演示',d:'15:20',tag:'已发布',p:0},
    {t:'面团故障排查',d:'--:--',tag:'草稿',p:0}
  ],
  questions:[
    {id:'Q-0231',stem:'下列关于冷水面团特性描述正确的是？',type:'单选',diff:'中等',chap:'第三章',status:'已审核',src:'教材 P58'},
    {id:'Q-0232',stem:'水温超过 80°C 时，面粉蛋白质主要发生何种变化？',type:'单选',diff:'较难',chap:'第三章',status:'待审核',src:'AI 生成'},
    {id:'Q-0233',stem:'简述温水面团的适用范围并说明理由。',type:'简答',diff:'中等',chap:'第三章',status:'草稿',src:'AI 生成'},
    {id:'Q-0234',stem:'烫面面团适合制作下列哪类制品？',type:'单选',diff:'容易',chap:'第三章',status:'已审核',src:'教材 P60'}
  ],
  tchStats:[['待审核候选题','12','hot'],['待批改作业','8',''],['待阅考试','3',''],['学情待关注','5','']],
  rubric:[{dim:'操作规范',ai:18,max:20},{dim:'面团状态',ai:15,max:20},{dim:'安全卫生',ai:10,max:10}]
};

const NAV={
  student:[['home','首页'],['courses','课程'],['knowledge','知识'],['graph','图谱'],['videos','视频'],['quiz','测评'],['task','任务']],
  teacher:[['home','首页'],['courses','班级'],['knowledge','知识'],['graph','图谱'],['bank','题库'],['ai-gen','出题'],['compose','组卷'],['grade','批改'],['analytics','学情'],['videos','视频']]
};
const TITLE={home:'学习首页',courses:'我的课程',knowledge:'知识详情',graph:'知识图谱',videos:'教学视频',quiz:'练习测评',task:'我的任务',bank:'题库',['ai-gen']:'AI 辅助出题',compose:'组卷',grade:'作业批改',analytics:'学情分析'};
const SUB={home:'今天的学习从这里开始',courses:'按学期查看你参与的课程',knowledge:'水调面团的性质 · 第三章',graph:'从局部关系理解知识脉络',videos:'已发布资源与学习进度',quiz:'第四章单元测验',task:'待办与提交',bank:'按课程 / 章节 / 状态检索',['ai-gen']:'候选题进入待审核，不直接入库',compose:'手动 / 规则 / AI 辅助',grade:'AI 建议与教师终评分分离',analytics:'基于真实数据的班级学情'};

function devbar(){
  const sch=[['A','A 杂志编辑'],['B','B 工业实用'],['C','C 自然有机']];
  const st=[['','正常'],['expired','会话失效'],['loadfail','加载失败'],['loading','加载中'],['forbidden','未授权']];
  el('devbar').innerHTML=`<span class="tag">P05 原型控制台</span>
    <span class="grp"><span class="lbl">视觉风格</span>${sch.map(([k,n])=>`<button data-scheme="${k}" class="${S.scheme===k?'on':''}">${n}</button>`).join('')}</span>
    <span class="grp"><span class="lbl">角色</span><button data-role="student" class="${S.role==='student'?'on':''}">学生端</button><button data-role="teacher" class="${S.role==='teacher'?'on':''}">教师端</button></span>
    <span class="grp"><span class="lbl">状态</span>${st.map(([k,n])=>`<button data-state="${k}" class="${S.forceState===k?'on':''}">${n}</button>`).join('')}</span>
    <span class="spacer"></span><button data-go="login">返回登录</button><span class="hint">点导航/按钮体验</span>`;
}

function loginView(){
  // 三套方案的登录页也采用各自的构成语言
  if(S.scheme==='A'){
    return `<div style="max-width:980px;margin:60px auto;padding:0 24px">
      <div style="text-align:center;border-bottom:2px solid var(--text);padding-bottom:14px;margin-bottom:34px">
        <div style="font-family:var(--font-display);font-size:14px;letter-spacing:.3em;color:var(--muted)">面向课程的 AI 智能教学平台</div>
        <div style="font-family:var(--font-display);font-size:62px;letter-spacing:-.04em;margin:6px 0">问 面</div>
        <div style="font-family:var(--font-body);font-size:11px;letter-spacing:.18em;color:var(--muted)">第 2.0 版 · 以《面点工艺学》为权威知识基线</div></div>
      <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:46px">
        <div><p class="ed-lede">把一阶段"演示正确性"升级为真实教学场景可用。教材溯源、有据可查的问答与知识图谱；教师主导，AI 出题与批改均需人工确认。</p>
          <hr class="ed-rule"><div class="ed-quote">"不编造、不越权、不出域。所有 AI 输出都是候选，最终决定权在教师。"<span class="cite">—— 问面 V2.0 可信治理原则</span></div></div>
        ${loginForm()}</div></div>`;
  }
  if(S.scheme==='B'){
    return `<div style="max-width:920px;margin:50px auto;padding:0 20px">
      <div style="background:var(--text);color:#fff;padding:20px 24px;display:flex;align-items:center;gap:24px">
        <span style="font-family:var(--font-display);font-size:20px">问面 / WENMIAN</span>
        <span style="border-left:1px solid rgba(255,255,255,.25);padding-left:20px;font-family:var(--font-num);font-size:11px">SYS v2.0 · BUILD 20261124</span>
        <span style="margin-left:auto;font-family:var(--font-num);font-size:11px"><i class="led" style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#3ddc84;margin-right:6px"></i>LOCAL MODE · ONLINE</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--border-strong);border-top:none">
        <div style="padding:30px;border-right:1px solid var(--border-strong);background:var(--surface)">
          <div style="font-family:var(--font-body);font-size:10px;letter-spacing:.14em;color:var(--muted)">SYSTEM CAPABILITIES</div>
          ${['教材溯源问答 / SOURCED QA','统一知识图谱 / GRAPH','题库组卷考试 / EXAM','作业批改与学情 / GRADE'].map(x=>`<div style="font-family:var(--font-num);font-size:12px;padding:10px 0;border-bottom:1px solid var(--border)">▸ ${x}</div>`).join('')}</div>
        ${loginForm()}</div></div>`;
  }
  return `<div style="max-width:960px;margin:44px auto;padding:0 20px">
    <div class="org-hero" style="margin:0"><div class="blob b1"></div><div class="blob b2"></div><div class="inner">
      <h1>让每一堂<em>面点课</em><br>都有据可依</h1>
      <p>问面以《面点工艺学》为基线，把教材、图谱、题目与学习过程温柔地连在一起。</p>
      <div style="max-width:390px">${loginForm()}</div>
    </div></div></div>`;
}
function loginForm(){
  return `<div>
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <button class="btn ${S.role==='student'?'primary':''}" data-role="student" style="flex:1">学生</button>
      <button class="btn ${S.role==='teacher'?'primary':''}" data-role="teacher" style="flex:1">教师</button></div>
    <div style="margin-bottom:12px"><div class="muted" style="font-size:11px;margin-bottom:5px">账号（学号 / 工号）</div>
      <input value="${S.role==='student'?'2024010231':'T0086'}" style="width:100%;min-height:44px;padding:0 12px;border:1px solid var(--border-strong);background:var(--surface);color:var(--text);border-radius:var(--radius)"></div>
    <div style="margin-bottom:18px"><div class="muted" style="font-size:11px;margin-bottom:5px">密码</div>
      <input type="password" value="demo1234" style="width:100%;min-height:44px;padding:0 12px;border:1px solid var(--border-strong);background:var(--surface);color:var(--text);border-radius:var(--radius)"></div>
    <button class="btn primary" data-act="login" style="width:100%">登 录</button>
    <div class="muted" style="font-size:11px;margin-top:12px;line-height:1.7">演示账号已预填 · 首次登录需修改初始密码<br>忘记密码请联系教师/管理员线下重置</div></div>`;
}
/*__MORE2__*/

/* ========== 方案 A：杂志编辑风 shell + 首页 ========== */
function shellA(inner){
  return `<div class="ed-masthead">
      <div class="brand">问面<small>Wenmian · Teaching Review</small></div>
      <div class="issue">第 2.0 卷 · 2026 秋季号</div><div class="spacer"></div>
      <span class="role">${S.role==='student'?'学生 · 2024010231':'教师 · 王acct'}</span>
      <button class="icon-btn" data-act="bell">${I.bell}</button>
      <button class="btn ghost" data-act="logout" style="min-height:34px;padding:0 10px">退出</button>
    </div>
    <div class="ed-shell">
      <nav class="ed-spine"><div class="vol">目次 · CONTENTS</div>
        ${NAV[S.role].map(([k,n])=>`<button data-go="${k}" class="${S.page===k?'on':''}">${n}</button>`).join('')}
      </nav>
      <main class="ed-main">${inner}</main>
    </div>`;
}
function homeA(){
  return `<div class="ed-kicker">${S.role==='student'?'Student Portfolio · 学习folio':'Faculty Desk · 教学纪要'}</div>
    <h1 class="ed-title reveal in">${S.role==='student'?'今日学习':'教学工作台'}</h1>
    <p class="ed-deck reveal in">${S.role==='student'?"本周有两项待办临近截止。建议先完成《水调面团》单元测验，再回到第三章梳理面筋形成的机制。":"按授权范围汇总：待审核 12、待批改 8、待阅 3。AI 生成的题与分均为候选，须由教师确认。"}</p>
    <hr class="ed-rule">
    ${S.role==='student'?`
      <div class="ed-figures reveal in">
        <div><div class="n tabnums">3</div><div class="l">在学课程</div></div>
        <div><div class="n tabnums">4</div><div class="l">待办任务</div></div>
        <div><div class="n tabnums">68<span style="font-size:15px">%</span></div><div class="l">学习进度</div></div>
      </div>
      <div class="ed-columns">
        <article>
          <div class="ed-folio">03</div><div class="ed-folio-cap">第三章 · 水调面团</div>
          <p class="ed-lede" style="margin-top:16px">水调面团以水温为枢，冷水面筋力强而韧，烫面柔软而糯。理解这一点，便理解了水饺与烧卖的分野。以下为本周建议研读的章节要点。</p>
          <div class="ed-quote">教材摘录：水温直接影响面粉中蛋白质的变性与面筋的生成量——这是选择面团类型的第一判据。<span class="cite">《面点工艺学》第三章第一节 · 第 58 页</span></div>
          <h3 style="font-size:18px;margin:22px 0 6px">我的课程</h3>
          <div class="item-list">${DATA.courses.map(c=>`<div class="item"><div class="grow"><h4>${c.name}</h4><div class="meta">${c.term} · ${c.teacher}</div><div class="databar"><i style="width:${c.progress}%"></i></div></div><button class="go" data-go="courses">阅读 →</button></div>`).join('')}</div>
        </article>
        <aside class="ed-column">
          <div class="ed-folio-cap" style="margin-bottom:12px">边栏 · 待办与提醒</div>
          ${DATA.todos.map((t,i)=>`<div class="ed-entry"><span class="no tabnums">${String(i+1).padStart(2,'0')}</span><div><h4>${t.t}</h4><div class="meta">${t.m}</div></div><button class="go" data-go="${t.page}">→</button></div>`).join('')}
          <div style="margin-top:24px;padding-top:14px;border-top:1px solid var(--border);font-family:var(--font-body);font-size:11px;color:var(--muted);line-height:1.7">本页仅呈现学习主内容；异常态（会话失效 / 加载失败）见顶部控制台。</div>
        </aside>
      </div>`:`
      <div class="ed-figures reveal in">${DATA.tchStats.map(([k,v])=>`<div><div class="n tabnums">${v}</div><div class="l">${k}</div></div>`).join('')}</div>
      <div class="ed-columns"><article>
        <div class="ed-folio">12</div><div class="ed-folio-cap">待审核候选题</div>
        <p class="ed-lede" style="margin-top:16px">候选题 Q-0232 附教材依据；另有 3 条图谱关系等待确认。审核动作逐条留痕，未审核内容不进入学生端。</p>
        <h3 style="font-size:18px;margin:22px 0 6px">待处理</h3>
        <div class="item-list">${[['题库待审核','12 题','bank'],['作业待批改','8 份','grade'],['考试待阅','3 场','grade'],['图谱关系待审','3 条','graph']].map(([t,m,p])=>`<div class="item"><div class="grow"><h4>${t}</h4><div class="meta">${m}</div></div><button class="go" data-go="${p}">处理 →</button></div>`).join('')}</div>
      </article><aside class="ed-column">
        <div class="ed-folio-cap" style="margin-bottom:12px">快捷操作</div>
        <div style="display:grid;gap:8px"><button class="btn" data-go="ai-gen">AI 辅助出题</button><button class="btn" data-go="compose">组卷</button><button class="btn" data-go="analytics">学情分析</button></div>
        <div class="ed-quote" style="margin-top:20px">教师主导原则：AI 只提供建议，题目、评分与权威关系均由教师确认后发布。<span class="cite">PRD §1.4 / §11</span></div>
      </aside></div>`}`;
}

/* ========== 方案 B：工业实用风 shell + 首页 ========== */
function shellB(inner){
  return `<div class="ind-statusbar">
      <span class="brand">问面 / CONSOLE</span>
      <span class="seg"><span><i class="led"></i>SYS ONLINE</span><span>DB: SQLITE/WAL</span><span>HOST: 127.0.0.1:8787</span></span>
      <span class="spacer"></span>
      <span class="seg"><span>USER <b>${S.role==='student'?'2024010231':'T0086'}</b></span><span>ROLE <b>${S.role==='student'?'STU':'TCH'}</b></span></span>
      <button class="icon-btn" data-act="bell" style="color:#eaf0f6">${I.bell}</button>
      <button data-act="logout" style="color:#eaf0f6;font-size:11px">EXIT</button>
    </div>
    <div class="ind-shell">
      <nav class="ind-rail">${NAV[S.role].map(([k,n])=>`<button data-go="${k}" class="${S.page===k?'on':''}" title="${TITLE[k]}"><span>${I[k==='ai-gen'?'book':k in I?k:'bank']}</span><span class="tip">${n}</span>${k==='bank'&&S.role==='teacher'?'<i class="dot"></i>':''}</button>`).join('')}</nav>
      <main class="ind-main">${inner}</main>
    </div>`;
}
function homeB(){
  return `<div class="ind-crumb">SYS / ${S.role==='student'?'STUDENT':'FACULTY'} / DASHBOARD</div>
    <div class="ind-head"><h1>${S.role==='student'?'学习概览':'工作台概览'}</h1>
      <span class="ind-tag">DATA: LIVE · 刷新 ${new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}</span></div>
    <div class="ind-metrics reveal in">
      ${(S.role==='student'
        ? [['ACTIVE COURSES','3',''],['OPEN TASKS','4','hot'],['VIDEO PROGRESS','56%',''],['AVG SCORE','82%','']]
        : DATA.tchStats.map(([k,v,hot])=>[k.toUpperCase().replace(/ /g,'_'),v,hot]).concat([['DATA SOURCE','REAL','']]).slice(0,4))
        .map(([k,v,hot])=>`<div class="ind-metric"><div class="k">${k}</div><div class="v ${hot||''}">${v}</div><div class="d">更新 11-24</div></div>`).join('')}
    </div>
    <div class="ind-grid2">
      <div class="ind-panel"><div class="hd">▸ ${S.role==='student'?'任务队列 / TASK QUEUE':'待处理队列 / PENDING QUEUE'}</div><div class="bd">
        ${(S.role==='student'?DATA.todos.map(t=>[t.t,t.m,t.page]):[['候选题 Q-0232','来源: AI生成 · 待审核','bank'],['作业 8 份','截止 12-01','grade'],['考试 3 场','待阅卷','grade'],['图谱关系 3 条','未审核不发布','graph']]).map((r,i)=>`<div class="ind-row"><span class="code">${String(i+1).padStart(3,'0')}</span><span class="grow">${r[0]}<div class="muted" style="font-size:10px">${r[1]}</div></span><button class="btn" data-go="${r[2]}" style="min-height:32px;padding:0 10px">OPEN</button></div>`).join('')}
      </div></div>
      <div class="ind-panel"><div class="hd">▸ 状态 / STATUS</div><div class="bd">
        ${[['教材基线','面点工艺学.docx','ok'],['知识发布','未发布(待授权)','warn'],['外部模型','未配置 · 本地降级','warn'],['学生数据出域','逐次 D3 批准','ok']].map(([k,v,s])=>`<div class="ind-row"><span class="grow">${k}</span><span class="ind-status ${s}">${v}</span></div>`).join('')}
        <div style="margin-top:16px;font-family:var(--font-body);font-size:10px;color:var(--muted);line-height:1.6">全部写操作在服务端校验；前端隐藏不代表权限控制。</div>
      </div></div>
    </div>`;
}

/* ========== 方案 C：自然有机风 shell + 首页 ========== */
function shellC(inner){
  return `<nav class="org-nav">
      <span class="brand">问面</span>
      <span class="links">${NAV[S.role].map(([k,n])=>`<button data-go="${k}" class="${S.page===k?'on':''}">${n}</button>`).join('')}</span>
      <button data-act="bell" class="icon-btn">${I.bell}</button>
      <button class="btn" data-act="logout" style="border-radius:999px;min-height:36px;padding:0 14px">${S.role==='student'?'学':'师'}</button>
    </nav><main>${inner}</main>`;
}
function homeC(){
  return `<div class="org-hero"><div class="blob b1"></div><div class="blob b2"></div><div class="inner">
      <h1 class="reveal in">${S.role==='student'?'慢慢来，<em>今天</em>也有好收获':'把备课这件<em>手艺</em>，做得更从容'}</h1>
      <p class="reveal in">${S.role==='student'?'本周 2 项待办临近截止。从第三章「水调面团」开始，像揉面一样一点点把知识揉进心里。':'待审核 12、待批改 8、待阅 3。AI 是助手，最后的判断始终在你手里。'}</p>
      <button class="btn primary reveal in" data-go="${S.role==='student'?'courses':'bank'}">${S.role==='student'?'继续学习':'开始处理'} →</button>
    </div></div>
    <div class="org-wrap">
      <h2 class="org-section-title reveal in">${S.role==='student'?'最近学习':'今日待办'}</h2>
      <div class="org-cards">
        ${(S.role==='student'?DATA.courses.slice(0,3).map(c=>({t:c.name,d:`${c.term} · ${c.teacher} · 进度 ${c.progress}%`,g:'courses'})):DATA.tchStats.slice(0,3).map(s=>({t:s[0],d:`${s[1]} 项待处理`,g:s[0].includes('审核')?'bank':s[0].includes('批改')?'grade':'analytics'})))
          .map((c,i)=>`<div class="org-card reveal in"><div class="ico">${I[['book','task','chart'][i]]}</div><h3>${c.t}</h3><p>${c.d}</p><button class="btn" data-go="${c.g}" style="margin-top:14px;border-radius:999px">进入 →</button></div>`).join('')}
      </div>
      <h2 class="org-section-title reveal in">${S.role==='student'?'学习提醒':'快捷入口'}</h2>
      <div class="org-soft reveal in">
        ${(S.role==='student'?DATA.todos.map(t=>[t.t,t.m,t.page]):[['AI 辅助出题','候选题不直接入库','ai-gen'],['组卷','手动 / 规则 / AI','compose'],['学情分析','基于真实数据','analytics']]).map(r=>`<div class="org-list-row"><div class="mk">${I.task}</div><div class="grow"><h4 style="margin:0;font-size:13.5px">${r[0]}</h4><div class="muted" style="font-size:11.5px">${r[1]}</div></div><button class="go" data-go="${r[2]}">→</button></div>`).join('')}
      </div>
    </div>`;
}
/*__MORE3__*/

/* ========== 内页（共享语义结构，视觉由 scheme CSS 决定） ========== */
function head(p){return `<div class="page-head"><h1>${TITLE[p]||'问面'}</h1><p>${SUB[p]||''}</p></div>`}

function pageCourses(){return head('courses')+`<div class="filterbar"><input placeholder="搜索课程"><select><option>2026 秋</option></select></div>
  <div class="item-list">${DATA.courses.map(c=>`<div class="item"><div class="grow"><h4>${c.name}</h4><div class="meta">${c.term} · ${c.teacher}</div><div class="databar"><i style="width:${c.progress}%"></i></div></div><span class="muted tabnums" style="font-size:12px">${c.progress}%</span><button class="btn primary" data-go="knowledge" style="min-height:36px">进入</button></div>`).join('')}</div>`}

function pageKnowledge(){const k=DATA.knowledge;return head('knowledge')+`
  <div style="border:1px solid var(--border-strong);padding:20px;background:var(--surface)">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><h2 style="font-size:26px">${k.title}</h2><span class="pill accent">已学习</span>${k.tags.map(t=>`<span class="pill">${t}</span>`).join('')}</div>
    <p style="line-height:1.9;margin:16px 0">${k.def}</p>
    <div style="background:var(--accent-soft);border-left:3px solid var(--accent);padding:14px 16px;font-size:13px;line-height:1.8">
      <div style="font-weight:700;color:var(--accent);font-size:11px;margin-bottom:6px">教材依据 · 可溯源</div>${k.src}
      <div style="margin-top:10px"><button class="btn" data-act="locate" style="min-height:36px">定位到原文 →</button></div></div>
  </div>
  <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:18px;margin-top:18px">
    <div style="border:1px solid var(--border);padding:18px;background:var(--surface)"><h3 style="font-size:16px;margin-bottom:10px">核心要点</h3>
      ${k.points.map((p,i)=>`<div class="item"><span class="muted tabnums">${String(i+1).padStart(2,'0')}</span><span class="grow">${p}</span></div>`).join('')}
      <div class="pill warn" style="margin-top:14px">证据不足处标注"待核实"，不臆造</div></div>
    <div style="border:1px solid var(--border);padding:18px;background:var(--surface)"><h3 style="font-size:16px;margin-bottom:10px">关联资源</h3>
      ${[['图谱关系','graph'],['操作视频','videos'],['章节题目','quiz'],['案例图鉴','knowledge']].map(r=>`<div class="item"><span class="grow">${r[0]}</span><button class="go" data-go="${r[1]}">→</button></div>`).join('')}</div>
  </div>`}

function pageGraph(){const ns=DATA.graphNodes,es=DATA.graphEdges,find=id=>ns.find(n=>n.id===id);
  const lines=es.map(([a,b])=>{const x=find(a),y=find(b);return `<line x1="${x.x+52}" y1="${x.y+24}" x2="${y.x+52}" y2="${y.y+24}" stroke="var(--accent)" stroke-width="1.6" opacity=".5"/>`}).join('');
  return head('graph')+`<div class="graph-wrap">
    <div class="graph-left"><div style="font-family:var(--font-body);font-size:12px;font-weight:700;margin-bottom:10px" class="txt">课程结构 / 搜索</div>
      <input placeholder="搜索节点" style="width:100%;min-height:36px;padding:0 10px;border:1px solid var(--border);background:var(--surface);color:var(--text);margin-bottom:12px" class="txt">
      ${['第三章 水调面团','3.1 水调面团的性质','3.2 面筋形成机制','第四章 发酵面团'].map((t,i)=>`<div class="tree-item item ${i===1?'on':''}" data-node="n1" style="font-family:var(--font-body);font-size:12px;cursor:pointer;padding:7px 0;border-bottom:1px solid var(--border)"><span class="txt">${i?'·':'▾'} ${t}</span></div>`).join('')}
      <button class="btn" data-act="listview" style="width:100%;min-height:34px;margin-top:12px" class="txt">列表视图</button>
    </div>
    <div class="graph-center"><svg style="position:absolute;inset:0;width:100%;height:100%">${lines}</svg>
      ${ns.map(n=>`<div class="gnode ${n.id==='n1'?'sel':''}" style="left:${n.x}px;top:${n.y}px" data-node="${n.id}">${n.t}<small>${n.d}</small></div>`).join('')}
    </div>
    <div class="graph-right"><span class="pill ok">已发布关系</span><h3 style="font-size:17px;margin:10px 0 4px">水调面团</h3>
      <div class="muted" style="font-size:11px">章节 · 第三章</div>
      <p style="font-size:12.5px;line-height:1.75;margin:12px 0">以水与面粉调制的面团，按水温分为冷水面、温水面、烫面。教材来源：第三章第一节。</p>
      <div style="font-size:11px;font-weight:700;margin-bottom:6px">相邻关系（来源可查）</div>
      ${[['冷水面','包含'],['面筋形成','相关'],['和面工艺','应用于']].map(r=>`<div class="item"><span class="grow">${r[0]}</span><span class="muted" style="font-size:11px">${r[1]}</span></div>`).join('')}
      <button class="btn primary" data-go="knowledge" style="width:100%;margin-top:14px">知识详情</button>
    </div></div>
    <p class="muted" style="font-size:11px;margin-top:12px">三栏结构；默认局部子图，不铺开全量。节点数据由统一图谱模型提供，图形引擎仅负责渲染。</p>`}

function pageVideos(){return head('videos')+`<div class="filterbar"><input placeholder="搜索视频"><select><option>全部章节</option></select>${S.role==='teacher'?'<button class="btn primary" data-act="upload">上传视频</button>':''}</div>
  <div class="item-list">${DATA.videos.map(v=>`<div class="item"><div style="width:84px;height:52px;background:var(--surface-2);border:1px solid var(--border);display:grid;place-items:center;flex:none">▶</div>
    <div class="grow"><h4>${v.t}</h4><div class="meta">${v.d} · <span class="pill ${v.tag==='已发布'?'ok':'warn'}">${v.tag}</span></div>
      ${v.tag==='已发布'?`<div class="databar"><i style="width:${v.p}%"></i></div><div class="meta">进度 ${v.p}% · 绑定本人</div>`:''}</div>
    <button class="btn" data-act="play" style="min-height:36px">${v.tag==='已发布'?'播放':'预览'}</button></div>`).join('')}</div>`}

function pageQuiz(){return head('quiz')+`<div style="border:1px solid var(--border-strong);padding:16px;background:var(--surface);margin-bottom:16px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">
    <span class="pill warn">${I.clock} 时限 30 分钟</span><span class="muted">共 10 题 · 已答 3 题</span><span class="pill ok">自动保存已作答</span><span style="flex:1"></span><button class="btn primary" data-act="submit">确认交卷</button></div>
  <div style="border:1px solid var(--border);padding:20px;background:var(--surface)"><h3 style="font-size:16px;margin-bottom:12px">第 4 题 · 单选</h3>
    <p style="line-height:1.8">冷水面团与烫面面团相比，主要区别在于：</p>
    ${['A. 用水量不同','B. 水温导致面筋形成程度不同','C. 面粉品牌不同','D. 搅拌时间不同'].map((o,i)=>`<label class="item" style="padding:8px 0;cursor:pointer"><input type="radio" name="q4" ${i===1?'checked':''}> <span class="grow">${o}</span></label>`).join('')}
    <div style="display:flex;gap:8px;margin-top:16px"><button class="btn" data-act="prev">上一题</button><button class="btn primary" data-act="next">下一题</button><span class="muted" style="margin-left:auto;font-size:11px">重复提交不重复计分</span></div></div>`}

function pageTask(){return head('task')+`<div class="item-list">${DATA.todos.map((t,i)=>`<div class="item"><div class="grow"><h4>${t.t}</h4><div class="meta">${t.m}</div></div><button class="btn ${i===1?'primary':''}" data-go="${t.page}" style="min-height:36px">${i===1?'提交作业':'前往'}</button></div>`).join('')}</div>`}

function pageBank(){return head('bank')+`<div class="filterbar"><input placeholder="搜索题干 / 编号"><select><option>课程：面点工艺学</option></select><select><option>章节：全部</option></select><select><option>状态：全部</option><option>待审核</option></select><button class="btn primary" data-go="ai-gen">AI 出题</button></div>
  <div class="item-list">${DATA.questions.map(q=>`<div class="item"><div class="grow"><h4><span class="muted tabnums">${q.id}</span> ${q.stem}</h4>
    <div class="meta" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:5px"><span class="pill">${q.type}</span><span class="pill">难度 ${q.diff}</span><span>${q.chap}</span><span>来源：${q.src}</span><span class="pill ${q.status==='已审核'?'ok':q.status==='待审核'?'warn':''}">${q.status}</span></div></div>
    ${q.status==='待审核'?`<button class="btn" data-act="approve" style="min-height:36px">通过</button><button class="btn" data-act="reject" style="min-height:36px">退回</button>`:`<button class="btn" data-act="preview" style="min-height:36px">预览</button>`}</div>`).join('')}</div>
  <p class="muted" style="font-size:11px;margin-top:12px">审核操作全部留痕；无教材证据的题目标记风险，不伪造引用。</p>`}

function pageAiGen(){return head('ai-gen')+`<div style="border:1px solid var(--border-strong);padding:18px;background:var(--surface);margin-bottom:16px">
    <h3 style="font-size:15px;margin-bottom:14px">生成参数</h3><div class="filterbar"><select><option>第三章 水调面团</option></select><select><option>单选</option></select><select><option>中等</option></select><input value="5" style="width:70px"><button class="btn primary" data-act="generate">生成候选题</button></div>
    <div class="muted" style="font-size:11px">候选题默认"待审核"，须逐题审核后入库</div></div>
  <div class="item-list">
    <div class="item"><div class="grow"><h4>水温超过 80°C 时，面粉蛋白质主要发生何种变化？</h4><div class="meta"><span class="pill warn">待审核</span> 教材依据：第三章 P59 · <span class="pill ok">有证据</span></div></div><button class="btn primary" data-act="approve" style="min-height:36px">通过</button></div>
    <div class="item"><div class="grow"><h4>请推测某品牌面粉的最佳和面时间。</h4><div class="meta"><span class="pill danger">风险</span> 无教材证据 · 需教师补充</div></div><button class="btn" data-act="reject" style="min-height:36px">退回</button></div>
  </div>`}

function pageCompose(){return head('compose')+`<div class="filterbar"><button class="btn primary">手动组卷</button><button class="btn" data-act="rule">规则组卷</button><button class="btn" data-act="ai-compose">AI 辅助</button><span style="flex:1"></span><button class="btn primary" data-act="preview-paper">预览并发布</button></div>
  <div style="display:grid;grid-template-columns:1fr 1.1fr .9fr;gap:14px">
    <div style="border:1px solid var(--border);padding:14px;background:var(--surface)"><h3 style="font-size:13px;margin-bottom:10px">题库筛选</h3><input placeholder="搜索题目" style="width:100%;min-height:36px;padding:0 10px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-bottom:10px">
      ${DATA.questions.slice(0,3).map(q=>`<div class="item" style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="grow" style="font-size:12px">${q.id} ${q.stem.slice(0,10)}…</span><button class="btn" data-act="add-q" style="min-height:30px;padding:0 8px">＋</button></div>`).join('')}</div>
    <div style="border:1px solid var(--border);padding:14px;background:var(--surface)"><h3 style="font-size:13px;margin-bottom:10px">试卷结构（可调序/分值）</h3>
      ${[['单选','第三章 水调面团',5],['单选','面筋形成机制',5],['简答','水温与面团性质',10],['单选','烫面制品',5]].map(r=>`<div class="item" style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="grow" style="font-size:12px">${r[0]} · ${r[1]}</span><button class="btn" data-act="up" style="min-height:28px;padding:0 6px">↑</button><button class="btn" data-act="down" style="min-height:28px;padding:0 6px">↓</button><input value="${r[2]}" data-score style="width:44px;min-height:30px;text-align:center;border:1px solid var(--border);background:var(--bg);color:var(--text)"></div>`).join('')}</div>
    <div style="border:1px solid var(--border);padding:14px;background:var(--surface)"><h3 style="font-size:13px;margin-bottom:10px">蓝图统计</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center">${[['totalScore','25','总分'],['','4','题量'],['','2','覆盖']].map(b=>`<div style="background:var(--surface-2);padding:10px 4px"><div class="tabnums" style="font-size:20px;font-weight:700" ${b[0]?`id="${b[0]}"`:''}>${b[1]}</div><div class="muted" style="font-size:10px">${b[2]}</div></div>`).join('')}</div>
      <div class="pill ok" style="margin-top:14px">校验通过</div><p class="muted" style="font-size:11px;line-height:1.6;margin-top:10px">发布前强制校验总分/题状态/对象/时间；发布后生成不可变快照。</p></div>
  </div>`}

function pageGrade(){const total=DATA.rubric.reduce((a,r)=>a+r.ai,0);return head('grade')+`<div style="display:grid;grid-template-columns:1.05fr 1fr;gap:16px">
    <div style="border:1px solid var(--border);padding:18px;background:var(--surface)"><h3 style="font-size:15px;margin-bottom:12px">学生提交 · 原件保留</h3>
      <div style="background:var(--surface-2);padding:14px;line-height:1.8;font-size:13px"><b>实训报告：和面温度控制</b><br><span class="muted">学号 2024010231 · 提交于 11-23 21:40</span><br><br>实验记录：冷水（20°C）面团筋性较强……烫面（90°C）面团柔软……（学生原文完整保留，AI 不覆盖）</div>
      <div style="margin-top:14px;display:flex;gap:8px"><span class="pill">版本 v2</span><span class="pill warn">迟交 1 天</span></div></div>
    <div><div style="background:var(--accent-soft);border:1px solid var(--border);padding:16px"><h3 style="font-size:13px;margin-bottom:10px">AI 批改建议（模型 v2 · Prompt v1.3）</h3>
      ${DATA.rubric.map(r=>`<div class="item" style="padding:7px 0;border-bottom:1px solid var(--border)"><span class="grow">${r.dim}<div class="muted" style="font-size:11px">${r.ai}/${r.max} · 分项依据</div></span><input value="${r.ai}" data-grade style="width:46px;min-height:32px;text-align:center;border:1px solid var(--border);background:var(--surface);color:var(--text)"></div>`).join('')}
      <p class="muted" style="font-size:11px;margin-top:10px">图像/视频评价仅描述可观察证据，不臆断口味、香气、内部组织。</p></div>
      <div style="border:1px solid var(--border);padding:16px;background:var(--surface);margin-top:14px"><h3 style="font-size:14px;margin-bottom:8px">教师终评分</h3>
        <div style="display:flex;align-items:baseline;gap:10px"><span class="tabnums" id="finalScore" style="font-size:32px;font-weight:700">${total}</span><span class="muted">/ 50</span><span class="pill warn">草稿未发布</span></div>
        <textarea style="width:100%;min-height:60px;padding:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-top:10px">面团状态描述建议补充实物照片佐证。</textarea>
        <div style="display:flex;gap:8px;margin-top:10px"><button class="btn" data-act="save-draft">保存草稿</button><button class="btn primary" data-act="publish-grade">确认发布成绩</button></div>
        <p class="muted" style="font-size:11px;margin-top:8px">AI 建议可修改/拒绝；终评分由教师确认，发布后学生可见。</p></div>
    </div></div>`}

function pageAnalytics(){return head('analytics')+`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
    ${[['平均正确率','78%','样本 32 人'],['作业完成率','86%','截止 12-01'],['待关注','5 人','薄弱点集中'],['数据口径','真实','更新今日']].map(s=>`<div style="border:1px solid var(--border-strong);padding:14px;background:var(--surface)"><div class="muted" style="font-size:10px;letter-spacing:.08em">${s[0]}</div><div class="tabnums" style="font-size:26px;font-weight:700;margin-top:6px">${s[1]}</div><div class="muted" style="font-size:10px">${s[2]}</div></div>`).join('')}</div>
  <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:16px">
    <div style="border:1px solid var(--border);padding:18px;background:var(--surface)"><h3 style="font-size:15px;margin-bottom:12px">知识点掌握 · 第三章</h3>
      ${[['水调面团性质',82],['面筋形成机制',64],['水温与面团',71],['烫面制品',90]].map(r=>`<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:12px"><span>${r[0]}</span><span class="tabnums">${r[1]}%</span></div><div class="databar" style="max-width:none"><i style="width:${r[1]}%"></i></div></div>`).join('')}</div>
    <div style="border:1px solid var(--border);padding:18px;background:var(--surface)"><h3 style="font-size:15px;margin-bottom:12px">薄弱点 · 可跳转资源</h3>
      ${[['面筋形成机制 64%','knowledge'],['水温与面团 71%','videos']].map(r=>`<div class="item"><span class="grow">${r[0]}</span><button class="go" data-go="${r[1]}">查看 →</button></div>`).join('')}
      <p class="muted" style="font-size:11px;margin-top:12px">样本不足时显示样本数，不混入模拟数据。</p></div>
  </div>`}
/*__MORE4__*/

/* ========== 异常态（三套方案共用语义，CSS 差异化） ========== */
function stateView(kind){
  const conf={
    expired:{t:'登录状态已失效',d:'会话已过期。为保护学习数据请重新登录；登录后从当前页继续，已作答内容不会丢失。',a:[['relogin','重新登录','primary'],['back','返回上一页','']]},
    loadfail:{t:'内容加载失败',d:'网络或接口暂时不可用，请求未完成（错误码 NET-503）。请稍后重试；若持续失败请联系管理员。',a:[['retry','重试加载','primary'],['back','返回首页','']]},
    forbidden:{t:'无权访问该内容',d:'该资源不在你授权的班级/课程范围内，访问已被拒绝并记录。如需访问请联系教师开通。',a:[['back','返回我的首页','primary']]}
  }[kind];
  if(kind==='loading'){
    return head(S.page)+`<div style="border:1px solid var(--border);padding:20px;background:var(--surface)"><div class="skeleton"><div class="sk-line" style="width:40%"></div><div class="sk-line" style="width:80%"></div><div class="sk-line" style="width:60%"></div><div class="sk-line" style="width:70%"></div></div><p class="muted" style="font-size:11px;margin-top:14px">正在加载…失败时显示原因与重试入口，不长期停留。</p></div>`;
  }
  return `<div class="state-wrap"><div class="state-card">
    <div style="font-family:var(--font-display);font-size:40px;color:var(--accent);margin-bottom:8px">${kind==='expired'?'◷':kind==='loadfail'?'⚠':'⊘'}</div>
    <h2>${conf.t}</h2><p>${conf.d}</p><div class="acts">${conf.a.map(a=>`<button class="btn ${a[2]}" data-act="${a[0]}">${a[1]}</button>`).join('')}</div>
    <div class="muted" style="font-size:11px;margin-top:20px">演示态 · 顶部控制台可切回"正常"</div></div></div>`;
}

/* ========== 路由 ========== */
function content(){
  if(S.forceState)return stateView(S.forceState);
  switch(S.page){
    case 'home':return S.role==='student'?homeA():homeA(); // 各方案首页由 renderShell 选择
    case 'courses':return pageCourses();
    case 'knowledge':return pageKnowledge();
    case 'graph':return pageGraph();
    case 'videos':return pageVideos();
    case 'quiz':return pageQuiz();
    case 'task':return pageTask();
    case 'bank':return pageBank();
    case 'ai-gen':return pageAiGen();
    case 'compose':return pageCompose();
    case 'grade':return pageGrade();
    case 'analytics':return pageAnalytics();
    default:return pageCourses();
  }
}
function homeForScheme(){
  if(S.scheme==='A')return homeA();
  if(S.scheme==='B')return homeB();
  return homeC();
}
function render(){
  document.body.setAttribute('data-scheme',S.scheme);
  document.body.dataset.role=S.role;
  devbar();
  if(!S.logged){el('root').innerHTML=loginView();return}
  // 异常态优先于页面内容渲染
  let inner = S.forceState ? stateView(S.forceState)
            : (S.page==='home' ? homeForScheme() : content());
  if(S.scheme==='A')el('root').innerHTML=shellA(inner);
  else if(S.scheme==='B')el('root').innerHTML=shellB(inner);
  else el('root').innerHTML=shellC(inner);
  requestAnimationFrame(()=>document.querySelectorAll('.reveal').forEach(n=>n.classList.add('in')));
}
function toast(msg){
  let t=el('toast');
  if(!t){t=document.createElement('div');t.id='toast';t.style.cssText='position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:10000;background:#1b1a18;color:#f6f2ea;padding:11px 20px;border-radius:8px;font-size:12px;box-shadow:0 10px 30px rgba(0,0,0,.3);transition:opacity .2s';document.body.appendChild(t)}
  t.textContent=msg;t.style.opacity='1';clearTimeout(t._t);t._t=setTimeout(()=>t.style.opacity='0',2200);
}

/* ========== 事件 ========== */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-scheme],[data-role],[data-state],[data-go],[data-act],[data-node]');
  if(!b)return;
  if(b.hasAttribute('data-scheme')){S.scheme=b.dataset.scheme;render();return}
  if(b.hasAttribute('data-role')){S.role=b.dataset.role;if(S.logged)S.page='home';render();return}
  if(b.hasAttribute('data-state')){S.forceState=b.dataset.state||null;render();return}
  if(b.hasAttribute('data-node')){toast('已选中节点 · 右侧显示详情与来源');return}
  if(b.hasAttribute('data-go')){
    const g=b.dataset.go;
    if(g==='login'){S.logged=false;S.forceState=null;S.page='login';render();return}
    S.page=g;S.forceState=null;render();return}
  if(b.hasAttribute('data-act')){
    const a=b.dataset.act;
    const M={login:()=>{S.logged=true;S.forceState=null;S.page='home';render();toast('登录成功')},
      logout:()=>{S.logged=false;S.page='login';render();toast('已退出，会话不可复用')},
      relogin:()=>{S.forceState=null;render();toast('已重新登录，从原页面继续')},
      back:()=>{S.forceState=null;render()},
      retry:()=>{S.forceState=null;render();toast('重新加载成功')},
      approve:()=>toast('已通过审核 · 操作已留痕（操作者/时间/对象）'),
      reject:()=>toast('已退回候选题 · 原因与操作已留痕'),
      generate:()=>toast('已生成 5 道候选题 · 均为待审核，未入库'),
      submit:()=>toast('已提交 · 重复提交不重复计分'),
      'save-draft':()=>toast('批改草稿已保存 · 未发布'),
      'publish-grade':()=>toast('成绩已发布 · 更正值留痕'),
      'add-q':()=>toast('已加入试卷 · 蓝图同步更新'),
      listview:()=>toast('已切换到列表视图 · 无需画布仍可浏览审核'),
      locate:()=>toast('定位到《面点工艺学》第三章第一节 · 第 58 页'),
      up:()=>toast('题目上移（支持键盘操作）'),down:()=>toast('题目下移（支持键盘操作）'),
      rule:()=>toast('规则组卷：按蓝图自动抽题'),'ai-compose':()=>toast('AI 辅助：仅用已审核题或标记候选'),
      preview:()=>toast('预览已打开（演示环境）'),'preview-paper':()=>toast('发布前校验：总分/题状态/对象/时间'),
      play:()=>toast('播放/续看已触发（演示）'),upload:()=>toast('上传入口已打开（演示）'),
      bell:()=>toast('暂无新通知'),prev:()=>toast('上一题 · 作答自动保存'),next:()=>toast('下一题 · 作答自动保存')};
    (M[a]||(()=>toast('操作已触发：'+a)))();return}
});
document.addEventListener('input',e=>{
  if(e.target.hasAttribute('data-score')){let s=0;document.querySelectorAll('[data-score]').forEach(i=>s+=Number(i.value)||0);const t=el('totalScore');if(t)t.textContent=s}
  if(e.target.hasAttribute('data-grade')){let s=0;document.querySelectorAll('[data-grade]').forEach(i=>s+=Number(i.value)||0);const t=el('finalScore');if(t)t.textContent=s}
});
(function(){
  const p=new URLSearchParams(location.hash.replace(/^#/,''));
  if(['A','B','C'].includes(p.get('scheme')))S.scheme=p.get('scheme');
  if(p.get('role'))S.role=p.get('role');
  if(p.get('page'))S.page=p.get('page');
  if(p.get('logged')==='1')S.logged=true;
  if(p.get('state'))S.forceState=p.get('state');
})();
render();
