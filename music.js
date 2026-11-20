/* PEAK MODE: theme + workout music */
(()=>{
const E=s=>document.querySelector(s),au=E('#aud'),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* theme */
const TH={volt:'#101012',sunset:'#ededf0',ember:'#130f0d',ocean:'#08121c',violet:'#100c1a',light:'#f5f3ef'},theme=t=>{document.documentElement.dataset.theme=t;E('meta[name=theme-color]').content=TH[t]};
E('#tTheme').value=db.theme||'volt';theme(db.theme||'volt');E('#tTheme').onchange=e=>{db.theme=e.target.value;save();theme(db.theme)};
/* playlist link */
const safe=u=>{try{return /^https?:$/.test(new URL(u).protocol)}catch{return false}};
function embed(u){try{const x=new URL(u),h=x.hostname;
if(/(^|\.)spotify\.com$/.test(h)){const m=x.pathname.match(/\/(playlist|album|track|artist|show)\/(\w+)/);return m&&`https://open.spotify.com/embed/${m[1]}/${m[2]}`}
if(/(^|\.)youtube\.com$/.test(h)){const l=x.searchParams.get('list');return l&&/^[\w-]+$/.test(l)&&`https://www.youtube.com/embed/videoseries?list=${l}`}}catch{}return null}
function showPl(){const u=db.playlist||'',em=u&&embed(u);E('#plUrl').value=u;E('#plEmbed').innerHTML=(em?`<iframe src="${em}" width="100%" height="${/spotify/.test(em)?152:232}" allow="autoplay; encrypted-media; fullscreen" loading="lazy" title="Workout playlist"></iframe>`:'')+(u&&safe(u)?`<a href="${esc(u)}" target="_blank" rel="noopener">Open in app or browser</a>`:'')}
E('#plSave').onclick=()=>{const u=E('#plUrl').value.trim();if(u&&!safe(u))return showToast('Paste a full link starting with https://');db.playlist=u;save();showPl();showToast(u?'Playlist saved.':'Playlist cleared.')};showPl();
/* songs on this device */
let tracks=[],cur=-1,shuf=false,url='';
async function load(){tracks=(await PM.allP()).filter(p=>p.type==='track').sort((a,b)=>a.ts-b.ts);list()}
function list(){E('#trackList').innerHTML=tracks.map((t,i)=>`<div class="trk ${i===cur?'on':''}"><button class="link" data-p="${i}">${i===cur&&!au.paused?'⏸':'▶'} ${esc(t.title)}</button><span class="soft">${(t.blob.size/1048576).toFixed(1)} MB</span><button class="link" data-d="${i}" aria-label="Remove ${esc(t.title)}">✕</button></div>`).join('')||'<p class="hint">No songs added yet.</p>';E('#mPlay').textContent=au.paused?'▶':'⏸'}
function play(i){if(!tracks.length)return;cur=(i+tracks.length)%tracks.length;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(tracks[cur].blob);au.src=url;au.play().catch(()=>{});E('#npTitle').textContent=tracks[cur].title;if('mediaSession'in navigator)navigator.mediaSession.metadata=new MediaMetadata({title:tracks[cur].title,artist:'PEAK MODE'});list()}
const next=()=>{let n=cur+1;if(shuf&&tracks.length>1)do n=Math.floor(Math.random()*tracks.length);while(n===cur);play(n)},prev=()=>play(cur<0?0:cur-1),toggle=()=>cur<0?play(0):au.paused?au.play():au.pause();
au.onended=next;au.onplay=au.onpause=list;
if('mediaSession'in navigator){[['play',()=>au.play()],['pause',()=>au.pause()],['nexttrack',next],['previoustrack',prev]].forEach(([a,f])=>{try{navigator.mediaSession.setActionHandler(a,f)}catch{}})}
E('#mNext').onclick=next;E('#mPrev').onclick=prev;E('#mPlay').onclick=toggle;E('#mShuf').onclick=e=>{shuf=!shuf;e.currentTarget.setAttribute('aria-pressed',shuf)};
E('#trackList').onclick=async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.p!==undefined){const i=+b.dataset.p;i===cur?toggle():play(i)}
if(b.dataset.d!==undefined){const i=+b.dataset.d;await PM.delP(tracks[i].id);if(i===cur){au.pause();au.removeAttribute('src');cur=-1;E('#npTitle').textContent='Nothing playing'}else if(i<cur)cur--;await load()}};
E('#addTracks').onchange=async e=>{const fs=[...e.target.files];try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();let i=0;for(const f of fs)await PM.putP({id:'t'+Date.now()+'-'+i,type:'track',title:f.name.replace(/\.[^.]+$/,''),ts:Date.now()+i++,blob:f});showToast(fs.length+' song'+(fs.length>1?'s':'')+' added.')}catch{showToast('Not enough storage for these songs.')}e.target.value='';load()};
load();
})();
