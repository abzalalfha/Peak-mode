/* PEAK MODE v2: physique photos, meal log, recipes, prep plan, charts, timers */
(()=>{
const E=s=>document.querySelector(s),ALL=s=>[...document.querySelectorAll(s)],fmt=s=>s.split('-').reverse().join('-');
const defaults=()=>{db.eaten||={};db.custom||={};db.done||={};db.prepDone||={};db.targets||={kcal:2500,protein:180,water:90}};defaults();
const T=()=>db.targets;
/* ---- photo store (IndexedDB: photos are too big for localStorage) ---- */
let _d;const idb=()=>_d||(_d=new Promise((ok,no)=>{const r=indexedDB.open('peakPhotos',1);r.onupgradeneeded=()=>r.result.createObjectStore('p',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}));
const tx=async(m,f)=>{const d=await idb();return new Promise((ok,no)=>{const t=d.transaction('p',m),q=f(t.objectStore('p'));t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>no(t.error)})};
const putP=p=>tx('readwrite',s=>s.put(p)),delP=id=>tx('readwrite',s=>s.delete(id)),allP=async()=>{try{return await tx('readonly',s=>s.getAll())||[]}catch{return[]}};
const shrink=(f,max=1000)=>new Promise((ok,no)=>{const i=new Image,u=URL.createObjectURL(f);i.onload=()=>{const k=Math.min(1,max/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.8))};i.onerror=no;i.src=u});
const pick=()=>new Promise(ok=>{const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=()=>ok(i.files[0]);i.click()});
/* ---- physique ---- */
let pose='Front';
async function renderPhysique(){const ps=(await allP()).filter(p=>p.type==='body').sort((a,b)=>a.date.localeCompare(b.date)||a.ts-b.ts),of=ps.filter(p=>p.pose===pose),wt=d=>{const m=db.measurements.filter(x=>x.date<=d&&x.weight).pop();return m?m.weight+' kg':''};
ALL('#poseSeg button').forEach(b=>b.classList.toggle('on',b.dataset.pose===pose));
E('#cmp').className=of.length<2?'':'cmp';
E('#cmp').innerHTML=of.length<2?`<p class="hint">Add two ${pose.toLowerCase()} photos on different days to compare.</p>`:[of[0],of[of.length-1]].map((p,i)=>`<figure><img src="${p.img}" alt="${pose} photo"><figcaption><b>${i?'Latest':'Start'}</b> ${fmt(p.date)} ${wt(p.date)}</figcaption></figure>`).join('');
E('#gallery').innerHTML=ps.slice().reverse().map(p=>`<figure data-id="${p.id}" tabindex="0"><img src="${p.img}" loading="lazy" alt=""><figcaption>${fmt(p.date)} · ${p.pose}</figcaption></figure>`).join('')||'<p class="hint">No photos yet. Your first photo is the day-1 baseline.</p>';
const t=today(),done=ps.filter(p=>p.date===t).map(p=>p.pose);E('#photoStatus').textContent=done.length?`Today: ${done.join(', ')} saved.`:'No photo yet today.';
ALL('#gallery figure').forEach(f=>f.onclick=()=>{const p=ps.find(x=>x.id===f.dataset.id);E('#pImg').src=p.img;E('#pInfo').textContent=fmt(p.date)+' · '+p.pose;E('#pDel').onclick=async()=>{if(confirm('Delete this photo?')){await delP(p.id);E('#photoDialog').close();renderPhysique()}};E('#photoDialog').showModal()})}
ALL('#poseSeg button').forEach(b=>b.onclick=()=>{pose=b.dataset.pose;renderPhysique()});
E('#addPhoto').onclick=async()=>{const f=await pick();if(!f)return;try{await putP({id:'b'+Date.now(),type:'body',pose,date:today(),ts:Date.now(),img:await shrink(f)});showToast('Photo saved.');renderPhysique()}catch{showToast('Could not save photo.')}};
E('#pClose').onclick=()=>E('#photoDialog').close();
/* ---- recipes: easy, batch-friendly ---- */
const R={
nocook:{n:'Grab and go',m:2,s:['Portion it into a box or bowl.','Eat as is. Keep it chilled or in your bag.'],h:'Pack it the night before.'},
eggs:{n:'Boiled eggs (batch)',m:12,s:['Put 8–10 eggs in a pot, cover with cold water.','Bring to a boil, cover, switch off heat, stand 10–12 min.','Cool in cold water 5 min. Keep in the fridge and use within 5 days.'],h:'One boil covers the whole week.'},
egg:{n:'Eggs: omelette or roast',m:8,s:['Whisk eggs + whites with salt, pepper, chopped onion, chilli, curry leaves.','Heat 1 tsp oil in a non-stick pan; cook 2–3 min a side.','For egg roast: fry onion + tomato + turmeric, chilli, garam masala 5 min, add the omelette pieces.'],h:'Use pre-chopped onion from your prep box.'},
oats:{n:'Oats',m:6,s:['Add oats to water or milk (about 4× the volume).','Microwave 2–3 min or simmer 4 min, stirring once.','Top with banana slices.'],h:'Mix oats + milk the night before for no-cook overnight oats.'},
tiffin:{n:'Puttu / idiyappam / dosa / appam',m:10,s:['Puttu: wet the flour with salted water till it holds when squeezed, fluff, steam 8–10 min.','Dosa or appam: ready batter, thin on a hot tawa, ½ tsp oil.','Idiyappam: buy ready-made and steam 5 min.'],h:'Ready flour or batter saves about 20 min.'},
chicken:{n:'Quick masala chicken (3 portions)',m:25,s:['Marinate boneless chicken: turmeric, chilli, pepper, ginger-garlic, salt, lemon.','Fry sliced onion + tomato in 1 tsp oil for 5 min.','Add chicken, cover, cook 12–15 min until no pink and juices run clear.','Box it. Fridge up to 3 days; freeze the rest.'],h:'Cook once on Sunday, reheat until steaming hot.'},
pepper:{n:'Chicken pepper fry',m:25,s:['Marinate chicken: turmeric, salt, ginger-garlic, 1 tsp crushed pepper.','Cook covered in 1 tsp oil with curry leaves and onion for 12–15 min.','Uncover and stir-fry 5 min till dry.'],h:'Same marinade as the masala chicken, so just swap the gravy step.'},
stew:{n:'Chicken stew',m:25,s:['Lightly sauté onion, ginger, green chilli in 1 tsp oil.','Add chicken, carrot, beans, ½ cup water; cover and cook 15 min.','Stir in the measured light coconut milk and warm 2–3 min. Don’t boil hard.'],h:'Pressure cooker: 2–3 whistles.'},
fish:{n:'Kerala fish curry',m:20,s:['Mix chilli, turmeric, coriander powder with water. Fry shallots, ginger, garlic, curry leaves in 1 tsp oil.','Add paste, salt, kudampuli (or tamarind), 1 cup water; simmer.','Add cleaned fish, cook 8–10 min without stirring. It is done when it flakes.'],h:'Ask the seller to clean and cut. Mathi and sardines cook in about 8 min. Best within 2 days.'},
gram:{n:'Cherupayar / kadala',m:20,s:['Soak overnight, or at least 4 h.','Pressure cook with turmeric + salt until soft (kadala takes longer than cherupayar).','Temper with 1 tsp oil, mustard, curry leaves, garlic, dried chilli.'],h:'Cook a double batch. Keeps 3 days in the fridge.'},
rice:{n:'Rice portions',m:25,s:['Rinse rice. Matta rice needs more water than white rice, so follow the pack.','Weigh the cooked portion on a kitchen scale.','Batch cooking: cool within an hour, box, refrigerate, reheat until steaming hot.'],h:'Weigh once and note which bowl equals your portion.'},
chapati:{n:'Chapati',m:15,s:['Knead atta + water + salt, rest 10 min.','Roll thin, cook on a hot tawa about 30 sec a side. No oil needed.'],h:'Ready-made chapati warms in 1 min.'},
thoran:{n:'Thoran / vegetables',m:10,s:['Chop veg fine (or buy pre-chopped).','Temper mustard + curry leaves in 1 tsp oil, add veg, turmeric, salt, 2 tbsp water, cover 5 min.','Stir in the measured grated coconut at the end.'],h:'Salad version: cucumber, onion, lime, salt.'}};
function recipe(m){const t=(m[2]+' '+m[3]).toLowerCase(),a=[];
if(m[1]==='Pre-workout')return[R.nocook];if(m[1]==='Snack')return[/egg/.test(t)?R.eggs:R.nocook];
if(/chicken/.test(t))a.push(/pepper/.test(t)?R.pepper:/stew/.test(t)?R.stew:R.chicken);
if(/fish|mathi|ayala|sardine/.test(t))a.push(R.fish);if(/cherupayar|kadala|green gram/.test(t))a.push(R.gram);
if(/egg|omelette/.test(t))a.push(R.egg);if(/oats/.test(t))a.push(R.oats);
if(/dosa|appam|idiyappam|puttu/.test(t))a.push(R.tiffin);if(/chapati/.test(t))a.push(R.chapati);
if(/rice/.test(t))a.push(R.rice);if(/thoran|vegetable|salad|cabbage|beans/.test(t))a.push(R.thoran);
return a.length?a:[R.nocook]}
const mins=m=>recipe(m).reduce((s,r)=>s+r.m,0);
function openRecipe(m){E('#rTitle').textContent=m[2];E('#rBody').innerHTML=`<p class="hint">${m[3]} · ${m[4]}</p>`+recipe(m).map(r=>`<h3>${r.n} <span class="hint">· ${r.m} min</span></h3><ol>${r.s.map(x=>`<li>${x}</li>`).join('')}</ol><p class="tip">Easier: ${r.h}</p>`).join('');E('#recipeDialog').showModal()}
E('#rClose').onclick=()=>E('#recipeDialog').close();
/* ---- meal log ---- */
const macro=m=>{const r=/(\d+)\s*kcal\s*·\s*(\d+)g/.exec(m[4]||'');return r?[+r[1],+r[2]]:[0,0]},plan=()=>menus[dateMenu(new Date())%7];
function totals(){const t=today(),ms=plan();let k=0,p=0;(db.eaten[t]||[]).forEach(i=>{const x=macro(ms[i]||[]);k+=x[0];p+=x[1]});(db.custom[t]||[]).forEach(c=>{k+=+c.kcal||0;p+=+c.protein||0});return[k,p]}
function renderIntake(){const[k,p]=totals(),pc=(v,g)=>Math.min(100,Math.round(v/g*100));
E('#intake').innerHTML=`<div class="bar"><span>Calories <b>${k}</b> / ${T().kcal}</span><div class="track"><i style="width:${pc(k,T().kcal)}%"></i></div></div><div class="bar"><span>Protein <b>${p} g</b> / ${T().protein} g</span><div class="track"><i style="width:${pc(p,T().protein)}%"></i></div></div><p class="hint">Tick each meal as you eat it. Totals use the plan’s estimates.</p>`;
const s=ALL('#today .stats b');s[0].textContent=T().kcal.toLocaleString('en-IN');s[1].textContent=T().protein+'g';
const lb=db.lastBackup;E('#backupNote').hidden=!!lb&&Date.now()-lb<6048e5;window.onIntake&&window.onIntake()}
async function renderMeals(){const t=today(),ms=plan(),e=db.eaten[t]||[],ph={};(await allP()).filter(p=>p.type==='meal'&&p.date===t).forEach(p=>ph[p.id]=p.img);
const pb=id=>`<button class="link" data-ph="${id}">${ph[id]?'Change photo':'Add photo'}</button>`,im=id=>ph[id]?`<img class="mp" src="${ph[id]}" alt="Meal photo">`:'';
E('#todayMeals').innerHTML=ms.map((m,i)=>`<div class="meal ${e.includes(i)?'eaten':''}"><label class="check"><input type="checkbox" data-e="${i}" ${e.includes(i)?'checked':''}><span><small>${m[0]} · ${m[1]}</small><b>${m[2]}</b></span></label><p>${m[3]} · <strong>${m[4]}</strong></p><div class="acts"><button class="link" data-r="${i}">How to make it · ${mins(m)} min</button>${pb('m-'+t+'-'+i)}</div>${im('m-'+t+'-'+i)}</div>`).join('');
E('#customMeals').innerHTML=(db.custom[t]||[]).map((c,j)=>`<div class="meal"><small>Extra meal</small><b>${c.name}</b><p>${c.kcal||0} kcal · ${c.protein||0} g protein</p><div class="acts">${pb('c-'+t+'-'+c.id)}<button class="link" data-del="${j}">Remove</button></div>${im('c-'+t+'-'+c.id)}</div>`).join('')}
E('#todayMeals').addEventListener('change',e=>{const i=e.target.dataset.e;if(i===undefined)return;const t=today(),s=new Set(db.eaten[t]||[]);e.target.checked?s.add(+i):s.delete(+i);db.eaten[t]=[...s];save();renderIntake();renderMeals()});
const mealClick=async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.r!==undefined)openRecipe(plan()[+b.dataset.r]);
if(b.dataset.ph){const f=await pick();if(!f)return;try{await putP({id:b.dataset.ph,type:'meal',date:today(),ts:Date.now(),img:await shrink(f,700)});renderMeals()}catch{showToast('Could not save photo.')}}
if(b.dataset.del!==undefined){const t=today(),c=db.custom[t].splice(+b.dataset.del,1)[0];await delP('c-'+t+'-'+c.id).catch(()=>0);save();renderIntake();renderMeals()}};
E('#todayMeals').addEventListener('click',mealClick);E('#customMeals').addEventListener('click',mealClick);
E('#addMeal').onclick=()=>{['#mName','#mKcal','#mProt'].forEach(s=>E(s).value='');E('#mealDialog').showModal()};E('#mClose').onclick=()=>E('#mealDialog').close();
E('#mSave').onclick=()=>{const n=E('#mName').value.trim();if(!n)return showToast('Enter what you ate.');const t=today();(db.custom[t]||=[]).push({id:Date.now(),name:n,kcal:+E('#mKcal').value||0,protein:+E('#mProt').value||0});save();E('#mealDialog').close();renderIntake();renderMeals()};
/* ---- nutrition tab: recipe buttons + Sunday plan ---- */
let base=[];const _rf=renderFood;renderFood=function(){_rf();let d=new Date();d.setDate(d.getDate()+menuOffset);base=menus[dateMenu(d)%7];E('#menuMeals').innerHTML=base.map((m,i)=>mealHTML(m).replace('</div>',`<button class="link" data-rm="${i}">How to make it · ${mins(m)} min</button></div>`)).join('')};
E('#menuMeals').addEventListener('click',e=>{const b=e.target.closest('[data-rm]');if(b)openRecipe(base[+b.dataset.rm])});
const PREP=[['Start the rice','5 min · cooker on, then leave it'],['Boil 8–10 eggs','12 min · cool in cold water'],['Marinate and cook chicken','25 min · 3 days of portions'],['Chop vegetables','15 min · thoran veg + salad box'],['Fish curry, or portion and freeze','20 min · cook 1–2 days, freeze the rest'],['Soak cherupayar / kadala','2 min · ready for tomorrow'],['Cool, weigh, box','10 min · label by day; fridge up to 3 days']];
const wk=()=>{const d=new Date();d.setDate(d.getDate()-d.getDay());return ymd(d)};
function renderSun(){const a=db.prepDone[wk()]||[];E('#sunPrep').innerHTML=PREP.map((p,i)=>`<label class="check"><input type="checkbox" data-p="${i}" ${a.includes(i)?'checked':''}><span><b>${p[0]}</b><br><small class="soft">${p[1]}</small></span></label>`).join('')+'<p class="hint">About 90 min once a week. After this, most meals are just reheat and assemble.</p>'}
E('#sunPrep').addEventListener('change',e=>{const i=e.target.dataset.p;if(i===undefined)return;const s=new Set(db.prepDone[wk()]||[]);e.target.checked?s.add(+i):s.delete(+i);db.prepDone[wk()]=[...s];save()});
/* ---- workout: set ticks + rest timer ---- */
const _rg=renderGym;renderGym=function(){_rg();if(workOffset!==0)return;const t=today(),n=workoutFor(new Date())[2].length;ALL('#exerciseList .exercise').forEach((el,i)=>{const c=document.createElement('input');c.type='checkbox';c.setAttribute('aria-label','Done');c.checked=(db.done[t]||[]).includes(i);c.onchange=()=>{const s=new Set(db.done[t]||[]);c.checked?s.add(i):s.delete(i);db.done[t]=[...s];if(s.size===n){const k=new Set(db.checks[t]||[]);k.add(1);db.checks[t]=[...k];renderChecks();E('#streak').textContent=streak();showToast('Workout complete.')}save()};el.classList.add('has');el.prepend(c)})};
let rt,ac;E('#restBtns').onclick=e=>{const s=+e.target.dataset.s;if(!s)return;clearInterval(rt);let n=s;ac||=new(window.AudioContext||window.webkitAudioContext)();const show=()=>E('#restClock').textContent=Math.floor(n/60)+':'+String(n%60).padStart(2,'0');show();rt=setInterval(()=>{n--;show();if(n<=0){clearInterval(rt);E('#restClock').textContent='Go';navigator.vibrate&&navigator.vibrate([200,100,200]);try{const o=ac.createOscillator();o.connect(ac.destination);o.frequency.value=880;o.start();o.stop(ac.currentTime+.4)}catch{}}},1000)};
/* ---- progress: trend chart + PR ---- */
function renderChart(){const d=db.measurements.filter(x=>+x.weight).slice(-30);if(d.length<2){E('#wChart').innerHTML='<p class="hint">Log two or more weights to see your trend.</p>';return}
const v=d.map(x=>+x.weight),mn=Math.min(...v)-.5,mx=Math.max(...v)+.5,W=320,H=100,pt=v.map((y,i)=>[i*W/(v.length-1),H-(y-mn)/(mx-mn)*H]),df=v[v.length-1]-v[0];
E('#wChart').innerHTML=`<svg viewBox="-8 -8 ${W+16} ${H+16}" class="chart" role="img" aria-label="Weight trend"><polyline points="${pt.map(p=>p.join(',')).join(' ')}" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linejoin="round"/>${pt.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="var(--green)"/>`).join('')}</svg><p class="hint">${v[0]} → ${v[v.length-1]} kg (${df>0?'+':''}${df.toFixed(1)} kg over ${d.length} check-ins). Judge by the 2–3 week trend, not single days.</p>`}
const _rh=renderHistory;renderHistory=function(){_rh();renderChart()};
const _sl=E('#saveLift').onclick;E('#saveLift').onclick=()=>{const n=db.lifts.length;_sl();if(db.lifts.length>n){const l=db.lifts[n],e1=x=>x.weight*(1+x.reps/30),prev=db.lifts.slice(0,n).filter(x=>x.name===l.name);if(prev.length&&e1(l)>Math.max(...prev.map(e1)))showToast('New personal best on '+l.name+'!')}};
/* ---- settings, backup ---- */
const _os=E('#settings').onclick;E('#settings').onclick=()=>{E('#tKcal').value=T().kcal;E('#tProt').value=T().protein;E('#waterInterval').value=T().water;_os()};
const _ss=E('#saveSettings').onclick;E('#saveSettings').onclick=()=>{db.targets={kcal:+E('#tKcal').value||2500,protein:+E('#tProt').value||180,water:+E('#waterInterval').value||90};_ss();renderIntake()};
E('#export').onclick=async()=>{const u=URL.createObjectURL(new Blob([JSON.stringify({...db,lastBackup:Date.now(),_photos:(await allP()).filter(p=>p.type!=='track')})],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='peak-mode-backup-'+today()+'.json';a.click();db.lastBackup=Date.now();save();renderIntake();setTimeout(()=>URL.revokeObjectURL(u),2000)};
E('#import').onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text()),ph=j._photos||[];delete j._photos;Object.assign(db,j);defaults();save();for(const p of ph)await putP(p);renderToday();showToast('Backup imported.')}catch{showToast('Could not read backup.')}};
/* ---- wire up ---- */
const _rt=renderToday;renderToday=function(){_rt();renderIntake();renderMeals();renderSun();renderPhysique()};
E('#date').textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
window.PM={putP,delP,allP,totals};renderToday();
})();
