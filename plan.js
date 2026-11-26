/* PEAK MODE: training setup (gym / home / outdoors) and plan generator */
(()=>{
const E=s=>document.querySelector(s),orig=workoutFor;
const POOL=[
['Push-ups','push','','8–15','Chest to a fist above the floor, body in one line'],['Feet-elevated push-ups','push','','6–12','Feet on a sturdy chair'],['Dumbbell floor press','push','db','8–12','Lie on the floor, elbows at 45°'],['Band chest press','push','band','12–15','Anchor the band behind you'],['Diamond push-ups','push','','6–12','Hands close, elbows tucked'],
['Pike push-ups','shoulder','','6–12','Hips high, head moves between hands'],['Dumbbell shoulder press','shoulder','db','8–12','Ribs down, no back arch'],['Band overhead press','shoulder','band','12–15',''],['Dumbbell lateral raise','shoulder','db','12–15','Light weight, slow lowering'],
['Pull-ups / chin-ups','pull','bar','4–10','Use a band or slow lowering if needed'],['Dumbbell row','pull','db','10–12 each','Flat back, pull to the hip'],['Band row','pull','band','12–15','Squeeze shoulder blades'],['Backpack row','pull','','12–15','Loaded backpack, hinge forward'],
['Band pull-aparts','pull2','band','15–20',''],['Reverse snow angels','pull2','','12–15','Lie face down, lift arms and sweep'],['Dumbbell rear-delt fly','pull2','db','12–15','Hinge forward, light weight'],
['Dumbbell curl','biceps','db','10–12',''],['Band curl','biceps','band','12–15',''],['Backpack curl','biceps','','12–15','Hold the backpack by the handle'],
['Chair dips','triceps','','8–15','Use a very stable chair'],['Overhead dumbbell extension','triceps','db','10–12',''],['Band pushdown','triceps','band','12–15','Anchor the band overhead'],
['Bodyweight squat','squat','','15–20','Heels down, knees track toes'],['Goblet squat','squat','db','10–12','Hold the dumbbell at the chest'],['Band squat','squat','band','12–15','Stand on the band'],['Tempo squat','squat','','10–12','3 s down, 1 s pause'],
['Dumbbell Romanian deadlift','hinge','db','10–12','Soft knees, hips back, flat back'],['Glute bridge','hinge','','15–20','Squeeze at the top'],['Single-leg glute bridge','hinge','','10–12 each',''],['Band pull-through','hinge','band','12–15',''],
['Reverse lunge','lunge','','10 each','Step back, torso tall'],['Bulgarian split squat','lunge','','8–10 each','Back foot on a chair'],['Dumbbell reverse lunge','lunge','db','8–10 each',''],['Step-ups','lunge','','10 each','Sturdy chair or bench'],
['Single-leg calf raise','calf','','15–20','Full range, pause at the top'],
['Plank','core','','30–45 s','Ribs down, squeeze glutes'],['Dead bug','core','','10 each','Lower back stays flat'],['Leg raises','core','','10–15','Slow lowering'],['Side plank','core','','30 s each',''],['Bicycle crunch','core','','20 total','']];
const HIIT=['Jumping jacks','Mountain climbers','Squat jumps (or fast squats)','High knees','Step-back burpees','Skater hops'],
MOB=[['Cat–cow','10 slow reps'],['World’s greatest stretch','5 each side'],['Hip flexor stretch','45 s each'],['Downward dog','45 s'],['Thoracic rotation','8 each side'],['Child’s pose','60 s'],['Hamstring stretch','45 s each'],['Pigeon pose','45 s each']],
REST=['Rest day','Walk 20–30 min, stretch lightly and sleep well.',[['Easy walk','20–30 min','Counts toward your step goal'],['Mobility flow','5–10 min','Hips and shoulders']]],
SL={full:['squat','push','hinge','pull','core','lunge'],upper:['push','pull','shoulder','pull2','triceps','biceps'],lower:['squat','hinge','lunge','calf','core','hinge'],push:['push','shoulder','push','triceps','core','shoulder'],pull:['pull','pull2','biceps','pull','core','pull2'],core:['core','core','core','core','core','core']},
TT={full:'Full body',upper:'Upper body',lower:'Lower body',push:'Push (chest, shoulders, triceps)',pull:'Pull (back, biceps)',core:'Core and conditioning'},
PAT={3:['full','','full','','full','',''],4:['upper','lower','','upper','lower','',''],5:['push','lower','pull','','full','x',''],6:['push','lower','pull','upper','lower','x','']},
PC={3:[0,2,4],4:[0,2,4,5],5:[0,1,3,4,5],6:[0,1,2,3,4,5]};
let cache={};
function gen(p){const key=JSON.stringify(p);if(cache[key])return cache[key];
const eq=new Set(p.eq),n={20:3,30:4,45:5,60:6}[p.mins]||4,sets={b:2,i:3,a:4}[p.lvl]||3,rounds={b:3,i:4,a:5}[p.lvl]||4,X=p.types.filter(t=>t!=='strength'),ok=x=>!x[2]||eq.has(x[2]);
const lift=(s,k)=>{const used=new Set(),ex=[];for(const slot of SL[s]){if(ex.length>=n)break;const l=POOL.filter(x=>x[1]===slot&&ok(x)&&!used.has(x[0]));if(!l.length)continue;const x=l[(k+ex.length)%l.length];used.add(x[0]);ex.push([x[0],`${sets} × ${x[3]}`,x[4]])}return[TT[s],`Rest 60–90 s between sets. Leave 2 reps in reserve. ${p.where==='home'?'Home session.':'Outdoor session.'}`,ex]};
const cardio=(t,k)=>{if(t==='hiit')return['HIIT circuit',`Work 40 s, rest 20 s through the list, rest 90 s, repeat for ${rounds} rounds.`,HIIT.slice(0,Math.max(4,n)).map(x=>[x,'40 s on / 20 s off','Controlled pace, no sloppy reps'])];
if(t==='run'){const m=Math.max(15,p.mins-5)+' min';return['Run / cardio',p.lvl==='b'?'Run–walk intervals. Keep it conversational.':p.lvl==='i'?'Steady run you can talk through.':'Interval session. Strong but controlled.',[['Warm-up walk','5 min',''],p.lvl==='b'?['Jog 1 min + walk 2 min','6–8 rounds','']:p.lvl==='i'?['Easy run',m,'Talk in sentences']:['Hard 3 min / easy 2 min','5 rounds','Rate of effort 7/10'],['Cool-down walk','5 min','']]]}
return['Mobility & recovery','Slow and easy. No pain, just stretch.',MOB.slice(0,n+2).map(x=>[x[0],x[1],''])]};
const w=[];let ki=0;
if(p.types.includes('strength')){const pat=PAT[p.days].slice();if(p.days<5&&X.length)pat[5]='x';pat.forEach((s,i)=>{if(!s)return w[i]=REST;if(s==='x')return w[i]=X.length?cardio(X[ki++%X.length]):lift('core',i);w[i]=lift(s,i)})}
else{const pos=PC[p.days];for(let i=0;i<7;i++)w[i]=pos.includes(i)?cardio(X[ki++%X.length]):REST}
return cache[key]=w}
/* v13.3: the gym strength program now follows your days, time and experience */
const FULL={
A:['Full Body A','Squat, press and pull. Controlled effort; leave 2–3 reps in reserve.',[['Back squat','3 × 5–8','Repeatable depth and brace.'],['Bench press','3 × 6–8','Stable setup.'],['Barbell row','3 × 8–10','Brace well; no jerking.'],['Leg curl','2 × 10–12','Full range.'],['Lateral raise','2 × 12–15','Strict reps.'],['Plank','3 × 30–60 sec','Brace and breathe.']]],
B:['Full Body B','Hinge, press and pull. Controlled effort; leave 2–3 reps in reserve.',[['Romanian deadlift','3 × 8–10','Hinge; controlled stretch.'],['Overhead press','3 × 6–8','Stop before form breaks.'],['Lat pulldown','3 × 8–12','Drive elbows down.'],['Leg press','3 × 8–12','Controlled depth.'],['Biceps curl','2 × 10–15','No swinging.'],['Cable crunch','3 × 12–15','Control the curl.']]],
C:['Full Body C','Legs, upper-body volume and arms. Controlled effort; leave 2–3 reps in reserve.',[['Hack / front squat','3 × 8–10','Choose comfortable variation.'],['Incline DB press','3 × 8–12','Leave 1–3 reps in reserve.'],['Seated cable row','3 × 10–12','Pause briefly.'],['Seated leg curl','2 × 10–15','Controlled.'],['Rear-delt fly','2 × 12–20','Avoid shrugging.'],['Overhead triceps','2 × 10–15','Pain-free range.']]]};
const gcache={};
function gymPlan(p){const key=p.days+'|'+p.mins+'|'+p.lvl;if(gcache[key])return gcache[key];
const idx={6:[0,1,2,3,4,5,6],5:[0,1,6,3,4,2,6],4:[0,1,6,3,4,6,6],3:['A',6,'B',6,'C',6,6]}[p.days]||[0,1,2,3,4,5,6],LIFT=[0,1,3,4,'A','B','C'],keep=Math.max(3,Math.floor(p.mins/7.5)),delta=p.lvl==='b'?-1:0,
adj=(s,dl,cap)=>s.replace(/^(\d+)(?:–(\d+))?(?= ×)/,(m,a,b)=>{const x=Math.min(cap,Math.max(2,+a+dl)),y=b?Math.min(cap,Math.max(x,+b+dl)):x;return y>x?x+'–'+y:String(x)}),
note={b:' Beginner: one set fewer per exercise. Stop each set with about 3 reps left.',a:' Advanced: one extra set on the first two lifts. Keep 1–2 reps in reserve.'}[p.lvl]||'';
return gcache[key]=idx.map(k=>{if(k===6)return workout[6];const src=typeof k==='string'?FULL[k]:workout[k],lift=LIFT.includes(k);let ex=src[2].map(e=>e.slice());if(lift){ex=ex.slice(0,keep).map((e,i)=>[e[0],adj(e[1],p.lvl==='a'?(i<2?1:0):delta,6),e[2]])}return[src[0],src[1]+(lift?note:''),ex]})}
workoutFor=function(d){const p=db.plan;if(!p)return orig(d);const i=(d.getDay()+6)%7;return p.where==='gym'&&p.types.includes('strength')?gymPlan(p)[i]:gen(p)[i]};

/* setup dialog */
const opt=(id,l,m,v)=>`<label>${l}<select id="${id}">${Object.entries(m).map(([k,x])=>`<option value="${k}" ${String(v)===k?'selected':''}>${x}</option>`).join('')}</select></label>`,ck=(c,l,on)=>`<label class="check"><input type="checkbox" data-${c} ${on?'checked':''}>${l}</label>`;
document.body.insertAdjacentHTML('beforeend','<dialog id="planDialog"><div class="row"><h2>Your training setup</h2><button id="plX" aria-label="Close">✕</button></div><div id="plBody"></div></dialog>');
const card=document.createElement('article');card.className='card';card.id='planCard';E('#gym h2').after(card);
function renderCard(){const p=db.plan;card.innerHTML=p?`<small>YOUR PLAN</small><h3>${{gym:'Gym',home:'Home',out:'Outdoors'}[p.where]} · ${p.days+' days/week · '+p.mins+' min'}</h3><p class="hint">${p.types.map(t=>({strength:'Strength',hiit:'HIIT',run:'Running / cardio',yoga:'Mobility / yoga'}[t])).join(' · ')}</p><button class="secondary" id="plOpen">Change setup</button>`:`<small>YOUR PLAN</small><h3>Where do you train?</h3><button class="primary" id="plOpen">Set up my training</button>`}
function open(){const p=db.plan||{where:'gym',eq:[],types:['strength'],days:4,mins:45,lvl:'b'};E('#plBody').innerHTML=`<p class="hint">Answer a few questions and PEAK MODE builds your week. You can change this any time.</p>${opt('plWhere','Where do you train?',{gym:'Gym',home:'Home',out:'Outdoors / park'},p.where)}<div id="plEq"><b>Equipment you have</b>${ck('eq="db"','Dumbbells',p.eq.includes('db'))}${ck('eq="band"','Resistance bands',p.eq.includes('band'))}${ck('eq="bar"','Pull-up bar',p.eq.includes('bar'))}<p class="hint">Nothing ticked means bodyweight only.</p></div><b>What do you want to do?</b>${ck('ty="strength"','Strength and muscle',p.types.includes('strength'))}${ck('ty="hiit"','Fat-burn HIIT',p.types.includes('hiit'))}${ck('ty="run"','Running / cardio',p.types.includes('run'))}${ck('ty="yoga"','Mobility / yoga',p.types.includes('yoga'))}${opt('plDays','Days per week',{3:'3',4:'4',5:'5',6:'6'},p.days)}${opt('plMins','Time per session',{20:'20 min',30:'30 min',45:'45 min',60:'60 min'},p.mins)}${opt('plLvl','Experience',{b:'Beginner',i:'Intermediate',a:'Advanced'},p.lvl)}<p class="hint" id="plNote"></p><button class="primary" id="planGo">Build my plan</button>`;sync();E('#planDialog').showModal()}
function sync(){const g=E('#plWhere').value==='gym',s=E('[data-ty="strength"]').checked;E('#plEq').hidden=g;E('#plNote').textContent=g&&s?'Gym strength uses the built-in gym program, adjusted to your days, time and experience.'+(E('#plDays').value==='3'?' With 3 days you get three full-body sessions.':'')+' Conditioning days run about 45 minutes whatever time you choose.':''}
E('#plBody').addEventListener('change',sync);E('#plX').onclick=()=>E('#planDialog').close();
E('#plBody').addEventListener('click',e=>{if(e.target.id!=='planGo')return;const types=[...document.querySelectorAll('[data-ty]:checked')].map(x=>x.dataset.ty);if(!types.length)return showToast('Pick at least one type of workout.');
db.plan={where:E('#plWhere').value,eq:[...document.querySelectorAll('[data-eq]:checked')].map(x=>x.dataset.eq),types,days:+E('#plDays').value,mins:+E('#plMins').value,lvl:E('#plLvl').value};save();E('#planDialog').close();renderCard();renderToday();showToast('Plan ready. Check the Workout tab.')});
card.addEventListener('click',e=>{if(e.target.id==='plOpen')open()});
renderCard();window.PMplanCard=renderCard;
})();
