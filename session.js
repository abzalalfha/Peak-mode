/* PEAK MODE v13.2: guided workout session. Saved as you go (survives reloads), clock-based rest timer, honest completion. */
(()=>{
const E=s=>document.querySelector(s),SKEY=ns('peakModeSession');
document.body.insertAdjacentHTML('beforeend','<div id="ses" role="dialog" aria-modal="true" aria-label="Workout session" hidden><div class="sin"><div class="stop"><button id="sX" aria-label="End session">✕</button><b id="sPos"></b><b id="sClock">0:00</b></div><div id="sBody"></div></div></div>');
const parse=s=>{const m=/^(\d+)(?:\s*[–-]\s*(\d+))?\s*×\s*(.+)$/.exec(String(s).trim());if(!m)return{sets:1,txt:String(s),r:'',timed:true};const n=/(\d+)(?!.*\d)/.exec(m[3]);return{sets:+(m[2]||m[1]),txt:m[3],r:n?+n[1]:'',timed:/\bs\b|sec|min/i.test(m[3])}};
let X=null,tm=0,rt=0,demo=0,lock=null,ac=null;
const fmt=s=>Math.floor(s/60)+':'+String(Math.round(s%60)).padStart(2,'0'),e1=(w,r)=>w*(1+r/30);
const lastW=n=>{const l=db.lifts.filter(x=>x.name===n).pop();return l?+l.weight:0};
/* ---- saved session (so a reload, phone call or app switch does not lose your sets) ---- */
function readSaved(){try{const s=JSON.parse(localStorage.getItem(SKEY)||'null');if(!s||s.v!==1||!Array.isArray(s.ex)||!s.ex.length||Date.now()-s.saved>12*36e5)return null;
 if(!s.ex.every(e=>e&&typeof e.n==='string'&&Number.isFinite(e.sets)&&Array.isArray(e.logs))||!(s.i>=0&&s.i<s.ex.length)||!(s.s>=0))return null;return s}catch{return null}}
const clearSaved=()=>{try{localStorage.removeItem(SKEY)}catch{}};
function persist(){if(!X||X.over)return;try{localStorage.setItem(SKEY,JSON.stringify({v:1,saved:Date.now(),date:today(),ex:X.ex,i:X.i,s:X.s,w:X.w||0,skip:[...X.skip],el:Math.round((Date.now()-X.t0)/1000),rest:X.restEnd||0,restNext:X.restNext||''}))}catch{}}
/* ---- screen wake + sound ---- */
async function getLock(){try{lock=await navigator.wakeLock.request('screen')}catch{}}
function beep(){try{ac||=new(window.AudioContext||window.webkitAudioContext)();ac.resume&&ac.resume();const o=ac.createOscillator();o.connect(ac.destination);o.frequency.value=880;o.start();o.stop(ac.currentTime+.35)}catch{}}
/* ---- open / resume / close ---- */
function hide(){clearInterval(tm);clearInterval(rt);clearInterval(demo);lock&&lock.release().catch(()=>0);lock=null;E('#ses').hidden=true;document.body.style.overflow='';renderToday()}
function close(){clearSaved();X=null;hide()}
function frame(){E('#ses').hidden=false;document.body.style.overflow='hidden'}
function run(){clearInterval(tm);tm=setInterval(()=>E('#sClock').textContent=fmt((Date.now()-X.t0)/1000),1000);getLock()}
function startNew(){const w=workoutFor(new Date());X={ex:w[2].map(e=>({n:e[0],note:e[2],...parse(e[1]),logs:[]})),i:0,s:0,t0:Date.now(),skip:new Set(),w:lastW(w[2][0][0]),restEnd:0,restNext:''};frame();run();setStep()}
function resume(sv){X={ex:sv.ex,i:sv.i,s:sv.s,w:sv.w||0,skip:new Set(sv.skip||[]),t0:Date.now()-(sv.el||0)*1000,restEnd:0,restNext:''};frame();run();
 if(sv.rest&&sv.rest>Date.now())rest(sv.restNext,sv.rest);else if(sv.rest)advance();else setStep()}
window.openSession=(forceResume)=>{const sv=readSaved();if(sv&&forceResume)return resume(sv);if(!sv){clearSaved();return startNew()}
 frame();E('#sPos').textContent='Unfinished session';E('#sClock').textContent='';
 const done=sv.ex.reduce((n,e)=>n+e.logs.length,0);
 E('#sBody').innerHTML=`<h1>Pick up where you left off?</h1><p class="sset">Exercise ${sv.i+1} of ${sv.ex.length} · ${done} set${done===1?'':'s'} logged</p><p class="hint">Saved ${new Date(sv.saved).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}.</p><button class="primary big2" id="sResume">Resume session</button><button class="secondary" id="sNew">Discard and start a new session</button>`};
window.PMses={pending:readSaved,discard:clearSaved};
/* ---- demo ---- */
async function showDemo(name){const box=E('#sDemo');if(!box||!window.PMlib)return;try{await PMlib.load()}catch{box.innerHTML='<p class="hint">Demo needs internet once.</p>';return}const x=PMlib.match(name);if(!x||!x.images.length){box.innerHTML='<p class="hint">No exact demo for this exercise.</p>';return}const fr=x.images.map(PMlib.img);let k=0;const put=()=>box.innerHTML=`<img src="${esc(fr[k])}" crossorigin="anonymous" alt="${esc(x.name)} demonstration">`;put();clearInterval(demo);if(fr.length>1)demo=setInterval(()=>{if(!E('#sDemo'))return clearInterval(demo);k=(k+1)%fr.length;put()},1000)}
/* ---- steps ---- */
function setStep(){clearInterval(rt);X.restEnd=0;persist();const e=X.ex[X.i],n=X.ex.length;E('#sPos').textContent=`Exercise ${X.i+1} of ${n}`;E('#sClock').textContent=fmt((Date.now()-X.t0)/1000);
const stp=(id,l,v,st)=>`<div class="stp"><small>${l}</small><div><button data-d="${id}:-${st}" aria-label="Less">−</button><input id="${id}" type="number" inputmode="decimal" value="${esc(v)}"><button data-d="${id}:${st}" aria-label="More">+</button></div></div>`;
E('#sBody').innerHTML=`<div id="sDemo" class="sdemo"></div><h1>${esc(e.n)}</h1><p class="sset">Set ${X.s+1} of ${e.sets} · ${esc(e.txt)}</p>${e.note?`<p class="hint">${esc(e.note)}</p>`:''}${limitFlags(e.n).length?`<p class="warnline">⚠ May load your ${esc(limitFlags(e.n).join(', '))}. Lower the load or range, or skip it. Stop for sharp pain.</p>`:''}${e.timed?'':`<div class="stpr">${stp('sW','Weight kg',X.w||'',2.5)}${stp('sR','Reps',e.r,1)}</div>`}<button class="primary big2" id="sDone">Done set</button><button class="link" id="sSkip">Skip exercise</button>`;showDemo(e.n)}
/* Rest uses the real clock (an end time), so a locked or throttled screen cannot make it run slow. */
function rest(next,endAt){clearInterval(rt);X.restEnd=endAt||Date.now()+90000;X.restNext=next;persist();
const left=()=>Math.max(0,Math.ceil((X.restEnd-Date.now())/1000));
E('#sBody').innerHTML=`<p class="sset">Rest</p><div class="rclock" id="rc">${fmt(left())}</div><p class="hint">${esc(next)}</p><div class="rbtns"><button class="secondary" id="r15">+15 s</button><button class="primary" id="rSkip">Skip rest</button></div><div id="rLearn" class="rlearn"></div>`;window.PMlearn&&PMlearn.mountRest(E('#rLearn'),X.ex[X.i].n);
const go=()=>{clearInterval(rt);advance()};
const tick=()=>{if(!E('#rc'))return clearInterval(rt);const l=left();E('#rc').textContent=fmt(l);if(l<=0){beep();navigator.vibrate&&navigator.vibrate([200,100,200]);go()}};
rt=setInterval(tick,250);E('#r15').onclick=()=>{X.restEnd+=15000;persist();tick()};E('#rSkip').onclick=go}
function advance(){const e=X.ex[X.i];if(X.s+1<e.sets){X.s++}else{X.i++;X.s=0;if(X.i>=X.ex.length)return summary(true);X.w=lastW(X.ex[X.i].n)}setStep()}
function done(){const e=X.ex[X.i];let w=0,r=0;if(!e.timed){w=+E('#sW').value||0;r=+E('#sR').value||0;if(!(r>0))return showToast('Enter the reps you did.');X.w=w}e.logs.push({w,r});persist();navigator.vibrate&&navigator.vibrate(30);try{ac||=new(window.AudioContext||window.webkitAudioContext)()}catch{}const b=E('#sDone');b.classList.add('pop');
const last=X.s+1>=e.sets,lastEx=X.i+1>=X.ex.length;if(last&&lastEx)return setTimeout(()=>summary(true),250);const nx=last?`Next exercise: ${X.ex[X.i+1].n}`:`Next: set ${X.s+2} of ${e.sets}`;setTimeout(()=>rest(nx),250)}
function summary(complete){clearInterval(rt);clearInterval(demo);const t=ymd(new Date()),secs=Math.round((Date.now()-X.t0)/1000);let vol=0,sets=0;const pbs=[],rows=[];
/* a session only counts as complete if nothing was skipped */
const full=complete&&X.skip.size===0;X.over=1;
X.ex.forEach((e,i)=>{if(!e.logs.length)return;sets+=e.logs.length;e.logs.forEach(l=>vol+=l.w*l.r);
 if(e.timed)return; /* timed work (plank, walks) has no weight x reps, so it is not added to the strength log */
 const best=e.logs.reduce((a,b)=>e1(b.w,b.r)>e1(a.w,a.r)?b:a),prev=db.lifts.filter(x=>x.name===e.n).map(x=>e1(+x.weight,+x.reps));if(best.w>0&&prev.length&&e1(best.w,best.r)>Math.max(...prev))pbs.push(`${e.n}: ${best.w} kg × ${best.r}`);rows.push([e,best])});
rows.forEach(([e,b])=>db.lifts.push({date:t,name:e.n,weight:String(b.w),reps:String(b.r),sets:String(e.logs.length)}));
db.done[t]=[...new Set([...(db.done[t]||[]),...X.ex.map((e,i)=>e.logs.length?i:-1).filter(i=>i>=0)])];
if(full){const k=new Set(db.checks[t]||[]);k.add(1);db.checks[t]=[...k]}
save();clearSaved();navigator.vibrate&&navigator.vibrate([40,60,40]);
E('#sPos').textContent=full?'Complete':'Ended early';const C=2*Math.PI*54;
E('#sBody').innerHTML=`<svg class="sring" viewBox="0 0 130 130" aria-hidden="true"><circle cx="65" cy="65" r="54" class="rbg"/><circle id="sRing" cx="65" cy="65" r="54" class="rfg" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 65 65)"/><path class="stick" d="M44 66l14 14 28-30" fill="none"/></svg><h1>${full?'Session complete':'Session saved'}</h1>${full||!X.skip.size?'':'<p class="hint">You skipped some exercises, so today is not marked as a completed workout. Your sets are saved.</p>'}<div class="sgrid"><div><b>${fmt(secs)}</b><small>time</small></div><div><b>${Math.round(vol).toLocaleString('en-IN')}</b><small>kg volume</small></div><div><b>${sets}</b><small>sets</small></div></div>${pbs.length?`<div class="card c-lime"><small>PERSONAL BESTS</small>${pbs.map(p=>`<p><b>${esc(p)}</b></p>`).join('')}</div>`:''}<button class="primary big2" id="sFin">Finish</button>`;requestAnimationFrame(()=>requestAnimationFrame(()=>{const r=E('#sRing');if(r)r.style.strokeDashoffset=full?0:C*.4}))}
E('#sBody').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
if(b.id==='sResume'){const sv=readSaved();return sv?resume(sv):startNew()}
if(b.id==='sNew'){clearSaved();return startNew()}
if(!X)return;
if(b.id==='sDone')done();if(b.id==='sSkip'){X.skip.add(X.i);X.i++;X.s=0;if(X.i>=X.ex.length)return summary(false);X.w=lastW(X.ex[X.i].n);setStep()}if(b.id==='sFin')close();
if(b.dataset.d){const[id,d]=b.dataset.d.split(':'),i=E('#'+id);i.value=Math.max(0,+(((+i.value||0)+ +d).toFixed(1)))}});
E('#sX').onclick=()=>{if(!X)return hide();if(E('#sFin'))return close();const any=X.ex.some(x=>x.logs.length);if(!any){if(confirm('Leave the session?'))close();return}if(confirm('End the session? Sets you finished will be saved.'))summary(false)};
document.addEventListener('visibilitychange',()=>{if(!X||E('#ses').hidden)return;if(document.hidden)persist();else getLock()});
addEventListener('pagehide',persist);
})();
