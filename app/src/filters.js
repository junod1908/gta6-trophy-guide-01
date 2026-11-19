// Filtering and the spoiler rule. The filter state is a small object the
// toolbar edits: a search string, one kind (or 'all'), one grade (or
// 'all'), a status, and the missable-watch-only switch. A trophy passes
// when it satisfies every active condition; search reads the name, the
// official description, the kind and the guide, so a mission name or a
// place finds its trophy.
//
// The spoiler shield is a display rule, not a filter: with the shield on, a
// story trophy that is not yet earned is shown as a hidden trophy — its
// name and official description are replaced until it is earned. Earned
// story trophies, and every non-story trophy, always show in full.

export function emptyFilters() {
  return { query: '', kind: 'all', grade: 'all', status: 'all', missableOnly: false };
}

export function isShielded(trophy, state) {
  return state.spoiler === true && trophy.kind === 'story' && state.earned[trophy.name] !== true;
}

export function displayName(trophy, state) {
  return isShielded(trophy, state) ? 'Hidden trophy' : trophy.name;
}

export function displayDescription(trophy, state) {
  if (isShielded(trophy, state)) {
    return 'A story trophy, hidden by the spoiler shield. Earn it in the game — or turn the shield off — to reveal its name and description.';
  }
  return trophy.description;
}

function searchableText(trophy) {
  return [trophy.name, trophy.description, trophy.kind, trophy.grade, trophy.guide]
    .join(' ')
    .toLowerCase();
}

export function matchesFilters(trophy, filters, state) {
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.missableOnly && trophy.missable !== true) return false;
  const earned = state.earned[trophy.name] === true;
  if (filters.status === 'earned' && !earned) return false;
  if (filters.status === 'open' && earned) return false;
  const query = filters.query.trim().toLowerCase();
  if (query) {
    // A shielded trophy is searched by its real name too: hiding is a
    // display choice, and a player hunting a known name should find it.
    if (!searchableText(trophy).includes(query)) return false;
  }
  return true;
}

export function countByKind(trophies) {
  const counts = { all: trophies.length };
  for (const trophy of trophies) counts[trophy.kind] = (counts[trophy.kind] ?? 0) + 1;
  return counts;
}

export function countByGrade(trophies) {
  const counts = { all: trophies.length };
  for (const trophy of trophies) counts[trophy.grade] = (counts[trophy.grade] ?? 0) + 1;
  return counts;
}
