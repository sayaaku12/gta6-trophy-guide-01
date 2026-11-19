// Leonida Trophy Guide — gta6-trophy-guide-01 entry (Node 22, stdlib only).
//
// The guide itself is app/: plain static files that open at app/index.html
// (one ES module, one stylesheet, one JSON data file, no build step) and work
// with the network off. This program hands it in: it copies app/ and
// screenshots/ from beside this file to the output directory and writes
// output/dossier.json, the summary the judge reads, with the vendored
// make.fun library. vendor/makefun-frontend.ts is copied from the kit
// unchanged; leave it as it is, or the scorer will refuse the dossier.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly instead of handing in a half-empty entry: the guide and its
// screenshots must both be present before anything is copied.
for (const needed of ['app', 'app/index.html', 'app/data/trophies.json']) {
  if (!existsSync(join(here, needed))) {
    throw new Error(`missing ${needed} — the guide is not built yet`);
  }
}
if (!existsSync(join(here, 'screenshots'))) {
  throw new Error('missing screenshots/ — take the screenshots first');
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 48 MiB of app files).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log(`Leonida Trophy Guide handed in to ${out} (app/ + screenshots/ + dossier.json).`);
