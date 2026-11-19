# Leonida Ledger — GTA VI Trophy Guide & Platinum Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/junod1908/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/junod1908/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline web app that guides and tracks all 55 Grand Theft Auto VI
PlayStation 5 trophies: the official list with its names, descriptions and
grades, a checklist saved in the browser, filters, a spoiler shield, a
roadmap to the platinum, the missable trophies flagged, and a guide to every
trophy in our own words that cites its sources. An entry to the make.fun
bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **The full official list** — all 55 trophies (1 platinum, 2 gold, 6
  silver, 46 bronze) with the exact name, official description and grade
  PlayStation publishes, as listed by Exophase and PSNProfiles.
- **A tracker** — tick trophies off as you earn them; progress is saved in
  the browser (localStorage) and can be exported to a JSON file and
  imported back. The 20 trophies PlayStation tracks a count for (250
  stunts, 42 Shooting Range golds, $250,000 laundered…) carry counters
  that mark the trophy earned when the target lands.
- **Filters** — by kind (story, collectibles, activities, online, misc),
  by grade, by earned status, missable-watch only, and full-text search.
  The official list has no online trophies, so that filter is honestly
  empty.
- **A spoiler shield** — hide the names and descriptions of story trophies
  until you have earned them.
- **A roadmap to the platinum** — six stages in playing order, built from
  the official descriptions: story first, strangers, collectibles and
  exploration, activities, free-roam feats and money, then 100% and the
  platinum. Estimates are labelled as estimates.
- **Missable watch** — three trophies flagged as cautions read from their
  official descriptions (the VCIA departure, the Ocean Beach cocktail,
  your 500 choices), each with its reasoning stated and plainly marked
  unverified.
- **Cited guides** — every trophy's guide is written for this entry, in
  its own words, and names its sources; where a description is a riddle
  and the trigger is not yet verified, the guide says so instead of
  inventing steps.

Everything is original: no Rockstar Games logo, artwork or game
screenshots, and no text copied from another guide.

## Run it

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

Open the page in a desktop browser. It works with the network off — every
file it loads lives under `app/`, and it makes no network request.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored make.fun library
(`vendor/makefun-frontend.ts`, the kit's copy, unchanged).

## Layout

- `app/index.html` — the page shell: masthead, progress, tabs, toolbar.
- `app/style.css` — the night-ledger look.
- `app/src/data.js` — loads the trophy file; grade/kind tables and the
  six roadmap stages.
- `app/src/store.js` — localStorage progress, counters, export and import.
- `app/src/filters.js` — filter matching and the spoiler-shield rule.
- `app/src/render.js` — progress header, checklist rows, detail pane.
- `app/src/views.js` — the roadmap and missable-watch views.
- `app/src/main.js` — boot, wiring, and the `?shot=` screenshot seeds.
- `app/data/trophies.json` — the 55 trophies with kinds, stages, targets,
  missable flags, guides and sources.
- `screenshots/` — four renders of the app itself (see `shots.json`).

## License

MIT — see `LICENSE`.
