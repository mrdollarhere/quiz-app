// ═══════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0YSPyzR7wvG_nxMS15ALWP6Z6yTAl6m4OdlYeQA79N9Oqfcyv7kTEYwg_qSKXgN-o/exec';
const ADMIN_PASSWORD = 'admin123'; // ← change this to your password

// ═══════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════
let allTests = [];
let allResponses = [];
let currentTestId = null;  // which test's questions are being edited
let editingQuestionId = null; // null = new, else = editing existing

// ═══════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════
const $ = id => document.getElementById(id);
const escH = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function toast(msg, type='success') {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

function showSection(id) {
  ['sectionTests','sectionQuestions','sectionResponses'].forEach(s => {
    const el = $(s);
    if (el) el.style.display = 'none';
  });
  const el = $(id);
  if (el) el.style.display = 'block';
  // Update active nav tab
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const tab = $('tab_' + id.replace('section','').toLowerCase());
  if (tab) tab.classList.add('active');
}

function setLoading(id, loading) {
  const btn = $(id);
  if (!btn) return;
  btn.disabled = loading;
  btn.style.opacity = loading ? '.5' : '1';
}

async function api(action, payload = {}) {
  const url = `${SCRIPT_URL}?action=${action}&_admin=1`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ═══════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════
function checkAuth() {
  const stored = sessionStorage.getItem('qf_admin');
  if (stored === btoa(ADMIN_PASSWORD)) {
    showApp();
  }
}

function login() {
  const val = $('passwordInput').value;
  if (!val) { $('loginError').style.display = 'block'; $('loginError').textContent = 'Enter the password.'; return; }
  if (val === ADMIN_PASSWORD) {
    sessionStorage.setItem('qf_admin', btoa(ADMIN_PASSWORD));
    $('loginError').style.display = 'none';
    showApp();
  } else {
    $('loginError').style.display = 'block';
    $('loginError').textContent = 'Incorrect password. Try again.';
    $('passwordInput').value = '';
    $('passwordInput').focus();
  }
}

function logout() {
  sessionStorage.removeItem('qf_admin');
  $('loginScreen').style.display = 'flex';
  $('appScreen').style.display = 'none';
  $('passwordInput').value = '';
}

function showApp() {
  $('loginScreen').style.display = 'none';
  $('appScreen').style.display = 'block';
  loadAll();
}

// ═══════════════════════════════════════════════════
//  LOAD ALL DATA
// ═══════════════════════════════════════════════════
async function loadAll() {
  await Promise.all([loadTests(), loadResponses()]);
}

async function loadTests() {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getTests`);
    const data = await res.json();
    allTests = data.tests || [];
    renderTestsTable();
    populateTestSelect();
  } catch(e) {
    toast('Failed to load tests — check your deployment.', 'error');
  }
}

async function loadResponses() {
  try {
    const data = await api('getResponses');
    allResponses = data.responses || [];
    renderResponsesTable();
  } catch(e) {
    // Responses tab may not exist yet
    allResponses = [];
    renderResponsesTable();
  }
}

// ═══════════════════════════════════════════════════
//  TESTS CRUD
// ═══════════════════════════════════════════════════
function renderTestsTable() {
  const tbody = $('testsTableBody');
  if (!allTests.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No tests yet — create your first one below.</td></tr>`;
    return;
  }
  tbody.innerHTML = allTests.map(t => `
    <tr>
      <td><span class="emoji-cell">${escH(t.icon||'📝')}</span></td>
      <td><strong>${escH(t.title||'')}</strong></td>
      <td class="text-muted">${escH(t.description||'')}</td>
      <td><span class="badge" style="background:${t.color||'#7c6af7'}22;color:${t.color||'#7c6af7'};border-color:${t.color||'#7c6af7'}44">${escH(t.difficulty||'—')}</span></td>
      <td class="text-muted">${escH(t.duration||'—')}</td>
      <td><code class="code-pill">${escH(t.sheet||'')}</code></td>
      <td class="action-cell">
        <button class="btn-icon btn-edit" onclick="editTest('${escH(String(t.id))}')">✏️</button>
        <button class="btn-icon btn-questions" onclick="openQuestions('${escH(String(t.id))}','${escH(t.title||'')}','${escH(t.sheet||'')}')">📋 Questions</button>
        <button class="btn-icon btn-delete" onclick="deleteTest('${escH(String(t.id))}','${escH(t.title||'')}')">🗑️</button>
      </td>
    </tr>`).join('');
}

function openTestForm(test = null) {
  const isEdit = !!test;
  $('testFormTitle').textContent = isEdit ? '✏️ Edit Test' : '+ New Test';
  $('testId').value     = isEdit ? test.id    : '';
  $('testTitle').value  = isEdit ? test.title : '';
  $('testDesc').value   = isEdit ? test.description : '';
  $('testIcon').value   = isEdit ? test.icon  : '📝';
  $('testSheet').value  = isEdit ? test.sheet : '';
  $('testDuration').value    = isEdit ? test.duration   : '';
  $('testDifficulty').value  = isEdit ? test.difficulty : 'Medium';
  $('testColor').value  = isEdit ? (test.color||'#7c6af7') : '#7c6af7';
  $('testFormModal').style.display = 'flex';
  setTimeout(() => $('testTitle').focus(), 60);
}

function editTest(id) {
  const test = allTests.find(t => String(t.id) === String(id));
  if (test) openTestForm(test);
}

function closeTestForm() { $('testFormModal').style.display = 'none'; }

async function saveTest() {
  const id     = $('testId').value.trim();
  const title  = $('testTitle').value.trim();
  const sheet  = $('testSheet').value.trim();
  if (!title) { toast('Title is required', 'error'); return; }
  if (!sheet) { toast('Sheet name is required', 'error'); return; }

  const payload = {
    id: id || String(Date.now()),
    title,
    description: $('testDesc').value.trim(),
    icon:       $('testIcon').value.trim() || '📝',
    sheet,
    duration:   $('testDuration').value.trim(),
    difficulty: $('testDifficulty').value,
    color:      $('testColor').value,
  };

  setLoading('saveTestBtn', true);
  try {
    const data = await api('saveTest', payload);
    if (data.success) {
      toast(id ? 'Test updated ✓' : 'Test created ✓');
      closeTestForm();
      await loadTests();
    } else {
      toast(data.error || 'Failed to save', 'error');
    }
  } catch(e) { toast('Network error', 'error'); }
  setLoading('saveTestBtn', false);
}

async function deleteTest(id, title) {
  if (!confirm(`Delete test "${title}"?\nThis will also delete all its questions. Responses are kept.`)) return;
  try {
    const data = await api('deleteTest', { id });
    if (data.success) {
      toast('Test deleted');
      await loadTests();
    } else {
      toast(data.error || 'Failed to delete', 'error');
    }
  } catch(e) { toast('Network error', 'error'); }
}

// ═══════════════════════════════════════════════════
//  QUESTIONS CRUD
// ═══════════════════════════════════════════════════
async function openQuestions(testId, testTitle, sheetName) {
  currentTestId = testId;
  $('questionsTestTitle').textContent = `📋 Questions — ${testTitle}`;
  $('questionsSheetName').textContent = sheetName;
  showSection('sectionQuestions');
  await loadQuestions(sheetName);
}

async function loadQuestions(sheetName) {
  const s = sheetName || $('questionsSheetName').textContent;
  $('questionsTableBody').innerHTML = `<tr><td colspan="6" class="empty-row">Loading…</td></tr>`;
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getQuestions&sheet=${encodeURIComponent(s)}`);
    const data = await res.json();
    renderQuestionsTable(data.questions || [], s);
  } catch(e) {
    toast('Failed to load questions', 'error');
  }
}

function renderQuestionsTable(questions, sheetName) {
  const tbody = $('questionsTableBody');
  if (!questions.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No questions yet — add your first one below.</td></tr>`;
    return;
  }
  tbody.innerHTML = questions.map(q => `
    <tr>
      <td class="text-muted">${escH(String(q.id||''))}</td>
      <td>${escH(String(q.question||'').substring(0,60))}${String(q.question||'').length>60?'…':''}</td>
      <td><span class="type-badge type-${q.type||'radio'}">${escH(q.type||'radio')}</span></td>
      <td class="text-muted small-cell">${q.correct?'<span class="has-correct">✓ scored</span>':'<span class="no-correct">survey</span>'}</td>
      <td class="text-muted small-cell">${String(q.required).toUpperCase()==='TRUE'?'<span class="required-dot">required</span>':''}</td>
      <td class="action-cell">
        <button class="btn-icon btn-edit" onclick="editQuestion(${JSON.stringify(escH(JSON.stringify(q)))})">✏️</button>
        <button class="btn-icon btn-delete" onclick="deleteQuestion('${escH(sheetName)}','${escH(String(q.id||''))}')">🗑️</button>
      </td>
    </tr>`).join('');
}

function openQuestionForm(q = null) {
  const isEdit = !!q;
  editingQuestionId = isEdit ? q.id : null;
  $('questionFormTitle').textContent = isEdit ? '✏️ Edit Question' : '+ New Question';
  $('qId').value          = isEdit ? q.id       : '';
  $('qQuestion').value    = isEdit ? q.question  : '';
  $('qType').value        = isEdit ? q.type      : 'radio';
  $('qOptions').value     = isEdit ? q.options   : '';
  $('qCorrect').value     = isEdit ? q.correct   : '';
  $('qRequired').checked  = isEdit ? String(q.required).toUpperCase()==='TRUE' : true;
  $('qImageUrl').value    = isEdit ? (q.imageUrl||'') : '';
  $('qRatingMin').value   = isEdit ? (q.ratingMin||'') : '';
  $('qRatingMax').value   = isEdit ? (q.ratingMax||'') : '';
  $('qRatingScale').value = isEdit ? (q.ratingScale||'5') : '5';
  $('qMatrixCols').value  = isEdit ? (q.matrixCols||'') : '';
  $('questionFormModal').style.display = 'flex';
  updateQuestionFormFields();
  setTimeout(() => $('qQuestion').focus(), 60);
}

function editQuestion(jsonStr) {
  try { openQuestionForm(JSON.parse(jsonStr)); } catch(e) { toast('Error opening question', 'error'); }
}

function closeQuestionForm() { $('questionFormModal').style.display = 'none'; }

function updateQuestionFormFields() {
  const type = $('qType').value;
  const showOptions  = ['radio','checkbox','dropdown','ordering','matching','hotspot','mtf','matrix'].includes(type);
  const showCorrect  = ['radio','checkbox','truefalse','ordering','matching','hotspot','mtf','matrix'].includes(type);
  const showRating   = type === 'rating';
  const showMatrix   = type === 'matrix';

  $('fieldOptions').style.display  = showOptions  ? 'block' : 'none';
  $('fieldCorrect').style.display  = showCorrect  ? 'block' : 'none';
  $('fieldRating').style.display   = showRating   ? 'block' : 'none';
  $('fieldMatrix').style.display   = showMatrix   ? 'block' : 'none';

  // Update hint text
  const hints = {
    radio:     'A|B|C|D  (pipe-separated options)',
    checkbox:  'A|B|C|D  (pipe-separated options)',
    dropdown:  'A|B|C  (pipe-separated options)',
    ordering:  'Item1|Item2|Item3  (in correct order)',
    matching:  'Prompt1::Answer1|Prompt2::Answer2',
    hotspot:   'Label:left%,top%,width%,height%|Label2:…',
    mtf:       'Statement1|Statement2|Statement3',
    matrix:    'Row1|Row2|Row3  (row labels)',
    truefalse: '',text:'',rating:'',
  };
  const correctHints = {
    radio:'The correct option text',checkbox:'Opt1|Opt2 (pipe-separated)',
    truefalse:'TRUE or FALSE',ordering:'Item1|Item2|Item3 (correct sequence)',
    matching:'P1::A1|P2::A2 (same as options)',hotspot:'Zone label',
    mtf:'TRUE|FALSE|TRUE (one per statement)',matrix:'Row::Col|Row2::Col2 (or blank for survey)',
  };
  const optHint = $('optionsHint');
  const corHint = $('correctHint');
  if (optHint) optHint.textContent = hints[type] || '';
  if (corHint) corHint.textContent = correctHints[type] || '';
}

async function saveQuestion() {
  const sheetName = $('questionsSheetName').textContent;
  const question  = $('qQuestion').value.trim();
  const type      = $('qType').value;
  if (!question) { toast('Question text is required', 'error'); return; }
  if (!sheetName) { toast('No sheet selected', 'error'); return; }

  const payload = {
    sheet:      sheetName,
    id:         $('qId').value.trim() || String(Date.now()),
    question,
    type,
    options:    $('qOptions').value.trim(),
    correct:    $('qCorrect').value.trim(),
    required:   $('qRequired').checked ? 'TRUE' : 'FALSE',
    imageUrl:   $('qImageUrl').value.trim(),
    ratingMin:  $('qRatingMin').value.trim(),
    ratingMax:  $('qRatingMax').value.trim(),
    ratingScale:$('qRatingScale').value.trim(),
    matrixCols: $('qMatrixCols').value.trim(),
  };

  setLoading('saveQuestionBtn', true);
  try {
    const data = await api('saveQuestion', payload);
    if (data.success) {
      toast(editingQuestionId ? 'Question updated ✓' : 'Question added ✓');
      closeQuestionForm();
      await loadQuestions(sheetName);
    } else {
      toast(data.error || 'Failed to save', 'error');
    }
  } catch(e) { toast('Network error', 'error'); }
  setLoading('saveQuestionBtn', false);
}

async function deleteQuestion(sheetName, id) {
  if (!confirm(`Delete question #${id}?`)) return;
  try {
    const data = await api('deleteQuestion', { sheet: sheetName, id });
    if (data.success) {
      toast('Question deleted');
      await loadQuestions(sheetName);
    } else {
      toast(data.error || 'Failed', 'error');
    }
  } catch(e) { toast('Network error', 'error'); }
}

function goBackToTests() {
  showSection('sectionTests');
  currentTestId = null;
}

// ═══════════════════════════════════════════════════
//  RESPONSES VIEW
// ═══════════════════════════════════════════════════
function populateTestSelect() {
  const sel = $('responseTestFilter');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">All Tests</option>' +
    allTests.map(t => `<option value="${escH(t.title)}" ${current===t.title?'selected':''}>${escH(t.title)}</option>`).join('');
}

function renderResponsesTable() {
  const filterTest = $('responseTestFilter')?.value || '';
  const filterGrade = $('responseGradeFilter')?.value || '';
  const search = ($('responseSearch')?.value || '').toLowerCase();

  let rows = allResponses.filter(r => {
    if (filterTest  && r.test  !== filterTest)  return false;
    if (filterGrade && r.grade !== filterGrade) return false;
    if (search && !String(r.name).toLowerCase().includes(search) &&
                  !String(r.test).toLowerCase().includes(search)) return false;
    return true;
  });

  const tbody = $('responsesTableBody');
  const empty = $('responsesEmpty');

  if (!rows.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    updateResponseStats([]);
    return;
  }
  if (empty) empty.style.display = 'none';

  tbody.innerHTML = rows.map(r => {
    const gradeColor = {A:'#4ade80',B:'#7c6af7',C:'#fbbf24',D:'#f87171'}[r.grade] || '#7a7a9a';
    const date = r.timestamp ? new Date(r.timestamp).toLocaleString() : '—';
    return `<tr>
      <td class="text-muted small-cell">${escH(date)}</td>
      <td><strong>${escH(r.name||'—')}</strong></td>
      <td>${escH(r.test||'—')}</td>
      <td class="text-center"><strong>${escH(String(r.score||'N/A'))}</strong></td>
      <td class="text-center">
        ${r.grade?`<span class="grade-pill" style="background:${gradeColor}22;color:${gradeColor};border-color:${gradeColor}44">${escH(r.grade)}</span>`:'<span class="text-muted">—</span>'}
      </td>
      <td class="text-muted text-center">${escH(String(r.correct??''))} / ${escH(String(r.total??''))}</td>
      <td><button class="btn-icon btn-view" onclick="viewResponse(${escH(JSON.stringify(JSON.stringify(r)))})">👁️ View</button></td>
    </tr>`;
  }).join('');

  updateResponseStats(rows);
}

function updateResponseStats(rows) {
  $('statTotalResponses').textContent = rows.length;
  const scored = rows.filter(r => r.score && r.score !== 'N/A');
  if (scored.length) {
    const avg = scored.reduce((s,r) => s + parseFloat(r.score), 0) / scored.length;
    $('statAvgScore').textContent = avg.toFixed(1) + '%';
  } else {
    $('statAvgScore').textContent = '—';
  }
  const grades = rows.reduce((acc,r) => { if(r.grade)acc[r.grade]=(acc[r.grade]||0)+1; return acc; },{});
  $('statGradeBreakdown').textContent = Object.entries(grades).map(([g,c])=>`${g}:${c}`).join('  ') || '—';
}

function viewResponse(jsonStr) {
  try {
    const r = JSON.parse(jsonStr);
    const modal = $('responseDetailModal');
    const content = $('responseDetailContent');
    const knownKeys = ['timestamp','name','test','score','grade','correct','wrong','total'];
    const answers = Object.entries(r).filter(([k]) => !knownKeys.includes(k));
    content.innerHTML = `
      <div class="detail-grid">
        <div class="detail-row"><span class="detail-label">Name</span><span class="detail-val">${escH(r.name||'—')}</span></div>
        <div class="detail-row"><span class="detail-label">Test</span><span class="detail-val">${escH(r.test||'—')}</span></div>
        <div class="detail-row"><span class="detail-label">Date</span><span class="detail-val">${escH(r.timestamp?new Date(r.timestamp).toLocaleString():'—')}</span></div>
        <div class="detail-row"><span class="detail-label">Score</span><span class="detail-val"><strong>${escH(String(r.score||'N/A'))}</strong></span></div>
        <div class="detail-row"><span class="detail-label">Grade</span><span class="detail-val">${r.grade?`<strong>${escH(r.grade)}</strong>`:'—'}</span></div>
        <div class="detail-row"><span class="detail-label">Correct / Total</span><span class="detail-val">${escH(String(r.correct??''))} / ${escH(String(r.total??''))}</span></div>
      </div>
      ${answers.length ? `
        <h4 class="detail-answers-title">Answers</h4>
        <div class="detail-answers">
          ${answers.map(([k,v]) => `
            <div class="detail-answer-row">
              <span class="detail-answer-key">${escH(k.replace(/^q\d+_/,'').replace(/_/g,' '))}</span>
              <span class="detail-answer-val">${escH(String(v||'—'))}</span>
            </div>`).join('')}
        </div>` : ''}`;
    modal.style.display = 'flex';
  } catch(e) { toast('Error loading response', 'error'); }
}

function closeResponseDetail() { $('responseDetailModal').style.display = 'none'; }

async function exportResponses() {
  try {
    const data = await api('exportResponsesCsv');
    if (data.csv) {
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'responses.csv'; a.click();
      URL.revokeObjectURL(url);
      toast('CSV downloaded ✓');
    } else {
      toast('No data to export', 'error');
    }
  } catch(e) { toast('Export failed', 'error'); }
}

// ═══════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  // Password enter key
  $('passwordInput')?.addEventListener('keydown', e => { if(e.key==='Enter') login(); });
  // Close modals on backdrop click
  $('testFormModal')?.addEventListener('click', e => { if(e.target===$('testFormModal')) closeTestForm(); });
  $('questionFormModal')?.addEventListener('click', e => { if(e.target===$('questionFormModal')) closeQuestionForm(); });
  $('responseDetailModal')?.addEventListener('click', e => { if(e.target===$('responseDetailModal')) closeResponseDetail(); });
});
