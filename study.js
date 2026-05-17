/* study.js — shared engine for the IT & Digital Skills Library.
 * Contains the functions that are byte-identical across all 7 hubs.
 * Per-hub data, config (EXAM_KEY etc.), and diverged functions stay
 * inline in each hub file. Loaded before each hub's inline <script>.
 */

function buildStudyTOC() {
  const guide = document.getElementById('panel-guide');
  if (!guide) return;
  if (guide.querySelector('.study-toc')) return;
  const headers = guide.querySelectorAll('.domain-card .domain-header h3');
  if (headers.length < 2) return;
  const toc = document.createElement('nav');
  toc.className = 'study-toc';
  toc.innerHTML = '<span class="toc-label">Jump to:</span>' +
    Array.from(headers).map((h, i) => {
      const txt = h.textContent.replace(/\s+\d+%\s*$/, '').trim();
      return '<button class="toc-item" data-idx="' + i + '">' + txt + '</button>';
    }).join('');
  const firstDomain = guide.querySelector('.domain-card');
  if (firstDomain) guide.insertBefore(toc, firstDomain);
  toc.querySelectorAll('.toc-item').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const card = guide.querySelectorAll('.domain-card')[i];
      const header = card.querySelector('.domain-header');
      const body = card.querySelector('.domain-body');
      header.classList.add('open');
      body.classList.add('open');
      const y = card.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}

function cancelMockExam() {
  if (!confirm('Exit the Mock Exam? Your progress will be discarded.')) return;
  if (mockTimerInterval) clearInterval(mockTimerInterval);
  document.getElementById('mock-exam-overlay').classList.remove('active');
}

function celebrate() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
  const particles = [];
  for (let i = 0; i < 140; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 240,
      y: canvas.height / 2 - 40,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.85) * 16,
      size: 6 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.35
    });
  }
  let last = performance.now();
  function frame(t) {
    const dt = Math.min((t - last) / 16, 3);
    last = t;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of particles) {
      p.vy += 0.45 * dt;
      p.vx *= 0.995;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      if (p.y > canvas.height + 40) continue;
      alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    if (alive > 0) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}

function copyNotes() {
  const text = document.getElementById('notes-text').value;
  if (!text.trim()) { alert('No notes to copy yet.'); return; }
  navigator.clipboard.writeText(text).then(
    () => { const s = document.getElementById('notes-status'); s.textContent = '✓ Copied to clipboard'; s.className = 'notes-status saved'; },
    () => alert('Could not copy. Try selecting and pressing Ctrl+C.')
  );
}

function jumpToMockQ(i) { mockQIdx = i; renderMockQuestion(); }

function nextMockQ() { if (mockQIdx < mockQs.length - 1) { mockQIdx++; renderMockQuestion(); } }

function prevMockQ() { if (mockQIdx > 0) { mockQIdx--; renderMockQuestion(); } }

function printStudyGuide() {
  toggleAllDomains(true);
  document.body.classList.add('printing-guide');
  setTimeout(() => {
    window.print();
    setTimeout(() => document.body.classList.remove('printing-guide'), 800);
  }, 150);
}

function recordMockScore(pct, score, total) {
  try {
    const key = 'bestMockScore_' + EXAM_KEY;
    const prev = JSON.parse(localStorage.getItem(key) || '{"pct":0}');
    if (pct > (prev.pct || 0)) {
      localStorage.setItem(key, JSON.stringify({ pct, score, total, date: new Date().toISOString().slice(0,10) }));
    }
  } catch(e) {}
  pushScoreHistory(pct, total, 'mock');
  renderProgress();
}

function recordQuizScore(pct, score, total) {
  try {
    const key = 'bestScore_' + EXAM_KEY;
    const prev = JSON.parse(localStorage.getItem(key) || '{"pct":0}');
    if (pct > (prev.pct || 0)) {
      localStorage.setItem(key, JSON.stringify({ pct, score, total, date: new Date().toISOString().slice(0,10) }));
    }
  } catch(e) {}
  pushScoreHistory(pct, total, 'quiz');
  updateWeakQuestions();
  renderProgress();
}

function recordVisit() {
  try {
    localStorage.setItem('lastActive_' + EXAM_KEY, new Date().toISOString());
    const today = new Date().toISOString().slice(0, 10);
    const activity = JSON.parse(localStorage.getItem('studyActivity') || '[]');
    if (!activity.includes(today)) {
      activity.push(today);
      localStorage.setItem('studyActivity', JSON.stringify(activity));
    }
  } catch(e) {}
}

function renderMockPalette() {
  const palette = document.getElementById('mock-palette');
  palette.innerHTML = mockQs.map((_, i) => {
    const answered = mockAnswers[i] !== null;
    const current = i === mockQIdx;
    return '<span class="mock-palette-cell' + (answered ? ' answered' : '') + (current ? ' current' : '') + '" onclick="jumpToMockQ(' + i + ')" title="Question ' + (i+1) + (answered ? ' — answered' : ' — unanswered') + '">' + (i+1) + '</span>';
  }).join('');
}

function renderTracker(state) {
  let done = 0;
  state.forEach((checked, i) => {
    const cb  = document.getElementById('task-'+(i+1));
    const day = document.getElementById('tday-'+(i+1));
    if (cb)  cb.checked = checked;
    if (day) day.classList.toggle('done', checked);
    if (checked) done++;
  });
  const el = document.getElementById('tracker-progress');
  if (el) el.textContent = done + ' / 5 complete';
}

function toggleAllDomains(open) {
  document.querySelectorAll('.domain-header').forEach(h => h.classList.toggle('open', open));
  document.querySelectorAll('.domain-body').forEach(b => b.classList.toggle('open', open));
}

function toggleTracker() {
  const body    = document.getElementById('tracker-body');
  const chevron = document.getElementById('tracker-chevron');
  const open    = body.classList.toggle('open');
  chevron.classList.toggle('open', open);
}

function updateQuizBadge() {
  const btn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.textContent.includes('Practice Quiz'));
  if (!btn) return;
  let badge = btn.querySelector('.progress-badge');
  const inProgress = quizQs && quizQs.length > 0 && currentQ > 0 && currentQ < quizQs.length && document.getElementById('quiz-result')?.style.display !== 'block';
  if (inProgress) {
    if (!badge) { badge = document.createElement('span'); badge.className = 'progress-badge'; btn.appendChild(badge); }
    badge.textContent = (currentQ + 1) + '/' + quizQs.length;
  } else if (badge) {
    badge.remove();
  }
}

function applyTheme(theme) {
  const light = theme === 'light';
  document.documentElement.classList.toggle('theme-light', light);
  const tc = document.querySelector('meta[name="theme-color"]');
  if (tc) tc.setAttribute('content', light ? '#eceff3' : '#0f1117');
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = light ? '🌙' : '☀️';
    const label = light ? 'Switch to dark mode' : 'Switch to light mode';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  });
}

function toggleTheme() {
  const next = document.documentElement.classList.contains('theme-light') ? 'dark' : 'light';
  try { localStorage.setItem('theme', next); } catch (e) {}
  applyTheme(next);
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(document.documentElement.classList.contains('theme-light') ? 'light' : 'dark');
  renderExamPlanner();
  renderProgress();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

/* === Exam-date planner ==============================================
 * Countdown + pace tip shown at the top of the Study Guide. Stored per
 * hub in examDate_<EXAM_KEY> as a YYYY-MM-DD string. */
function examPlannerTip(days) {
  if (days > 45) return 'Plenty of runway. Work through one study-guide domain at a time and let the spaced-repetition flashcards build your recall.';
  if (days > 21) return 'Good pace. Aim for a practice quiz every couple of days and clear your due flashcards as they come up.';
  if (days > 10) return 'Getting close. Do a practice quiz most days, review every question you miss, and keep your flashcards current.';
  if (days > 3)  return 'Crunch time. Take a full timed mock exam, then drill the domains and questions you score lowest on.';
  return 'Final stretch. Do a light review, re-read your missed questions, skim the cheat sheet, and rest well the night before.';
}

function examPlannerStreak() {
  let act = [];
  try { act = JSON.parse(localStorage.getItem('studyActivity') || '[]'); } catch (e) {}
  const recent = new Set(act);
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (recent.has(d.toISOString().slice(0, 10))) n++;
  }
  if (!n) return '';
  return '<div class="ep-streak">🔥 You have studied ' + n + ' of the last 7 days' + (n >= 5 ? ' — great consistency!' : '') + '</div>';
}

function renderExamPlanner() {
  const host = document.getElementById('exam-planner');
  if (!host) return;
  let date = '';
  try { date = localStorage.getItem('examDate_' + EXAM_KEY) || ''; } catch (e) {}
  const streak = examPlannerStreak();
  if (!date) {
    host.innerHTML =
      '<div class="ep-set"><span class="ep-icon">📅</span>' +
      '<label class="ep-set-label" for="ep-date">Got an exam booked? Set the date for a countdown and pace tips:</label>' +
      '<input type="date" id="ep-date" class="ep-input">' +
      '<button class="ep-btn" onclick="setExamDate()">Set date</button></div>' + streak;
    return;
  }
  const exam = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((exam - today) / 86400000);
  const dateStr = exam.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  let num, unit, tip;
  if (days > 1) { num = days; unit = 'days to go'; tip = examPlannerTip(days); }
  else if (days === 1) { num = 1; unit = 'day to go'; tip = examPlannerTip(1); }
  else if (days === 0) { num = '🎯'; unit = 'exam day'; tip = 'Exam day! Read each question carefully, flag-and-return on the hard ones, and trust your preparation. Good luck.'; }
  else { num = '✓'; unit = 'date passed'; tip = 'Your exam date has passed — hope it went well! Set a new date for a retake or your next certification.'; }
  host.innerHTML =
    '<div class="ep-live"><div class="ep-count"><div class="ep-num">' + num + '</div>' +
    '<div class="ep-unit">' + unit + '</div></div>' +
    '<div class="ep-body"><div class="ep-date-line">Exam date: <strong>' + dateStr + '</strong> ' +
    '<button class="ep-link" onclick="clearExamDate()">change</button></div>' +
    '<div class="ep-tip">' + tip + '</div></div></div>' + streak;
}

function setExamDate() {
  const input = document.getElementById('ep-date');
  if (!input || !input.value) return;
  try { localStorage.setItem('examDate_' + EXAM_KEY, input.value); } catch (e) {}
  renderExamPlanner();
}

function clearExamDate() {
  try { localStorage.removeItem('examDate_' + EXAM_KEY); } catch (e) {}
  renderExamPlanner();
}

/* === Progress & weak-area tracking ==================================
 * scoreHistory_<EXAM_KEY> = [{ pct, total, kind, date }]  (last 40)
 * weakQuestions_<EXAM_KEY> = { "<question>": { misses, opts, answer, exp } }
 * A weak question self-clears: getting it right again trims its miss count. */
function pushScoreHistory(pct, total, kind) {
  try {
    const key = 'scoreHistory_' + EXAM_KEY;
    const hist = JSON.parse(localStorage.getItem(key) || '[]');
    hist.push({ pct: pct, total: total, kind: kind, date: new Date().toISOString().slice(0, 10) });
    if (hist.length > 40) hist.splice(0, hist.length - 40);
    localStorage.setItem(key, JSON.stringify(hist));
  } catch (e) {}
}

function updateWeakQuestions() {
  if (typeof wrongAnswers === 'undefined' || typeof quizQs === 'undefined') return;
  try {
    const key = 'weakQuestions_' + EXAM_KEY;
    const weak = JSON.parse(localStorage.getItem(key) || '{}');
    const missedNow = new Set(wrongAnswers.map(w => w.q));
    quizQs.forEach(q => {
      if (missedNow.has(q.q)) {
        const rec = weak[q.q] || { misses: 0 };
        rec.misses++;
        rec.opts = q.opts;
        rec.answer = q.answer;
        rec.exp = q.exp;
        weak[q.q] = rec;
      } else if (weak[q.q]) {
        weak[q.q].misses--;
        if (weak[q.q].misses <= 0) delete weak[q.q];
      }
    });
    localStorage.setItem(key, JSON.stringify(weak));
  } catch (e) {}
}

function clearProgress() {
  if (!confirm('Clear your quiz history and weak-question list? This cannot be undone.')) return;
  try {
    localStorage.removeItem('scoreHistory_' + EXAM_KEY);
    localStorage.removeItem('weakQuestions_' + EXAM_KEY);
  } catch (e) {}
  renderProgress();
}

function renderProgress() {
  const host = document.getElementById('progress-box');
  if (!host) return;
  let hist = [], weak = {};
  try { hist = JSON.parse(localStorage.getItem('scoreHistory_' + EXAM_KEY) || '[]'); } catch (e) {}
  try { weak = JSON.parse(localStorage.getItem('weakQuestions_' + EXAM_KEY) || '{}'); } catch (e) {}
  const weakList = Object.keys(weak).map(q => ({
    q: q, misses: weak[q].misses, opts: weak[q].opts, answer: weak[q].answer, exp: weak[q].exp
  })).sort((a, b) => b.misses - a.misses);
  if (!hist.length && !weakList.length) { host.innerHTML = ''; return; }
  let html = '<div class="pg-head"><h3>📈 Your progress</h3>' +
    '<button class="pg-clear" onclick="clearProgress()">Clear</button></div>';
  if (hist.length) {
    const pcts = hist.map(h => h.pct);
    const best = Math.max.apply(null, pcts);
    const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
    const latest = pcts[pcts.length - 1];
    html += '<div class="pg-stats">' +
      '<div class="pg-stat"><span class="pg-stat-num">' + hist.length + '</span><span class="pg-stat-lbl">attempts</span></div>' +
      '<div class="pg-stat"><span class="pg-stat-num">' + latest + '%</span><span class="pg-stat-lbl">latest</span></div>' +
      '<div class="pg-stat"><span class="pg-stat-num">' + avg + '%</span><span class="pg-stat-lbl">average</span></div>' +
      '<div class="pg-stat"><span class="pg-stat-num">' + best + '%</span><span class="pg-stat-lbl">best</span></div></div>';
    html += '<div class="pg-spark">' + hist.slice(-14).map(h => {
      return '<span class="pg-bar' + (h.pct >= 70 ? ' pass' : '') + '" style="height:' +
        Math.max(h.pct, 4) + '%" title="' + h.kind + ' — ' + h.pct + '% on ' + h.date + '"></span>';
    }).join('') + '</div>';
  }
  if (weakList.length) {
    html += '<details class="pg-weak"><summary>🎯 Questions to review (' + weakList.length + ')</summary>' +
      '<div class="pg-weak-body">' + weakList.slice(0, 20).map(w => {
        const correct = (w.opts && typeof w.answer === 'number') ? w.opts[w.answer] : '';
        return '<div class="pg-weak-item"><div class="pg-weak-q">' + w.q +
          ' <span class="pg-weak-misses">missed ' + w.misses + '×</span></div>' +
          (correct ? '<div class="pg-weak-a">✓ ' + correct + '</div>' : '') +
          (w.exp ? '<div class="pg-weak-exp">' + w.exp + '</div>' : '') + '</div>';
      }).join('') + '</div></details>';
  }
  host.innerHTML = html;
}
