// ═══════════════════════════════════════════════════
//  CONFIG — change URL here when you redeploy
// ═══════════════════════════════════════════════════
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAuEkoaeG4uDFtp7TtHFdKgXcBRD-DVFy9nYXOoaI3XC9D1AMKV4CvH2fpmnu0wBaN/exec';

// ═══════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════
let allTests=[], selectedTest=null;
let questions=[], currentIdx=0, answers={}, mode='survey', respondentName='';
let quizMode='train'; // 'train' | 'test' | 'race'
let raceCorrectCount=0; // tracks streak in race mode

// ═══════════════════════════════════════════════════
//  DEMO DATA
// ═══════════════════════════════════════════════════
const IMG={
  sky:   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  world: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1200px-World_map_-_low_resolution.svg.png',
  solar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Solar-System.pdf/page1-1200px-Solar-System.pdf.jpg',
  cell:  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Animal_cell_structure_en.svg/1200px-Animal_cell_structure_en.svg.png',
  code:  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
};
const DEMO_TESTS=[
  {id:1,title:'General Knowledge',description:'Mixed types incl. image, hotspot & matrix',icon:'🧠',sheet:'demo_gen',duration:'6 min',difficulty:'Medium',color:'#7c6af7'},
  {id:2,title:'Science Quiz',description:'Planets, cells & drag-drop',icon:'🔬',sheet:'demo_sci',duration:'8 min',difficulty:'Medium',color:'#f76a8a'},
  {id:3,title:'Tech & Coding',description:'Web & programming fundamentals',icon:'💻',sheet:'demo_tech',duration:'10 min',difficulty:'Hard',color:'#6af7c4'},
  {id:4,title:'Feedback Survey',description:'Share your experience — no right/wrong',icon:'📋',sheet:'demo_survey',duration:'3 min',difficulty:'Easy',color:'#fbbf24'},
];
const DEMO_QS={
  demo_gen:[
    {id:1,question:'What type of landscape is shown in this photo?',type:'radio',imageUrl:IMG.sky,options:'Desert|Mountain|Ocean|Forest',correct:'Mountain',required:'TRUE'},
    {id:2,question:'Which of these are mammals?',type:'checkbox',options:'Dog|Eagle|Whale|Snake|Cat',correct:'Dog|Whale|Cat',required:'TRUE'},
    {id:3,question:'Mark each statement as True or False:',type:'mtf',options:'The sun is a star|Water boils at 50°C|Sound travels faster than light|DNA has a double helix structure',correct:'TRUE|FALSE|FALSE|TRUE',required:'TRUE'},
    {id:4,question:'The Earth revolves around the Sun.',type:'truefalse',options:'',correct:'TRUE',required:'TRUE'},
    {id:5,question:'Click on Europe in the map below:',type:'hotspot',imageUrl:IMG.world,options:'Europe:28%,15%,20%,25%|Asia:50%,12%,35%,38%|Americas:5%,10%,22%,55%|Africa:30%,38%,20%,30%|Australia:65%,55%,18%,22%',correct:'Europe',required:'TRUE'},
    {id:6,question:'Rate your confidence in each subject:',type:'matrix',options:'Mathematics|Science|History|Literature',matrixCols:'Not at all|Slightly|Moderately|Very|Extremely',correct:'',required:'FALSE'},
    {id:7,question:'Drag to put in order from smallest to largest:',type:'ordering',options:'Ant|Mouse|Cat|Horse|Elephant',correct:'Ant|Mouse|Cat|Horse|Elephant',required:'TRUE'},
    {id:8,question:'Match each country to its capital:',type:'matching',options:'France::Paris|Japan::Tokyo|Brazil::Brasília|Australia::Canberra',correct:'France::Paris|Japan::Tokyo|Brazil::Brasília|Australia::Canberra',required:'TRUE'},
    {id:9,question:'How fun was this quiz?',type:'rating',options:'',correct:'',required:'TRUE',ratingMin:'Boring',ratingMax:'Super fun',ratingScale:5},
  ],
  demo_sci:[
    {id:1,question:'Chemical symbol for water?',type:'radio',options:'WA|H2O|HO2|W',correct:'H2O',required:'TRUE'},
    {id:2,question:'Click on the nucleus in this animal cell diagram:',type:'hotspot',imageUrl:IMG.cell,options:'Nucleus:38%,35%,22%,25%|Mitochondria:62%,52%,18%,18%|Cell Membrane:5%,5%,90%,90%|Cytoplasm:15%,15%,70%,70%',correct:'Nucleus',required:'TRUE'},
    {id:3,question:'Classify each organism into its correct kingdom:',type:'matrix',options:'Mushroom|Eagle|Oak Tree|E. coli',matrixCols:'Animal|Plant|Fungi|Bacteria',correct:'Mushroom::Fungi|Eagle::Animal|Oak Tree::Plant|E. coli::Bacteria',required:'TRUE'},
    {id:4,question:'True or False for each science fact:',type:'mtf',options:'The heart pumps blood|Plants absorb CO₂|The moon has an atmosphere|Sound cannot travel in space',correct:'TRUE|TRUE|FALSE|TRUE',required:'TRUE'},
    {id:5,question:'Order the planets closest to farthest from the Sun:',type:'ordering',imageUrl:IMG.solar,options:'Mercury|Venus|Earth|Mars|Jupiter|Saturn',correct:'Mercury|Venus|Earth|Mars|Jupiter|Saturn',required:'TRUE'},
    {id:6,question:'Light travels faster than sound.',type:'truefalse',options:'',correct:'TRUE',required:'TRUE'},
  ],
  demo_tech:[
    {id:1,question:'What does this code snippet primarily do?',type:'radio',imageUrl:IMG.code,options:'Defines a function|Creates a loop|Declares a variable|Imports a module',correct:'Defines a function',required:'TRUE'},
    {id:2,question:'Which are JavaScript frameworks?',type:'checkbox',options:'React|Vue|Django|Angular|Laravel',correct:'React|Vue|Angular',required:'TRUE'},
    {id:3,question:'Match each concept to its correct category:',type:'matrix',options:'React|SQL|Git|Docker',matrixCols:'Frontend|Backend|Database|DevOps|Version Control',correct:'React::Frontend|SQL::Database|Git::Version Control|Docker::DevOps',required:'TRUE'},
    {id:4,question:'True or False — web fundamentals:',type:'mtf',options:'HTML defines structure|CSS handles logic|JavaScript is synchronous by default|REST uses HTTP',correct:'TRUE|FALSE|FALSE|TRUE',required:'TRUE'},
    {id:5,question:'Order from lowest to highest abstraction:',type:'ordering',options:'Machine Code|Assembly|C|Python|No-Code',correct:'Machine Code|Assembly|C|Python|No-Code',required:'TRUE'},
    {id:6,question:'HTML stands for HyperText Markup Language.',type:'truefalse',options:'',correct:'TRUE',required:'TRUE'},
  ],
  demo_survey:[
    {id:1,question:'How did you hear about us?',type:'dropdown',options:'Social Media|Friend|Google|Other',correct:'',required:'TRUE'},
    {id:2,question:'How satisfied are you with each feature?',type:'matrix',options:'Quiz Questions|Score System|Drag & Drop|Hotspot Images|Matrix Questions',matrixCols:'Very Unsatisfied|Unsatisfied|Neutral|Satisfied|Very Satisfied',correct:'',required:'FALSE'},
    {id:3,question:'Any suggestions for improvement?',type:'text',options:'',correct:'',required:'FALSE'},
    {id:4,question:'Rate your overall experience.',type:'rating',options:'',correct:'',required:'TRUE',ratingMin:'Poor',ratingMax:'Excellent',ratingScale:5},
  ],
};

// ═══════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════
const $=id=>document.getElementById(id);
const show=id=>{$(id).style.display='block';};
const hide=id=>{$(id).style.display='none';};
const showFlex=id=>{$(id).style.display='flex';};
function hideAll(){
  ['testSelector','nameScreen','modeScreen','quizHeader','progressBar','navRow','resultScreen'].forEach(hide);
  $('skeletonLoad').style.display='none';
  $('questionContainer').innerHTML='';
}
function showStatus(msg,type){
  const el=$('statusMsg');el.innerHTML=msg;el.style.display='block';
  const styles={
    error:'background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);color:#f87171',
    loading:'background:rgba(124,106,247,.1);border:1px solid rgba(124,106,247,.3);color:#7c6af7',
  };
  el.style.cssText=`display:block;padding:14px 18px;border-radius:12px;font-size:14px;margin-bottom:16px;${styles[type]||styles.loading}`;
}
function hideStatus(){$('statusMsg').style.display='none';}
function escH(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function escJ(s){return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");}
function shuffle(a){const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}

// ═══════════════════════════════════════════════════
//  LOAD TESTS  — auto-runs on page open
// ═══════════════════════════════════════════════════
async function loadTests(){
  $('skeletonLoad').style.display='grid';
  showStatus('Loading tests<span class="ldots"></span>','loading');
  try{
    const res=await fetch(`${SCRIPT_URL}?action=getTests`);
    const data=await res.json();
    if(!data.tests||!data.tests.length)throw new Error('No tests found in Tests tab');
    hideStatus();$('skeletonLoad').style.display='none';renderSelector(data.tests);
  }catch(err){
    $('skeletonLoad').style.display='none';
    showStatus(`❌ Failed to load: ${err.message}. Check your Apps Script deployment.`,'error');
  }
}
window.addEventListener('load',loadTests);

// ═══════════════════════════════════════════════════
//  TEST SELECTOR
// ═══════════════════════════════════════════════════
function renderSelector(tests){
  allTests=tests; selectedTest=null;
  const diffColor={Easy:'#4ade80',Medium:'#fbbf24',Hard:'#f87171'};
  $('testsGrid').innerHTML=tests.map(t=>`
    <div id="tc_${t.id}" onclick="selectTest('${t.id}')"
      class="relative bg-surface border-2 border-border rounded-2xl p-7 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl overflow-hidden select-none group"
      style="--cc:${t.color||'#7c6af7'}">
      <!-- top accent bar -->
      <div class="absolute top-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" style="background:${t.color||'#7c6af7'}"></div>
      <!-- check -->
      <div class="tc-check absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-sm text-white opacity-0 transition-opacity" style="background:${t.color||'#7c6af7'}">✓</div>
      <!-- content -->
      <div class="text-4xl mb-3">${t.icon||'📝'}</div>
      <div class="font-heading text-lg font-bold tracking-tight mb-2 leading-tight">${escH(t.title)}</div>
      <div class="text-muted text-xs leading-relaxed mb-4">${escH(t.description||'')}</div>
      <div class="flex gap-2 flex-wrap">
        ${t.duration?`<span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface2 text-muted">⏱ ${escH(String(t.duration))}</span>`:''}
        ${t.difficulty?`<span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface2" style="color:${diffColor[t.difficulty]||'#7a7a9a'}">${escH(String(t.difficulty))}</span>`:''}
      </div>
    </div>`).join('');
  $('selectorSub').textContent=`${tests.length} test${tests.length!==1?'s':''} available`;
  show('testSelector');
}

function selectTest(id){
  selectedTest=allTests.find(t=>String(t.id)===String(id));
  // deselect all
  document.querySelectorAll('[id^="tc_"]').forEach(c=>{
    c.classList.remove('border-[color:var(--cc)]');
    c.querySelector('.tc-check').classList.add('opacity-0');
    c.querySelector('.tc-check').classList.remove('opacity-100');
    // remove top bar scale
    c.querySelector('div.absolute.top-0').classList.remove('scale-x-100');
    c.querySelector('div.absolute.top-0').classList.add('scale-x-0');
  });
  // select this one
  const card=$(`tc_${id}`);
  card.style.borderColor=selectedTest.color||'#7c6af7';
  card.querySelector('.tc-check').classList.remove('opacity-0');
  card.querySelector('.tc-check').classList.add('opacity-100');
  card.querySelector('div.absolute.top-0').classList.remove('scale-x-0');
  card.querySelector('div.absolute.top-0').classList.add('scale-x-100');
  // enable start btn
  const btn=$('startTestBtn');
  btn.classList.remove('opacity-40','pointer-events-none');
  btn.textContent=`Start "${selectedTest.title}" →`;
}

// ═══════════════════════════════════════════════════
//  NAME SCREEN
// ═══════════════════════════════════════════════════
function proceedToName(){
  if(!selectedTest)return;
  hide('testSelector');
  $('nameTestBadge').textContent=`${selectedTest.icon||'📝'} ${selectedTest.title}`;
  $('nameInput').value=''; $('nameGreeting').textContent='';
  $('nameError').style.display='none';
  show('nameScreen'); setTimeout(()=>$('nameInput').focus(),80);
}
function onNameType(val){
  const msgs=['Hi there! 👋','Hello! 😊','Great name! ✨','Welcome! 🚀','Nice to meet you! 🎉'];
  $('nameError').style.display='none';
  $('nameGreeting').textContent=val.trim().length>=2?`${msgs[val.trim().length%msgs.length]} Ready, ${val.trim().split(' ')[0]}?`:'';
}
function goToModeScreen(){
  // Called after name is confirmed — shows the mode picker
  hide('nameScreen');
  $('modeTestBadge').textContent=`${selectedTest.icon||'📝'} ${selectedTest.title}`;
  // Reset mode selection UI
  quizMode='train';
  ['train','test','race'].forEach(m=>resetModeCard(m));
  $('startModeBtn').classList.add('opacity-40','pointer-events-none');
  show('modeScreen');
}
function goBackToName(){
  hide('modeScreen');
  show('nameScreen');
  setTimeout(()=>$('nameInput').focus(),80);
}
function selectMode(m){
  quizMode=m;
  ['train','test','race'].forEach(id=>resetModeCard(id));
  const colors={train:'accent3',test:'accent',race:'accent2'};
  const card=$(`mode_${m}`);
  const colorMap={
    train:{border:'border-accent3',bg:'bg-accent3/10',check:'border-accent3 bg-accent3'},
    test: {border:'border-accent', bg:'bg-accent/10',  check:'border-accent bg-accent'},
    race: {border:'border-accent2',bg:'bg-accent2/10', check:'border-accent2 bg-accent2'},
  };
  const s=colorMap[m];
  card.classList.remove('border-border','bg-surface2');
  card.classList.add(s.border,s.bg);
  const chk=card.querySelector('.mode-check');
  chk.classList.remove('border-border');
  chk.classList.add(...s.check.split(' '));
  chk.innerHTML='<span class="text-white text-xs font-bold">✓</span>';
  // Enable start button
  $('startModeBtn').classList.remove('opacity-40','pointer-events-none');
}
function resetModeCard(m){
  const card=$(`mode_${m}`);
  card.className='mode-card flex items-center gap-4 px-5 py-4 bg-surface2 border-2 border-border rounded-2xl cursor-pointer transition-all text-left '
    +{train:'hover:border-accent3 hover:bg-accent3/5',test:'hover:border-accent hover:bg-accent/5',race:'hover:border-accent2 hover:bg-accent2/5'}[m];
  const chk=card.querySelector('.mode-check');
  chk.className='mode-check w-6 h-6 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0 transition-all';
  chk.innerHTML='';
}

// ═══════════════════════════════════════════════════
//  LOAD QUESTIONS + INIT QUIZ
// ═══════════════════════════════════════════════════
async function startQuiz(){
  // startQuiz is now called from name screen — validate name then go to mode
  const nm=$('nameInput').value.trim();
  if(!nm){$('nameError').style.display='block';$('nameInput').focus();return;}
  respondentName=nm;
  goToModeScreen();
}

async function launchQuiz(){
  // Called from mode screen — actually load questions
  hide('modeScreen');
  showStatus('Loading questions<span class="ldots"></span>','loading');
  let qs;
  try{
    const res=await fetch(`${SCRIPT_URL}?action=getQuestions&sheet=${encodeURIComponent(selectedTest.sheet)}`);
    const data=await res.json();
    if(!data.questions||!data.questions.length)throw new Error('No questions in: '+selectedTest.sheet);
    qs=data.questions;
  }catch(err){
    showStatus(`❌ ${err.message}`,'error');
    setTimeout(()=>{hideStatus();show('modeScreen');},2000);return;
  }
  hideStatus();initQuiz(qs);
}

function initQuiz(qs){
  questions=qs; currentIdx=0; answers={}; raceCorrectCount=0;
  mode=questions.some(q=>q.correct&&String(q.correct).trim()!=='')?'quiz':'survey';

  // Apply mode ordering
  if(quizMode==='test'||quizMode==='race'){
    questions=shuffle([...questions]);
  }
  // (train = original order, already set)

  const modeLabels={train:'📖 Train',test:'📝 Test',race:'⚡ Race'};
  const modeColors={train:'text-accent3 bg-accent3/10 border-accent3/30',test:'text-accent bg-accent/10 border-accent/30',race:'text-accent2 bg-accent2/10 border-accent2/30'};
  $('quizTag').className=`inline-block font-heading text-[11px] font-bold uppercase tracking-[.2em] px-4 py-1.5 rounded-full mb-4 border ${modeColors[quizMode]}`;
  $('quizTag').textContent=modeLabels[quizMode];
  $('quizTitle').innerHTML=`${escH(selectedTest.title)}<br><span class="grad-text">Question by Question</span>`;
  $('quizDesc').textContent=`Good luck, ${respondentName.split(' ')[0]}! · ${questions.length} questions · ${quizMode==='race'?'Race mode — restart on wrong!':mode==='quiz'?'Scored':'Survey'}`;

  // Hide prev button in race and test mode (no going back)
  $('prevBtn').style.display=(quizMode==='race')?'none':'';

  show('quizHeader'); show('progressBar'); showFlex('navRow');
  renderQ();
}

// ═══════════════════════════════════════════════════
//  RENDER QUESTION
// ═══════════════════════════════════════════════════

/* Badge colours per type */
const TYPE_META={
  radio:    {icon:'🔘',label:'Single Choice',  bg:'bg-accent/10',   text:'text-accent'},
  checkbox: {icon:'☑️',label:'Multi Select',    bg:'bg-accent2/10',  text:'text-accent2'},
  text:     {icon:'✏️',label:'Text Answer',     bg:'bg-accent3/10',  text:'text-accent3'},
  rating:   {icon:'⭐',label:'Rating',          bg:'bg-yellow-400/10',text:'text-yellow-400'},
  dropdown: {icon:'▼', label:'Dropdown',        bg:'bg-sky-400/10',  text:'text-sky-400'},
  truefalse:{icon:'⚡',label:'True / False',    bg:'bg-emerald-400/10',text:'text-emerald-400'},
  ordering: {icon:'🔀',label:'Drag to Order',   bg:'bg-orange-400/10',text:'text-orange-400'},
  matching: {icon:'🔗',label:'Drag to Match',   bg:'bg-violet-400/10',text:'text-violet-400'},
  hotspot:  {icon:'📍',label:'Click the Image', bg:'bg-pink-500/10',  text:'text-pink-400'},
  mtf:      {icon:'✅',label:'Multiple T/F',    bg:'bg-teal-400/10',  text:'text-teal-400'},
  matrix:   {icon:'🔲',label:'Matrix Choice',   bg:'bg-amber-400/10', text:'text-amber-400'},
};

function renderQ(){
  const q=questions[currentIdx]; updateProg();
  const m=TYPE_META[q.type]||{icon:'❓',label:q.type,bg:'bg-accent/10',text:'text-accent'};

  // Optional image above question (not for hotspot — it handles its own image)
  let imageBlock='';
  const imgUrl=String(q.imageUrl||'').trim();
  if(imgUrl&&q.type!=='hotspot'){
    imageBlock=`<div class="w-full mb-6 rounded-xl overflow-hidden border border-border bg-surface2">
      <img src="${escH(imgUrl)}" alt="Question image" class="w-full h-auto max-h-72 object-contain block transition-opacity duration-300" style="opacity:0"
        onload="this.style.opacity=1"
        onerror="this.parentNode.innerHTML='<div class=\\'flex items-center justify-center h-24 text-[#f87171] text-sm gap-2\\'>⚠️ Image failed to load</div>'"/>
    </div>`;
  }

  const req=String(q.required).toUpperCase()==='TRUE'?'<span class="text-accent2 ml-1">*</span>':'';
  let inputHtml='';

  // ── radio ──
  if(q.type==='radio'){
    const opts=String(q.options).split('|').filter(Boolean);
    inputHtml=`<div class="flex flex-col gap-2.5">${opts.map(o=>{
      const sel=answers[q.id]===o;
      return `<div onclick="selR(${q.id},'${escJ(o)}',this)" class="flex items-center gap-3 px-4 py-3.5 bg-surface2 border ${sel?'border-accent bg-accent/10':'border-border'} rounded-xl cursor-pointer transition-all hover:border-accent hover:bg-accent/5 select-none">
        <div class="w-5 h-5 rounded-full border-2 ${sel?'border-accent bg-accent':'border-border'} flex items-center justify-center flex-shrink-0 transition-all">
          ${sel?'<div class="w-2 h-2 rounded-full bg-white"></div>':''}
        </div>
        <span class="text-sm leading-snug">${escH(o)}</span>
      </div>`;
    }).join('')}</div>`;
  }
  // ── checkbox ──
  else if(q.type==='checkbox'){
    const opts=String(q.options).split('|').filter(Boolean);
    const cur=answers[q.id]?answers[q.id].split('|'):[];
    inputHtml=`<div class="flex flex-col gap-2.5">${opts.map(o=>{
      const sel=cur.includes(o);
      return `<div onclick="selC(${q.id},'${escJ(o)}',this)" class="flex items-center gap-3 px-4 py-3.5 bg-surface2 border ${sel?'border-accent2 bg-accent2/10':'border-border'} rounded-xl cursor-pointer transition-all hover:border-accent2 hover:bg-accent2/5 select-none">
        <div class="w-5 h-5 rounded-md border-2 ${sel?'border-accent2 bg-accent2':'border-border'} flex items-center justify-center flex-shrink-0 transition-all">
          ${sel?'<span class="text-white text-xs font-bold">✓</span>':''}
        </div>
        <span class="text-sm leading-snug">${escH(o)}</span>
      </div>`;
    }).join('')}</div>`;
  }
  // ── text ──
  else if(q.type==='text'){
    inputHtml=`<textarea oninput="answers[${q.id}]=this.value" placeholder="Type your answer…"
      class="w-full bg-surface2 border border-border rounded-xl px-4 py-3.5 text-[#e8e8f0] text-sm outline-none resize-y min-h-[80px] focus:border-accent3 placeholder:text-muted transition-colors">${escH(answers[q.id]||'')}</textarea>`;
  }
  // ── rating ──
  else if(q.type==='rating'){
    const sc=parseInt(q.ratingScale)||5; const cur=answers[q.id];
    inputHtml=`<div class="flex gap-2 flex-wrap">${Array.from({length:sc},(_,i)=>{const v=i+1;const sel=String(cur)===String(v);
      return `<button onclick="selRat(${q.id},${v},this)" class="w-13 h-13 w-12 h-12 rounded-xl text-base font-heading font-bold transition-all border ${sel?'bg-yellow-400 border-yellow-400 text-[#1a1a00] scale-105':'bg-surface2 border-border text-muted hover:border-yellow-400 hover:text-yellow-400'}">${v}</button>`;
    }).join('')}</div>
    <div class="flex justify-between mt-2 text-[11px] text-muted"><span>${q.ratingMin||'Low'}</span><span>${q.ratingMax||'High'}</span></div>`;
  }
  // ── dropdown ──
  else if(q.type==='dropdown'){
    const opts=String(q.options).split('|').filter(Boolean); const cur=answers[q.id]||'';
    inputHtml=`<select onchange="answers[${q.id}]=this.value" class="w-full bg-surface2 border border-border rounded-xl px-4 py-3.5 text-[#e8e8f0] text-sm outline-none cursor-pointer appearance-none focus:border-sky-400 transition-colors">
      <option value="">— Select —</option>
      ${opts.map(o=>`<option value="${escH(o)}" ${cur===o?'selected':''} class="bg-surface2">${escH(o)}</option>`).join('')}
    </select>`;
  }
  // ── truefalse ──
  else if(q.type==='truefalse'){
    const cur=answers[q.id];
    inputHtml=`<div class="flex gap-3">
      <button onclick="selTF(${q.id},'TRUE',this)" class="flex-1 py-4 rounded-xl border-2 font-heading font-bold text-base transition-all ${cur==='TRUE'?'bg-green-400/10 border-green-400 text-green-400':'bg-surface2 border-border text-muted hover:border-accent3'}">✓ True</button>
      <button onclick="selTF(${q.id},'FALSE',this)" class="flex-1 py-4 rounded-xl border-2 font-heading font-bold text-base transition-all ${cur==='FALSE'?'bg-red-400/10 border-[#f87171] text-[#f87171]':'bg-surface2 border-border text-muted hover:border-accent3'}">✗ False</button>
    </div>`;
  }
  // ── ordering ──
  else if(q.type==='ordering') inputHtml=buildOrderingHTML(q);
  // ── matching ──
  else if(q.type==='matching') inputHtml=buildMatchingHTML(q);
  // ── hotspot ──
  else if(q.type==='hotspot') inputHtml=buildHotspotHTML(q);
  // ── mtf ──
  else if(q.type==='mtf') inputHtml=buildMtfHTML(q);
  // ── matrix ──
  else if(q.type==='matrix') inputHtml=buildMatrixHTML(q);

  $('questionContainer').innerHTML=`
    <div class="w-full max-w-2xl bg-surface border border-border rounded-2xl p-7 md:p-9 mb-6 relative overflow-hidden card-accent animate-fadeUp">
      <span class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${m.bg} ${m.text}">${m.icon} ${m.label}</span>
      <p class="font-heading text-xs text-muted font-semibold mb-2">Question ${currentIdx+1} of ${questions.length}</p>
      <p class="font-heading text-xl md:text-2xl font-bold leading-snug mb-6 tracking-tight">${escH(q.question)}${req}</p>
      ${imageBlock}
      ${inputHtml}
    </div>`;

  if(q.type==='ordering') initOrderingDrag(q);
  if(q.type==='matching') initMatchingDrag(q);

  // Nav button states
  $('prevBtn').style.opacity=currentIdx===0?'0.3':'1';
  $('prevBtn').disabled=currentIdx===0;
  $('prevBtn').style.display=(quizMode==='race')?'none':'';
  const last=currentIdx===questions.length-1;
  const nb=$('nextBtn');
  if(quizMode==='race'){
    nb.textContent='Check Answer ⚡';
    nb.className='flex-1 font-heading font-bold text-sm py-3 px-4 rounded-xl bg-accent2 text-white hover:bg-pink-500 transition-all hover:-translate-y-px';
  }else{
    nb.textContent=last?'✓ Submit':'Next →';
    nb.className=last
      ?'flex-1 font-heading font-bold text-sm py-3 px-4 rounded-xl bg-green-500 text-[#052e16] hover:bg-green-400 transition-all hover:-translate-y-px'
      :'flex-1 font-heading font-bold text-sm py-3 px-4 rounded-xl bg-accent text-white hover:bg-[#9580ff] transition-all hover:-translate-y-px';
  }
}

function updateProg(){
  const pct=Math.round((currentIdx/questions.length)*100);
  $('progressText').textContent=`Question ${currentIdx+1} of ${questions.length}`;
  $('progressPct').textContent=pct+'%';
  $('progressFill').style.width=pct+'%';
}

// ═══════════════════════════════════════════════════
//  ORDERING — build + drag
// ═══════════════════════════════════════════════════
function buildOrderingHTML(q){
  const items=String(q.options).split('|').filter(Boolean);
  let ordered=answers[q.id]?answers[q.id].split('|'):(answers[q.id]=shuffle(items).join('|'),answers[q.id].split('|'));
  return `<p class="text-xs text-muted mb-3 flex items-center gap-1.5"><span class="text-accent opacity-60 text-sm">☰</span>Drag items up or down to reorder</p>
  <div class="flex flex-col gap-2" id="orderList_${q.id}" data-qid="${q.id}">
    ${ordered.map((item,i)=>`
      <div class="flex items-center gap-3 px-4 py-3.5 bg-surface2 border-2 border-border rounded-xl cursor-grab select-none transition-all hover:border-orange-400 hover:bg-orange-400/5" draggable="true" data-item="${escH(item)}" data-idx="${i}">
        <span class="text-muted text-lg leading-none cursor-grab" style="letter-spacing:-2px">⠿</span>
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading font-bold flex-shrink-0" style="background:rgba(251,146,60,.15);border:1px solid rgba(251,146,60,.3);color:#fb923c">${i+1}</div>
        <span class="text-sm flex-1 leading-snug">${escH(item)}</span>
      </div>`).join('')}
  </div>`;
}

function initOrderingDrag(q){
  const list=document.getElementById(`orderList_${q.id}`);if(!list)return;
  let dragSrc=null;
  list.querySelectorAll('[draggable]').forEach(item=>{
    item.addEventListener('dragstart',e=>{dragSrc=item;item.classList.add('dragging','opacity-40');e.dataTransfer.effectAllowed='move';});
    item.addEventListener('dragend',()=>{item.classList.remove('dragging','opacity-40');list.querySelectorAll('[draggable]').forEach(i=>i.classList.remove('drag-over'));});
    item.addEventListener('dragover',e=>{e.preventDefault();if(item!==dragSrc)item.classList.add('drag-over');});
    item.addEventListener('dragleave',()=>item.classList.remove('drag-over'));
    item.addEventListener('drop',e=>{e.preventDefault();item.classList.remove('drag-over');if(dragSrc&&dragSrc!==item){const all=[...list.querySelectorAll('[draggable]')];if(all.indexOf(dragSrc)<all.indexOf(item))list.insertBefore(dragSrc,item.nextSibling);else list.insertBefore(dragSrc,item);updOrdNums(list,q.id);}});
  });
  // touch
  let tItem=null,tClone=null,tOX=0,tOY=0;
  list.querySelectorAll('[draggable]').forEach(item=>{
    item.addEventListener('touchstart',e=>{tItem=item;const t=e.touches[0];const r=item.getBoundingClientRect();tOX=t.clientX-r.left;tOY=t.clientY-r.top;tClone=item.cloneNode(true);Object.assign(tClone.style,{position:'fixed',zIndex:9999,width:r.width+'px',opacity:'0.85',pointerEvents:'none',top:t.clientY-tOY+'px',left:t.clientX-tOX+'px',boxShadow:'0 8px 30px rgba(0,0,0,.4)'});document.body.appendChild(tClone);item.classList.add('tdragging');e.preventDefault();},{passive:false});
    item.addEventListener('touchmove',e=>{if(!tItem)return;const t=e.touches[0];if(tClone){tClone.style.top=t.clientY-tOY+'px';tClone.style.left=t.clientX-tOX+'px';}if(tClone)tClone.style.pointerEvents='none';const un=document.elementFromPoint(t.clientX,t.clientY);if(tClone)tClone.style.pointerEvents='';const tgt=un?.closest('[data-item]');list.querySelectorAll('[draggable]').forEach(i=>i.classList.remove('drag-over'));if(tgt&&tgt!==tItem&&list.contains(tgt))tgt.classList.add('drag-over');e.preventDefault();},{passive:false});
    item.addEventListener('touchend',e=>{if(!tItem)return;const t=e.changedTouches[0];if(tClone){tClone.remove();tClone=null;}tItem.classList.remove('tdragging');const un=document.elementFromPoint(t.clientX,t.clientY);const tgt=un?.closest('[data-item]');list.querySelectorAll('[draggable]').forEach(i=>i.classList.remove('drag-over'));if(tgt&&tgt!==tItem&&list.contains(tgt)){const all=[...list.querySelectorAll('[draggable]')];if(all.indexOf(tItem)<all.indexOf(tgt))list.insertBefore(tItem,tgt.nextSibling);else list.insertBefore(tItem,tgt);updOrdNums(list,q.id);}tItem=null;});
  });
}
function updOrdNums(list,qid){const items=[...list.querySelectorAll('[draggable]')];items.forEach((item,i)=>{item.querySelectorAll('div')[1].textContent=i+1;item.dataset.idx=i;});answers[qid]=items.map(i=>i.dataset.item).join('|');}

// ═══════════════════════════════════════════════════
//  MATCHING — build + drag
// ═══════════════════════════════════════════════════
function buildMatchingHTML(q){
  const pairs=String(q.options).split('|').filter(Boolean).map(p=>{const[pr,an]=p.split('::');return{prompt:pr?.trim()||'',answer:an?.trim()||''};});
  const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const savedMap=parseMatchingAnswer(answers[q.id]||'');
  const usedAnswers=Object.values(savedMap);
  const shuffledAnswers=shuffle(pairs.map(p=>p.answer));
  const promptsHTML=pairs.map((p,i)=>`
    <div class="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-violet-400/25 min-h-[50px] text-sm" style="background:rgba(192,132,252,.06)">
      <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-heading font-bold flex-shrink-0" style="background:rgba(192,132,252,.2);color:#c084fc">${letters[i]}</div>
      <span>${escH(p.prompt)}</span>
    </div>`).join('');
  const dropsHTML=pairs.map((p,i)=>{const matched=savedMap[p.prompt]||'';
    return `<div class="min-h-[50px] rounded-xl border-2 ${matched?'border-solid border-violet-400/40':'border-dashed border-border'} bg-surface2 flex items-center px-2.5 gap-2 transition-all"
      id="drop_${q.id}_${i}" data-qid="${q.id}" data-prompt="${escH(p.prompt)}" data-idx="${i}"
      ondragover="dzOver(event)" ondragleave="dzLeave(event)" ondrop="dzDrop(event)">
      ${matched
        ?`<span class="text-[11px] font-bold px-2 py-0.5 rounded flex-shrink-0" style="background:rgba(192,132,252,.15);color:#c084fc">${letters[i]}</span>
           <span class="text-sm flex-1">${escH(matched)}</span>
           <button onclick="removeMatch(${q.id},${i},'${escJ(matched)}')" class="text-muted hover:text-red-400 text-base px-1 flex-shrink-0 transition-colors">✕</button>`
        :`<span class="text-xs text-muted italic">Drop answer here</span>`}
    </div>`;}).join('');
  const bankHTML=shuffledAnswers.map(a=>`
    <div class="px-3.5 py-2 bg-surface2 border-2 border-border rounded-lg text-sm cursor-grab select-none transition-all hover:border-violet-400 hover:bg-violet-400/5 bank-chip"
      draggable="true" data-answer="${escH(a)}" ${usedAnswers.includes(a)?'style="opacity:.3;pointer-events:none;border-style:dashed"':''}
      ondragstart="chipDragStart(event,${q.id})" ondragend="chipDragEnd(event)">${escH(a)}</div>`).join('');
  return `<p class="text-xs text-muted mb-4 leading-relaxed">Drag each answer chip onto the matching prompt. Tap ✕ to remove.</p>
  <div class="grid grid-cols-2 gap-4 mb-4">
    <div><p class="font-heading text-[10px] font-bold uppercase tracking-widest text-muted mb-2.5">Prompts</p><div class="flex flex-col gap-2">${promptsHTML}</div></div>
    <div><p class="font-heading text-[10px] font-bold uppercase tracking-widest text-muted mb-2.5">Drop Here</p><div class="flex flex-col gap-2">${dropsHTML}</div></div>
  </div>
  <div><p class="font-heading text-[10px] font-bold uppercase tracking-widest text-muted mb-2.5">Answer Bank</p><div class="flex flex-wrap gap-2" id="bank_${q.id}">${bankHTML}</div></div>`;
}
function initMatchingDrag(q){
  const bank=document.getElementById(`bank_${q.id}`);if(!bank)return;
  let tChip=null,tClone=null,tOX=0,tOY=0;
  bank.querySelectorAll('.bank-chip').forEach(chip=>{
    chip.addEventListener('touchstart',e=>{if(chip.style.pointerEvents==='none')return;tChip=chip;const t=e.touches[0];const r=chip.getBoundingClientRect();tOX=t.clientX-r.left;tOY=t.clientY-r.top;tClone=chip.cloneNode(true);Object.assign(tClone.style,{position:'fixed',zIndex:9999,opacity:'0.85',pointerEvents:'none',top:t.clientY-tOY+'px',left:t.clientX-tOX+'px',boxShadow:'0 8px 30px rgba(0,0,0,.4)'});document.body.appendChild(tClone);chip.style.opacity='.35';e.preventDefault();},{passive:false});
    chip.addEventListener('touchmove',e=>{if(!tChip)return;const t=e.touches[0];if(tClone){tClone.style.top=t.clientY-tOY+'px';tClone.style.left=t.clientX-tOX+'px';}if(tClone)tClone.style.pointerEvents='none';const un=document.elementFromPoint(t.clientX,t.clientY);if(tClone)tClone.style.pointerEvents='';document.querySelectorAll('[id^="drop_"]').forEach(z=>z.classList.remove('dz-over'));const zone=un?.closest('[data-prompt]');if(zone)zone.classList.add('dz-over');e.preventDefault();},{passive:false});
    chip.addEventListener('touchend',e=>{if(!tChip)return;const t=e.changedTouches[0];if(tClone){tClone.remove();tClone=null;}tChip.style.opacity='';document.querySelectorAll('[id^="drop_"]').forEach(z=>z.classList.remove('dz-over'));const un=document.elementFromPoint(t.clientX,t.clientY);const zone=un?.closest('[data-prompt]');if(zone)placeMatch(parseInt(zone.dataset.qid),parseInt(zone.dataset.idx),tChip.dataset.answer);tChip=null;});
  });
}
function chipDragStart(e,qid){e.dataTransfer.setData('text/plain',e.target.dataset.answer);e.target.style.opacity='.35';}
function chipDragEnd(e){e.target.style.opacity='';}
function dzOver(e){e.preventDefault();e.currentTarget.classList.add('dz-over');}
function dzLeave(e){e.currentTarget.classList.remove('dz-over');}
function dzDrop(e){e.preventDefault();e.currentTarget.classList.remove('dz-over');placeMatch(parseInt(e.currentTarget.dataset.qid),parseInt(e.currentTarget.dataset.idx),e.dataTransfer.getData('text/plain'));}
function placeMatch(qid,idx,answerVal){
  const q=questions.find(q=>String(q.id)===String(qid));if(!q)return;
  const pairs=String(q.options).split('|').filter(Boolean).map(p=>{const[pr,an]=p.split('::');return{prompt:pr?.trim()||'',answer:an?.trim()||''};});
  const prompt=pairs[idx]?.prompt;if(!prompt)return;
  const map=parseMatchingAnswer(answers[qid]||'');
  Object.keys(map).forEach(k=>{if(map[k]===answerVal)delete map[k];});
  map[prompt]=answerVal;
  answers[qid]=Object.entries(map).map(([k,v])=>`${k}::${v}`).join('|');
  renderQ();
}
function removeMatch(qid,idx,answerVal){
  const q=questions.find(q=>String(q.id)===String(qid));if(!q)return;
  const pairs=String(q.options).split('|').filter(Boolean).map(p=>{const[pr,an]=p.split('::');return{prompt:pr?.trim()||'',answer:an?.trim()||''};});
  const prompt=pairs[idx]?.prompt;if(!prompt)return;
  const map=parseMatchingAnswer(answers[qid]||'');
  delete map[prompt];
  answers[qid]=Object.entries(map).map(([k,v])=>`${k}::${v}`).join('|');
  renderQ();
}
function parseMatchingAnswer(str){const map={};if(!str)return map;str.split('|').forEach(pair=>{const[k,v]=pair.split('::');if(k&&v)map[k.trim()]=v.trim();});return map;}

// ═══════════════════════════════════════════════════
//  HOTSPOT — build + interact
// ═══════════════════════════════════════════════════
function buildHotspotHTML(q){
  const imgUrl=String(q.imageUrl||'').trim();
  if(!imgUrl)return`<div class="p-4 rounded-xl text-sm text-red-400 border border-red-400/30 bg-red-400/5">⚠️ hotspot type requires an imageUrl column value.</div>`;
  const selected=answers[q.id]||'';
  const zones=String(q.options||'').split('|').filter(Boolean).map(z=>{const ci=z.indexOf(':');if(ci===-1)return null;const lbl=z.substring(0,ci).trim();const c=z.substring(ci+1).trim().split(',');if(c.length<4)return null;return{label:lbl,left:c[0].trim(),top:c[1].trim(),width:c[2].trim(),height:c[3].trim()};}).filter(Boolean);
  const zonesHTML=zones.map(z=>`
    <div class="hs-zone ${selected===z.label?'hs-sel':''}" style="left:${z.left};top:${z.top};width:${z.width};height:${z.height}" onclick="selHotspot(${q.id},'${escJ(z.label)}',this)">
      <div class="hs-label">${escH(z.label)}</div>
    </div>`).join('');
  const selLabel=selected
    ?`<div class="mt-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-center text-pink-400 border border-pink-400/30 bg-pink-400/8">✓ Selected: <strong>${escH(selected)}</strong></div>`
    :`<div class="mt-3 px-4 py-2.5 rounded-xl text-sm text-center text-muted italic border border-border">No zone selected yet — click on the image</div>`;
  return `<div class="text-xs text-muted mb-3 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-pink-400/20 bg-pink-400/5">👆 Click on the correct area of the image below</div>
  <div class="relative inline-block w-full rounded-xl overflow-hidden border-2 border-border bg-surface2 cursor-crosshair">
    <img src="${escH(imgUrl)}" alt="Hotspot" draggable="false" class="w-full h-auto block max-h-[420px] object-contain select-none transition-opacity duration-300" style="opacity:0" onload="this.style.opacity=1"
      onerror="this.parentNode.innerHTML='<div class=\\'p-10 text-center text-[#f87171] text-sm\\'>⚠️ Image failed to load</div>'"/>
    ${zonesHTML}
  </div>${selLabel}`;
}
function selHotspot(qid,label,el){
  answers[qid]=label;
  el.closest('.relative').querySelectorAll('.hs-zone').forEach(z=>z.classList.remove('hs-sel'));
  el.classList.add('hs-sel');
  const card=el.closest('.card-accent');
  if(card){const lbl=card.querySelector('[class*="No zone"]')||card.querySelector('[class*="Selected"]');
    if(lbl){lbl.className='mt-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-center text-pink-400 border border-pink-400/30 bg-pink-400/8';lbl.innerHTML=`✓ Selected: <strong>${escH(label)}</strong>`;}}
}

// ═══════════════════════════════════════════════════
//  MTF — Multiple True/False
// ═══════════════════════════════════════════════════
function buildMtfHTML(q){
  const stmts=String(q.options).split('|').filter(Boolean);
  const cur=answers[q.id]?answers[q.id].split('|'):[];
  return `<div class="flex flex-col gap-3">${stmts.map((stmt,i)=>{
    const val=cur[i]||'';
    return `<div class="bg-surface2 border ${val?'border-teal-400/35':'border-border'} rounded-xl px-4 py-3.5 transition-colors" id="mtfrow_${q.id}_${i}">
      <p class="text-sm mb-3 leading-snug">${escH(stmt)}</p>
      <div class="flex gap-2.5">
        <button onclick="selMtf(${q.id},${i},'TRUE',this)" class="flex-1 py-2.5 rounded-lg border-2 font-heading font-bold text-sm transition-all ${val==='TRUE'?'bg-green-400/10 border-green-400 text-green-400':'bg-surface border-border text-muted hover:border-accent3'}">✓ True</button>
        <button onclick="selMtf(${q.id},${i},'FALSE',this)" class="flex-1 py-2.5 rounded-lg border-2 font-heading font-bold text-sm transition-all ${val==='FALSE'?'bg-red-400/10 border-[#f87171] text-[#f87171]':'bg-surface border-border text-muted hover:border-accent3'}">✗ False</button>
      </div>
    </div>`;}).join('')}</div>`;
}
function selMtf(qid,idx,val,btn){
  const q=questions.find(q=>String(q.id)===String(qid));if(!q)return;
  const stmts=String(q.options).split('|').filter(Boolean);
  const cur=answers[qid]?answers[qid].split('|'):Array(stmts.length).fill('');
  while(cur.length<stmts.length)cur.push('');
  cur[idx]=val; answers[qid]=cur.join('|');
  const row=document.getElementById(`mtfrow_${qid}_${idx}`);
  if(row){
    row.className=`bg-surface2 border border-teal-400/35 rounded-xl px-4 py-3.5 transition-colors`;
    row.querySelectorAll('button').forEach(b=>{b.className=`flex-1 py-2.5 rounded-lg border-2 font-heading font-bold text-sm transition-all bg-surface border-border text-muted hover:border-accent3`;});
    btn.className=`flex-1 py-2.5 rounded-lg border-2 font-heading font-bold text-sm transition-all ${val==='TRUE'?'bg-green-400/10 border-green-400 text-green-400':'bg-red-400/10 border-[#f87171] text-[#f87171]'}`;
  }
}

// ═══════════════════════════════════════════════════
//  MATRIX — Grid choice
// ═══════════════════════════════════════════════════
function buildMatrixHTML(q){
  const rows=String(q.options).split('|').filter(Boolean);
  const cols=String(q.matrixCols||'').split('|').filter(Boolean);
  if(!cols.length)return`<div class="text-red-400 text-sm p-3">⚠️ matrix type requires a matrixCols column.</div>`;
  const saved=parseMatchingAnswer(answers[q.id]||'');
  const headerCells=cols.map(c=>`<th class="px-2 py-2.5 text-center font-heading text-[10px] font-bold uppercase tracking-wide text-amber-400 border-b-2 border-border border-r border-border last:border-r-0 whitespace-normal min-w-[48px]">${escH(c)}</th>`).join('');
  const bodyRows=rows.map(row=>{const chosen=saved[row]||'';
    return `<tr class="border-b border-border last:border-b-0 hover:bg-amber-400/5 transition-colors" id="mxrow_${q.id}_${CSS.escape(row)}">
      <td class="px-3.5 py-3 text-sm border-r border-border">${escH(row)}</td>
      ${cols.map(col=>`<td class="px-2 py-3 text-center border-r border-border last:border-r-0">
        <div onclick="selMatrix(${q.id},'${escJ(row)}','${escJ(col)}',this)"
          class="w-5 h-5 rounded-full border-2 mx-auto cursor-pointer transition-all ${chosen===col?'border-amber-400 bg-amber-400':'border-border hover:border-amber-400'} flex items-center justify-center">
          ${chosen===col?'<div class="w-2 h-2 rounded-full bg-white"></div>':''}
        </div>
      </td>`).join('')}
    </tr>`;}).join('');
  return `<div class="w-full overflow-x-auto rounded-xl border border-border">
    <table class="w-full border-collapse min-w-[380px]">
      <thead class="bg-surface2"><tr><th class="px-3.5 py-2.5 border-b-2 border-border border-r border-border text-left w-[35%]"></th>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </div>`;
}
function selMatrix(qid,rowLabel,colLabel,dot){
  const map=parseMatchingAnswer(answers[qid]||'');
  map[rowLabel]=colLabel;
  answers[qid]=Object.entries(map).map(([k,v])=>`${k}::${v}`).join('|');
  const rowEl=document.getElementById(`mxrow_${qid}_${CSS.escape(rowLabel)}`);
  if(rowEl){
    rowEl.querySelectorAll('[onclick]').forEach(d=>{d.className='w-5 h-5 rounded-full border-2 mx-auto cursor-pointer transition-all border-border hover:border-amber-400 flex items-center justify-center';d.innerHTML='';});
    dot.className='w-5 h-5 rounded-full border-2 mx-auto cursor-pointer transition-all border-amber-400 bg-amber-400 flex items-center justify-center';
    dot.innerHTML='<div class="w-2 h-2 rounded-full bg-white"></div>';
  }
}

// ═══════════════════════════════════════════════════
//  STANDARD INTERACTIONS
// ═══════════════════════════════════════════════════
function selR(id,val,el){
  answers[id]=val;
  el.closest('.flex.flex-col').querySelectorAll('[onclick]').forEach(e=>{
    e.className=e.className.replace('border-accent bg-accent/10','border-border');
    e.querySelector('div').className=e.querySelector('div').className.replace('border-accent bg-accent','border-border')+' ';
    e.querySelector('div').innerHTML='';
  });
  el.className=el.className.replace('border-border','border-accent bg-accent/10');
  const circle=el.querySelector('div');
  circle.className=circle.className.replace('border-border','border-accent bg-accent');
  circle.innerHTML='<div class="w-2 h-2 rounded-full bg-white"></div>';
}
function selC(id,val,el){
  const cur=answers[id]?answers[id].split('|'):[];
  const i=cur.indexOf(val);
  if(i===-1)cur.push(val);else cur.splice(i,1);
  answers[id]=cur.join('|');
  const sel=cur.includes(val);
  el.className=el.className.replace(sel?'border-border':'border-accent2 bg-accent2/10',sel?'border-accent2 bg-accent2/10':'border-border');
  const box=el.querySelector('div');
  box.className=box.className.replace(sel?'border-border':'border-accent2 bg-accent2',sel?'border-accent2 bg-accent2':'border-border');
  box.innerHTML=sel?'<span class="text-white text-xs font-bold">✓</span>':'';
}
function selRat(id,val,el){
  answers[id]=val;
  el.closest('.flex.gap-2').querySelectorAll('button').forEach(b=>{b.className=b.className.replace('bg-yellow-400 border-yellow-400 text-[#1a1a00] scale-105','bg-surface2 border-border text-muted hover:border-yellow-400 hover:text-yellow-400');});
  el.className=el.className.replace('bg-surface2 border-border text-muted hover:border-yellow-400 hover:text-yellow-400','bg-yellow-400 border-yellow-400 text-[#1a1a00] scale-105');
}
function selTF(id,val,el){
  answers[id]=val;
  el.closest('.flex.gap-3').querySelectorAll('button').forEach(b=>{
    b.className='flex-1 py-4 rounded-xl border-2 font-heading font-bold text-base transition-all bg-surface2 border-border text-muted hover:border-accent3';
  });
  el.className=`flex-1 py-4 rounded-xl border-2 font-heading font-bold text-base transition-all ${val==='TRUE'?'bg-green-400/10 border-green-400 text-green-400':'bg-red-400/10 border-[#f87171] text-[#f87171]'}`;
}

// ═══════════════════════════════════════════════════
//  NAVIGATE
// ═══════════════════════════════════════════════════
function navigate(dir){
  const q=questions[currentIdx];
  if(dir===1){
    // Validate required
    if(String(q.required).toUpperCase()==='TRUE'){
      let missing=false;
      if(q.type==='mtf'){const stmts=String(q.options).split('|').filter(Boolean);const cur=answers[q.id]?answers[q.id].split('|'):[];missing=stmts.some((_,i)=>!cur[i]);}
      else if(q.type==='matrix'){const rows=String(q.options).split('|').filter(Boolean);const saved=parseMatchingAnswer(answers[q.id]||'');missing=rows.some(r=>!saved[r]);}
      else missing=!answers[q.id]||!String(answers[q.id]).trim();
      if(missing){showStatus('⚠️ This question is required — please answer all parts.','error');setTimeout(hideStatus,2400);return;}
    }

    // ── Race mode: check answer immediately ──
    if(quizMode==='race'){
      const sc=scoreQuestion(q);
      if(sc.hasCorrect){
        if(sc.isCorrect){
          // Correct — show green flash then move forward
          raceCorrectCount++;
          showRaceFeedback(true, raceCorrectCount, questions.length);
          setTimeout(()=>{
            hideRaceFeedback();
            if(currentIdx===questions.length-1){submit();return;}
            currentIdx++; hideStatus(); renderQ();
          },1200);
        }else{
          // Wrong — show red flash then restart
          showRaceFeedback(false, raceCorrectCount, questions.length);
          setTimeout(()=>{
            hideRaceFeedback();
            // Reset and restart from question 1 with a new shuffle
            currentIdx=0; answers={}; raceCorrectCount=0;
            questions=shuffle([...questions]);
            hideStatus(); renderQ();
          },2000);
        }
        return; // don't fall through
      }
    }

    // Normal / Train / Test navigation
    if(currentIdx===questions.length-1){submit();return;}
    currentIdx++;
  }else{
    if(currentIdx===0)return;
    currentIdx--;
  }
  hideStatus();renderQ();
}

function showRaceFeedback(correct, streak, total){
  const el=$('raceFeedback');
  $('raceFeedbackIcon').textContent=correct?'✅':'❌';
  $('raceFeedbackText').textContent=correct?`Correct! ${streak} of ${total}`:'Wrong! Starting over...';
  $('raceFeedbackText').style.color=correct?'#4ade80':'#f87171';
  $('raceFeedbackSub').textContent=correct
    ?streak===total?'🏆 Last one — submitting!':'Keep going!'
    :`You had ${streak} correct. Try again!`;
  el.style.display='flex';
}
function hideRaceFeedback(){$('raceFeedback').style.display='none';}

// ═══════════════════════════════════════════════════
//  SCORE ENGINE
// ═══════════════════════════════════════════════════
function scoreQuestion(q){
  const userAns=answers[q.id]||'';
  const hasCorrect=q.correct&&String(q.correct).trim()!=='';
  if(!hasCorrect)return{hasCorrect:false,isCorrect:null,userAns,correctAns:''};
  let isCorrect=false;
  if(q.type==='ordering')isCorrect=userAns.trim()===String(q.correct).trim();
  else if(q.type==='matching'||q.type==='matrix'){const u=parseMatchingAnswer(userAns),c=parseMatchingAnswer(String(q.correct));isCorrect=Object.keys(c).length>0&&Object.keys(c).every(k=>u[k]&&u[k].toLowerCase()===c[k].toLowerCase())&&Object.keys(u).length===Object.keys(c).length;}
  else if(q.type==='mtf'){const u=userAns.split('|').map(s=>s.trim().toUpperCase()),c=String(q.correct).split('|').map(s=>s.trim().toUpperCase());isCorrect=c.length>0&&c.every((v,i)=>u[i]===v);}
  else if(q.type==='checkbox'){const norm=s=>String(s).trim().toLowerCase().split('|').sort().join('|');isCorrect=norm(userAns)===norm(q.correct);}
  else isCorrect=String(userAns).trim().toLowerCase()===String(q.correct).trim().toLowerCase();
  return{hasCorrect,isCorrect,userAns,correctAns:String(q.correct)};
}

// ═══════════════════════════════════════════════════
//  SUBMIT
// ═══════════════════════════════════════════════════
async function submit(){
  showStatus('Saving your responses<span class="ldots"></span>','loading');
  hide('navRow');
  let correct=0,wrong=0,total=0;
  const reviewData=questions.map(q=>{const sc=scoreQuestion(q);if(sc.hasCorrect){total++;if(sc.isCorrect)correct++;else wrong++;}return{q,...sc};});
  const pct=total>0?Math.round((correct/total)*100):null;
  const grade=pct===null?null:pct>=90?'A':pct>=75?'B':pct>=60?'C':'D';
  const gradeLabel={A:'🏆 Excellent!',B:'👍 Good Job!',C:'📚 Keep Practising',D:'💪 Try Again'};
  const payload={name:respondentName,testTitle:selectedTest?.title||'',score:pct!==null?pct+'%':'N/A',correct,wrong,total,grade:grade||'N/A',answers:{},timestamp:new Date().toISOString()};
  questions.forEach(q=>{payload.answers[`q${q.id}_${String(q.question).substring(0,18).replace(/\s+/g,'_')}`]=answers[q.id]||'';});
  let saved=false;
  try{
    await fetch(SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload)});
    saved=true;
  }catch(e){}
  setTimeout(()=>{
    hideStatus();$('questionContainer').innerHTML='';hide('progressBar');hide('quizHeader');show('resultScreen');
    const badges={A:'🏆',B:'⭐',C:'📖',D:'💡',null:'🎉'};
    $('resultBadge').textContent=badges[grade]||'🎉';
    $('resultTestName').textContent=`${selectedTest?.icon||'📝'} ${selectedTest?.title||'Test'}`;
    $('resultTitle').textContent=grade?gradeLabel[grade]:'All Done!';
    $('resultSub').textContent=`Hi ${respondentName.split(' ')[0]}! You've completed the test.`;
    const ss=$('resultSaveStatus');
    ss.textContent=saved?'✅ Responses saved to Google Sheets':'📋 Not saved — check your Apps Script deployment.';
    ss.style.color=saved?'#4ade80':'#7a7a9a';
    if(pct!==null){
      show('scoreCard');
      setTimeout(()=>{const circ=2*Math.PI*52;$('ringFill').style.strokeDasharray=`${(pct/100)*circ} ${circ}`;const rc={A:'#4ade80',B:'#7c6af7',C:'#fbbf24',D:'#f87171'};$('ringFill').style.stroke=rc[grade];$('ringPct').style.color=rc[grade];},120);
      $('ringPct').textContent=pct+'%';$('statCorrect').textContent=correct;$('statWrong').textContent=wrong;$('statTotal').textContent=total;
      const gradeStyles={A:'bg-green-400/15 text-green-400 border border-green-400/40',B:'bg-accent/15 text-accent border border-accent/40',C:'bg-yellow-400/15 text-yellow-400 border border-yellow-400/40',D:'bg-red-400/15 text-[#f87171] border border-red-400/40'};
      $('gradeBadge').textContent=`Grade ${grade} — ${gradeLabel[grade]}`;
      $('gradeBadge').className=`font-heading font-extrabold text-base px-6 py-2 rounded-full ${gradeStyles[grade]}`;
    }else hide('scoreCard');
    buildReview(reviewData);show('reviewSection');
  },900);
}

// ═══════════════════════════════════════════════════
//  ANSWER REVIEW
// ═══════════════════════════════════════════════════
function buildReview(reviewData){
  $('reviewList').innerHTML=reviewData.map((item,i)=>{
    const{q,userAns,isCorrect,hasCorrect,correctAns}=item;
    let icon,iconCls;
    if(!hasCorrect){icon='💬';iconCls='bg-accent/10 text-accent';}
    else if(isCorrect){icon='✓';iconCls='bg-green-400/15 text-green-400';}
    else{icon='✗';iconCls='bg-red-400/15 text-[#f87171]';}

    let body='';
    if(q.type==='ordering'){
      const u=userAns?userAns.split('|'):[];const c=correctAns?correctAns.split('|'):[];
      body=`<div class="ml-10 mt-1"><p class="text-xs text-muted mb-2">Your order:</p>${u.map((it,idx)=>{const ok=it===c[idx];return`<div class="flex items-center gap-2 mb-1.5"><span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style="background:${ok?'rgba(74,222,128,.15)':'rgba(248,113,113,.15)'};color:${ok?'#4ade80':'#f87171'}">${idx+1}</span><span class="text-sm" style="color:${ok?'#4ade80':'#f87171'}">${escH(it)}</span>${!ok&&c[idx]?`<span class="text-xs text-muted">← should be: <strong style="color:#4ade80">${escH(c[idx])}</strong></span>`:''}</div>`;}).join('')}</div>`;
    }else if(q.type==='matching'||q.type==='matrix'){
      const u=parseMatchingAnswer(userAns);const c=parseMatchingAnswer(correctAns);
      const hasC=Object.keys(c).length>0;
      const pairs=hasC?Object.entries(c):Object.entries(u);
      body=`<div class="ml-10 mt-1 flex flex-col gap-1.5">${pairs.map(([prompt,ans])=>{const ua=u[prompt]||'';const ok=hasC?ua.toLowerCase()===ans.toLowerCase():false;return`<div class="flex items-start gap-2 text-sm"><div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style="background:${!hasC?'#7a7a9a':ok?'#4ade80':'#f87171'}"></div><div><span class="text-muted">${escH(prompt)}</span><span class="text-muted mx-1.5">→</span><span style="color:${!hasC?'#e8e8f0':ok?'#4ade80':'#f87171'}">${escH(ua||'—')}</span>${hasC&&!ok&&ans?`<span class="text-xs text-muted ml-1">(correct: <strong style="color:#4ade80">${escH(ans)}</strong>)</span>`:''}</div></div>`;}).join('')}</div>`;
    }else if(q.type==='mtf'){
      const stmts=String(q.options).split('|').filter(Boolean);
      const u=userAns?userAns.split('|'):[];const c=correctAns?correctAns.split('|'):[];
      body=`<div class="ml-10 mt-1 flex flex-col gap-1.5">${stmts.map((stmt,idx)=>{const ua=(u[idx]||'').toUpperCase();const ca=(c[idx]||'').toUpperCase();const ok=ua===ca&&ca!=='';return`<div class="flex items-start gap-2 text-sm"><div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style="background:${ok?'#4ade80':'#f87171'}"></div><div><span class="text-muted">${escH(stmt)}</span><br><span class="text-xs" style="color:${ok?'#4ade80':'#f87171'}">You: ${ua||'—'}</span>${!ok&&ca?`<span class="text-xs text-muted ml-2">Correct: <strong style="color:#4ade80">${ca}</strong></span>`:''}</div></div>`;}).join('')}</div>`;
    }else{
      const dispAns=userAns?escH(userAns.replace(/\|/g,' · ')):'<em class="text-muted">No answer</em>';
      const valStyle=!hasCorrect?'background:#1c1c28;color:#7a7a9a':isCorrect?'background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.2)':'background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.2);text-decoration:line-through';
      let correctRow='';
      if(hasCorrect&&!isCorrect)correctRow=`<div class="flex items-start gap-2 mt-1.5"><span class="text-[10px] font-bold uppercase tracking-wider min-w-[60px] pt-1 text-green-400">Correct</span><span class="text-xs px-2.5 py-1 rounded-md" style="background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.2)">${escH(String(correctAns).replace(/\|/g,' · '))}</span></div>`;
      body=`<div class="ml-10 mt-2">
        <div class="flex items-start gap-2"><span class="text-[10px] font-bold uppercase tracking-wider min-w-[60px] pt-1 text-muted">${q.type==='hotspot'?'Clicked':'Your Ans'}</span><span class="text-xs px-2.5 py-1 rounded-md" style="${valStyle}">${dispAns}</span></div>
        ${correctRow}
      </div>`;
    }

    return `<div class="px-6 py-5 border-b border-border last:border-b-0">
      <div class="flex items-start gap-3 mb-2">
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${iconCls}">${icon}</div>
        <p class="font-heading text-sm font-semibold leading-snug flex-1">Q${i+1}. ${escH(q.question)}</p>
      </div>
      ${body}
    </div>`;
  }).join('');
}

function toggleReview(){
  const list=$('reviewList'),btn=$('toggleReviewBtn');
  const open=list.style.display!=='none';
  list.style.display=open?'none':'block';
  btn.textContent=open?'Show Details ▾':'Hide Details ▴';
}

// ═══════════════════════════════════════════════════
//  SCREEN NAVIGATION
// ═══════════════════════════════════════════════════
function backToSelector(){
  hideAll();hide('scoreCard');show('testSelector');
  document.querySelectorAll('[id^="tc_"]').forEach(c=>{
    c.style.borderColor='';
    c.querySelector('.tc-check')?.classList.add('opacity-0');
    c.querySelector('.tc-check')?.classList.remove('opacity-100');
  });
  const btn=$('startTestBtn');
  btn.classList.add('opacity-40','pointer-events-none');
  btn.textContent='Continue →';
  selectedTest=null; quizMode='train'; raceCorrectCount=0;
}
function retakeSame(){
  hide('resultScreen');
  // Go back to mode screen so they can change mode or keep the same
  $('modeTestBadge').textContent=`${selectedTest.icon||'📝'} ${selectedTest.title}`;
  ['train','test','race'].forEach(m=>resetModeCard(m));
  $('startModeBtn').classList.add('opacity-40','pointer-events-none');
  quizMode='train'; raceCorrectCount=0;
  show('modeScreen');
}
