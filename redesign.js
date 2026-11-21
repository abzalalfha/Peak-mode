
/* PEAK MODE v11 — interaction layer; preserves the v10 data model */
(()=>{'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.body.classList.add('v11');
const dock=document.createElement('div');dock.className='v11-dock';dock.innerHTML='<button data-vtab="today" class="active"><span>⌂</span>Today</button><button data-vtab="gym"><span>↗</span>Train</button><button data-vtab="food"><span>◷</span>Eat</button><button data-vtab="progress"><span>◎</span>You</button>';document.body.append(dock);
function go(id){const b=$(`nav [data-page="${id}"]`);if(b)b.click();dock.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.vtab===id));}
dock.addEventListener('click',e=>{const b=e.target.closest('[data-vtab]');if(b)go(b.dataset.vtab)});
const you=document.createElement('div');you.id='v11-you-links';you.style.display='none';you.innerHTML='<article class="card"><h3>Your space</h3><p class="muted">Progress, coaching and your personal training tools.</p><div class="chips"><button data-extra="coach">AI Coach & check-in</button><button data-extra="run">Run & cycle</button><button data-extra="library">Exercise library</button><button data-extra="physique">Physique</button><button data-extra="progress">Progress & reports</button><button data-extra="settings">Settings</button></div></article>';
$('#progress').prepend(you);
you.addEventListener('click',e=>{const b=e.target.closest('[data-extra]');if(!b)return;const id=b.dataset.extra;if(id==='settings'){$('#settings')?.click();return}go(id);});
/* Convert the Today screen to a compact next-action view. */
const today=$('#today');
if(today){
 const first=today.querySelector('.card');
 if(first){const start=document.createElement('button');start.className='primary';start.textContent='Start workout →';start.addEventListener('click',()=>session.open());first.append(start);}
 const intake=today.querySelector('#intake');
 if(intake){const meal=document.createElement('article');meal.className='card';meal.innerHTML='<small>NEXT MEAL</small><h3 id="v11-next-meal">Your next meal</h3><p class="muted" id="v11-next-detail"></p><button class="secondary" id="v11-open-eat">Open meal plan</button>';first?.after(meal);$('#v11-open-eat').onclick=()=>go('food');}
}
/* Meal timeline: retains existing menu and meal detail rendering. */
function enhanceMeals(){
 const host=$('#menuMeals');if(!host)return;
 const d=new Date(),idx=((Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(2026,0,1))/86400000)%7)+7)%7,meals=menus[idx]||[];
 const now=d.getHours()*60+d.getMinutes();
 host.innerHTML=meals.map((m,i)=>{const [hh,mm]=(m[0]||'12:00').split(':').map(Number),past=now>=hh*60+mm,upcoming=!past&&i===meals.findIndex(x=>{const [h,mi]=x[0].split(':').map(Number);return h*60+mi>=now});return `<div class="meal v11-meal" style="opacity:${past?.65:1};border-color:${upcoming?'var(--v11-accent)':'var(--v11-line)'}"><time>${esc(m[0])}<br>${past?'PASSED':upcoming?'UP NEXT':'LATER'}</time><div><strong>${esc(m[2])}</strong><small>${esc(m[4]||'')}</small></div><button class="secondary" data-meal-detail="${i}">Details</button></div>`}).join('');
 host.querySelectorAll('[data-meal-detail]').forEach(b=>b.onclick=()=>{const m=meals[+b.dataset.mealDetail];if(typeof mealHTML==='function'){$('#recipeDialog').showModal();$('#rTitle').textContent=m[2];$('#rBody').textContent=(m[3]||'')+' · '+(m[5]||'');}});
 const n=meals.find(m=>{const [h,mi]=m[0].split(':').map(Number);return h*60+mi>=now})||meals[meals.length-1];
 if(n){$('#v11-next-meal').textContent=n[2];$('#v11-next-detail').textContent=n[0]+' · '+n[4];}
}
const session={
 items:[],index:0,done:[],timer:null,seconds:0,
 open(){const w=workoutFor(new Date());this.items=w?.[2]||[];this.index=0;this.done=[];this.render();$('#v11-session').classList.add('open')},
 render(){const item=this.items[this.index];if(!item){this.finish();return}$('#v11-ex-name').textContent=item[0];$('#v11-ex-meta').textContent=(item[1]||'')+' · '+(item[2]||'');$('#v11-ex-count').textContent=`Exercise ${this.index+1} of ${this.items.length}`;$('#v11-ex-progress').style.width=(this.index/Math.max(1,this.items.length)*100)+'%';$('#v11-set-list').innerHTML=Array.from({length:3},(_,i)=>`<div class="v11-set"><span>Set ${i+1}</span><span>${esc(item[1]||'Follow your planned reps')}</span><button class="secondary" data-set="${i}">${(this.done[this.index]||[]).includes(i)?'Done ✓':'Mark done'}</button></div>`).join('');$('#v11-set-list').querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{const a=this.done[this.index]||(this.done[this.index]=[]);const n=+b.dataset.set;if(!a.includes(n)){a.push(n);b.textContent='Done ✓';this.startRest(90)}});$('#v11-next').textContent=this.index===this.items.length-1?'Finish workout':'Next exercise →'},
 startRest(n){clearInterval(this.timer);this.seconds=n;$('#v11-rest').textContent='Rest · '+n+'s';this.timer=setInterval(()=>{this.seconds--;$('#v11-rest').textContent=this.seconds>0?'Rest · '+this.seconds+'s':'Rest complete';if(this.seconds<=0)clearInterval(this.timer)},1000)},
 next(){this.index++;this.render()},
 finish(){clearInterval(this.timer);const total=this.done.reduce((s,a)=>s+a.length,0);$('#v11-session-body').innerHTML=`<h2>Session complete</h2><p class="muted">Nice work. Your session summary:</p><h1>${total} sets completed</h1><p>${this.items.length} exercises · ${new Date().toLocaleTimeString()}</p><button class="primary" id="v11-close-finish">Done</button>`;$('#v11-close-finish').onclick=()=>$('#v11-session').classList.remove('open')}
};
const modal=document.createElement('div');modal.id='v11-session';modal.className='v11-modal';modal.innerHTML='<div class="v11-sheet" id="v11-session-body"><div class="muted" id="v11-ex-count"></div><div class="v11-progress"><i id="v11-ex-progress"></i></div><h2 id="v11-ex-name"></h2><p class="muted" id="v11-ex-meta"></p><div style="height:110px;display:grid;place-items:center;background:#ffffff08;border-radius:16px;margin:14px 0"><span class="muted">Exercise movement reference</span></div><div id="v11-set-list"></div><p id="v11-rest" class="muted">Rest timer starts after a set is marked done.</p><button class="primary" id="v11-next">Next exercise →</button><button class="secondary" id="v11-close-session">Close</button></div>';document.body.append(modal);
$('#v11-close-session').onclick=()=>{clearInterval(session.timer);modal.classList.remove('open')};
$('#v11-next').onclick=()=>session.next();
/* Floating music shortcut opens a compact service chooser; full player stays on Train. */
const music=document.createElement('button');music.className='v11-music';music.title='Music';music.textContent='♫';document.body.append(music);
const mm=document.createElement('div');mm.className='v11-modal';mm.innerHTML='<div class="v11-sheet"><h2>Music</h2><p class="muted">Choose where you want to listen. Your music service handles playback.</p><button class="primary" id="v11-spotify">Spotify</button><button class="secondary" id="v11-youtube">YouTube Music</button><button class="secondary" id="v11-local">Device music player</button><button class="secondary" id="v11-music-close">Close</button></div>';document.body.append(mm);music.onclick=()=>mm.classList.add('open');$('#v11-music-close').onclick=()=>mm.classList.remove('open');$('#v11-spotify').onclick=()=>window.open('https://open.spotify.com/','_blank','noopener');$('#v11-youtube').onclick=()=>window.open('https://music.youtube.com/','_blank','noopener');$('#v11-local').onclick=()=>{mm.classList.remove('open');go('gym');document.querySelector('#music')?.scrollIntoView({behavior:'smooth'})};
/* update meal preview and keep it in sync after original renderer */
enhanceMeals();const oldFood=window.renderFood;if(typeof oldFood==='function'){window.renderFood=()=>{oldFood();enhanceMeals()}}
})();
