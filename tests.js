/* PEAK MODE self-test. Open tests.html in the browser and press "Run all tests".
   Every group loads the real app in a hidden frame with a throw-away test store (?pmkey=peakTest...), so real data is never read or changed. */
const $=s=>document.querySelector(s),J=v=>JSON.stringify(v),sleep=ms=>new Promise(r=>setTimeout(r,ms));
let results=[],grp='';
function row(ok,name,detail){results.push({ok,name,detail,grp});const d=document.createElement('div');d.className=ok?'ok':'bad';d.textContent=(ok?'✅ ':'❌ ')+name+(ok||!detail?'':' — '+detail);$('#out').appendChild(d)}
function group(n){grp=n;const h=document.createElement('h2');h.textContent=n;$('#out').appendChild(h)}
const expect=(c,m)=>{if(!c)throw new Error(m||'check failed')};
async function check(name,fn){try{await fn();row(true,name)}catch(e){row(false,name,e&&e.message||String(e))}}
function cleanup(id){Object.keys(localStorage).filter(k=>k===id||k.startsWith(id+'_')).forEach(k=>localStorage.removeItem(k));try{indexedDB.deleteDatabase('peakPhotos_'+id)}catch{}}
async function fresh(seed){const id='peakTest'+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36);if(seed!==undefined)localStorage.setItem(id,seed);
 const f=$('#app');await new Promise(res=>{f.onload=()=>res();f.src='index.html?pmkey='+id});await sleep(250);const w=f.contentWindow;
 return{id,w,ev:c=>w.eval(c),done:()=>cleanup(id)}}
const READY="db.onboarded=true;db.name='Test';db.profile={age:30,height:175,weight:80,sex:'m',act:1.55,goal:'muscle'};db.plan={where:'gym',eq:[],types:['strength'],days:6,mins:60,lvl:'i'};db.prefs={diet:'non',meals:4,region:'',allergies:'',budget:'',limits:'',areas:[]};db.swaps={};save()";
const WEEK="JSON.stringify([0,1,2,3,4,5,6].map(i=>{const w=workoutFor(new Date(2026,10,23+i));return{t:w[0],n:w[2].length,d:w[1],ex:w[2].map(e=>[e[0],e[1]])}}))";
const ymdAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};

async function runAll(){
 results=[];$('#out').innerHTML='';$('#sum').textContent='Running…';$('#run').disabled=true;$('#copy').disabled=true;
 const realBefore=localStorage.getItem('peakModeLifetimeV1');

 group('1. Saving and loading data');
 let S=await fresh();
 await check('a new install starts with the current data format and every list present',()=>{expect(S.ev('db.v')===S.ev('SCHEMA'),'db.v='+S.ev('db.v'));expect(S.ev("Array.isArray(db.measurements)&&Array.isArray(db.lifts)&&typeof db.water==='object'&&typeof db.settings.workout==='string'&&db.targets.kcal>0"),'defaults missing')});
 await check('saving works and survives a reload of the same store',async()=>{S.ev("db.name='Asha';save()");const raw=JSON.parse(localStorage.getItem(S.id));expect(raw.name==='Asha','name not stored')});
 S.done();
 S=await fresh(J({name:'Asha',measurements:[{date:'2026-01-02',weight:'80'}],targets:null,settings:'junk'}));
 await check('old data (no version number) is upgraded and nothing is lost',()=>{expect(S.ev('db.v')===2,'v='+S.ev('db.v'));expect(S.ev('db.name')==='Asha','name lost');expect(S.ev('db.measurements.length')===1,'measurement lost');expect(S.ev('db.targets.kcal')===2500,'targets not repaired');expect(S.ev("db.settings.workout")==='05:45','settings not repaired')});
 S.done();
 S=await fresh('{this is not json');
 await check('damaged saved data does not crash the app',()=>expect(S.ev('typeof PMlearn')==='object','app did not start'));
 await check('damaged data: a copy is kept and the app starts clean',()=>{expect(localStorage.getItem(S.id+'_corrupt')==='{this is not json','copy not kept');expect(S.ev('db.v')===2,'not clean')});
 S.done();
 S=await fresh(J({v:99,name:'FromTheFuture'}));
 await check('data from a newer app version is never overwritten',()=>{expect(S.ev('PMSTORE.newer')===true,'not detected');expect(S.ev("db.name='Changed';save()")===false,'save was allowed');expect(JSON.parse(localStorage.getItem(S.id)).name==='FromTheFuture','data was overwritten')});
 S.done();
 S=await fresh();
 await check('a full or blocked store is reported instead of crashing',()=>{const w=S.w,old=w.Storage.prototype.setItem;w.Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError')};let r;try{r=S.ev('save()')}finally{w.Storage.prototype.setItem=old}expect(r===false,'save should return false');expect(S.ev('PMSTORE.failed')===true,'failure not recorded')});
 await check('the error log keeps only the last 20 problems',()=>{S.ev("for(let i=0;i<30;i++)PMLOG.error('test','boom '+i)");expect(S.ev('PMLOG.list().length')===20,'len '+S.ev('PMLOG.list().length'));expect(S.ev("PMLOG.list()[19].m")==='boom 29','wrong order')});
 await check('diagnostics report works and contains no personal data',async()=>{S.ev("db.name='SecretName';db.profile={weight:81.234};save()");const r=await S.w.PMdiag.report();expect(r.includes('App version: '+S.ev('APP_VER')),'no version');expect(!r.includes('SecretName')&&!r.includes('81.234'),'personal data leaked')});
 S.done();

 group('2. Backup and restore safety');
 S=await fresh();S.ev(READY);
 const chk=(txt)=>S.w.PMbackup.check(txt);
 await check('rejects text that is not JSON',()=>expect(chk('hello').ok===false));
 await check('rejects null and arrays',()=>expect(chk('null').ok===false&&chk('[1,2]').ok===false));
 await check('rejects an empty object and another app\'s file',()=>expect(chk('{}').ok===false&&chk(J({_format:'other',water:{}})).ok===false));
 await check('accepts a valid backup and counts what is inside',()=>{const r=chk(J({_format:'peak-mode-backup',measurements:[{date:'2026-11-20',weight:'80.4'}],lifts:[{date:'2026-11-20',name:'Bench press',weight:'60',reps:'5',sets:'3'}]}));expect(r.ok&&r.summary.measurements===1&&r.summary.lifts===1,J(r.summary))});
 await check('old backups (no format marker) still restore',()=>expect(chk(J({water:{'2026-11-20':500},onboarded:true})).ok));
 const hostile={_format:'peak-mode-backup',onboarded:true,custom:{'2026-11-24':[{id:5,name:'<img src=x onerror=1>',kcal:'50',protein:3}]},measurements:[{date:'2026-11-24',weight:'<script>'},{date:'2026-11-24',weight:'81.5'}],lifts:[{date:'2026-11-24',name:'Squat',weight:'100',reps:'5',sets:'3'},{date:'bad',name:'x',weight:'1',reps:'1',sets:'1'}],_photos:[{id:'b1',type:'body',pose:'Front',date:'2026-11-24',ts:1,img:'x" onerror="1'},{id:'b2',type:'body',pose:'Front',date:'2026-11-24',ts:2,img:'data:image/jpeg;base64,/9j/AA=='}],settings:'junk',targets:{kcal:'abc'},plan:{types:['evil']},extra:'drop me',learn:{a:{'2026-11-01':{q:99999,c:1}},streak:'abc'}};
 await check('hostile backup: bad rows, bad dates and bad photos are dropped',()=>{const r=chk(J(hostile));expect(r.ok&&r.summary.measurements===1&&r.summary.lifts===1&&r.summary.photos===1&&r.skipped===1,J(r.summary)+' skipped '+r.skipped)});
 await check('hostile backup: unknown fields dropped, junk repaired to safe defaults',()=>{const d=chk(J(hostile)).data;expect(!('extra' in d),'extra kept');expect(d.targets.kcal===2500,'targets');expect(typeof d.settings.workout==='string','settings');expect(!d.plan,'plan');expect(Object.keys(d.learn.a).length===0&&d.learn.streak===0,'learn')});
 await check('hostile backup: text is stored as text and can never run as code',async()=>{S.ev("db.custom[today()]=[{id:1,name:'<img src=x onerror=\"window.__xss=1\">',kcal:100,protein:5}];save();renderToday()");await sleep(500);expect(S.w.__xss!==1,'script ran');expect(S.ev("document.querySelector('#customMeals').textContent").includes('<img src=x'),'not shown as text')});
 S.done();

 group('3. Workout plan follows your answers');
 S=await fresh();S.ev(READY);
 const orig=JSON.parse(S.ev("JSON.stringify(workout.map(w=>[w[0],w[2].map(e=>e[0])]))")),origNames=new Set(orig.flatMap(w=>w[1]));
 const week=()=>JSON.parse(S.ev(WEEK)),setPlan=(p)=>S.ev("Object.assign(db.plan,"+J(p)+");save()");
 await check('6 days = your original week, unchanged',()=>{const w=week();expect(J(w.map(x=>x.t))===J(orig.map(o=>o[0])),'titles');expect(w[0].n===7&&w[0].ex[0][1]==='4 × 4–6','sets')});
 await check('5 days drops the Athletic session and keeps Conditioning on Saturday',()=>{setPlan({days:5});expect(J(week().map(x=>x.t))===J(['Upper Strength','Lower Strength','Recovery Day','Upper Hypertrophy','Lower Hypertrophy','Conditioning + Core','Recovery Day']),J(week().map(x=>x.t)))});
 await check('4 days trains Mon, Tue, Thu, Fri',()=>{setPlan({days:4});expect(J(week().map(x=>x.t))===J(['Upper Strength','Lower Strength','Recovery Day','Upper Hypertrophy','Lower Hypertrophy','Recovery Day','Recovery Day']))});
 await check('3 days gives three full-body sessions using only exercises already in your program',()=>{setPlan({days:3});const w=week();expect(J(w.map(x=>x.t))===J(['Full Body A','Recovery Day','Full Body B','Recovery Day','Full Body C','Recovery Day','Recovery Day']),J(w.map(x=>x.t)));const bad=w.flatMap(x=>x.ex.map(e=>e[0])).filter(n=>!origNames.has(n));expect(!bad.length,'new names: '+bad)});
 for(const [m,n] of [[20,3],[30,4],[45,6],[60,8]])await check(`${m} minutes trims lifting days to ${n} exercises (recovery day untouched)`,()=>{setPlan({days:6,mins:m});const w=week();expect(w[3].n===n&&w[6].n===3,'got '+w[3].n+' / '+w[6].n)});
 await check('beginner gets one set fewer',()=>{setPlan({mins:60,lvl:'b'});const w=week();expect(w[0].ex[0][1]==='3 × 4–6'&&w[1].ex[1][1]==='2 × 3–5',w[0].ex[0][1]+' / '+w[1].ex[1][1])});
 await check('advanced gets +1 set on the first two lifts only',()=>{setPlan({lvl:'a'});const w=week();expect(w[0].ex[0][1]==='5 × 4–6'&&w[0].ex[1][1]==='5 × 6–8'&&w[0].ex[2][1]==='3 × 6',w[0].ex.slice(0,3).map(e=>e[1]).join(', '))});
 await check('without a chosen plan the original program is used',()=>{S.ev('db.plan=undefined;save()');expect(week()[0].t==='Upper Strength')});
 await check('program day counts from your own start date',()=>{S.ev(`db.startDate='${ymdAgo(10)}'`);expect(S.ev('programDay(new Date())')===11,'day '+S.ev('programDay(new Date())'));S.ev(`db.startDate='${ymdAgo(0)}'`);expect(S.ev('programDay(new Date())')===1)});
 S.done();

 group('4. Diet, allergies and injuries');
 S=await fresh();S.ev(READY);
 const hits=(a,t)=>{S.ev(`db.prefs.allergies=${J(a)}`);return JSON.parse(S.ev(`JSON.stringify(allergyHits(${J(t)}))`))};
 await check('egg allergy flags eggs and omelette but not eggplant',()=>expect(J(hits('egg','Eggs, oats & milk'))==='["egg"]'&&hits('egg','Egg omelette').length===1&&hits('egg','Eggplant curry').length===0));
 await check('lactose flags milk, curd and paneer but not coconut milk',()=>expect(hits('lactose','Curd & roasted chana').length===1&&hits('lactose','Paneer bhurji').length===1&&hits('lactose','Chicken stew with coconut milk').length===0));
 await check('gluten flags chapati but not bajra roti',()=>expect(hits('gluten','2 chapatis').length===1&&hits('gluten','Bajra roti').length===0));
 await check('several allergies at once',()=>expect(hits('peanuts, lactose','Milk & peanuts').length===2));
 await check('"none" and "no allergies" flag nothing',()=>expect(hits('none','Eggs, milk, peanuts').length===0&&hits('no allergies','Eggs, milk').length===0));
 await check('an allergy word the app does not know is still matched by text',()=>expect(hits('mushroom','Mushroom masala')[0]==='mushroom'));
 S.ev("db.prefs.allergies=''");
 await check('non-vegetarian with no allergies: meals identical to your original menu',()=>expect(S.ev("(()=>{for(let i=0;i<7;i++){if(JSON.stringify(mealsFor(new Date(2026,0,1+i)))!==JSON.stringify(menus[i]))return false}return true})()")));
 S.ev("db.prefs.diet='veg';save()");
 await check('vegetarian: no meat, fish or egg in any of the 7 days',()=>{const t=S.ev("JSON.stringify([0,1,2,3,4,5,6].flatMap(i=>mealsFor(new Date(2026,0,1+i)).map(m=>(m[2]+' '+m[3]).toLowerCase())))");expect(!/chicken|fish|mathi|ayala|sardine|egg|omelette|mutton|beef|prawn/.test(t),'found non-veg item')});
 await check('vegetarian: meals that were replaced say so, and nothing is left unmatched',()=>expect(S.ev("[0,1,2,3,4,5,6].flatMap(i=>mealsFor(new Date(2026,0,1+i))).filter(m=>m[6]==='nomatch').length")===0));
 S.ev("db.prefs.diet='non';db.prefs.areas=['knee'];save()");
 await check('knee flag on squats and leg press, not on bench press or plank',()=>expect(J(JSON.parse(S.ev("JSON.stringify([limitFlags('Back squat'),limitFlags('Leg press'),limitFlags('Bench press'),limitFlags('Plank')])")))==='[["knee"],["knee"],[],[]]'));
 S.ev("db.prefs.areas=[]");await check('no areas chosen means no warnings',()=>expect(S.ev("limitFlags('Back squat').length")===0));
 S.done();

 group('5. Learn: knowledge and quiz');
 S=await fresh();S.ev(READY);
 await check('content is complete: 80+ questions, 60+ tips, 26 muscles',()=>expect(S.ev('PMDATA.QUIZ.length')>=80&&S.ev('PMDATA.TIPS.length')>=60&&S.ev('Object.keys(PMDATA.MUSCLES).length')>=26));
 await check('every question has 4 different answers and an explanation; no duplicates',()=>expect(S.ev("PMDATA.QUIZ.every(q=>q.length===7&&new Set(q.slice(1,5)).size===4&&q[5])&&new Set(PMDATA.QUIZ.map(q=>q[0])).size===PMDATA.QUIZ.length")));
 await check('every exercise rule points at muscles that exist',()=>expect(S.ev("PMDATA.RULES.flatMap(r=>[...r[2],...r[3]]).every(id=>PMDATA.MUSCLES[id])")));
 await check('the daily question does not repeat during a full cycle of days',()=>expect(S.ev("(()=>{const s=new Set();for(let i=0;i<PMDATA.QUIZ.length;i++){const d=new Date(2026,10,23+i);s.add(PMlearn.quizFor(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')).i)}return s.size===PMDATA.QUIZ.length})()")));
 await check('every exercise the app can schedule has muscle knowledge (meal prep excepted)',()=>{const miss=JSON.parse(S.ev(`(()=>{const out=new Set();for(const where of ['gym','home','out'])for(const eq of [[],['db'],['band'],['bar'],['db','band','bar']])for(const types of [['strength'],['hiit'],['run'],['yoga'],['strength','hiit','run','yoga']])for(const days of [3,4,5,6])for(const lvl of ['b','i','a']){db.plan={where,eq,types,days,mins:45,lvl};for(let i=0;i<7;i++)workoutFor(new Date(2026,10,23+i))[2].forEach(e=>out.add(e[0]))}return JSON.stringify([...out].filter(n=>!PMlearn.info(n)))})()`));expect(miss.every(n=>/meal prep|rest|recovery/i.test(n)),'missing: '+miss)});
 S.ev("db.plan={where:'gym',eq:[],types:['strength'],days:6,mins:60,lvl:'i'}");
 await check('answering the daily question records it once and starts a streak',()=>{S.ev("db.learn={a:{},streak:0,best:0,last:'',seed:5}");S.ev("PMlearn.answer(PMlearn.quizFor(today()).pos)");expect(S.ev('db.learn.streak')===1&&S.ev('Object.keys(db.learn.a).length')===1,'first');S.ev('PMlearn.answer(0)');expect(S.ev('Object.keys(db.learn.a).length')===1,'second answer was allowed')});
 await check('a missed few days halves the streak instead of resetting it',()=>{S.ev(`db.learn={a:{},streak:4,best:4,last:'${ymdAgo(3)}',seed:5}`);S.ev("PMlearn.answer(PMlearn.quizFor(today()).pos)");expect(S.ev('db.learn.streak')===2&&S.ev('db.learn.best')===4,'streak '+S.ev('db.learn.streak'))});
 S.done();

 group('6. Safety nets and screens');
 S=await fresh();S.ev(READY);
 await check('backup reminder appears for old data and goes away after a backup',()=>{S.ev(`db.firstUse='${ymdAgo(5)}';delete db.lastBackup;db.backupSnooze=''`);expect(S.ev('PMsafe.reminder()').length>0,'no reminder');S.ev('db.lastBackup=Date.now()');expect(S.ev('PMsafe.reminder()')==='','still reminding')});
 await check('the screens are drawn by a registered pipeline (no layered wrappers)',()=>expect(S.ev('PMR.today.length')>=6&&S.ev('PMR.gym.length')>=2&&S.ev('PMR.food.length')>=1&&S.ev('PMR.history.length')>=1,'steps '+S.ev('JSON.stringify([PMR.today.length,PMR.gym.length,PMR.food.length,PMR.history.length])')));
 await check('every screen can be drawn without errors',()=>{S.ev('renderToday();renderGym();renderFood();renderHistory()')});
 S.done();

 group('7. Test safety');
 await check('your real data was not changed by these tests',()=>expect(localStorage.getItem('peakModeLifetimeV1')===realBefore,'real data changed!'));
 Object.keys(localStorage).filter(k=>k.startsWith('peakTest')).forEach(k=>localStorage.removeItem(k));
 const f=results.filter(r=>!r.ok);$('#sum').textContent=f.length?`❌ ${f.length} of ${results.length} checks failed`:`✅ All ${results.length} checks passed`;$('#sum').style.color=f.length?'#ff8a65':'#bde87a';
 $('#run').disabled=false;$('#copy').disabled=false;window.__results=results;
}
$('#run').onclick=runAll;
$('#copy').onclick=async()=>{const t=$('#sum').textContent+'\n'+results.map(r=>(r.ok?'PASS ':'FAIL ')+r.name+(r.detail?' — '+r.detail:'')).join('\n');try{await navigator.clipboard.writeText(t);$('#copy').textContent='Copied'}catch{prompt('Copy the results:',t)}};
if(location.hash==='#auto')runAll();
