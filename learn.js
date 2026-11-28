/* PEAK MODE v13.4: Learn. Daily knowledge and quiz on Today, exercise knowledge during rest, and a muscle guide. */
(()=>{
const D=PMDATA,E=s=>document.querySelector(s),MU=D.MUSCLES;
const RULES=D.RULES.map(r=>({label:r[0],re:r[1],p:r[2],s:r[3],kind:r[4],form:r[5],mistake:r[6],why:r[7]}));
const REGION={upper:'Upper body',core:'Core and spine',lower:'Lower body'};
const gcd=(a,b)=>b?gcd(b,a%b):a,stride=n=>{let s=37;while(gcd(s,n)!==1)s++;return s};
const QS=stride(D.QUIZ.length),TS=stride(D.TIPS.length);
const L=()=>{const l=db.learn||(db.learn={});if(!l.a||typeof l.a!=='object')l.a={};['streak','best'].forEach(k=>{if(!Number.isFinite(l[k]))l[k]=0});if(typeof l.last!=='string')l.last='';if(!Number.isFinite(l.seed))l.seed=Math.floor(Math.random()*997);return l};
const epoch=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);return Math.floor(Date.UTC(+m[1],+m[2]-1,+m[3])/864e5)};
const qIndex=day=>(day*QS+L().seed)%D.QUIZ.length,tipIndex=(day,k)=>(day*TS+L().seed+k)%D.TIPS.length;
let tipShift=0,qOpen=false,qWhy=false,restK=0;
/* ---- daily quiz ---- */
function quizFor(t){const i=qIndex(epoch(t)),q=D.QUIZ[i],pos=(i*5+3)%4,o=q.slice(2,5);o.splice(pos,0,q[1]);return{i,q:q[0],opts:o,pos,why:q[5],cat:q[6]}}
function answer(k){const t=today(),l=L();if(l.a[t])return;const z=quizFor(t),ok=k===z.pos;l.a[t]={q:z.i,c:ok?1:0,x:k};
 const gap=l.last?epoch(t)-epoch(l.last):0;
 l.streak=!l.last?1:gap<=1?l.streak+1:Math.max(1,Math.ceil(l.streak/2)); /* a missed day halves the streak instead of erasing it */
 l.best=Math.max(l.best,l.streak);l.last=t;save();qOpen=false;qWhy=true;renderToday()}
const stats=()=>{const l=L(),a=Object.values(l.a),n=a.length,c=a.filter(x=>x.c).length;return{n,c,pct:n?Math.round(100*c/n):0,streak:l.streak,best:l.best}};
function homeHTML(){const st=db.settings||{},t=today(),day=epoch(t);let h='';
 if(st.knowledge!==false){const tp=D.TIPS[tipIndex(day,tipShift)];h+=`<article class="card learn"><small>TODAY'S KNOWLEDGE · ${esc(tp[0]).toUpperCase()}</small><b>${esc(tp[1])}</b><p>${esc(tp[2])}</p><div class="lrow2"><button class="link" data-l="guide">Muscle guide</button><button class="link" data-l="tip">Another tip</button></div></article>`}
 if(st.quiz!==false){const z=quizFor(t),a=L().a[t],s=stats();
  if(!a)h+=`<article class="card learn"><small>DAILY QUESTION · ${esc(z.cat).toUpperCase()}${s.streak?` · STREAK ${s.streak}`:''}</small><b>${esc(z.q)}</b>${qOpen?`<div class="qopts">${z.opts.map((o,k)=>`<button data-qa="${k}">${esc(o)}</button>`).join('')}</div>`:'<div class="lrow2"><button class="primary" data-l="qopen">Answer</button></div>'}</article>`;
  else h+=`<article class="card learn"><small>DAILY QUESTION · ${a.c?'CORRECT':'ANSWERED'} · STREAK ${s.streak}</small><b>${esc(z.q)}</b>${qWhy?`<div class="qopts">${z.opts.map((o,k)=>`<button disabled class="${k===z.pos?'ok':k===a.x?'bad':''}">${esc(o)}</button>`).join('')}</div><p class="hint"><b>${a.c?'Correct.':'Not quite.'}</b> ${esc(z.why)}</p><p class="hint">Missing a day only halves your streak. Come back tomorrow for a new question.</p>`:''}<div class="lrow2"><button class="link" data-l="why">${qWhy?'Hide answer':'Show answer'}</button><button class="link" data-l="guide">Quiz stats</button></div></article>`}
 return h}
E('#home').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.qa!==undefined)return answer(+b.dataset.qa);
 const a=b.dataset.l;if(a==='guide')return openGuide();if(a==='tip'){tipShift++;return renderToday()}if(a==='qopen'){qOpen=true;return renderToday()}if(a==='why'){qWhy=!qWhy;return renderToday()}});
/* ---- exercise knowledge during rest ---- */
let R={name:'',tab:'muscles',sel:''};
const info=name=>{const n=String(name).toLowerCase();return RULES.find(r=>r.re.test(n))||null};
const chip=(id,main,sel)=>`<button class="lm${main?' p':''}${sel===id?' on':''}" data-lm="${id}">${esc(MU[id][0])}</button>`;
function detail(id){const m=MU[id];return m?`<div class="ldet"><b>${esc(m[0])}</b><small>${esc(m[1])}</small><p><i>Where:</i> ${esc(m[2])}</p><p><i>What it does:</i> ${esc(m[3])}</p><p><i>Why it matters:</i> ${esc(m[4])}</p><p class="hint">Tip: ${esc(m[5])}</p></div>`:''}
function restHTML(){const r=info(R.name);
 if(!r){const tp=D.TIPS[tipIndex(epoch(today()),restK)];return `<div class="rl"><small>KNOW THIS · ${esc(tp[0]).toUpperCase()}</small><b>${esc(tp[1])}</b><p>${esc(tp[2])}</p></div>`}
 const st=r.kind==='stretch',w=st?['Muscles stretched','Also involved']:['Main muscles','Helping muscles'],tab=R.tab;
 let body='';
 if(tab==='muscles'){body=r.p.length?`<p class="lh">${w[0]}</p><div class="lchips">${r.p.map(id=>chip(id,1,R.sel)).join('')}</div>${r.s.length?`<p class="lh">${w[1]}</p><div class="lchips">${r.s.map(id=>chip(id,0,R.sel)).join('')}</div>`:''}${detail(R.sel)}`:`<p class="hint">This movement prepares the whole body, so there is no single target muscle.</p>`}
 else if(tab==='benefits'){body=`<p>${esc(r.why)}</p>${r.p.map(id=>`<p><b>${esc(MU[id][0])}:</b> ${esc(MU[id][4])}</p>`).join('')}`}
 else{const lf=limitFlags(R.name);body=`<p><b>Key cue:</b> ${esc(r.form)}</p><p><b>Common mistake:</b> ${esc(r.mistake)}</p>${lf.length?`<p class="warnline">⚠ May load your ${esc(lf.join(', '))}. Lower the load or range, or skip it. Stop for sharp pain.</p>`:''}`}
 return `<div class="rl"><small>${st?'JUST STRETCHED':'JUST TRAINED'}</small><b>${esc(R.name)}</b><div class="ltabs">${[['muscles','Muscles'],['benefits','Benefits'],['form','Form']].map(([k,n])=>`<button data-lt="${k}" class="${tab===k?'on':''}">${n}</button>`).join('')}</div>${body}<button class="link" data-l="guide">Open muscle guide</button></div>`}
function mountRest(el,name){if(!el)return;restK++;R={name,tab:'muscles',sel:''};const r=info(name);if(r&&r.p[0])R.sel=r.p[0];el.innerHTML=restHTML()}
E('#ses').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const el=E('#rLearn');
 if(b.dataset.lt&&el){R.tab=b.dataset.lt;el.innerHTML=restHTML()}
 else if(b.dataset.lm&&el){R.sel=R.sel===b.dataset.lm?'':b.dataset.lm;el.innerHTML=restHTML()}
 else if(b.dataset.l==='guide')openGuide()});
/* ---- muscle guide overlay ---- */
function guideHTML(q){q=(q||'').toLowerCase().trim();const s=stats();let out='';
 for(const [reg,name] of Object.entries(REGION)){const ids=Object.keys(MU).filter(id=>MU[id][6]===reg&&(!q||[MU[id][0],MU[id][1],...RULES.filter(r=>r.p.includes(id)||r.s.includes(id)).map(r=>r.label)].some(t=>t.toLowerCase().includes(q))));
  if(!ids.length)continue;out+=`<h3>${name}</h3>`+ids.map(id=>{const m=MU[id],main=RULES.filter(r=>r.p.includes(id)).map(r=>r.label),help=RULES.filter(r=>r.s.includes(id)).map(r=>r.label);
   return `<details class="lmu"><summary><b>${esc(m[0])}</b><small>${esc(m[1])}</small></summary><p><i>Where:</i> ${esc(m[2])}</p><p><i>What it does:</i> ${esc(m[3])}</p><p><i>Why it matters:</i> ${esc(m[4])}</p><p class="hint">Tip: ${esc(m[5])}</p>${main.length?`<p><i>Mainly trained by:</i> ${esc(main.slice(0,7).join(', '))}</p>`:''}${help.length?`<p><i>Also worked by:</i> ${esc(help.slice(0,6).join(', '))}</p>`:''}</details>`}).join('')}
 return {stats:s.n?`Your quiz: ${s.n} answered · ${s.c} correct (${s.pct}%) · streak ${s.streak} · best ${s.best}`:'Answer the daily question on Today to build your streak.',list:out||'<p class="hint">No muscle matches that search.</p>'}}
function openGuide(){let g=E('#mguide');if(!g){document.body.insertAdjacentHTML('beforeend','<div id="mguide" role="dialog" aria-modal="true" aria-label="Muscle guide" hidden><div class="mgin"><div class="mgtop"><button id="mgX" aria-label="Close muscle guide">✕</button><b>Muscle guide</b></div><p class="hint" id="mgStats"></p><input id="mgSearch" type="search" placeholder="Search a muscle or exercise, e.g. chest or squat" aria-label="Search muscles"><div id="mgList"></div><p class="hint">General education only. It is not medical advice.</p></div></div>');g=E('#mguide');
  const draw=()=>{const r=guideHTML(E('#mgSearch').value);E('#mgStats').textContent=r.stats;E('#mgList').innerHTML=r.list};
  E('#mgSearch').oninput=draw;E('#mgX').onclick=()=>{g.hidden=true;if(E('#ses').hidden)document.body.style.overflow=''};g._draw=draw}
 g._draw();g.hidden=false;document.body.style.overflow='hidden'}
/* ---- settings toggles ---- */
E('#tStart').closest('label').insertAdjacentHTML('afterend','<label class="check"><input type="checkbox" id="tKnow"> Show daily knowledge tip</label><label class="check"><input type="checkbox" id="tQuiz"> Show daily quiz question</label>');
E('#settings').addEventListener('click',()=>{const s=db.settings||{};E('#tKnow').checked=s.knowledge!==false;E('#tQuiz').checked=s.quiz!==false});
E('#tKnow').onchange=e=>{(db.settings||(db.settings={})).knowledge=e.target.checked;save();renderToday()};
E('#tQuiz').onchange=e=>{(db.settings||(db.settings={})).quiz=e.target.checked;save();renderToday()};
window.PMlearn={homeHTML,mountRest,info,answer,stats,quizFor,openGuide};
renderToday();
})();
