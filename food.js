/* PEAK MODE: Indian food database (approximate values per 100 g, prepared as eaten) + portion logger */
(()=>{
const E=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),r1=x=>Math.round(x*10)/10;
/* name|regions (A all, S south, N north, W west, E east, X north-east)|kcal|protein|carbs|fat|portions */
const RAW=`Rice, cooked white|A|130|2.7|28|0.3|katori:150,plate:250
Matta rice, cooked (Kerala)|S|125|2.8|27|0.7|katori:150,plate:250
Chapati / roti, plain|AN|300|9|50|7|roti:40
Paratha, plain|N|325|7|45|12|paratha:80
Naan|N|320|9|55|6|naan:90
Poori|N|340|7|42|16|poori:35
Makki di roti (Punjab)|N|240|5|46|3|roti:60
Bajra roti (Rajasthan, Gujarat)|NW|270|8|50|4|roti:50
Jowar roti (Maharashtra, Karnataka)|WS|250|8|50|2|roti:40
Ragi mudde (Karnataka)|S|120|2.5|26|0.5|ball:150
Plain dosa|S|170|4|30|3|dosa:80
Masala dosa|S|170|4|26|5|dosa:150
Idli|S|140|4|29|0.4|idli:40
Medu vada|S|330|10|32|18|vada:40
Uttapam|S|150|4|24|4|uttapam:100
Pesarattu (Andhra)|S|150|8|22|3|piece:100
Idiyappam (Kerala, Tamil Nadu)|S|130|2.5|28|0.5|piece:35
Puttu (Kerala)|S|165|3|32|2.5|piece:100
Appam (Kerala)|S|160|2.5|32|2|appam:50
Kerala parotta|S|330|6|45|14|parotta:80
Upma|S|150|3|22|5|katori:150
Pongal (Tamil Nadu)|S|150|4|24|4|katori:150
Poha (Maharashtra, MP)|W|130|2.5|25|2.5|plate:150
Sabudana khichdi (Maharashtra)|W|180|2|32|5|plate:150
Dhokla (Gujarat)|W|160|6|24|4.5|piece:30
Thepla (Gujarat)|W|300|9|42|11|piece:40
Pav bhaji|W|150|4|22|5|plate:250
Vada pav|W|225|6|32|8|piece:130
Luchi (Bengal)|E|370|7|45|18|piece:30
Sattu flour (Bihar, Jharkhand)|E|400|20|65|6|2 tbsp:30
Momo, steamed chicken (North-East)|X|150|8|20|4|piece:30
Thukpa (North-East)|X|90|5|12|2|bowl:300
Dal, home-style|A|100|6|14|2.5|katori:150
Sambar|S|60|3|9|1.5|katori:150
Rasam|S|25|1|4|0.5|katori:150
Rajma curry (Punjab)|N|120|6|17|3|katori:150
Chole (Punjab)|N|150|7|20|5|katori:150
Sarson da saag (Punjab)|N|85|3|6|5|katori:150
Palak paneer|N|150|8|6|11|katori:150
Paneer, raw|A|265|18|1.2|20|slice:25
Paneer butter masala|N|190|7|7|15|katori:150
Aloo gobi|N|100|2.5|12|5|katori:150
Baingan bharta|N|90|2|8|6|katori:150
Bhindi fry|A|100|2|8|7|katori:100
Cabbage thoran (Kerala)|S|85|2|8|5|katori:100
Avial (Kerala)|S|100|2|9|6|katori:150
Khichdi|A|110|4|18|2.5|katori:150
Curd rice|S|115|3.5|17|3.5|katori:150
Lemon rice|S|140|3|25|3|katori:150
Veg pulao|A|140|3|24|3.5|katori:150
Chicken biryani|A|165|8|21|5|katori:200,plate:350
Chicken curry, home-style|A|140|14|4|7|katori:150
Chicken breast, cooked|A|165|31|0|3.6|palm-size piece:100
Mutton curry|A|200|17|4|13|katori:150
Beef fry (Kerala)|S|220|22|3|13|katori:100
Fish curry (Kerala, Bengal, Goa style)|A|120|13|3|6|katori:150
Prawn curry (Goa, Konkan)|W|110|13|3|5|katori:150
Fish fry|A|190|20|5|10|piece:80
Egg, boiled|A|155|13|1.1|11|egg:50
Omelette (1 tsp oil)|A|155|10|1|12|2-egg omelette:110
Besan chilla|N|180|9|22|6|chilla:80
Soya chunks, dry|A|345|52|33|0.5|serving:50
Roasted chana|A|370|20|58|6|handful:30
Peanuts, roasted|A|590|26|16|50|handful:30
Curd (dahi)|A|60|3.5|4.7|3.3|katori:150
Buttermilk (chaas, moru)|A|40|2|3|1.5|glass:200
Milk, whole|A|62|3.2|4.8|3.5|glass:200
Lassi, sweet (Punjab)|N|100|3|15|3|glass:250
Banana|A|90|1.1|23|0.3|banana:120
Apple|A|52|0.3|14|0.2|apple:150
Mango|A|60|0.8|15|0.4|mango:200
Papaya|A|43|0.5|11|0.3|bowl:150
Oats, rolled (dry)|A|380|13|67|7|serving:40
Coconut, grated|S|350|3.3|15|33|2 tbsp:20
Ghee|A|900|0|0|100|tsp:5
Cooking oil|A|900|0|0|100|tsp:5
Whey protein (check your label)|A|400|80|8|6|scoop:30`;
const BASE=RAW.split('\n').map((l,i)=>{const[n,rg,k,p,c,f,m]=l.split('|');return{id:'f'+i,name:n,reg:rg,k:+k,p:+p,c:+c,f:+f,m:m.split(',').map(x=>{const j=x.lastIndexOf(':');return[x.slice(0,j),+x.slice(j+1)]})}});
db.foods||=[];const all=()=>BASE.concat(db.foods);
const REG={'':'All',S:'South',N:'North',W:'West',E:'East',X:'North-East'};let reg=(db.prefs&&db.prefs.region)||'';
document.body.insertAdjacentHTML('beforeend','<dialog id="foodDialog"><div class="row"><h2>Add food</h2><button id="fClose" aria-label="Close">✕</button></div><div id="fFind"><input id="fSearch" type="search" placeholder="Search: dosa, fish curry, roti…" aria-label="Search foods"><div class="chips2" id="fReg"></div><div id="fList"></div><button class="secondary" id="fCustom">+ Add a custom food</button><p class="hint">Approximate typical values for home-style food. Real values vary with recipe and oil, so add a custom food when you know better.</p></div><div id="fPick" hidden></div></dialog>');
E('#addMeal').insertAdjacentHTML('afterend','<button class="primary" id="addFood">+ Search food</button> ');
function list(){const d=(db.prefs||{}).diet,dietOk=x=>{if(!d||d==='non')return true;const n=x.name.toLowerCase();return !/chicken|fish|mutton|beef|prawn/.test(n)&&!(d==='veg'&&/egg|omelette/.test(n))},w=E('#fSearch').value.toLowerCase().split(/\s+/).filter(Boolean),r=all().filter(x=>dietOk(x)&&(!reg||x.reg.includes(reg)||x.reg==='A')&&w.every(t=>x.name.toLowerCase().includes(t)));
E('#fReg').innerHTML=Object.entries(REG).map(([k,v])=>`<button data-r="${k}" class="${reg===k?'on':''}">${v}</button>`).join('');
E('#fList').innerHTML=r.map(x=>`<button class="lrow" data-id="${x.id}"><span><b>${esc(x.name)}</b><small>${x.k} kcal · ${x.p} g protein per 100 g</small></span></button>`).join('')||'<p class="hint">No match. Add it as a custom food below.</p>'}
const back=()=>{E('#fPick').hidden=true;E('#fFind').hidden=false};
function pick(f){E('#fFind').hidden=true;const p=E('#fPick');p.hidden=false;const u=f.m.concat([['grams',1]]);
p.innerHTML=`<button class="link" id="fBack">← Back</button><h3>${esc(f.name)}</h3><label>Portion<select id="pU">${u.map((x,i)=>`<option value="${i}">${esc(x[0])}${x[0]==='grams'?'':' ('+x[1]+' g)'}</option>`).join('')}</select></label><label>How many<input id="pQ" type="number" step="0.5" min="0" value="1" inputmode="decimal"></label><div class="tip" id="pOut"></div><button class="primary" id="pAdd">Add to today</button>`;
const calc=()=>{const g=(+E('#pQ').value||0)*u[+E('#pU').value][1],q=x=>r1(x*g/100);return{g,kcal:Math.round(f.k*g/100),protein:q(f.p),carbs:q(f.c),fat:q(f.f)}},show=()=>{const c=calc();E('#pOut').textContent=`${c.g} g · ${c.kcal} kcal · ${c.protein} g protein · ${c.carbs} g carbs · ${c.fat} g fat`};
E('#pU').onchange=()=>{E('#pQ').value=u[+E('#pU').value][0]==='grams'?100:1;show()};E('#pQ').oninput=show;show();
E('#fBack').onclick=back;E('#pAdd').onclick=()=>{const c=calc();if(!(c.g>0))return showToast('Enter an amount.');const t=today();(db.custom[t]||=[]).push({id:Date.now(),name:`${f.name} · ${E('#pQ').value} ${u[+E('#pU').value][0]}`,kcal:c.kcal,protein:c.protein,carbs:c.carbs,fat:c.fat});save();renderToday();showToast('Added to today.');E('#foodDialog').close();back()}}
function custom(){E('#fFind').hidden=true;const p=E('#fPick');p.hidden=false;p.innerHTML=`<button class="link" id="fBack">← Back</button><h3>Custom food (per 100 g)</h3><label>Name<input id="fcN"></label><div class="form"><label>Calories<input id="fcK" type="number" inputmode="decimal"></label><label>Protein g<input id="fcP" type="number" inputmode="decimal"></label><label>Carbs g<input id="fcC" type="number" inputmode="decimal"></label><label>Fat g<input id="fcF" type="number" inputmode="decimal"></label></div><button class="primary" id="fcSave">Save food</button>`;
E('#fBack').onclick=back;E('#fcSave').onclick=()=>{const n=E('#fcN').value.trim(),v=['#fcK','#fcP','#fcC','#fcF'].map(s=>+E(s).value);if(!n||v.some(x=>!(x>=0))||!E('#fcK').value)return showToast('Enter a name and values (0 or more).');const f={id:'u'+Date.now(),name:n,reg:'A',k:v[0],p:v[1],c:v[2],f:v[3],m:[['serving (100 g)',100]]};db.foods.push(f);save();pick(f)}}
E('#addFood').onclick=()=>{back();E('#fSearch').value='';reg=(db.prefs&&db.prefs.region)||'';list();E('#foodDialog').showModal()};E('#fClose').onclick=()=>E('#foodDialog').close();E('#fSearch').oninput=list;E('#fCustom').onclick=custom;
E('#fFind').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.r!==undefined){reg=b.dataset.r;list()}if(b.dataset.id)pick(all().find(x=>x.id===b.dataset.id))});
})();
