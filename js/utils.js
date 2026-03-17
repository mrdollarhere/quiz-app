
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
