/* PEAK MODE v13.1: safe backup and restore. Every imported value is checked before anything on the device is changed. */
(()=>{
const E=s=>document.querySelector(s);
const BACKUP_FORMAT='peak-mode-backup',APP_VERSION='13.2',MAX_BYTES=120*1024*1024;
const isObj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const DATE=/^\d{4}-\d{2}-\d{2}$/,IMG=/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/,ID=/^[A-Za-z0-9_-]{1,80}$/,TIME=/^\d{2}:\d{2}$/;
const num=(x,min,max)=>{if(x===''||x===null||typeof x==='boolean'||Array.isArray(x))return null;const n=Number(x);return Number.isFinite(n)&&n>=min&&n<=max?n:null};
const str=(x,n)=>typeof x==='string'?x.slice(0,n):'';
const oneOf=(x,list,d)=>list.includes(x)?x:d;
const ints=(a,max)=>Array.isArray(a)?[...new Set(a.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<=max))]:[];
const dateMap=(o,fn)=>{const r={};if(!isObj(o))return r;for(const k of Object.keys(o)){if(!DATE.test(k))continue;const v=fn(o[k]);if(v!==undefined)r[k]=v}return r};
const numStr=(x,min,max)=>{const n=num(x,min,max);return n===null?'':String(n)};
const rep={dropped:0};

function cleanDb(j){
 const c={};
 c.water=dateMap(j.water,v=>num(v,0,20000)??undefined);
 c.checks=dateMap(j.checks,v=>ints(v,9));
 c.eaten=dateMap(j.eaten,v=>ints(v,20));
 c.done=dateMap(j.done,v=>ints(v,30));
 c.prepDone=dateMap(j.prepDone,v=>ints(v,20));
 c.custom=dateMap(j.custom,v=>{if(!Array.isArray(v))return undefined;const out=[];v.slice(0,100).forEach((x,i)=>{if(!isObj(x))return;const name=str(x.name,120).trim();if(!name)return;const o={id:num(x.id,0,9e15)??Date.now()+i,name,kcal:num(x.kcal,0,20000)??0,protein:num(x.protein,0,2000)??0};const cb=num(x.carbs,0,3000),f=num(x.fat,0,3000);if(cb!==null)o.carbs=cb;if(f!==null)o.fat=f;out.push(o)});return out});
 c.checkins=dateMap(j.checkins,v=>{if(!isObj(v))return undefined;const sl=num(v.sleep,0,16);if(sl===null)return undefined;const r=n=>num(v[n],1,5)??3;return{sleep:sl,q:r('q'),sore:r('sore'),fat:r('fat'),stress:r('stress'),mot:r('mot'),pain:v.pain===true}});
 c.measurements=(Array.isArray(j.measurements)?j.measurements:[]).slice(0,5000).map(x=>{if(!isObj(x)||!DATE.test(String(x.date)))return null;const o={date:x.date,weight:numStr(x.weight,20,400),waist:numStr(x.waist,30,300),chest:numStr(x.chest,30,300),arm:numStr(x.arm,10,100)};return o.weight||o.waist||o.chest||o.arm?o:null}).filter(Boolean);
 c.lifts=(Array.isArray(j.lifts)?j.lifts:[]).slice(0,20000).map(x=>{if(!isObj(x)||!DATE.test(String(x.date)))return null;const name=str(x.name,80).trim(),w=num(x.weight,0,1000),r=num(x.reps,0,1000),s=num(x.sets,0,100);return name&&w!==null&&r!==null&&s!==null?{date:x.date,name,weight:String(w),reps:String(r),sets:String(s)}:null}).filter(Boolean);
 c.foods=(Array.isArray(j.foods)?j.foods:[]).slice(0,500).map(x=>{if(!isObj(x)||!/^u\d+$/.test(String(x.id)))return null;const name=str(x.name,80).trim(),k=num(x.k,0,2000),p=num(x.p,0,200),cb=num(x.c,0,200),f=num(x.f,0,200);if(!name||k===null||p===null||cb===null||f===null)return null;const m=(Array.isArray(x.m)?x.m:[]).slice(0,12).map(q=>Array.isArray(q)&&typeof q[0]==='string'&&num(q[1],1,5000)!==null?[q[0].slice(0,40),+q[1]]:null).filter(Boolean);return{id:x.id,name,reg:'A',k,p,c:cb,f,m:m.length?m:[['serving (100 g)',100]]}}).filter(Boolean);
 const st=isObj(j.settings)?j.settings:{};c.settings={};['workout','breakfast','lunch','snack','dinner'].forEach((k,i)=>c.settings[k]=TIME.test(String(st[k]))?st[k]:['05:45','08:00','13:00','16:30','20:00'][i]);
 const t=isObj(j.targets)?j.targets:{};c.targets={kcal:num(t.kcal,800,10000)??2500,protein:num(t.protein,20,500)??180,water:num(t.water,30,240)??90};
 if(isObj(j.profile)){const p=j.profile,o={};const a=num(p.age,12,90),h=num(p.height,120,230),w=num(p.weight,30,250);if(a!==null)o.age=a;if(h!==null)o.height=h;if(w!==null)o.weight=w;o.sex=oneOf(p.sex,['m','f'],'m');o.act=oneOf(+p.act,[1.2,1.375,1.55,1.725],1.55);o.goal=oneOf(p.goal,['fat','muscle','recomp','strength','maintain','fit'],'fit');c.profile=o}
 if(typeof j.name==='string')c.name=j.name.slice(0,24);
 if(Array.isArray(j.goals))c.goals=j.goals.filter(g=>['muscle','fat','lean','gain','fit','maintain','strength','run','yoga'].includes(g)).slice(0,9);
 if(isObj(j.plan)){const p=j.plan,types=(Array.isArray(p.types)?p.types:[]).filter(x=>['strength','hiit','run','yoga'].includes(x));if(types.length)c.plan={where:oneOf(p.where,['gym','home','out'],'gym'),eq:(Array.isArray(p.eq)?p.eq:[]).filter(x=>['db','band','bar'].includes(x)),types,days:oneOf(+p.days,[3,4,5,6],4),mins:oneOf(+p.mins,[20,30,45,60],45),lvl:oneOf(p.lvl,['b','i','a'],'b')}}
 if(isObj(j.prefs)){const p=j.prefs;c.prefs={diet:oneOf(p.diet,['veg','egg','non'],'non'),allergies:str(p.allergies,200),meals:oneOf(+p.meals,[3,4,5],4),budget:/^\d{0,7}$/.test(String(p.budget??''))?String(p.budget??''):'',region:oneOf(p.region,['','S','N','W','E','X'],''),time:oneOf(p.time,['morning','afternoon','evening'],'morning'),limits:str(p.limits,500)}}
 c.onboarded=j.onboarded===true;if(j.planAsked)c.planAsked=1;
 c.theme=oneOf(j.theme,['volt','sunset','ember','ocean','violet','light'],'volt');
 if(typeof j.playlist==='string'&&/^https?:\/\//i.test(j.playlist)&&j.playlist.length<=500)c.playlist=j.playlist;
 c.swaps=dateMap(j.swaps,v=>{if(!isObj(v))return undefined;const o={};Object.keys(v).forEach(i=>{if(/^\d{1,2}$/.test(i)&&Array.isArray(v[i])&&v[i].length>=3&&v[i].every(x=>typeof x==='string'))o[i]=v[i].slice(0,4).map(x=>x.slice(0,300))});return o});
 const lb=num(j.lastBackup,0,9e15);if(lb!==null)c.lastBackup=lb;
 return c}

function cleanPhoto(p){
 if(!isObj(p)||!ID.test(String(p.id))||!DATE.test(String(p.date)))return null;
 if(p.type==='body'||p.type==='meal'){if(!IMG.test(String(p.img)))return null;const o={id:p.id,type:p.type,date:p.date,ts:num(p.ts,0,9e15)??Date.now(),img:p.img};if(p.type==='body'){if(!['Front','Side','Back'].includes(p.pose))return null;o.pose=p.pose}return o}
 if(p.type==='run'){const pts=(Array.isArray(p.pts)?p.pts:[]).slice(0,60000).map(q=>Array.isArray(q)&&num(q[0],-90,90)!==null&&num(q[1],-180,180)!==null?[+q[0],+q[1],num(q[2],0,9e15)??0]:null).filter(Boolean);const d=num(p.dist,0,1e6),t=num(p.time,0,864000);if(!pts.length||d===null||t===null)return null;return{id:p.id,type:'run',kind:oneOf(p.kind,['run','walk','cycle'],'run'),date:p.date,dist:Math.round(d),time:Math.round(t),pts,splits:(Array.isArray(p.splits)?p.splits:[]).slice(0,500).map(x=>num(x,0,864000)).filter(x=>x!==null),kcal:Math.round(num(p.kcal,0,100000)??0)}}
 return null}

/* Returns {ok:true,data,photos,summary} or {ok:false,error} and never changes anything on the device. */
window.PMbackup={
 check(text){
  let j;try{j=JSON.parse(text)}catch{return{ok:false,error:'This file is not a valid PEAK MODE backup (it is not readable JSON).'}}
  if(!isObj(j))return{ok:false,error:'This file is not a PEAK MODE backup.'}
  if(j._format!==undefined&&j._format!==BACKUP_FORMAT)return{ok:false,error:'This file is not a PEAK MODE backup.'}
  const known=['water','checks','eaten','custom','measurements','lifts','profile','targets','plan','checkins','_photos','onboarded'];
  if(!known.some(k=>k in j))return{ok:false,error:'No PEAK MODE data was found in this file, so nothing was changed.'}
  const data=cleanDb(j),raw=Array.isArray(j._photos)?j._photos:[],photos=raw.map(cleanPhoto).filter(Boolean);
  return{ok:true,data,photos,skipped:raw.length-photos.length,summary:{measurements:data.measurements.length,lifts:data.lifts.length,days:Object.keys(data.eaten).length,photos:photos.filter(p=>p.type!=='run').length,runs:photos.filter(p=>p.type==='run').length}}},
 build:async()=>({...db,_format:BACKUP_FORMAT,_app:APP_VERSION,lastBackup:Date.now(),_photos:(await PM.allP()).filter(p=>p.type!=='track'&&p.type!=='draft')})
};

E('#export').onclick=async()=>{
 try{const body=JSON.stringify(await PMbackup.build()),u=URL.createObjectURL(new Blob([body],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='peak-mode-backup-'+today()+'.json';a.click();db.lastBackup=Date.now();save();window.renderToday&&renderToday();showToast('Backup saved to your downloads.');setTimeout(()=>URL.revokeObjectURL(u),3000)}
 catch(e){showToast('Could not create the backup. Nothing was changed.')}};

E('#import').onchange=async e=>{
 const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
 if(f.size>MAX_BYTES)return showToast('That file is too large to be a PEAK MODE backup.');
 let text;try{text=await f.text()}catch{return showToast('Could not read that file.')}
 const r=PMbackup.check(text);if(!r.ok)return showToast(r.error);
 const s=r.summary,msg=`Restore this backup?\n\n${s.measurements} body check-ins, ${s.lifts} lift records, ${s.days} days of meals, ${s.photos} photos, ${s.runs} activities.${r.skipped?`\n${r.skipped} photo/activity item(s) were unreadable and will be skipped.`:''}\n\nYour settings and logs on this device will be REPLACED by the backup. Photos and activities in the backup are added; ones already on this device stay.`;
 if(!confirm(msg))return showToast('Restore cancelled. Nothing was changed.');
 try{
  localStorage.setItem('peakModeLifetimeV1_beforeRestore',localStorage.getItem('peakModeLifetimeV1')||'');
  for(const p of r.photos)await PM.putP(p);
  Object.keys(db).forEach(k=>delete db[k]);Object.assign(db,r.data);save();
  showToast('Backup restored.');setTimeout(()=>location.reload(),700)
 }catch(err){showToast('Restore failed part-way. Your previous settings are kept in a safety copy. Please contact support before importing again.')}
};
})();
