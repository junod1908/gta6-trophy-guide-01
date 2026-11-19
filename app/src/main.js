// Leonida Ledger's boot and wiring: loads the trophies and the saved state,
// builds the filter chips, connects the toolbar, tabs and detail pane, and
// re-renders on every change. It also carries the screenshot seeds: a
// ?shot= checklist|guide|roadmap|filters address loads a fixed, honest demo
// progress (a dozen trophies earned, counters part way) so the entry's
// screenshots show the tracker mid-platinum rather than empty — the same
// state a player would reach, never a state the tracker cannot hold.

import { GRADE_LABEL, GRADE_ORDER, KINDS, loadTrophies } from './data.js';
import { countByGrade, countByKind, emptyFilters, matchesFilters } from './filters.js';
import { renderDetail, renderList, renderProgress } from './render.js';
import { renderMissables, renderRoadmap } from './views.js';
import {
  downloadExport,
  isEarned,
  loadState,
  parseImport,
  saveState,
  setCounter,
  setEarned,
  setSpoiler,
} from './store.js';

const DEMO_EARNED = [
  'Just Like Paradise',
  'Paradise Lost',
  'T**s Ass Drug Money',
  'Vice City, Baby!',
  'Trust',
  'Break the Bank',
  'Family Matters',
  'Master of None',
  'Baited My Tackle',
  'Stick Fiddler',
  'Hot Together',
  'Positive Mental Attitude',
];
const DEMO_COUNTERS = {
  'The Shootist': 17,
  'Cunning Stunts': 96,
  'You WAiNKer!': 34,
  'Whip It Good': 41,
  'Actions Speak Louder': 132,
  'Dime on the Dollar': 64000,
  'Strangers & Freaks': 3,
};

const shot = new URLSearchParams(location.search).get('shot');

let trophies = [];
let state = loadState();
let filters = emptyFilters();
let selectedName = null;
let activeTab = 'checklist';

const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail');
const resultCountEl = document.getElementById('result-count');
const saveNoteEl = document.getElementById('save-note');

function selectedTrophy() {
  return trophies.find((trophy) => trophy.name === selectedName) ?? null;
}

function update() {
  renderProgress(trophies, state);
  const visible = trophies.filter((trophy) => matchesFilters(trophy, filters, state));
  resultCountEl.textContent = `Showing ${visible.length} of ${trophies.length} trophies · ${trophies.filter((t) => isEarned(state, t)).length} earned overall`;
  renderList(listEl, visible, state, selectedName, callbacks);
  renderDetail(detailEl, selectedTrophy(), state, callbacks);
  if (activeTab === 'roadmap') {
    renderRoadmap(document.getElementById('view-roadmap'), trophies, state, callbacks.onSelect);
  }
  if (activeTab === 'missables') {
    renderMissables(document.getElementById('view-missables'), trophies, state, callbacks.onSelect);
  }
}

const callbacks = {
  onToggle(trophy, earned) {
    setEarned(state, trophy, earned);
    update();
  },
  onCounter(trophy, value) {
    setCounter(state, trophy, value);
    update();
  },
  onSelect(trophy) {
    selectedName = trophy.name;
    if (activeTab !== 'checklist') activateTab('checklist');
    update();
    detailEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
};

function activateTab(tab) {
  activeTab = tab;
  for (const button of document.querySelectorAll('.tab')) {
    button.classList.toggle('is-active', button.dataset.tab === tab);
  }
  for (const view of document.querySelectorAll('.view')) {
    view.hidden = view.id !== `view-${tab}`;
  }
  update();
}

function buildChips() {
  const kindCounts = countByKind(trophies);
  const kindRow = document.getElementById('kind-chips');
  const kindOptions = [{ id: 'all', label: 'All kinds' }, ...KINDS];
  kindRow.replaceChildren(
    ...kindOptions.map((option) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `chip-btn${filters.kind === option.id ? ' is-active' : ''}`;
      chip.textContent = `${option.label} (${kindCounts[option.id] ?? 0})`;
      chip.addEventListener('click', () => {
        filters.kind = option.id;
        buildChips();
        update();
      });
      return chip;
    }),
  );
  const gradeCounts = countByGrade(trophies);
  const gradeRow = document.getElementById('grade-chips');
  const gradeOptions = ['all', ...GRADE_ORDER];
  gradeRow.replaceChildren(
    ...gradeOptions.map((grade) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `chip-btn${filters.grade === grade ? ' is-active' : ''}`;
      chip.textContent = grade === 'all' ? `All grades (${gradeCounts.all})` : `${GRADE_LABEL[grade]} (${gradeCounts[grade] ?? 0})`;
      chip.addEventListener('click', () => {
        filters.grade = grade;
        buildChips();
        update();
      });
      return chip;
    }),
  );
}

function seedDemo() {
  state = loadState();
  for (const name of DEMO_EARNED) state.earned[name] = true;
  Object.assign(state.counters, DEMO_COUNTERS);
  if (shot === 'filters') {
    state.spoiler = true;
    filters.kind = 'story';
  }
  if (shot === 'guide') selectedName = 'The Shootist';
}

function wireToolbar() {
  document.getElementById('search').addEventListener('input', (event) => {
    filters.query = event.target.value;
    update();
  });
  document.getElementById('status-filter').addEventListener('change', (event) => {
    filters.status = event.target.value;
    update();
  });
  document.getElementById('missable-only').addEventListener('change', (event) => {
    filters.missableOnly = event.target.checked;
    update();
  });
  const spoilerToggle = document.getElementById('spoiler-toggle');
  spoilerToggle.checked = state.spoiler;
  spoilerToggle.addEventListener('change', (event) => {
    setSpoiler(state, event.target.checked);
    update();
  });
  document.getElementById('export-btn').addEventListener('click', () => downloadExport(state));
  const fileInput = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;
    const imported = parseImport(await file.text());
    if (!imported) {
      saveNoteEl.textContent = 'That file is not a Leonida Ledger progress export; nothing was imported.';
      return;
    }
    state = imported;
    saveState(state);
    document.getElementById('spoiler-toggle').checked = state.spoiler;
    saveNoteEl.textContent = 'Progress imported and saved in this browser.';
    update();
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    state = { earned: {}, counters: {}, spoiler: state.spoiler };
    saveState(state);
    saveNoteEl.textContent = 'Progress cleared; the spoiler setting was kept.';
    update();
  });
  for (const button of document.querySelectorAll('.tab')) {
    button.addEventListener('click', () => activateTab(button.dataset.tab));
  }
}

async function boot() {
  trophies = await loadTrophies();
  if (shot) seedDemo();
  if (!selectedName && trophies.length > 0) selectedName = trophies[0].name;
  buildChips();
  wireToolbar();
  if (shot === 'roadmap') activateTab('roadmap');
  if (shot === 'missables') activateTab('missables');
  update();
  window.__shotReady = true;
}

boot().catch((error) => {
  resultCountEl.textContent = `The guide could not load its trophy data: ${error.message}`;
  window.__shotReady = true;
});
