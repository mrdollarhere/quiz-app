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
