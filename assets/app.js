'use strict';

document.documentElement.classList.add('js-enabled');
document.querySelectorAll('.interactive-only').forEach(element => { element.hidden = false; });
const guideData = JSON.parse(document.getElementById('guide-data').textContent);
const byId = id => document.getElementById(id);
const heuristicDetails = [...document.querySelectorAll('.heuristic')];

function readPreference(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function savePreference(key, value) {
  try { localStorage.setItem(key, value); } catch { /* The page also works when storage is unavailable. */ }
}
const preferredTheme = readPreference('nielsen-theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
function setTheme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  byId('theme-toggle').setAttribute('aria-pressed', String(dark));
}
setTheme(preferredTheme ? preferredTheme === 'dark' : systemDark.matches);
byId('theme-toggle').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  setTheme(dark);
  savePreference('nielsen-theme', dark ? 'dark' : 'light');
});
systemDark.addEventListener('change', event => {
  if (!readPreference('nielsen-theme')) setTheme(event.matches);
});

byId('menu-toggle').addEventListener('click', () => {
  const open = byId('sidebar').classList.toggle('is-open');
  byId('menu-toggle').setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.sidebar nav a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 760px)').matches) {
      byId('sidebar').classList.remove('is-open');
      byId('menu-toggle').setAttribute('aria-expanded', 'false');
      document.querySelector(link.getAttribute('href'))?.focus({ preventScroll: true });
    }
  });
});
byId('expand-all').addEventListener('click', () => heuristicDetails.forEach(detail => { detail.open = true; }));
byId('collapse-all').addEventListener('click', () => heuristicDetails.forEach(detail => { detail.open = false; }));

function revealAnchor() {
  let anchor;
  try { anchor = byId(decodeURIComponent(location.hash.slice(1))); } catch { return; }
  const detail = anchor?.closest('details');
  if (detail) {
    detail.open = true;
    requestAnimationFrame(() => anchor.scrollIntoView({ block: 'start' }));
  }
}
window.addEventListener('hashchange', revealAnchor);
revealAnchor();

let printState = [];
window.addEventListener('beforeprint', () => {
  printState = [...document.querySelectorAll('details')].map(detail => [detail, detail.open]);
  printState.forEach(([detail]) => { detail.open = true; });
});
window.addEventListener('afterprint', () => printState.forEach(([detail, open]) => { detail.open = open; }));
byId('print-guide').addEventListener('click', () => window.print());

let scrollScheduled = false;
function updateReadingState() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  byId('reading-progress').style.width = `${available > 0 ? Math.min(100, Math.max(0, window.scrollY / available * 100)) : 100}%`;
  const chapters = [...document.querySelectorAll('.chapter')];
  let current = chapters[0];
  chapters.forEach(chapter => { if (chapter.getBoundingClientRect().top <= 160) current = chapter; });
  document.querySelectorAll('.sidebar nav a').forEach(link => {
    if (link.hash.slice(1) === current?.querySelector('h2').id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateReadingState); }
}, { passive: true });
window.addEventListener('resize', updateReadingState);
document.addEventListener('toggle', updateReadingState, true);
updateReadingState();

const searchEntries = [];
document.querySelectorAll('.chapter').forEach(chapter => {
  const title = chapter.querySelector('h2');
  chapter.querySelectorAll('p, li, tr').forEach(element => {
    if (element.closest('.tool-panel, .section-actions') || element.querySelector('p, li, tr')) return;
    const detail = element.closest('.heuristic');
    searchEntries.push({ text: element.textContent.replace(/\s+/g, ' ').trim(), anchor: detail?.id || title.id, title: detail?.querySelector('h3').textContent || title.textContent });
  });
});
function appendMarkedText(parent, value, query) {
  const start = value.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  if (start < 0) { parent.textContent = value; return; }
  parent.append(document.createTextNode(value.slice(0, start)));
  const mark = document.createElement('mark');
  mark.textContent = value.slice(start, start + query.length);
  parent.append(mark, document.createTextNode(value.slice(start + query.length)));
}
function searchGuide() {
  const query = byId('guide-search').value.trim();
  const list = byId('search-results');
  list.replaceChildren();
  list.hidden = !query;
  if (!query) { byId('search-status').textContent = 'Search across all chapters, including collapsed heuristics.'; return; }
  const matches = searchEntries.filter(entry => entry.text.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const displayed = matches.slice(0, 15);
  byId('search-status').textContent = matches.length ? `${matches.length} matching passages. Showing ${displayed.length}.` : 'No matching passages. Try another word.';
  displayed.forEach(entry => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${entry.anchor}`;
    link.textContent = entry.title;
    link.addEventListener('click', () => {
      const anchor = byId(entry.anchor);
      if (anchor.matches('details')) anchor.open = true;
      anchor.querySelector('summary')?.focus({ preventScroll: true });
    });
    const excerpt = document.createElement('p');
    const start = Math.max(0, entry.text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) - 60);
    const snippet = `${start ? '…' : ''}${entry.text.slice(start, start + 210)}${entry.text.length > start + 210 ? '…' : ''}`;
    appendMarkedText(excerpt, snippet, query);
    item.append(link, excerpt);
    list.append(item);
  });
}
let searchTimer;
byId('guide-search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(searchGuide, 160); });
byId('clear-search').addEventListener('click', () => { clearTimeout(searchTimer); byId('guide-search').value = ''; searchGuide(); byId('guide-search').focus(); });

guideData.quiz.forEach((question, index) => {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'quiz-item';
  const legend = document.createElement('legend');
  legend.textContent = `Scenario ${index + 1}`;
  const text = document.createElement('p');
  text.textContent = question.question;
  const label = document.createElement('label');
  label.htmlFor = `quiz-${index}`;
  label.textContent = 'Main heuristic';
  const select = document.createElement('select');
  select.id = `quiz-${index}`;
  select.name = select.id;
  select.required = true;
  select.add(new Option('Choose a heuristic', ''));
  guideData.cards.forEach(card => select.add(new Option(`${card.number}. ${card.name}`, String(card.number))));
  const feedback = document.createElement('p');
  feedback.id = `feedback-${index}`;
  feedback.className = 'feedback';
  feedback.hidden = true;
  select.setAttribute('aria-describedby', feedback.id);
  fieldset.append(legend, text, label, select, feedback);
  byId('quiz-questions').append(fieldset);
});
byId('quiz-form').addEventListener('submit', event => {
  event.preventDefault();
  let score = 0;
  guideData.quiz.forEach((question, index) => {
    const correct = Number(byId(`quiz-${index}`).value) === question.answer;
    if (correct) score++;
    const feedback = byId(`feedback-${index}`);
    feedback.hidden = false;
    feedback.textContent = `${correct ? 'Matches the suggested diagnosis.' : 'Consider this diagnosis.'} ${question.explanation}`;
  });
  byId('quiz-score').textContent = `${score} of ${guideData.quiz.length} answers match the suggested main heuristic. A different answer can still be defensible when you explain the consequence and context.`;
});
byId('reset-quiz').addEventListener('click', () => {
  byId('quiz-form').reset();
  document.querySelectorAll('.quiz-item .feedback').forEach(element => { element.hidden = true; element.textContent = ''; });
  byId('quiz-score').textContent = 'Quiz reset.';
  byId('quiz-0').focus();
});

let cardIndex = 0;
function renderCard() {
  const card = guideData.cards[cardIndex];
  byId('card-counter').textContent = `CARD ${String(cardIndex + 1).padStart(2, '0')} / ${guideData.cards.length}`;
  byId('card-question').textContent = card.question;
  const answer = byId('card-answer');
  answer.replaceChildren();
  const name = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = `#${card.number} ${card.name}`;
  name.append(strong);
  const hook = document.createElement('p');
  hook.textContent = `Memory hook: ${card.hook}`;
  answer.append(name, hook);
  answer.hidden = true;
  byId('card-reveal').setAttribute('aria-expanded', 'false');
  byId('card-reveal').textContent = 'Reveal answer';
  byId('card-status').textContent = `Card ${cardIndex + 1} of ${guideData.cards.length}. Recall the heuristic, then reveal.`;
}
byId('card-reveal').addEventListener('click', () => {
  const answer = byId('card-answer');
  answer.hidden = !answer.hidden;
  byId('card-reveal').setAttribute('aria-expanded', String(!answer.hidden));
  byId('card-reveal').textContent = answer.hidden ? 'Reveal answer' : 'Hide answer';
  byId('card-status').textContent = answer.hidden ? 'Answer hidden.' : `Answer: ${guideData.cards[cardIndex].name}.`;
});
byId('card-next').addEventListener('click', () => { cardIndex = (cardIndex + 1) % guideData.cards.length; renderCard(); });
byId('card-prev').addEventListener('click', () => { cardIndex = (cardIndex - 1 + guideData.cards.length) % guideData.cards.length; renderCard(); });
renderCard();

guideData.cards.forEach(card => byId('finding-heuristic').add(new Option(`${card.number}. ${card.name}`, String(card.number))));
const findings = [];
let nextFindingId = 1;
function renderFindings() {
  const list = byId('finding-list');
  list.replaceChildren();
  findings.forEach(finding => {
    const article = document.createElement('article');
    article.className = 'finding';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = `${finding.id} · Severity ${finding.severity} · ${finding.confidence} confidence`;
    const title = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = finding.problem;
    title.append(strong);
    const scope = document.createElement('p');
    scope.className = 'hint';
    scope.textContent = `${finding.scope} · Heuristic #${finding.heuristic} · ${finding.status}`;
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Review evidence and proposed fix';
    details.append(summary);
    [['Evidence', finding.evidence], ['Severity rationale', finding.rationale], ['Fix and acceptance criteria', finding.fix], ['Verification result', finding.verification || 'Not yet recorded']].forEach(([label, value]) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = `${label}: ${value}`;
      details.append(paragraph);
    });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = `Remove ${finding.id}`;
    remove.addEventListener('click', () => {
      findings.splice(findings.indexOf(finding), 1);
      renderFindings();
      byId('finding-status').textContent = `${finding.id} removed. ${findings.length} findings remaining.`;
      byId('export-findings').disabled ? byId('finding-form').querySelector('button[type=submit]').focus() : byId('export-findings').focus();
    });
    article.append(badge, title, scope, details, remove);
    list.append(article);
  });
  byId('export-findings').disabled = findings.length === 0;
}
byId('finding-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const finding = Object.fromEntries(new FormData(form));
  for (const [key, value] of Object.entries(finding)) finding[key] = value.trim();
  for (const name of ['scope', 'problem', 'evidence', 'rationale', 'fix']) {
    if (!finding[name]) { form.elements[name].setCustomValidity('Enter meaningful text, not only spaces.'); form.elements[name].reportValidity(); return; }
  }
  finding.id = `F${String(nextFindingId++).padStart(3, '0')}`;
  findings.push(finding);
  renderFindings();
  byId('finding-status').textContent = `${finding.id} added. ${findings.length} findings ready to export. Download before closing or reloading.`;
  form.reset();
});
byId('finding-form').addEventListener('input', event => { event.target.setCustomValidity?.(''); });
function csvCell(value) {
  let text = String(value ?? '');
  // Avoid interpreting user-entered text as a spreadsheet formula on import.
  if (/^[\s\uFEFF]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
byId('export-findings').addEventListener('click', () => {
  const headers = ['ID', 'Scope', 'Evidence type', 'Problem and consequence', 'Reproduction and evidence', 'Primary heuristic', 'Secondary heuristics', 'Severity', 'Confidence', 'Severity rationale', 'Fix and acceptance criteria', 'Owner', 'Status', 'Verification result'];
  const fields = ['id', 'scope', 'evidenceType', 'problem', 'evidence', 'heuristic', 'secondary', 'severity', 'confidence', 'rationale', 'fix', 'owner', 'status', 'verification'];
  const rows = [headers, ...findings.map(finding => fields.map(field => finding[field] ?? ''))];
  const blob = new Blob(['\uFEFF', rows.map(row => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nielsen-evaluation.csv';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  byId('finding-status').textContent = `CSV download requested for ${findings.length} findings.`;
});
