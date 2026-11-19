// The two reading views: the roadmap to the platinum (the six stages in
// playing order, each with its trophies and the stage's own progress) and
// the missable watch (the trophies this guide flags, with the reasoning for
// each flag stated as plainly as the guide can state it). Both are built
// from the same trophy data and the same saved state as the checklist.

import { GRADE_LABEL, STAGES } from './data.js';
import { displayName } from './filters.js';
import { isEarned } from './store.js';

// The same node builder as render.js: class plus optional text, the text
// always assigned as textContent so trophy text is never parsed as markup.
function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function trophyChip(trophy, state, onSelect) {
  const chip = h('button', `chip${isEarned(state, trophy) ? ' is-earned' : ''}`);
  chip.type = 'button';
  chip.append(
    h('span', `swatch swatch-${trophy.grade}`),
    h('span', 'chip-name', displayName(trophy, state)),
    h('span', 'chip-grade', GRADE_LABEL[trophy.grade]),
  );
  if (trophy.missable) chip.append(h('span', 'tag tag-missable', 'Missable watch'));
  chip.addEventListener('click', () => onSelect(trophy));
  return chip;
}

export function renderRoadmap(section, trophies, state, onSelect) {
  const intro = h('div', 'view-intro');
  intro.append(
    h('h2', 'view-title', 'Roadmap to the platinum'),
    h('p', 'view-lede', 'Six stages, in the order this guide recommends playing them, built from the official descriptions: which story chapters and missions come first, which collectibles and counts fill the middle, and what the endgame asks. Estimates are rough planning figures read from the descriptions and their tracked counts — labelled as estimates, never as measurements. Select any trophy to open its guide.'),
  );
  const parts = [intro];
  for (const stage of STAGES) {
    const inStage = trophies.filter((trophy) => trophy.stage === stage.n);
    const done = inStage.filter((trophy) => isEarned(state, trophy)).length;
    const block = h('section', 'stage');
    const head = h('div', 'stage-head');
    head.append(
      h('h3', 'stage-title', `Stage ${stage.n} — ${stage.title}`),
      h('span', 'stage-progress', `${done}/${inStage.length} earned`),
    );
    const bar = h('div', 'counter-bar stage-bar');
    const fill = h('div', 'counter-fill');
    fill.style.width = inStage.length === 0 ? '0%' : `${(done / inStage.length) * 100}%`;
    bar.append(fill);
    block.append(head, h('p', 'stage-note', stage.note), bar);
    const chips = h('div', 'chip-grid');
    chips.append(...inStage.map((trophy) => trophyChip(trophy, state, onSelect)));
    block.append(chips);
    parts.push(block);
  }
  section.replaceChildren(...parts);
}

export function renderMissables(section, trophies, state, onSelect) {
  const flagged = trophies.filter((trophy) => trophy.missable);
  const intro = h('div', 'view-intro');
  intro.append(
    h('h2', 'view-title', 'Missable watch'),
    h('p', 'view-lede', 'Three trophies are flagged here, and the flags are cautions, not verdicts. Each is tied by its official description to a moment the game may not offer twice — a story location, an early scripted scene, choices made as the story unfolds — and the official list nowhere promises those moments can be replayed. The game is days old and no flag here is confirmed in play; each card quotes the reasoning so you can judge it yourself. Everything not flagged reads, from its description, as repeatable in free roam or earned in story order.'),
  );
  const parts = [intro];
  for (const trophy of flagged) {
    const card = h('article', 'missable-card');
    const head = h('div', 'missable-card-head');
    head.append(h('span', `swatch swatch-${trophy.grade}`), h('h3', 'missable-card-title', displayName(trophy, state)));
    card.append(head);
    card.append(h('p', 'missable-card-desc', `\u201C${trophy.description}\u201D`));
    if (trophy.missableNote) card.append(h('p', 'missable-card-note', trophy.missableNote));
    const open = h('button', 'missable-open', 'Open the guide');
    open.type = 'button';
    open.addEventListener('click', () => onSelect(trophy));
    card.append(open);
    parts.push(card);
  }
  const cleared = h('p', 'view-foot', 'Why nothing else is flagged: chapter and named-mission trophies are earned in story order; the robberies, races, challenges and counters describe repeatable open-world systems; and the money and property totals accumulate across a whole playthrough. If a later, verified guide proves one of these wrong, the honest fix is a flag here — until then, these three cautions are the ones the official descriptions support.');
  parts.push(cleared);
  section.replaceChildren(...parts);
}
