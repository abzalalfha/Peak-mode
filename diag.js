/* PEAK MODE v13.5: support tools. Shows the app version and lets you copy a diagnostics report (no personal data) for bug reports. */
(()=>{
const E=s=>document.querySelector(s);
E('#tQuiz').closest('label').insertAdjacentHTML('afterend','<p class="hint" id="dgInfo"></p><button type="button" class="link" id="dgCopy">Copy diagnostics for support</button><textarea id="dgText" readonly rows="8" hidden aria-label="Diagnostics" style="width:100%;margin-top:8px"></textarea>');
const info=()=>{E('#dgInfo').textContent=`PEAK MODE v${APP_VER} · data format ${db.v}${PMLOG.list().length?` · ${PMLOG.list().length} recent problem${PMLOG.list().length===1?'':'s'} logged`:''}`};
E('#settings').addEventListener('click',()=>{info();E('#dgText').hidden=true});
async function report(){let st='unknown',used='unknown',photos='unknown';
 try{if(navigator.storage){st=navigator.storage.persisted?String(await navigator.storage.persisted()):'unknown';if(navigator.storage.estimate){const e=await navigator.storage.estimate();used=((e.usage||0)/1048576).toFixed(1)+' MB'}}}catch{}
 try{photos=String((await PM.allP()).length)}catch{}
 const err=PMLOG.list();
 return ['PEAK MODE diagnostics (no personal data)',`App version: ${APP_VER}`,`Data format: ${db.v} (app expects ${SCHEMA})`,`Time: ${new Date().toISOString()}`,`Mode: ${matchMedia('(display-mode: standalone)').matches?'installed app':'browser'}`,`Browser: ${navigator.userAgent}`,`Storage protected: ${st}; used: ${used}; saved items (photos and runs): ${photos}`,`Saved-data size: ${Math.round(JSON.stringify(db).length/1024)} KB`,`Recovered from damaged data: ${PMSTORE.recovered}; newer data found: ${PMSTORE.newer}; save failed: ${PMSTORE.failed}`,`Recent problems (${err.length}):`,...err.map(e=>`  ${e.t} [${e.w}] ${e.m}`)].join('\n')}
E('#dgCopy').onclick=async()=>{const t=await report(),box=E('#dgText');box.value=t;box.hidden=false;box.select();
 try{await navigator.clipboard.writeText(t);showToast('Diagnostics copied. Paste them into your message to support.')}catch{showToast('Select the text below and copy it.')}};
window.PMdiag={report};
})();
