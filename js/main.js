// ============================================================
//  main.js — FILE THAM KHẢO (không được load trực tiếp)
//
//  File này chứa toàn bộ logic quiz gộp lại từ các module:
//    - js/utils.js
//    - js/quiz-render.js
//    - js/quiz.js
//
//  tests.html KHÔNG load file này.
//  Load order thực tế trong tests.html:
//    1. config.js
//    2. demo-data.js
//    3. utils.js
//    4. quiz-render.js
//    5. quiz.js
//
//  Giữ file này để:
//    - Tham khảo toàn bộ logic ở một chỗ
//    - Dùng làm backup nếu muốn quay lại single-file
//    - So sánh khi debug
// ============================================================


// ============================================================
//  utils.js — Các hàm tiện ích dùng chung
// ============================================================

// ── DOM helpers ──
const $ = id => document.getElementById(id);
const show     = id => { const e=$(id); if(e) e.style.display='block'; };
const hide     = id => { const e=$(id); if(e) e.style.display='none'; };
const showFlex = id => { const e=$(id); if(e) e.style.display='flex'; };

// ── String helpers ──
function escH(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escJ(s) {
  return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
}

// ── Array shuffle ──
function shuffle(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// ── Status message ──
function showStatus(msg, type) {
  const el = $('statusMsg'); if (!el) return;
  el.innerHTML = msg;
  const styles = {
    error:   'background:rgba(220,38,38,.07);border:1px solid rgba(220,38,38,.2);color:var(--error)',
    loading: 'background:rgba(37,99,235,.07);border:1px solid rgba(37,99,235,.2);color:var(--accent)',
  };
  el.style.cssText = `display:block;padding:14px 18px;border-radius:12px;font-size:14px;margin-bottom:16px;${styles[type]||styles.loading}`;
}
function hideStatus() {
  const el = $('statusMsg'); if (el) el.style.display = 'none';
}

// ============================================================
//  quiz-render.js — Render giao diện quiz
//  Phụ thuộc: utils.js (được load trước)
//  Dùng biến global: questions, answers, currentIdx, quizMode,
//                    raceCorrectCount (từ quiz.js)
// ============================================================

// ── Question type metadata ──
const TYPE_META = {
  radio:    { icon:'🔘', label:'Single Choice',  bg:'bg-accent/10',        text:'text-accent'       },
  checkbox: { icon:'☑️', label:'Multi Select',    bg:'bg-accent2/10',       text:'text-accent2'      },
  text:     { icon:'✏️', label:'Text Answer',     bg:'bg-accent3/10',       text:'text-accent3'      },
  rating:   { icon:'⭐', label:'Rating',          bg:'bg-yellow-400/10',    text:'text-yellow-400'   },
  dropdown: { icon:'▼',  label:'Dropdown',        bg:'bg-sky-400/10',       text:'text-sky-400'      },
  truefalse:{ icon:'⚡', label:'True / False',    bg:'bg-emerald-400/10',   text:'text-emerald-400'  },
  ordering: { icon:'🔀', label:'Drag to Order',   bg:'bg-orange-400/10',    text:'text-orange-400'   },
  matching: { icon:'🔗', label:'Drag to Match',   bg:'bg-violet-400/10',    text:'text-violet-400'   },
  hotspot:  { icon:'📍', label:'Click the Image', bg:'bg-pink-500/10',      text:'text-pink-400'     },
  mtf:      { icon:'✅', label:'Multiple T/F',    bg:'bg-teal-400/10',      text:'text-teal-400'     },
  matrix:   { icon:'🔲', label:'Matrix Choice',   bg:'bg-amber-400/10',     text:'text-amber-400'    },
};

// ════════════════════════════════════════════════════
//  TEST SELECTOR — render test cards grid
// ════════════════════════════════════════════════════
function renderSelector(tests) {
  allTests = tests; selectedTest = null;
  const diffColor = { Easy:'#00b894', Medium:'#fbbf24', Hard:'#e84393' };
  $('testsGrid').innerHTML = tests.map(t => `
    <div id="tc_${t.id}" onclick="selectTest('${t.id}')" class="test-card" style="--card-color:${t.color||'var(--accent)'}">
      <div class="tc-bar" style="position:absolute;top:0;left:0;right:0;height:3px;background:${t.color||'var(--accent)'};transform:scaleX(0);transition:transform .25s;transform-origin:left;border-radius:16px 16px 0 0"></div>
      <div class="tc-check" style="position:absolute;top:14px;right:14px;width:26px;height:26px;border-radius:50%;background:${t.color||'var(--accent)'};display:flex;align-items:center;justify-content:center;font-size:13px;color:white;opacity:0;transition:opacity .2s">✓</div>
      <div style="font-size:36px;margin-bottom:12px">${t.icon||'📝'}</div>
      <div style="font-family:'Be Vietnam Pro',sans-serif;font-size:17px;font-weight:700;margin-bottom:7px;line-height:1.2;color:var(--text)">${escH(t.title)}</div>
      <div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:14px">${escH(t.description||'')}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${t.duration?`<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:100px;background:var(--surface2);color:var(--muted);border:1px solid var(--border)">⏱ ${escH(String(t.duration))}</span>`:''}
        ${t.difficulty?`<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:100px;background:var(--surface2);border:1px solid var(--border);color:${diffColor[t.difficulty]||'var(--muted)'}">${escH(String(t.difficulty))}</span>`:''}
      </div>
    </div>`).join('');
  $('selectorSub').textContent = `${tests.length} test${tests.length!==1?'s':''} available`;
  show('testSelector');
}

// ════════════════════════════════════════════════════
//  RENDER QUESTION — main dispatcher
// ════════════════════════════════════════════════════
function renderQ() {
  const q = questions[currentIdx];
  updateProg();
  const m = TYPE_META[q.type] || { icon:'❓', label:q.type, bg:'bg-accent/10', text:'text-accent' };

  // Optional image (not for hotspot — it handles its own)
  let imageBlock = '';
  const imgUrl = String(q.imageUrl||'').trim();
  if (imgUrl && q.type !== 'hotspot') {
    imageBlock = `<div style="background:var(--surface2);border-radius:10px;overflow:hidden;margin-bottom:16px">
      <img src="${escH(imgUrl)}" alt="Question image" style="width:100%;height:auto;max-height:280px;object-fit:contain;display:block;opacity:0;transition:opacity .3s"
        onload="this.style.opacity=1"
        onerror="this.parentNode.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:80px;color:var(--error);font-size:13px\\'>⚠️ Image failed to load</div>'"/>
    </div>`;
  }

  const req = String(q.required).toUpperCase()==='TRUE'
    ? `<span style="color:var(--accent2);margin-left:4px">*</span>` : '';

  // Dispatch to type builder
  const inputHtml = buildInputHTML(q);

  $('questionContainer').innerHTML = `
    <div class="card w-full max-w-2xl p-7 md:p-9 mb-6 relative overflow-hidden card-accent animate-fadeUp">
      <span class="type-badge ${m.bg} ${m.text}">${m.icon} ${m.label}</span>
      <p style="font-size:12px;font-weight:600;margin-bottom:8px;margin-top:12px;color:var(--muted)">Câu ${currentIdx+1} / ${questions.length}</p>
      <p style="font-family:'Be Vietnam Pro',sans-serif;font-size:18px;font-weight:700;line-height:1.45;margin-bottom:20px;color:var(--text)">${escH(q.question)}${req}</p>
      ${imageBlock}
      ${inputHtml}
    </div>`;

  if (q.type === 'ordering') initOrderingDrag(q);
  if (q.type === 'matching') initMatchingDrag(q);

  // Update nav buttons
  const pb = $('prevBtn');
  if (pb) {
    pb.style.opacity = currentIdx === 0 ? '0.35' : '1';
    pb.disabled = currentIdx === 0;
    pb.style.display = quizMode === 'race' ? 'none' : '';
  }
  const last = currentIdx === questions.length - 1;
  const nb = $('nextBtn');
  if (nb) {
    if (quizMode === 'race') {
      nb.textContent = 'Kiểm tra ⚡';
      nb.style.background = 'linear-gradient(135deg,#f76a8a,#f94c81)';
      nb.style.boxShadow = '0 0 16px rgba(247,106,138,.4)';
    } else {
      nb.style.boxShadow = '';
      nb.textContent = last ? '✓ Nộp bài' : 'Tiếp →';
      nb.style.background = last ? '#16a34a' : 'var(--accent)';
    }
  }
  renderToc();
}

function buildInputHTML(q) {
  switch (q.type) {
    case 'radio':     return buildRadioHTML(q);
    case 'checkbox':  return buildCheckboxHTML(q);
    case 'text':      return buildTextHTML(q);
    case 'rating':    return buildRatingHTML(q);
    case 'dropdown':  return buildDropdownHTML(q);
    case 'truefalse': return buildTrueFalseHTML(q);
    case 'ordering':  return buildOrderingHTML(q);
    case 'matching':  return buildMatchingHTML(q);
    case 'hotspot':   return buildHotspotHTML(q);
    case 'mtf':       return buildMtfHTML(q);
    case 'matrix':    return buildMatrixHTML(q);
    default:          return `<p style="color:var(--muted);font-size:13px">Unknown type: ${escH(q.type)}</p>`;
  }
}

function updateProg() {
  const pct = Math.round((currentIdx / questions.length) * 100);
  const pt = $('progressText'); if (pt) pt.textContent = `Câu ${currentIdx+1} / ${questions.length}`;
  const pp = $('progressPct');  if (pp) pp.textContent = pct + '%';
  const pf = $('progressFill'); if (pf) pf.style.width = pct + '%';
}

// ════════════════════════════════════════════════════
//  QUESTION TYPE BUILDERS
// ════════════════════════════════════════════════════

function buildRadioHTML(q) {
  const opts = String(q.options).split('|').filter(Boolean);
  return `<div style="display:flex;flex-direction:column;gap:10px">${opts.map(o => {
    const sel = answers[q.id] === o;
    return `<div onclick="selR(${q.id},'${escJ(o)}',this)" class="opt${sel?' sel-radio':''}" data-val="${escH(o)}">
      <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${sel?'var(--accent)':'var(--border2)'};background:${sel?'var(--accent)':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .18s">
        ${sel?'<div style="width:8px;height:8px;border-radius:50%;background:white"></div>':''}
      </div>
      <span style="font-size:14px;color:var(--text)">${escH(o)}</span>
    </div>`;
  }).join('')}</div>`;
}

function buildCheckboxHTML(q) {
  const opts = String(q.options).split('|').filter(Boolean);
  const cur  = answers[q.id] ? answers[q.id].split('|') : [];
  return `<div style="display:flex;flex-direction:column;gap:10px">${opts.map(o => {
    const sel = cur.includes(o);
    return `<div onclick="selC(${q.id},'${escJ(o)}',this)" class="opt${sel?' sel-check':''}" data-val="${escH(o)}">
      <div style="width:20px;height:20px;border-radius:6px;border:2px solid ${sel?'var(--accent2)':'var(--border2)'};background:${sel?'var(--accent2)':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .18s">
        ${sel?'<span style="color:white;font-size:12px;font-weight:700">✓</span>':''}
      </div>
      <span style="font-size:14px;color:var(--text)">${escH(o)}</span>
    </div>`;
  }).join('')}</div>`;
}

function buildTextHTML(q) {
  return `<textarea class="textarea-inp" placeholder="Nhập câu trả lời…" oninput="answers[${q.id}]=this.value">${escH(answers[q.id]||'')}</textarea>`;
}

function buildRatingHTML(q) {
  const sc = parseInt(q.ratingScale) || 5;
  const cur = answers[q.id];
  return `<div style="display:flex;gap:8px;flex-wrap:wrap">${Array.from({length:sc},(_,i)=>{
    const v = i+1; const sel = String(cur)===String(v);
    return `<button class="rating-btn${sel?' sel':''}" onclick="selRat(${q.id},${v},this)">${v}</button>`;
  }).join('')}</div>
  <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:var(--muted)"><span>${escH(q.ratingMin||'Thấp')}</span><span>${escH(q.ratingMax||'Cao')}</span></div>`;
}

function buildDropdownHTML(q) {
  const opts = String(q.options).split('|').filter(Boolean);
  const cur  = answers[q.id] || '';
  return `<select class="styled-select" onchange="answers[${q.id}]=this.value">
    <option value="">— Chọn —</option>
    ${opts.map(o=>`<option value="${escH(o)}" ${cur===o?'selected':''}>${escH(o)}</option>`).join('')}
  </select>`;
}

function buildTrueFalseHTML(q) {
  const cur = answers[q.id];
  return `<div style="display:flex;gap:12px">
    <button class="tf-btn${cur==='TRUE'?' sel-true':''}"  onclick="selTF(${q.id},'TRUE',this)">✓ Đúng</button>
    <button class="tf-btn${cur==='FALSE'?' sel-false':''}" onclick="selTF(${q.id},'FALSE',this)">✗ Sai</button>
  </div>`;
}

function buildOrderingHTML(q) {
  const items = String(q.options).split('|').filter(Boolean);
  let ordered = answers[q.id]
    ? answers[q.id].split('|')
    : (answers[q.id] = shuffle(items).join('|'), answers[q.id].split('|'));
  return `<p style="font-size:12px;color:var(--muted);margin-bottom:12px;display:flex;align-items:center;gap:6px">
    <span style="color:var(--accent);opacity:.7;font-size:14px">☰</span>Kéo các mục lên/xuống để sắp xếp thứ tự</p>
  <div style="display:flex;flex-direction:column;gap:8px" id="orderList_${q.id}" data-qid="${q.id}">
    ${ordered.map((item,i)=>`
      <div class="ordering-item" style="display:flex;align-items:center;gap:12px;padding:13px 16px;cursor:grab;user-select:none;transition:all .2s" draggable="true" data-item="${escH(item)}" data-idx="${i}">
        <span style="color:var(--muted);font-size:18px;cursor:grab;flex-shrink:0;letter-spacing:-2px">⠿</span>
        <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Be Vietnam Pro',sans-serif;font-size:12px;font-weight:800;flex-shrink:0;background:rgba(251,146,60,.15);border:1px solid rgba(251,146,60,.3);color:#fb923c">${i+1}</div>
        <span style="font-size:14px;color:var(--text);flex:1;line-height:1.4">${escH(item)}</span>
      </div>`).join('')}
  </div>`;
}

function initOrderingDrag(q) {
  const list = document.getElementById(`orderList_${q.id}`); if (!list) return;
  let dragSrc = null;
  list.querySelectorAll('[draggable]').forEach(item => {
    item.addEventListener('dragstart', e => { dragSrc=item; item.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; });
    item.addEventListener('dragend',   () => { item.classList.remove('dragging'); list.querySelectorAll('[draggable]').forEach(i=>i.classList.remove('drag-over')); });
    item.addEventListener('dragover',  e => { e.preventDefault(); if(item!==dragSrc) item.classList.add('drag-over'); });
    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    item.addEventListener('drop',      e => { e.preventDefault(); item.classList.remove('drag-over'); if(dragSrc&&dragSrc!==item){const all=[...list.querySelectorAll('[draggable]')];all.indexOf(dragSrc)<all.indexOf(item)?list.insertBefore(dragSrc,item.nextSibling):list.insertBefore(dragSrc,item);updOrdNums(list,q.id);}});
  });
  // Touch support
  let tItem=null,tClone=null,tOX=0,tOY=0;
  list.querySelectorAll('[draggable]').forEach(item=>{
    item.addEventListener('touchstart',e=>{tItem=item;const t=e.touches[0];const r=item.getBoundingClientRect();tOX=t.clientX-r.left;tOY=t.clientY-r.top;tClone=item.cloneNode(true);Object.assign(tClone.style,{position:'fixed',zIndex:9999,width:r.width+'px',opacity:'0.85',pointerEvents:'none',top:t.clientY-tOY+'px',left:t.clientX-tOX+'px',boxShadow:'0 8px 30px rgba(0,0,0,.3)'});document.body.appendChild(tClone);item.classList.add('tdragging');e.preventDefault();},{passive:false});
    item.addEventListener('touchmove',e=>{if(!tItem)return;const t=e.touches[0];if(tClone){tClone.style.top=t.clientY-tOY+'px';tClone.style.left=t.clientX-tOX+'px';}tClone.style.pointerEvents='none';const un=document.elementFromPoint(t.clientX,t.clientY);tClone.style.pointerEvents='';const tgt=un?.closest('[data-item]');list.querySelectorAll('[draggable]').forEach(i=>i.classList.remove('drag-over'));if(tgt&&tgt!==tItem&&list.contains(tgt))tgt.classList.add('drag-over');e.preventDefault();},{passive:false});
    item.addEventListener('touchend',e=>{if(!tItem)return;const t=e.changedTouches[0];tClone?.remove();tClone=null;tItem.classList.remove('tdragging');const un=document.elementFromPoint(t.clientX,t.clientY);const tgt=un?.closest('[data-item]');list.querySelectorAll('[draggable]').forEach(i=>i.classList.remove('drag-over'));if(tgt&&tgt!==tItem&&list.contains(tgt)){const all=[...list.querySelectorAll('[draggable]')];all.indexOf(tItem)<all.indexOf(tgt)?list.insertBefore(tItem,tgt.nextSibling):list.insertBefore(tItem,tgt);updOrdNums(list,q.id);}tItem=null;});
  });
}
function updOrdNums(list,qid){const items=[...list.querySelectorAll('[draggable]')];items.forEach((item,i)=>{item.querySelectorAll('div')[1].textContent=i+1;item.dataset.idx=i;});answers[qid]=items.map(i=>i.dataset.item).join('|');}

function buildMatchingHTML(q) {
  const pairs = String(q.options).split('|').filter(Boolean).map(p=>{const[pr,an]=p.split('::');return{prompt:pr?.trim()||'',answer:an?.trim()||''};});
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const savedMap = parseMatchingAnswer(answers[q.id]||'');
  const usedAnswers = Object.values(savedMap);
  const shuffledAnswers = shuffle(pairs.map(p=>p.answer));
  const promptsHTML = pairs.map((p,i)=>`
    <div class="matching-prompt" style="display:flex;align-items:center;gap:10px;padding:11px 14px;min-height:50px;font-size:14px">
      <div style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;background:rgba(192,132,252,.2);color:#c084fc">${letters[i]}</div>
      <span style="color:var(--text)">${escH(p.prompt)}</span>
    </div>`).join('');
  const dropsHTML = pairs.map((p,i)=>{const matched=savedMap[p.prompt]||'';
    return `<div class="matching-drop-zone${matched?' has-item':''}" style="display:flex;align-items:center;padding:8px 10px;gap:8px;transition:all .2s"
      id="drop_${q.id}_${i}" data-qid="${q.id}" data-prompt="${escH(p.prompt)}" data-idx="${i}"
      ondragover="dzOver(event)" ondragleave="dzLeave(event)" ondrop="dzDrop(event)">
      ${matched
        ?`<span style="font-size:11px;font-weight:700;background:rgba(192,132,252,.15);color:#c084fc;border-radius:4px;padding:2px 7px;flex-shrink:0">${letters[i]}</span>
           <span style="font-size:14px;flex:1;color:var(--text)">${escH(matched)}</span>
           <button onclick="removeMatch(${q.id},${i},'${escJ(matched)}')" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;padding:2px 4px;line-height:1;flex-shrink:0" onmouseover="this.style.color='var(--error)'" onmouseout="this.style.color='var(--muted)'">✕</button>`
        :`<span style="font-size:12px;color:var(--muted);font-style:italic">Thả đáp án vào đây</span>`}
    </div>`;}).join('');
  const bankHTML = shuffledAnswers.map(a=>`
    <div class="bank-chip" style="padding:8px 14px;font-size:14px;cursor:grab;transition:all .2s;user-select:none;color:var(--text)${usedAnswers.includes(a)?';opacity:.3;pointer-events:none;border-style:dashed':''}"
      draggable="true" data-answer="${escH(a)}"
      ondragstart="chipDragStart(event,${q.id})" ondragend="chipDragEnd(event)">${escH(a)}</div>`).join('');
  return `<p style="font-size:12px;color:var(--muted);margin-bottom:16px;line-height:1.5">Kéo từng đáp án vào ô phù hợp. Nhấn ✕ để xóa.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
    <div><p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:10px">Vế trái</p><div style="display:flex;flex-direction:column;gap:8px">${promptsHTML}</div></div>
    <div><p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:10px">Thả đáp án</p><div style="display:flex;flex-direction:column;gap:8px">${dropsHTML}</div></div>
  </div>
  <div><p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:10px">Ngân hàng đáp án</p><div style="display:flex;flex-wrap:wrap;gap:8px" id="bank_${q.id}">${bankHTML}</div></div>`;
}
function initMatchingDrag(q){
  const bank=document.getElementById(`bank_${q.id}`);if(!bank)return;
  let tChip=null,tClone=null,tOX=0,tOY=0;
  bank.querySelectorAll('.bank-chip').forEach(chip=>{
    chip.addEventListener('touchstart',e=>{if(chip.style.pointerEvents==='none')return;tChip=chip;const t=e.touches[0];const r=chip.getBoundingClientRect();tOX=t.clientX-r.left;tOY=t.clientY-r.top;tClone=chip.cloneNode(true);Object.assign(tClone.style,{position:'fixed',zIndex:9999,opacity:'0.85',pointerEvents:'none',top:t.clientY-tOY+'px',left:t.clientX-tOX+'px',boxShadow:'0 8px 30px rgba(0,0,0,.3)'});document.body.appendChild(tClone);chip.style.opacity='.35';e.preventDefault();},{passive:false});
    chip.addEventListener('touchmove',e=>{if(!tChip)return;const t=e.touches[0];if(tClone){tClone.style.top=t.clientY-tOY+'px';tClone.style.left=t.clientX-tOX+'px';}tClone.style.pointerEvents='none';const un=document.elementFromPoint(t.clientX,t.clientY);tClone.style.pointerEvents='';document.querySelectorAll('[id^="drop_"]').forEach(z=>z.classList.remove('dz-over'));const zone=un?.closest('[data-prompt]');if(zone)zone.classList.add('dz-over');e.preventDefault();},{passive:false});
    chip.addEventListener('touchend',e=>{if(!tChip)return;const t=e.changedTouches[0];tClone?.remove();tClone=null;tChip.style.opacity='';document.querySelectorAll('[id^="drop_"]').forEach(z=>z.classList.remove('dz-over'));const un=document.elementFromPoint(t.clientX,t.clientY);const zone=un?.closest('[data-prompt]');if(zone)placeMatch(parseInt(zone.dataset.qid),parseInt(zone.dataset.idx),tChip.dataset.answer);tChip=null;});
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

function buildHotspotHTML(q) {
  const imgUrl = String(q.imageUrl||'').trim();
  if (!imgUrl) return `<div style="color:var(--error);font-size:13px;padding:12px;border:1px solid rgba(220,38,38,.2);border-radius:10px;background:rgba(220,38,38,.05)">⚠️ Loại hotspot cần cột imageUrl.</div>`;
  const selected = answers[q.id]||'';
  const zones = String(q.options||'').split('|').filter(Boolean).map(z=>{const ci=z.indexOf(':');if(ci===-1)return null;const lbl=z.substring(0,ci).trim();const c=z.substring(ci+1).trim().split(',');if(c.length<4)return null;return{label:lbl,left:c[0].trim(),top:c[1].trim(),width:c[2].trim(),height:c[3].trim()};}).filter(Boolean);
  const zonesHTML = zones.map(z=>`
    <div class="hs-zone ${selected===z.label?'hs-sel':''}" style="left:${z.left};top:${z.top};width:${z.width};height:${z.height}" onclick="selHotspot(${q.id},'${escJ(z.label)}',this)">
      <div class="hs-label">${escH(z.label)}</div>
    </div>`).join('');
  const selLabel = selected
    ? `<div style="margin-top:12px;padding:10px 14px;border-radius:10px;font-size:13px;font-weight:600;text-align:center;color:#db2777;border:1px solid rgba(219,39,119,.3);background:rgba(219,39,119,.05)">✓ Đã chọn: <strong>${escH(selected)}</strong></div>`
    : `<div style="margin-top:12px;padding:10px 14px;border-radius:10px;font-size:13px;text-align:center;color:var(--muted);border:1px solid var(--border);font-style:italic">Chưa chọn — click vào vùng trên ảnh</div>`;
  return `<div style="font-size:12px;color:var(--muted);margin-bottom:10px;display:flex;align-items:center;gap:6px">👆 Click vào vùng đúng trên ảnh</div>
  <div style="position:relative;border-radius:10px;overflow:hidden;background:var(--surface2)">
    <img src="${escH(imgUrl)}" alt="Hotspot" draggable="false" style="width:100%;height:auto;display:block;max-height:420px;object-fit:contain;opacity:0;transition:opacity .3s;user-select:none" onload="this.style.opacity=1"
      onerror="this.parentNode.innerHTML='<div style=\\'padding:40px;text-align:center;color:var(--error);font-size:13px\\'>⚠️ Không tải được ảnh</div>'"/>
    ${zonesHTML}
  </div>${selLabel}`;
}
function selHotspot(qid,label,el){
  answers[qid]=label;
  el.closest('[style*="position:relative"]').querySelectorAll('.hs-zone').forEach(z=>z.classList.remove('hs-sel'));
  el.classList.add('hs-sel');
  const lbl=el.closest('[style*="position:relative"]')?.nextElementSibling;
  if(lbl){lbl.style.color='#db2777';lbl.style.fontStyle='normal';lbl.innerHTML=`✓ Đã chọn: <strong>${escH(label)}</strong>`;}
}

function buildMtfHTML(q) {
  const stmts = String(q.options).split('|').filter(Boolean);
  const cur   = answers[q.id] ? answers[q.id].split('|') : [];
  return `<div style="display:flex;flex-direction:column;gap:10px">${stmts.map((stmt,i)=>{
    const val = cur[i]||'';
    return `<div class="mtf-row" id="mtfrow_${q.id}_${i}">
      <p style="font-size:14px;margin-bottom:10px;line-height:1.45;color:var(--text)">${escH(stmt)}</p>
      <div style="display:flex;gap:10px">
        <button class="mtf-btn${val==='TRUE'?' sel-true':''}"  onclick="selMtf(${q.id},${i},'TRUE',this)">✓ Đúng</button>
        <button class="mtf-btn${val==='FALSE'?' sel-false':''}" onclick="selMtf(${q.id},${i},'FALSE',this)">✗ Sai</button>
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
  if(row){row.querySelectorAll('.mtf-btn').forEach(b=>b.classList.remove('sel-true','sel-false'));btn.classList.add(val==='TRUE'?'sel-true':'sel-false');}
}

function buildMatrixHTML(q) {
  const rows = String(q.options).split('|').filter(Boolean);
  const cols = String(q.matrixCols||'').split('|').filter(Boolean);
  if (!cols.length) return `<div style="color:var(--error);font-size:13px;padding:12px">⚠️ matrix type cần cột matrixCols.</div>`;
  const saved = parseMatchingAnswer(answers[q.id]||'');
  const headerCells = cols.map(c=>`<th class="matrix-th">${escH(c)}</th>`).join('');
  const bodyRows = rows.map(row=>{const chosen=saved[row]||'';
    return `<tr id="mxrow_${q.id}_${CSS.escape(row)}" style="transition:background .15s">
      <td class="matrix-td-label">${escH(row)}</td>
      ${cols.map(col=>`<td class="matrix-td">
        <div class="matrix-radio${chosen===col?' sel':''}" onclick="selMatrix(${q.id},'${escJ(row)}','${escJ(col)}',this)">
          ${chosen===col?'<div style="width:8px;height:8px;border-radius:50%;background:white"></div>':''}
        </div>
      </td>`).join('')}
    </tr>`;}).join('');
  return `<div style="width:100%;overflow-x:auto;border-radius:12px;border:1px solid var(--border)">
    <table class="matrix-table">
      <thead style="background:var(--surface2)"><tr><th class="matrix-th-blank"></th>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </div>`;
}
function selMatrix(qid,rowLabel,colLabel,dot){
  const map=parseMatchingAnswer(answers[qid]||'');
  map[rowLabel]=colLabel;
  answers[qid]=Object.entries(map).map(([k,v])=>`${k}::${v}`).join('|');
  const rowEl=document.getElementById(`mxrow_${qid}_${CSS.escape(rowLabel)}`);
  if(rowEl){rowEl.querySelectorAll('.matrix-radio').forEach(d=>{d.classList.remove('sel');d.innerHTML='';});dot.classList.add('sel');dot.innerHTML='<div style="width:8px;height:8px;border-radius:50%;background:white"></div>';}
}

// ════════════════════════════════════════════════════
//  STANDARD INTERACTIONS
// ════════════════════════════════════════════════════
function selR(id,val,el){
  answers[id]=val;
  el.closest('[style*="flex-direction:column"]').querySelectorAll('.opt').forEach(e=>{
    e.classList.remove('sel-radio');
    const dot=e.querySelector('div');
    if(dot){dot.style.borderColor='var(--border2)';dot.style.background='transparent';dot.innerHTML='';}
  });
  el.classList.add('sel-radio');
  const circle=el.querySelector('div');
  if(circle){circle.style.borderColor='var(--accent)';circle.style.background='var(--accent)';circle.innerHTML='<div style="width:8px;height:8px;border-radius:50%;background:white"></div>';}
}
function selC(id,val,el){
  const cur=answers[id]?answers[id].split('|'):[];
  const i=cur.indexOf(val);
  if(i===-1)cur.push(val);else cur.splice(i,1);
  answers[id]=cur.join('|');
  const sel=cur.includes(val);
  if(sel)el.classList.add('sel-check');else el.classList.remove('sel-check');
  const box=el.querySelector('div');
  if(box){box.style.borderColor=sel?'var(--accent2)':'var(--border2)';box.style.background=sel?'var(--accent2)':'transparent';box.innerHTML=sel?'<span style="color:white;font-size:12px;font-weight:700">✓</span>':'';}
}
function selRat(id,val,el){
  answers[id]=val;
  el.closest('[style*="flex"]').querySelectorAll('.rating-btn').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');
}
function selTF(id,val,el){
  answers[id]=val;
  el.closest('[style*="flex"]').querySelectorAll('.tf-btn').forEach(b=>b.classList.remove('sel-true','sel-false'));
  el.classList.add(val==='TRUE'?'sel-true':'sel-false');
}

// ════════════════════════════════════════════════════
//  QUIZ TOOLBAR
// ════════════════════════════════════════════════════
function showQuizToolbar(){
  const tb=$('quizToolbar'),sp=$('quizToolbarSpacer');
  if(tb)tb.style.display='block';
  if(sp)sp.style.display='block';
}
function hideQuizToolbar(){
  const tb=$('quizToolbar'),sp=$('quizToolbarSpacer');
  if(tb)tb.style.display='none';
  if(sp)sp.style.display='none';
  closeToc();
}

// ════════════════════════════════════════════════════
//  TABLE OF CONTENTS
// ════════════════════════════════════════════════════
function toggleToc(){
  const panel=$('tocPanel');if(!panel)return;
  const isOpen=panel.style.transform==='translateX(0px)'||panel.style.transform==='translateX(0%)';
  isOpen?closeToc():openToc();
}
function openToc(){
  const panel=$('tocPanel'),backdrop=$('tocBackdrop');
  if(panel)panel.style.transform='translateX(0)';
  if(backdrop)backdrop.style.display='block';
  renderToc();
}
function closeToc(){
  const panel=$('tocPanel'),backdrop=$('tocBackdrop');
  if(panel)panel.style.transform='translateX(100%)';
  if(backdrop)backdrop.style.display='none';
}
function renderToc(){
  const list=$('tocList'),countEl=$('tocAnsweredCount');
  if(!list||!questions.length)return;
  const TYPE_ICONS={radio:'🔘',checkbox:'☑️',text:'✏️',rating:'⭐',dropdown:'▼',truefalse:'⚡',ordering:'🔀',matching:'🔗',hotspot:'📍',mtf:'✅',matrix:'🔲'};
  const answered=questions.filter(q=>answers[q.id]&&String(answers[q.id]).trim()!=='').length;
  if(countEl)countEl.textContent=`${answered} / ${questions.length} đã trả lời`;
  if(quizMode==='race'){
    list.innerHTML=`<div style="padding:20px 12px;text-align:center;font-size:12px;color:var(--muted);line-height:1.6">
      <div style="font-size:24px;margin-bottom:8px">⚡</div>
      <strong style="color:var(--warn)">Chế độ Race</strong><br>
      Không thể nhảy câu trong Race Mode.<br>Trả lời từng câu để tiếp tục.
      <div style="margin-top:12px;padding:10px;background:rgba(217,119,6,.08);border:1px solid rgba(217,119,6,.2);border-radius:10px;font-size:11px">
        Chuỗi đúng: <strong style="color:var(--warn)">${raceCorrectCount} / ${questions.length}</strong>
      </div></div>`;
    return;
  }
  list.innerHTML=questions.map((q,i)=>{
    const isCurrent=i===currentIdx;
    const isAnswered=answers[q.id]&&String(answers[q.id]).trim()!=='';
    const icon=TYPE_ICONS[q.type]||'❓';
    const bg=isCurrent?`background:rgba(37,99,235,.1);border-color:var(--accent)`:isAnswered?`background:rgba(5,150,105,.05);border-color:rgba(5,150,105,.25)`:`background:var(--surface2);border-color:var(--border)`;
    const numBg=isCurrent?`background:var(--accent);color:white`:isAnswered?`background:rgba(5,150,105,.2);color:var(--success)`:`background:var(--border);color:var(--muted)`;
    return `<button onclick="jumpToQuestion(${i})"
      style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid;${bg};cursor:pointer;transition:all .15s;text-align:left;margin-bottom:5px;font-family:'Be Vietnam Pro',sans-serif">
      <div style="width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;${numBg}">${i+1}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escH(String(q.question).substring(0,48))}${q.question.length>48?'…':''}</div>
        <div style="font-size:10px;color:var(--muted);margin-top:1px">${icon} ${q.type}${isAnswered?' · đã trả lời':''}</div>
      </div>
      ${isCurrent?`<div style="width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0"></div>`:''}
      ${isAnswered&&!isCurrent?`<div style="width:6px;height:6px;border-radius:50%;background:var(--success);flex-shrink:0"></div>`:''}
    </button>`;
  }).join('');
}
function jumpToQuestion(idx){
  if(quizMode==='race')return;
  currentIdx=idx; closeToc(); hideStatus(); renderQ();
  const qc=$('questionContainer');
  if(qc)setTimeout(()=>qc.scrollIntoView({behavior:'smooth',block:'start'}),60);
}

// ════════════════════════════════════════════════════
//  RACE FEEDBACK OVERLAY
// ════════════════════════════════════════════════════
function showRaceFeedback(correct,streak,total){
  $('raceFeedbackIcon').textContent=correct?'✅':'❌';
  $('raceFeedbackText').textContent=correct?`Đúng! ${streak} / ${total}`:'Sai! Bắt đầu lại...';
  $('raceFeedbackText').style.color=correct?'var(--success)':'var(--error)';
  $('raceFeedbackSub').textContent=correct?(streak===total?'🏆 Câu cuối — đang nộp bài!':'Tiếp tục!'):`Bạn đúng ${streak} câu. Thử lại nhé!`;
  $('raceFeedback').style.display='flex';
}
function hideRaceFeedback(){ $('raceFeedback').style.display='none'; }

// ════════════════════════════════════════════════════
//  ANSWER REVIEW
// ════════════════════════════════════════════════════
function buildReview(reviewData){
  $('reviewList').innerHTML=reviewData.map((item,i)=>{
    const{q,userAns,isCorrect,hasCorrect,correctAns}=item;
    let icon,iconBg,iconColor;
    if(!hasCorrect){icon='💬';iconBg='rgba(37,99,235,.1)';iconColor='var(--accent)';}
    else if(isCorrect){icon='✓';iconBg='rgba(5,150,105,.12)';iconColor='var(--success)';}
    else{icon='✗';iconBg='rgba(220,38,38,.12)';iconColor='var(--error)';}
    const S=`color:var(--success)`,E=`color:var(--error)`,M=`color:var(--muted)`;
    let body='';
    if(q.type==='ordering'){
      const u=userAns?userAns.split('|'):[];const c=correctAns?correctAns.split('|'):[];
      body=`<div style="margin-left:36px;margin-top:6px"><p style="font-size:12px;${M};margin-bottom:8px">Thứ tự của bạn:</p>${u.map((it,idx)=>{const ok=it===c[idx];return`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;background:${ok?'rgba(5,150,105,.15)':'rgba(220,38,38,.15)'};${ok?S:E}">${idx+1}</span><span style="font-size:13px;${ok?S:E}">${escH(it)}</span>${!ok&&c[idx]?`<span style="font-size:11px;${M}"> ← đúng: <strong style="${S}">${escH(c[idx])}</strong></span>`:''}</div>`;}).join('')}</div>`;
    }else if(q.type==='matching'||q.type==='matrix'){
      const u=parseMatchingAnswer(userAns);const c=parseMatchingAnswer(correctAns);
      const hasC=Object.keys(c).length>0;const pairs=hasC?Object.entries(c):Object.entries(u);
      body=`<div style="margin-left:36px;margin-top:6px;display:flex;flex-direction:column;gap:6px">${pairs.map(([prompt,ans])=>{const ua=u[prompt]||'';const ok=hasC?ua.toLowerCase()===ans.toLowerCase():false;return`<div style="display:flex;align-items:flex-start;gap:8px;font-size:13px"><div style="width:8px;height:8px;border-radius:50%;margin-top:4px;flex-shrink:0;background:${!hasC?'var(--muted)':ok?'var(--success)':'var(--error)'}"></div><div><span style="${M}">${escH(prompt)}</span><span style="${M};margin:0 6px">→</span><span style="${!hasC?'color:var(--text)':ok?S:E}">${escH(ua||'—')}</span>${hasC&&!ok&&ans?`<span style="font-size:11px;${M}"> (đúng: <strong style="${S}">${escH(ans)}</strong>)</span>`:''}</div></div>`;}).join('')}</div>`;
    }else if(q.type==='mtf'){
      const stmts=String(q.options).split('|').filter(Boolean);const u=userAns?userAns.split('|'):[];const c=correctAns?correctAns.split('|'):[];
      body=`<div style="margin-left:36px;margin-top:6px;display:flex;flex-direction:column;gap:6px">${stmts.map((stmt,idx)=>{const ua=(u[idx]||'').toUpperCase();const ca=(c[idx]||'').toUpperCase();const ok=ua===ca&&ca!=='';return`<div style="display:flex;align-items:flex-start;gap:8px;font-size:13px"><div style="width:8px;height:8px;border-radius:50%;margin-top:4px;flex-shrink:0;background:${ok?'var(--success)':'var(--error)'}"></div><div><span style="${M}">${escH(stmt)}</span><br><span style="font-size:12px;${ok?S:E}">Bạn: ${ua||'—'}</span>${!ok&&ca?`<span style="font-size:12px;${M};margin-left:8px">Đúng: <strong style="${S}">${ca}</strong></span>`:''}</div></div>`;}).join('')}</div>`;
    }else{
      const dispAns=userAns?escH(userAns.replace(/\|/g,' · ')):`<em style="${M}">Chưa trả lời</em>`;
      const valStyle=!hasCorrect?`background:var(--surface2);color:var(--text-sub)`:isCorrect?`background:rgba(5,150,105,.1);${S};border:1px solid rgba(5,150,105,.25)`:`background:rgba(220,38,38,.1);${E};border:1px solid rgba(220,38,38,.25);text-decoration:line-through`;
      let correctRow='';
      if(hasCorrect&&!isCorrect)correctRow=`<div style="display:flex;align-items:flex-start;gap:8px;margin-top:6px"><span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;min-width:60px;padding-top:2px;${S}">Đáp án</span><span style="font-size:12px;padding:3px 10px;border-radius:6px;background:rgba(5,150,105,.1);${S};border:1px solid rgba(5,150,105,.25)">${escH(String(correctAns).replace(/\|/g,' · '))}</span></div>`;
      body=`<div style="margin-left:36px;margin-top:8px">
        <div style="display:flex;align-items:flex-start;gap:8px"><span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;min-width:60px;padding-top:2px;${M}">${q.type==='hotspot'?'Đã chọn':'Câu trả lời'}</span><span style="font-size:12px;padding:3px 10px;border-radius:6px;${valStyle}">${dispAns}</span></div>
        ${correctRow}</div>`;
    }
    return `<div class="review-item">
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:8px">
        <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;margin-top:1px;background:${iconBg};color:${iconColor}">${icon}</div>
        <p style="font-family:'Be Vietnam Pro',sans-serif;font-size:14px;font-weight:600;line-height:1.4;flex:1;color:var(--text)">Câu ${i+1}. ${escH(q.question)}</p>
      </div>${body}</div>`;
  }).join('');
}
function toggleReview(){
  const list=$('reviewList'),btn=$('toggleReviewBtn');
  const open=list.style.display!=='none';
  list.style.display=open?'none':'block';
  btn.textContent=open?'Xem chi tiết ▾':'Ẩn chi tiết ▴';
}

// ============================================================
//  quiz.js — Luồng điều hướng, tải dữ liệu, chấm điểm, nộp bài
//  Phụ thuộc: config.js, demo-data.js, utils.js, quiz-render.js
// ============================================================

// ── Apply saved theme immediately ──
(function(){
  const saved = localStorage.getItem('qf-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

// ════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════
let allTests       = [];
let selectedTest   = null;
let questions      = [];
let currentIdx     = 0;
let answers        = {};
let mode           = 'survey';   // 'quiz' | 'survey'
let respondentName = '';
let quizMode       = 'train';    // 'train' | 'test' | 'race'
let raceCorrectCount = 0;

// ════════════════════════════════════════════════════
//  SCREEN HELPERS
// ════════════════════════════════════════════════════
function hideAll() {
  ['testSelector','nameScreen','modeScreen','resultScreen'].forEach(hide);
  const sk = $('skeletonLoad'); if (sk) sk.style.display = 'none';
  const qc = $('questionContainer'); if (qc) qc.innerHTML = '';
  hideQuizToolbar();
}

// ════════════════════════════════════════════════════
//  LOAD TESTS
// ════════════════════════════════════════════════════
async function loadTests() {
  $('skeletonLoad').style.display = 'grid';
  showStatus('Đang tải bài kiểm tra<span class="ldots"></span>', 'loading');
  try {
    const res  = await fetch(`${SCRIPT_URL}?action=getTests`);
    const data = await res.json();
    if (!data.tests || !data.tests.length) throw new Error('Không tìm thấy bài kiểm tra nào trong tab Tests');
    hideStatus();
    $('skeletonLoad').style.display = 'none';
    allTests = data.tests;
    renderSelector(data.tests);
  } catch(err) {
    $('skeletonLoad').style.display = 'none';
    showStatus(`❌ Tải thất bại: ${err.message}. Kiểm tra lại Apps Script deployment.`, 'error');
  }
}
// Auto-load only on tests.html
if (document.getElementById('testSelector')) {
  window.addEventListener('load', loadTests);
}

// ════════════════════════════════════════════════════
//  TEST SELECTOR
// ════════════════════════════════════════════════════
function selectTest(id) {
  selectedTest = allTests.find(t => String(t.id) === String(id));
  // Deselect all cards
  document.querySelectorAll('[id^="tc_"]').forEach(c => {
    c.style.borderColor = '';
    c.querySelector('.tc-check').style.opacity = '0';
    c.querySelector('.tc-bar').style.transform = 'scaleX(0)';
  });
  // Select this card
  const card = $(`tc_${id}`);
  card.style.borderColor = selectedTest.color || 'var(--accent)';
  card.querySelector('.tc-check').style.opacity = '1';
  card.querySelector('.tc-bar').style.transform = 'scaleX(1)';
  // Enable button
  const btn = $('startTestBtn');
  btn.classList.remove('disabled');
  btn.style.opacity = '1';
  btn.style.pointerEvents = 'all';
  btn.textContent = `Bắt đầu "${selectedTest.title}" →`;
}

// ════════════════════════════════════════════════════
//  NAME SCREEN
// ════════════════════════════════════════════════════
function proceedToName() {
  if (!selectedTest) return;
  hide('testSelector');
  $('nameTestBadge').textContent = `${selectedTest.icon||'📝'} ${selectedTest.title}`;
  $('nameInput').value = ''; $('nameGreeting').textContent = '';
  $('nameError').style.display = 'none';
  show('nameScreen');
  setTimeout(() => $('nameInput').focus(), 80);
}
function onNameType(val) {
  const msgs = ['Xin chào! 👋','Tuyệt vời! 😊','Tên hay đấy! ✨','Chào mừng! 🚀','Rất vui được gặp bạn! 🎉'];
  $('nameError').style.display = 'none';
  $('nameGreeting').textContent = val.trim().length >= 2
    ? `${msgs[val.trim().length % msgs.length]} Sẵn sàng chưa, ${val.trim().split(' ').pop()}?` : '';
}
function startQuiz() {
  const nm = $('nameInput').value.trim();
  if (!nm) { $('nameError').style.display = 'block'; $('nameInput').focus(); return; }
  respondentName = nm;
  goToModeScreen();
}

// ════════════════════════════════════════════════════
//  MODE SCREEN
// ════════════════════════════════════════════════════
function goToModeScreen() {
  hide('nameScreen');
  $('modeTestBadge').textContent = `${selectedTest.icon||'📝'} ${selectedTest.title}`;
  quizMode = 'train';
  ['train','test','race'].forEach(m => resetModeCard(m));
  $('startModeBtn').classList.add('disabled');
  $('startModeBtn').style.opacity = '.45';
  $('startModeBtn').style.pointerEvents = 'none';
  show('modeScreen');
}
function goBackToName() {
  hide('modeScreen');
  show('nameScreen');
  setTimeout(() => $('nameInput').focus(), 80);
}
function selectMode(m) {
  quizMode = m;
  ['train','test','race'].forEach(id => resetModeCard(id));
  const colorVar = { train:'var(--accent3)', test:'var(--accent)', race:'var(--warn)' };
  const c = colorVar[m];
  const card = $(`mode_${m}`);
  card.style.borderColor = c;
  card.style.background  = `color-mix(in srgb,${c} 6%,var(--surface))`;
  const chk = card.querySelector('.mode-check');
  chk.style.borderColor = c;
  chk.style.background  = c;
  chk.innerHTML = '<span style="color:white;font-size:11px;font-weight:700">✓</span>';
  $('startModeBtn').classList.remove('disabled');
  $('startModeBtn').style.opacity = '1';
  $('startModeBtn').style.pointerEvents = 'all';
}
function resetModeCard(m) {
  const card = $(`mode_${m}`); if (!card) return;
  card.style.borderColor = 'var(--border)';
  card.style.background  = 'var(--surface2)';
  const chk = card.querySelector('.mode-check');
  if (chk) { chk.style.borderColor='var(--border)'; chk.style.background='transparent'; chk.innerHTML=''; }
}

// ════════════════════════════════════════════════════
//  LAUNCH QUIZ
// ════════════════════════════════════════════════════
async function launchQuiz() {
  hide('modeScreen');
  showStatus('Đang tải câu hỏi<span class="ldots"></span>', 'loading');
  let qs;
  try {
    const res  = await fetch(`${SCRIPT_URL}?action=getQuestions&sheet=${encodeURIComponent(selectedTest.sheet)}`);
    const data = await res.json();
    if (!data.questions || !data.questions.length) throw new Error('Không có câu hỏi trong: ' + selectedTest.sheet);
    qs = data.questions;
  } catch(err) {
    // Fallback to demo data if available
    if (typeof DEMO_QS !== 'undefined' && DEMO_QS[selectedTest.sheet]) {
      qs = DEMO_QS[selectedTest.sheet];
    } else {
      showStatus(`❌ ${err.message}`, 'error');
      setTimeout(() => { hideStatus(); show('modeScreen'); }, 2000);
      return;
    }
  }
  hideStatus();
  initQuiz(qs);
}

function initQuiz(qs) {
  questions = qs; currentIdx = 0; answers = {}; raceCorrectCount = 0;
  mode = questions.some(q => q.correct && String(q.correct).trim() !== '') ? 'quiz' : 'survey';
  if (quizMode === 'test' || quizMode === 'race') questions = shuffle([...questions]);

  // Update toolbar labels
  const modeLabels = { train:'📖 Luyện tập', test:'📝 Kiểm tra', race:'⚡ Thử thách' };
  const modeColors = {
    train: { bg:'rgba(5,150,105,.1)',  color:'var(--success)', border:'rgba(5,150,105,.3)' },
    test:  { bg:'rgba(37,99,235,.1)',  color:'var(--accent)',  border:'rgba(37,99,235,.3)' },
    race:  { bg:'rgba(217,119,6,.1)', color:'var(--warn)',    border:'rgba(217,119,6,.3)' },
  };
  const mc = modeColors[quizMode];
  const quizTag = $('quizTag');
  if (quizTag) { quizTag.textContent=modeLabels[quizMode]; quizTag.style.color=mc.color; }
  const titleSmall = $('quizTitleSmall');
  if (titleSmall) titleSmall.textContent = selectedTest?.title || 'Quiz';
  const tocTestName = $('tocTestName');
  if (tocTestName) tocTestName.textContent = `${selectedTest?.icon||'📝'} ${selectedTest?.title||'Quiz'}`;
  const tocModeBadge = $('tocModeBadge');
  if (tocModeBadge) { tocModeBadge.textContent=modeLabels[quizMode]; tocModeBadge.style.background=mc.bg; tocModeBadge.style.color=mc.color; tocModeBadge.style.borderColor=mc.border; }

  showQuizToolbar();
  renderQ();
}

// ════════════════════════════════════════════════════
//  NAVIGATE
// ════════════════════════════════════════════════════
function navigate(dir) {
  const q = questions[currentIdx];
  if (dir === 1) {
    // Validate required
    if (String(q.required).toUpperCase() === 'TRUE') {
      let missing = false;
      if (q.type === 'mtf') {
        const stmts = String(q.options).split('|').filter(Boolean);
        const cur   = answers[q.id] ? answers[q.id].split('|') : [];
        missing = stmts.some((_,i) => !cur[i]);
      } else if (q.type === 'matrix') {
        const rows  = String(q.options).split('|').filter(Boolean);
        const saved = parseMatchingAnswer(answers[q.id]||'');
        missing = rows.some(r => !saved[r]);
      } else {
        missing = !answers[q.id] || !String(answers[q.id]).trim();
      }
      if (missing) { showStatus('⚠️ Câu hỏi này bắt buộc — vui lòng trả lời.','error'); setTimeout(hideStatus,2400); return; }
    }

    // Race mode — instant check
    if (quizMode === 'race') {
      const sc = scoreQuestion(q);
      if (sc.hasCorrect) {
        if (sc.isCorrect) {
          raceCorrectCount++;
          showRaceFeedback(true, raceCorrectCount, questions.length);
          setTimeout(() => {
            hideRaceFeedback();
            if (currentIdx === questions.length-1) { submit(); return; }
            currentIdx++; hideStatus(); renderQ();
          }, 1200);
        } else {
          showRaceFeedback(false, raceCorrectCount, questions.length);
          setTimeout(() => {
            hideRaceFeedback();
            currentIdx = 0; answers = {}; raceCorrectCount = 0;
            questions = shuffle([...questions]);
            hideStatus(); renderQ();
          }, 2000);
        }
        return;
      }
    }

    // Normal navigation
    if (currentIdx === questions.length-1) { submit(); return; }
    currentIdx++;
  } else {
    if (currentIdx === 0) return;
    currentIdx--;
  }
  hideStatus(); renderQ();
}

// ════════════════════════════════════════════════════
//  SCORE ENGINE
// ════════════════════════════════════════════════════
function scoreQuestion(q) {
  const userAns  = answers[q.id] || '';
  const hasCorrect = q.correct && String(q.correct).trim() !== '';
  if (!hasCorrect) return { hasCorrect:false, isCorrect:null, userAns, correctAns:'' };
  let isCorrect = false;
  if (q.type === 'ordering') {
    isCorrect = userAns.trim() === String(q.correct).trim();
  } else if (q.type === 'matching' || q.type === 'matrix') {
    const u=parseMatchingAnswer(userAns), c=parseMatchingAnswer(String(q.correct));
    isCorrect = Object.keys(c).length>0 && Object.keys(c).every(k=>u[k]&&u[k].toLowerCase()===c[k].toLowerCase()) && Object.keys(u).length===Object.keys(c).length;
  } else if (q.type === 'mtf') {
    const u=userAns.split('|').map(s=>s.trim().toUpperCase());
    const c=String(q.correct).split('|').map(s=>s.trim().toUpperCase());
    isCorrect = c.length>0 && c.every((v,i)=>u[i]===v);
  } else if (q.type === 'checkbox') {
    const norm = s => String(s).trim().toLowerCase().split('|').sort().join('|');
    isCorrect = norm(userAns) === norm(q.correct);
  } else {
    isCorrect = String(userAns).trim().toLowerCase() === String(q.correct).trim().toLowerCase();
  }
  return { hasCorrect, isCorrect, userAns, correctAns:String(q.correct) };
}

// ════════════════════════════════════════════════════
//  SUBMIT
// ════════════════════════════════════════════════════
async function submit() {
  showStatus('Đang lưu kết quả<span class="ldots"></span>', 'loading');
  closeToc();
  let correct=0, wrong=0, total=0;
  const reviewData = questions.map(q => {
    const sc = scoreQuestion(q);
    if (sc.hasCorrect) { total++; if(sc.isCorrect) correct++; else wrong++; }
    return { q, ...sc };
  });
  const pct   = total > 0 ? Math.round((correct/total)*100) : null;
  const grade = pct===null ? null : pct>=90?'A':pct>=75?'B':pct>=60?'C':'D';
  const gradeLabel = { A:'🏆 Xuất sắc!', B:'👍 Tốt lắm!', C:'📚 Cần ôn thêm', D:'💪 Thử lại nhé' };
  const payload = {
    name: respondentName, testTitle: selectedTest?.title||'',
    score: pct!==null ? pct+'%' : 'N/A', correct, wrong, total,
    grade: grade||'N/A', answers:{}, timestamp: new Date().toISOString(),
  };
  questions.forEach(q => {
    payload.answers[`q${q.id}_${String(q.question).substring(0,18).replace(/\s+/g,'_')}`] = answers[q.id]||'';
  });
  let saved = false;
  try {
    const res  = await fetch(`${SCRIPT_URL}?action=saveResponse`, { method:'POST', headers:{'Content-Type':'text/plain'}, body:JSON.stringify(payload) });
    const data = await res.json();
    saved = data.success === true;
  } catch(e) { console.error('Save error:', e); }

  setTimeout(() => {
    hideStatus(); $('questionContainer').innerHTML = '';
    hideQuizToolbar(); show('resultScreen');

    const badges = { A:'🏆', B:'⭐', C:'📖', D:'💡', null:'🎉' };
    $('resultBadge').textContent    = badges[grade] || '🎉';
    $('resultTestName').textContent = `${selectedTest?.icon||'📝'} ${selectedTest?.title||'Bài kiểm tra'}`;
    $('resultTitle').textContent    = grade ? gradeLabel[grade] : 'Hoàn thành!';
    $('resultSub').textContent      = `Xin chào ${respondentName.split(' ').pop()}! Bạn đã hoàn thành bài kiểm tra.`;

    const ss = $('resultSaveStatus');
    ss.textContent = saved ? '✅ Kết quả đã lưu về Google Sheets' : '📋 Chưa lưu được — kiểm tra Apps Script deployment.';
    ss.style.color = saved ? 'var(--success)' : 'var(--muted)';

    if (pct !== null) {
      show('scoreCard');
      setTimeout(() => {
        const circ = 2*Math.PI*52;
        $('ringFill').style.strokeDasharray = `${(pct/100)*circ} ${circ}`;
        const rc = { A:'var(--success)', B:'var(--accent)', C:'var(--warn)', D:'var(--error)' };
        $('ringFill').style.stroke  = rc[grade];
        $('ringPct').style.color    = rc[grade];
      }, 120);
      $('ringPct').textContent   = pct + '%';
      $('statCorrect').textContent = correct;
      $('statWrong').textContent   = wrong;
      $('statTotal').textContent   = total;
      const gradeStyles = {
        A: `background:rgba(5,150,105,.1);color:var(--success);border:1px solid rgba(5,150,105,.3)`,
        B: `background:rgba(37,99,235,.1);color:var(--accent);border:1px solid rgba(37,99,235,.3)`,
        C: `background:rgba(217,119,6,.1);color:var(--warn);border:1px solid rgba(217,119,6,.3)`,
        D: `background:rgba(220,38,38,.1);color:var(--error);border:1px solid rgba(220,38,38,.3)`,
      };
      $('gradeBadge').textContent = `Xếp loại ${grade} — ${gradeLabel[grade]}`;
      $('gradeBadge').style.cssText = `font-family:'Be Vietnam Pro',sans-serif;font-weight:800;font-size:15px;padding:8px 24px;border-radius:100px;${gradeStyles[grade]}`;
    } else {
      hide('scoreCard');
    }
    buildReview(reviewData); show('reviewSection');
  }, 900);
}

// ════════════════════════════════════════════════════
//  SCREEN NAVIGATION
// ════════════════════════════════════════════════════
function backToSelector() {
  hideAll(); hide('scoreCard');
  selectedTest=null; quizMode='train'; raceCorrectCount=0;
  document.querySelectorAll('[id^="tc_"]').forEach(c => {
    c.style.borderColor='';
    c.querySelector?.('.tc-check')?.style && (c.querySelector('.tc-check').style.opacity='0');
    c.querySelector?.('.tc-bar')?.style   && (c.querySelector('.tc-bar').style.transform='scaleX(0)');
  });
  const btn = $('startTestBtn');
  if (btn) { btn.classList.add('disabled'); btn.style.opacity='.45'; btn.style.pointerEvents='none'; btn.textContent='Tiếp tục →'; }
  show('testSelector');
}
function backToHome()  { window.location.href='index.html'; }
function goToTests()   { window.location.href='tests.html'; }
function retakeSame() {
  hide('resultScreen');
  $('modeTestBadge').textContent = `${selectedTest.icon||'📝'} ${selectedTest.title}`;
  ['train','test','race'].forEach(m => resetModeCard(m));
  $('startModeBtn').classList.add('disabled');
  $('startModeBtn').style.opacity = '.45';
  $('startModeBtn').style.pointerEvents = 'none';
  quizMode='train'; raceCorrectCount=0;
  show('modeScreen');
}
