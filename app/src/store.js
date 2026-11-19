// The tracker's memory: which trophies are earned, how far each tracked
// counter has got, and whether the spoiler shield is on. Everything lives in
// one localStorage record, is written on every change, and can be exported
// to a JSON file and imported back — the file is the same shape the app
// keeps, so an export from one browser restores exactly in another.

const STORAGE_KEY = 'leonida-ledger-v1';
const EXPORT_APP = 'leonida-ledger';

export function emptyState() {
  return { earned: {}, counters: {}, spoiler: false };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return normalizeState(JSON.parse(raw));
  } catch {
    return emptyState();
  }
}

// Accepts a stored record or an imported file and returns a clean state:
// unknown trophy names are dropped by the caller against the trophy list,
// non-numeric counters are discarded here, and the spoiler flag is a plain
// boolean. Importing never throws on a merely untidy file.
export function normalizeState(value) {
  const state = emptyState();
  if (!value || typeof value !== 'object') return state;
  if (value.earned && typeof value.earned === 'object') {
    for (const [name, flag] of Object.entries(value.earned)) {
      if (flag) state.earned[name] = true;
    }
  }
  if (Array.isArray(value.earnedNames)) {
    for (const name of value.earnedNames) {
      if (typeof name === 'string') state.earned[name] = true;
    }
  }
  if (value.counters && typeof value.counters === 'object') {
    for (const [name, count] of Object.entries(value.counters)) {
      const n = Number(count);
      if (Number.isFinite(n) && n > 0) state.counters[name] = Math.floor(n);
    }
  }
  state.spoiler = value.spoiler === true || value?.settings?.spoiler === true;
  return state;
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, quotas): the tracker keeps
    // working for the session and the export button remains the way out.
  }
}

export function isEarned(state, trophy) {
  return state.earned[trophy.name] === true;
}

export function counterOf(state, trophy) {
  return state.counters[trophy.name] ?? 0;
}

// Toggling a trophy whose counter has already reached its target keeps the
// counter; clearing a counter below its target un-earns nothing by itself —
// the checkbox is the player's word, the counter is their notebook.
export function setEarned(state, trophy, earned) {
  if (earned) state.earned[trophy.name] = true;
  else delete state.earned[trophy.name];
  saveState(state);
}

export function setCounter(state, trophy, value) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  if (n === 0) delete state.counters[trophy.name];
  else state.counters[trophy.name] = n;
  if (trophy.target && n >= trophy.target) state.earned[trophy.name] = true;
  saveState(state);
  return n;
}

export function setSpoiler(state, on) {
  state.spoiler = on === true;
  saveState(state);
}

// Clears every earned flag and counter while keeping the spoiler setting:
// starting a fresh playthrough should not force a player to re-hide the
// story trophies they have not reached yet.
export function resetProgress(state) {
  state.earned = {};
  state.counters = {};
  saveState(state);
}

// The export file: earned names as a list (readable, diffable), counters by
// trophy name, and the spoiler setting — stamped with the app and version
// so an import can refuse a file that is not one of ours.
export function exportData(state) {
  return {
    app: EXPORT_APP,
    version: 1,
    exportedAt: new Date().toISOString(),
    earnedNames: Object.keys(state.earned).sort(),
    counters: { ...state.counters },
    spoiler: state.spoiler,
  };
}

export function downloadExport(state) {
  const blob = new Blob([JSON.stringify(exportData(state), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-ledger-progress.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Parses an imported file's text. Returns the normalized state, or null
// when the file is not a Leonida Ledger export (or not JSON at all).
export function parseImport(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  if (value.app !== undefined && value.app !== EXPORT_APP) return null;
  if (!('earnedNames' in value) && !('earned' in value) && !('counters' in value)) return null;
  return normalizeState(value);
}
