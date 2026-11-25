/* PEAK MODE v13.2: data safety. Asks the browser to protect stored data, shows storage status, and reminds you to back up. */
(()=>{
const E=s=>document.querySelector(s),day=s=>new Date(s+'T00:00').getTime(),dayMs=864e5;
const hasData=()=>db.measurements.length||db.lifts.length||Object.keys(db.eaten||{}).length||Object.keys(db.checks||{}).length;
function earliest(){const d=[...Object.keys(db.eaten||{}),...Object.keys(db.checks||{}),...db.measurements.map(x=>x.date),...db.lifts.map(x=>x.date)].filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).sort();return d[0]||today()}
if(!db.firstUse){db.firstUse=hasData()?earliest():today();save()}
let st={persisted:null,used:null};
async function check(ask){try{if(!navigator.storage){st.persisted='na';return}
 let p=navigator.storage.persisted?await navigator.storage.persisted():false;
 if(!p&&ask&&navigator.storage.persist)p=await navigator.storage.persist();st.persisted=!!p;
 if(navigator.storage.estimate){const e=await navigator.storage.estimate();st.used=e.usage||0}}catch{st.persisted=st.persisted??false}render()}
function render(){const el=E('#storageNote');if(!el)return;
 const used=st.used!=null?` Using about ${(st.used/1048576).toFixed(1)} MB.`:'';
 el.className='hint'+(st.persisted===true?'':' warn');
 el.textContent=st.persisted===true?'Storage protection: ON. The browser will not clear your data to free space.'+used:st.persisted==='na'?'This browser cannot protect stored data. Back up regularly.'+used:'Storage protection: not guaranteed. The browser may clear data if the device is low on space or the app is not used for a long time. On iPhone, add PEAK MODE to the Home Screen. Back up regularly.'+used}
const p=document.createElement('p');p.id='storageNote';p.className='hint';p.textContent='Checking storage…';E('#export').before(p);
document.querySelector('nav [data-page="progress"]').addEventListener('click',()=>check(false));
window.PMsafe={
 reminder(){if(db.backupSnooze===today())return'';
  if(db.lastBackup){const d=Math.floor((Date.now()-db.lastBackup)/dayMs);return d>=7?`Your last backup was ${d} days ago.`:''}
  const d=Math.floor((day(today())-day(db.firstUse||today()))/dayMs);return d>=3?'You have not backed up yet. Photos and logs live only on this device.':''},
 snooze(){db.backupSnooze=today();save()}};
check(true);renderToday();
})();
