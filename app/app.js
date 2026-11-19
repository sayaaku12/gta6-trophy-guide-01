// Leonida Trophy Guide — offline tracker for the 55 GTA VI PS5 trophies.
// State lives in localStorage under KEY; nothing is fetched from the network
// except the bundled data/trophies.json file itself.
const KEY = 'gta6-trophy-guide-v1';
const SEED_EARNED = [
  'Just Like Paradise', 'Paradise Lost', 'Trust', 'Baited My Tackle',
  'Stick Fiddler', 'Hot Together', 'Retail Therapy', 'Gunslinger',
  'Catch Me If You Can', 'Sneakthief', 'A Classic Blitz Play',
  'Treat Yo Self', 'On the Spot',
];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byName = new Map(trophies.map((t) => [t.name, t]));

let state = loadState();
let selected = null;
let filters = { q: '', kind: 'all', grade: 'all', earned: 'all', missableOnly: false, hideHidden: false };
let currentView = 'checklist';

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { earned: [], notes: {}, spoiler: false, theme: 'paper' };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => byName.has(n)) : [],
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      spoiler: Boolean(parsed.spoiler),
      theme: parsed.theme === 'night' ? 'night' : 'paper',
    };
  } catch {
    return { earned: [], notes: {}, spoiler: false, theme: 'paper' };
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

const earnedSet = () => new Set(state.earned);
const isEarned = (t) => earnedSet().has(t.name);
function toggleEarned(t) {
  const set = earnedSet();
  if (set.has(t.name)) set.delete(t.name);
  else set.add(t.name);
  state.earned = [...set];
  save();
  renderAll();
}

function rarityLabel(psn) {
  if (psn < 0.5) return 'Ultra rare';
  if (psn < 2) return 'Very rare';
  if (psn < 10) return 'Rare';
  return 'Common';
}

function spoilerHidden(t) {
  // Spoiler setting hides story trophies (names + descriptions) until earned.
  return state.spoiler && t.kind === 'story' && t.hidden && !isEarned(t);
}

function displayName(t) {
  return spoilerHidden(t) ? 'Hidden story trophy' : t.name;
}
function displayDesc(t) {
  return spoilerHidden(t) ? 'Earn this trophy to reveal its name and description.' : t.description;
}

const $ = (id) => document.getElementById(id);
const listEl = $('trophy-list');

function visibleTrophies() {
  const q = filters.q.trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.kind !== 'all' && t.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.earned === 'todo' && isEarned(t)) return false;
    if (filters.earned === 'earned' && !isEarned(t)) return false;
    if (filters.missableOnly && !t.missable) return false;
    if (filters.hideHidden && t.hidden) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderList() {
  const shown = visibleTrophies();
  $('list-meta').textContent = `${shown.length} of 55 trophies shown · ${state.earned.length} earned`;
  listEl.replaceChildren();
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy-card' + (isEarned(t) ? ' earned' : '') + (selected === t.name ? ' selected' : '');
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', `${displayName(t)}, ${t.grade}`);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned(t);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('click', (e) => { e.stopPropagation(); toggleEarned(t); });
    const main = document.createElement('div');
    main.className = 'trophy-main';
    const name = document.createElement('div');
    name.className = 'trophy-name' + (spoilerHidden(t) ? ' spoiler-name' : '');
    name.textContent = displayName(t);
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = displayDesc(t);
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    const grade = document.createElement('span');
    grade.className = `grade-badge grade-${t.grade}`;
    grade.textContent = t.grade;
    meta.append(grade);
    const kind = document.createElement('span');
    kind.className = 'kind-tag';
    kind.textContent = t.kind;
    meta.append(kind);
    if (t.hidden) {
      const h = document.createElement('span');
      h.className = 'hidden-tag';
      h.textContent = 'Hidden';
      meta.append(h);
    }
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'missable-tag';
      m.textContent = 'Missable';
      meta.append(m);
    }
    const r = document.createElement('span');
    r.className = 'rarity-tag';
    r.textContent = `${t.psn.toFixed(2)}% · ${rarityLabel(t.psn)}`;
    meta.append(r);
    main.append(name, desc, meta);
    li.append(box, main);
    li.addEventListener('click', () => selectTrophy(t));
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') selectTrophy(t);
      if (e.key === ' ') { e.preventDefault(); toggleEarned(t); }
    });
    listEl.append(li);
  }
}

function selectTrophy(t, scroll = true) {
  selected = t.name;
  renderList();
  renderGuide();
  if (scroll) $('guide-pane').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderGuide() {
  const body = $('guide-body');
  const empty = $('guide-empty');
  const t = selected ? byName.get(selected) : null;
  if (!t) { body.hidden = true; empty.hidden = false; return; }
  empty.hidden = true;
  body.hidden = false;
  const grade = $('guide-grade');
  grade.className = `grade-badge grade-${t.grade}`;
  grade.textContent = t.grade;
  $('guide-kind').textContent = t.kind;
  $('guide-hidden').hidden = !t.hidden;
  $('guide-missable').hidden = !t.missable;
  $('guide-name').textContent = displayName(t);
  $('guide-desc').textContent = displayDesc(t);
  $('guide-target').textContent = t.target;
  $('guide-psn').textContent = `${t.psn.toFixed(2)}% of PSN players have earned it (${rarityLabel(t.psn)}) — Exophase, 2026-11-19.`;
  $('guide-text').textContent = spoilerHidden(t)
    ? 'Spoilers are on: earn this trophy to reveal its guide.'
    : t.guide;
  $('guide-unconfirmed').hidden = !/UNCONFIRMED/.test(t.guide) || spoilerHidden(t);
  const src = $('guide-sources');
  src.replaceChildren();
  for (const s of t.sources) {
    const li = document.createElement('li');
    li.textContent = s;
    src.append(li);
  }
  const note = $('guide-note');
  note.value = state.notes[t.name] ?? '';
  note.oninput = () => {
    if (note.value.trim()) state.notes[t.name] = note.value;
    else delete state.notes[t.name];
    save();
  };
  const earnedBtn = $('guide-earned');
  earnedBtn.textContent = isEarned(t) ? 'Mark not earned' : 'Mark earned';
  earnedBtn.onclick = () => toggleEarned(t);
  const idx = trophies.indexOf(t);
  $('guide-prev').onclick = () => selectTrophy(trophies[(idx - 1 + trophies.length) % trophies.length]);
  $('guide-next').onclick = () => selectTrophy(trophies[(idx + 1) % trophies.length]);
}

function renderProgress() {
  const total = trophies.length;
  const earned = state.earned.length;
  $('earned-count').textContent = earned;
  $('progress-fill').style.width = `${(earned / total) * 100}%`;
  $('progress-bar').setAttribute('aria-valuenow', String(earned));
  const byGrade = (g) => trophies.filter((t) => t.grade === g && isEarned(t)).length;
  const counts = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
  $('progress-sub').textContent =
    `Platinum ${byGrade('platinum')}/${counts.platinum} · Gold ${byGrade('gold')}/${counts.gold} · ` +
    `Silver ${byGrade('silver')}/${counts.silver} · Bronze ${byGrade('bronze')}/${counts.bronze}`;
}

const PHASES = [
  { n: 1, title: 'Phase 1 — Play the story', hours: '60–80 hours', blurb: 'Chapters 1–4, the final mission, the character strands, and the one missable trophy. Do the Chapter 1 balcony meditation before Chapter 1 ends.' },
  { n: 2, title: 'Phase 2 — The 100% grind', hours: 'about 100 hours', blurb: 'After the credits, open Progress > Stats > 100% Completion and work the checklist: stunts, ranges, vaults, cards, vehicles, garages and laundering.' },
  { n: 3, title: 'Phase 3 — Cleanup', hours: 'about 10 hours', blurb: 'Stranger strands, character quests and the odd trophies: races, the tank, the plane, the unconfirmed ones. Then the platinum pops.' },
];

function renderRoadmap() {
  const grid = $('roadmap-grid');
  grid.replaceChildren();
  for (const p of PHASES) {
    const list = trophies.filter((t) => t.stage === p.n);
    const done = list.filter(isEarned).length;
    const card = document.createElement('div');
    card.className = 'phase-card';
    const h = document.createElement('h3');
    h.textContent = p.title;
    const hours = document.createElement('p');
    hours.className = 'phase-hours';
    hours.textContent = p.hours;
    const blurb = document.createElement('p');
    blurb.textContent = p.blurb;
    const bar = document.createElement('div');
    bar.className = 'phase-bar';
    const fill = document.createElement('div');
    fill.style.width = `${list.length ? (done / list.length) * 100 : 0}%`;
    bar.append(fill);
    const count = document.createElement('p');
    count.className = 'phase-count';
    count.textContent = `${done} / ${list.length} earned`;
    const ul = document.createElement('ul');
    ul.className = 'phase-trophies';
    for (const t of list) {
      const li = document.createElement('li');
      li.className = isEarned(t) ? 'done' : '';
      li.textContent = `${isEarned(t) ? '✓ ' : '○ '}${displayName(t)} — ${t.grade}`;
      li.addEventListener('click', () => { showView('checklist'); selectTrophy(t); });
      li.style.cursor = 'pointer';
      ul.append(li);
    }
    card.append(h, hours, blurb, bar, count, ul);
    grid.append(card);
  }
}

function renderMissables() {
  const pma = byName.get('Positive Mental Attitude');
  const hero = $('missable-hero');
  hero.replaceChildren();
  const h = document.createElement('h3');
  h.textContent = `⚠ ${pma.name} — the only missable trophy`;
  const p = document.createElement('p');
  p.textContent = pma.guide;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Open its guide';
  btn.addEventListener('click', () => { showView('checklist'); selectTrophy(pma); });
  hero.append(h, p, btn);

  const warns = [
    ['Yago’s race (Chapter 3) — time-sensitive.', 'Yago’s race carries an hourglass icon and can pass you by. Save first, then race. It counts toward Strangers & Freaks.'],
    ['Chapter 1 balcony meditation.', 'Lucia’s morning meditation on the balcony of Jason’s house, after the mission Down to Earth, disappears after Chapter 1. Do it, and keep a Chapter 1 save.'],
    ['Cheats disable trophies.', 'All 61 cheats unlock after the story, but using one disables trophies and saving for the current session.'],
  ];
  const wl = $('warn-list');
  wl.replaceChildren();
  for (const [title, text] of warns) {
    const li = document.createElement('li');
    const s = document.createElement('strong');
    s.textContent = title + ' ';
    li.append(s, document.createTextNode(text));
    wl.append(li);
  }

  const un = $('unconfirmed-list');
  un.replaceChildren();
  for (const t of trophies.filter((x) => /UNCONFIRMED/.test(x.guide))) {
    const li = document.createElement('li');
    const s = document.createElement('strong');
    s.textContent = t.name + ' — ';
    li.append(s, document.createTextNode(t.description + ' Trigger unconfirmed; the guide says so and invents nothing.'));
    li.addEventListener('click', () => { showView('checklist'); selectTrophy(t); });
    li.style.cursor = 'pointer';
    un.append(li);
  }
}

function nextUp() {
  const todo = trophies.filter((t) => !isEarned(t));
  const pma = todo.find((t) => t.missable);
  const rest = todo.filter((t) => !t.missable);
  rest.sort((a, b) => (a.stage - b.stage) || (b.psn - a.psn) || (a.id - b.id));
  const picked = pma ? [pma, ...rest] : rest;
  return picked.slice(0, 5);
}

function renderNextUp() {
  const ol = $('nextup-list');
  ol.replaceChildren();
  for (const t of nextUp()) {
    const li = document.createElement('li');
    const div = document.createElement('div');
    const h = document.createElement('h3');
    h.textContent = displayName(t);
    const p = document.createElement('p');
    const why = t.missable
      ? 'Do this first — it is the only missable trophy, and its Chapter 1 meditation disappears after Chapter 1.'
      : t.stage === 1
        ? `Story phase — ${t.target}. Play the story and it comes to you.`
        : `Phase ${t.stage} — ${t.target}. ${t.psn.toFixed(2)}% of PSN players have it, so it is one of the more reachable ones left.`;
    p.textContent = `${t.grade} · ${t.kind} · ${why}`;
    const g = document.createElement('p');
    g.textContent = spoilerHidden(t) ? 'Guide hidden until earned (spoilers on).' : t.guide;
    div.append(h, p, g);
    li.append(div);
    li.addEventListener('click', () => { showView('checklist'); selectTrophy(t); });
    li.style.cursor = 'pointer';
    ol.append(li);
  }
  if (!nextUp().length) {
    const li = document.createElement('li');
    li.textContent = 'Every trophy is earned — Vice Got a Price! is yours. Leonida Legend.';
    ol.append(li);
  }
}

function showView(name) {
  currentView = name;
  if (location.hash !== `#${name}`) history.replaceState(null, '', `#${name}`);
  for (const btn of document.querySelectorAll('.tab')) {
    btn.classList.toggle('active', btn.dataset.view === name);
  }
  for (const sec of document.querySelectorAll('.view')) {
    sec.classList.toggle('active', sec.id === `view-${name}`);
  }
  if (name === 'roadmap') renderRoadmap();
  if (name === 'missables') renderMissables();
  if (name === 'nextup') renderNextUp();
}

function renderAll() {
  renderProgress();
  renderList();
  renderGuide();
  if (currentView === 'roadmap') renderRoadmap();
  if (currentView === 'missables') renderMissables();
  if (currentView === 'nextup') renderNextUp();
}

function applyTheme() {
  document.body.dataset.theme = state.theme;
  $('theme-btn').textContent = state.theme === 'night' ? 'Paper theme' : 'Night theme';
}
function applySpoiler() {
  $('spoiler-btn').textContent = state.spoiler ? 'Spoilers: on' : 'Spoilers: off';
  $('spoiler-btn').setAttribute('aria-pressed', String(state.spoiler));
}

// Controls
for (const btn of document.querySelectorAll('.tab')) {
  btn.addEventListener('click', () => showView(btn.dataset.view));
}
for (const btn of document.querySelectorAll('.kind-btn')) {
  btn.addEventListener('click', () => {
    for (const b of document.querySelectorAll('.kind-btn')) b.classList.toggle('active', b === btn);
    filters.kind = btn.dataset.kind;
    renderList();
  });
}
$('search').addEventListener('input', (e) => { filters.q = e.target.value; renderList(); });
$('grade-filter').addEventListener('change', (e) => { filters.grade = e.target.value; renderList(); });
$('earned-filter').addEventListener('change', (e) => { filters.earned = e.target.value; renderList(); });
$('missable-only').addEventListener('change', (e) => { filters.missableOnly = e.target.checked; renderList(); });
$('hide-hidden').addEventListener('change', (e) => { filters.hideHidden = e.target.checked; renderList(); });

$('spoiler-btn').addEventListener('click', () => { state.spoiler = !state.spoiler; save(); applySpoiler(); renderAll(); });
$('theme-btn').addEventListener('click', () => { state.theme = state.theme === 'night' ? 'paper' : 'night'; save(); applyTheme(); });

$('export-btn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ earned: state.earned, notes: state.notes }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (Array.isArray(data.earned)) state.earned = data.earned.filter((n) => byName.has(n));
    if (data.notes && typeof data.notes === 'object') state.notes = data.notes;
    save();
    renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
  e.target.value = '';
});
$('reset-btn').addEventListener('click', () => {
  if (!confirm('Clear all earned ticks and notes?')) return;
  state.earned = [];
  state.notes = {};
  selected = null;
  save();
  renderAll();
});

document.addEventListener('keydown', (e) => {
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') {
    if (e.key === 'Escape') e.target.blur();
    return;
  }
  if (e.key === '/') { e.preventDefault(); $('search').focus(); }
  else if (e.key === '1') showView('checklist');
  else if (e.key === '2') showView('roadmap');
  else if (e.key === '3') showView('missables');
  else if (e.key === '4') showView('nextup');
  else if (e.key === 's' || e.key === 'S') { state.spoiler = !state.spoiler; save(); applySpoiler(); renderAll(); }
  else if (e.key === 't' || e.key === 'T') { state.theme = state.theme === 'night' ? 'paper' : 'night'; save(); applyTheme(); }
});

// Demo seed: loading with ?demo=1 (used for the screenshots) starts with
// 13 trophies earned, so the tracker reads as used. A normal first visit
// starts at 0; real progress overwrites the seed.
if (new URLSearchParams(location.search).has('demo') && !localStorage.getItem(KEY)) {
  state.earned = [...SEED_EARNED];
  save();
}

applyTheme();
applySpoiler();
// Deep-link: #roadmap, #missables or #nextup open that section directly.
const hashView = (location.hash || '').slice(1);
if (['roadmap', 'missables', 'nextup'].includes(hashView)) currentView = hashView;
renderAll();
showView(currentView);
// Open the missable trophy's guide on first load, so the guide pane is
// never an empty box — and the one trophy that can be missed is the first
// thing a reader sees.
if (!selected) selectTrophy(byName.get('Positive Mental Attitude'), false);
