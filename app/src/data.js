// Data for Leonida Ledger: loads the trophy file that ships with the app and
// holds the guide's own reference tables — grade order and labels, the kind
// labels used by the filters, and the six roadmap stages every trophy is
// filed under. The trophies themselves live in app/data/trophies.json: their
// names, descriptions and grades are the official PlayStation 5 list, and
// each carries this guide's own kind, stage, target, missable flag and guide.

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const GRADE_LABEL = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const KINDS = [
  { id: 'story', label: 'Story' },
  { id: 'collectible', label: 'Collectibles' },
  { id: 'activity', label: 'Activities' },
  { id: 'online', label: 'Online' },
  { id: 'misc', label: 'Misc & feats' },
];

export const KIND_LABEL = Object.fromEntries(KINDS.map((kind) => [kind.id, kind.label]));

// The roadmap: six stages, in the order this guide recommends playing them.
// Each stage's note says what it holds and gives a rough planning estimate
// read from the official descriptions and their tracked counts alone; the
// estimates are labelled as estimates in the app, never as measurements.
export const STAGES = [
  {
    n: 1,
    title: 'Story first — missions and chapters',
    note: 'Play the campaign in order: the opening mission Gone Fishing, Chapters 1 to 4, the named missions (Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown, Operation Savage Glory) and the final mission. Three missable-watch items live in this stage — the VCIA departure, the Ocean Beach cocktail and your 500 choices — so clear them as their moments arrive, not after the credits. Estimate: the bulk of a first playthrough; the story is the spine everything else hangs on.',
  },
  {
    n: 2,
    title: 'Strangers and side stories',
    note: 'Finish the named strands — Andy, Kenton, Billy, Randy and Tyrone each end in a trophy of their own — plus Bret\u2019s hunt, and complete any 8 strands in all for the silver Strangers & Freaks. Estimate: several evenings of side missions, most of them started during stage 1 travel.',
  },
  {
    n: 3,
    title: 'Collectibles and exploration',
    note: 'One region-by-region sweep of Leonida clears most of five counters at once: 18 meditation spots, 3 Collectible Card sets, WAiNK at 100 locations, 100 vehicles discovered and all 52 areas explored. Estimate: a long weekend of routes; the counts, not the difficulty, set the pace.',
  },
  {
    n: 4,
    title: 'Activities and challenges',
    note: 'The skill stage. Gold medals in all 42 Shooting Range challenges are the gate; around them sit 250 stunts, wins at 14 Top Fun Drone Race locations, 20 different race wins, 50 challenges, a fishing win against Cal, one arcade game, bowling, and a first try of all 9 activity types. Estimate: the second-longest stage — the range golds decide how long.',
  },
  {
    n: 5,
    title: 'Free-roam feats, money and cleanup',
    note: 'Everything the open world lets you repeat: the two partner feats, 5 Bank Vaults, an armored truck, one Illegal Operation for each of the 9 gangs, an undetected jewelry robbery, and the money totals — $250,000 laundered, $100,000 spent, all 8 garages bought, 10 vehicles registered — plus the one-off feats and the three riddle trophies whose triggers the official descriptions do not pin down. Estimate: steady cleanup, paced by the two dollar totals.',
  },
  {
    n: 6,
    title: '100 percent and the platinum',
    note: 'Whatever the game\u2019s completion tally still wants, finished off: A Long Road at 100%, and the moment it lands, Vice Got a Price! follows on its own, because the platinum asks for nothing but the other 54. Estimate: entirely depends on what stages 1 to 5 left behind — which is why the counters are worth keeping honest from day one.',
  },
];

export const STAGE_BY_N = Object.fromEntries(STAGES.map((stage) => [stage.n, stage]));

// Fetches the app's own trophy file (a relative path inside app/, never the
// network beyond this static server) and returns its trophies in list order.
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json answered ${response.status}`);
  const data = await response.json();
  const trophies = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(trophies) || trophies.length === 0) {
    throw new Error('trophies.json holds no trophies array');
  }
  // The list is shown in official order; sort by id so the order survives
  // an untidy hand edit of the data file.
  return [...trophies].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
}

export function formatTarget(value) {
  return value.toLocaleString('en-US');
}
