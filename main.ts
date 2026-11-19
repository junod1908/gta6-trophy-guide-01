// Leonida Ledger, an entry to make.fun's gta6-trophy-guide-01 (Node 22,
// standard library only). The guide itself is this directory's app/ folder:
// plain static files a browser opens at app/index.html (ES modules, one
// stylesheet, no build step), fully offline — it loads nothing over the
// network, and its trophy list, guides, roadmap and missable flags are
// app/data/trophies.json plus the modules under app/src/.
//
// This program hands the guide in: it copies app/ and screenshots/ from
// beside this file to /output and writes /output/dossier.json, the summary
// the judge reads (the screenshots, the first load's files and bytes, and
// the source outline), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts exactly as the kit ships it: the scorer
// requires dossier.json to be byte for byte what its own copy writes.
//
// Try the guide locally with `node serve.ts`, then open
// http://localhost:8080. Outside the grader's container,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Everything resolves beside this file, never from the caller's working
// directory: the hand-in must describe the same app wherever it runs from.
const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The entry is only complete with its page and screenshots in place:
// refuse to hand in a dossier the gate would reject for a missing app or a
// missing or empty screenshots/.
if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error('app/index.html is missing: the guide has no page to hand in');
}
if (!existsSync(join(here, 'app', 'data', 'trophies.json'))) {
  throw new Error('app/data/trophies.json is missing: the guide has no trophy list to hand in');
}
const shotsDir = join(here, 'screenshots');
const shotCount = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((name) => /\.(png|jpe?g)$/i.test(name)).length
  : 0;
if (shotCount < 3 || shotCount > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shotCount}`);
}

// The dossier below is built from these output copies, so the summary the
// judge reads describes exactly the files that were handed in.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (the gate): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 48 MiB of app files: app/ counts beside /output's own 1,000-entry
// cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
