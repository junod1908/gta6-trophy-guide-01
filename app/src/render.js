// Rendering for the checklist view: the header progress (ring, earned count,
// per-grade tally), the trophy rows, and the detail pane that shows one
// trophy's official description, this guide's own guide text with its
// sources, its missable note and its counter editor. Everything is built
// with DOM calls and textContent, so trophy text is never parsed as markup.

import { GRADE_LABEL, GRADE_ORDER, KIND_LABEL, STAGE_BY_N, formatTarget } from './data.js';
import { displayDescription, displayName, isShielded } from './filters.js';
import { counterOf, isEarned } from './store.js';

// The one node builder for this view: every element goes through here so
// class and text handling stay uniform — text always via textContent.
function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const RING_CIRCUMFERENCE = 2 * Math.PI * 52;

export function renderProgress(trophies, state) {
  const earned = trophies.filter((trophy) => isEarned(state, trophy));
  document.getElementById('earned-count').textContent = String(earned.length);
  const ring = document.getElementById('ring-fill');
  const fraction = trophies.length === 0 ? 0 : earned.length / trophies.length;
  ring.style.strokeDasharray = String(RING_CIRCUMFERENCE);
  ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - fraction));

  const tally = document.getElementById('grade-tally');
  tally.replaceChildren(
    ...GRADE_ORDER.map((grade) => {
      const inGrade = trophies.filter((trophy) => trophy.grade === grade);
      const done = inGrade.filter((trophy) => isEarned(state, trophy)).length;
      const item = h('li', `tally tally-${grade}`);
      item.append(h('span', 'swatch'), h('span', 'tally-text', `${GRADE_LABEL[grade]} ${done}/${inGrade.length}`));
      return item;
    }),
  );
}

function badgesFor(trophy, state) {
  const badges = [];
  badges.push(h('span', 'tag tag-kind', KIND_LABEL[trophy.kind] ?? trophy.kind));
  badges.push(h('span', 'tag tag-stage', `Roadmap stage ${trophy.stage}`));
  if (trophy.missable) badges.push(h('span', 'tag tag-missable', 'Missable watch'));
  if (trophy.target) {
    const count = counterOf(state, trophy);
    badges.push(h('span', 'tag tag-counter', `${formatTarget(count)} / ${formatTarget(trophy.target)} ${trophy.targetLabel}`));
  }
  return badges;
}

export function renderList(listEl, visible, state, selectedName, callbacks) {
  const rows = visible.map((trophy) => {
    const earned = isEarned(state, trophy);
    const row = h('li', `row grade-edge-${trophy.grade}${earned ? ' is-earned' : ''}${trophy.name === selectedName ? ' is-selected' : ''}`);

    const checkLabel = h('label', 'row-check');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = earned;
    checkbox.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    checkbox.addEventListener('change', () => callbacks.onToggle(trophy, checkbox.checked));
    checkLabel.append(checkbox);

    const main = h('button', 'row-main');
    main.type = 'button';
    main.addEventListener('click', () => callbacks.onSelect(trophy));
    const top = h('span', 'row-top');
    top.append(h('span', `swatch swatch-${trophy.grade}`), h('span', 'row-name', displayName(trophy, state)));
    const badges = h('span', 'row-badges');
    badges.append(...badgesFor(trophy, state));
    main.append(top, h('span', 'row-desc', displayDescription(trophy, state)), badges);

    row.append(checkLabel, main);
    return row;
  });
  listEl.replaceChildren(...rows);
}

function counterEditor(trophy, state, callbacks) {
  const wrap = h('div', 'counter-editor');
  const count = counterOf(state, trophy);
  wrap.append(h('p', 'counter-line', `PlayStation tracks ${formatTarget(trophy.target)} — ${trophy.targetLabel}. Your count:`));
  const controls = h('div', 'counter-controls');
  const minus = h('button', 'counter-btn', '−');
  minus.type = 'button';
  minus.setAttribute('aria-label', 'Decrease count');
  minus.addEventListener('click', () => callbacks.onCounter(trophy, count - 1));
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.value = String(count);
  input.setAttribute('aria-label', `Your count for ${trophy.name}`);
  input.addEventListener('change', () => callbacks.onCounter(trophy, Number(input.value)));
  const plus = h('button', 'counter-btn', '+');
  plus.type = 'button';
  plus.setAttribute('aria-label', 'Increase count');
  plus.addEventListener('click', () => callbacks.onCounter(trophy, count + 1));
  const bar = h('div', 'counter-bar');
  const fill = h('div', 'counter-fill');
  fill.style.width = `${Math.min(100, (count / trophy.target) * 100)}%`;
  bar.append(fill);
  controls.append(minus, input, plus);
  wrap.append(controls, bar);
  if (count >= trophy.target) wrap.append(h('p', 'counter-done', 'Target reached — this trophy is marked earned.'));
  return wrap;
}

export function renderDetail(detailEl, trophy, state, callbacks) {
  if (!trophy) {
    detailEl.replaceChildren(
      h('h2', 'detail-title', 'Pick a trophy'),
      h('p', 'detail-hint', 'Select any trophy in the list to read its guide: what the official description asks, where it sits in the roadmap, when it can be missed, and the sources each claim stands on.'),
    );
    return;
  }
  const earned = isEarned(state, trophy);
  const shielded = isShielded(trophy, state);
  const stage = STAGE_BY_N[trophy.stage];

  const head = h('div', 'detail-head');
  head.append(h('span', `swatch swatch-big swatch-${trophy.grade}`));
  const headText = h('div', 'detail-head-text');
  headText.append(
    h('p', 'detail-grade', `${GRADE_LABEL[trophy.grade]} · ${KIND_LABEL[trophy.kind] ?? trophy.kind} · Roadmap stage ${trophy.stage}${stage ? ` — ${stage.title}` : ''}`),
    h('h2', 'detail-title', displayName(trophy, state)),
  );
  head.append(headText);

  const parts = [head];
  parts.push(h('p', 'detail-label', 'Official description'));
  parts.push(h('blockquote', 'detail-desc', displayDescription(trophy, state)));

  if (trophy.missable && trophy.missableNote && !shielded) {
    const note = h('div', 'missable-note');
    note.append(h('p', 'missable-note-title', 'Missable watch'), h('p', 'missable-note-text', trophy.missableNote));
    parts.push(note);
  }

  if (!shielded) {
    parts.push(h('p', 'detail-label', 'Guide — in our own words'));
    parts.push(h('p', 'detail-guide', trophy.guide));
    parts.push(h('p', 'detail-label', 'Sources'));
    parts.push(h('p', 'detail-sources', trophy.sources));
    if (trophy.target) parts.push(counterEditor(trophy, state, callbacks));
  } else {
    parts.push(h('p', 'detail-hint', 'The guide for this trophy is hidden by the spoiler shield too. Mark it earned when you unlock it in the game and everything is revealed.'));
  }

  const toggle = h('button', earned ? 'earned-btn is-earned' : 'earned-btn', earned ? 'Earned ✓ — tap to undo' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => callbacks.onToggle(trophy, !earned));
  parts.push(toggle);

  detailEl.replaceChildren(...parts);
}
