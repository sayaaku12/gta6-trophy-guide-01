[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/sayaaku12/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/sayaaku12/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI · PS5

An offline guide and tracker for all **55 Grand Theft Auto VI PlayStation 5 trophies**: the official list with a cited guide for every trophy, a checklist saved in the browser, a roadmap to the platinum, the missables flagged, and a next-up planner.

Built for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) ($250, 50 places paid).

## What it does

- **Checklist** — all 55 trophies with official names, descriptions and grades; tick them off, progress saves in the browser (localStorage), export to a file and import it back.
- **Filters** — by kind (story, collectibles, activities), grade, earned / not earned, missable only, hidden only; plus full-text search.
- **Spoiler setting** — hides story trophy names and descriptions until they are earned.
- **Guide pane** — every trophy has a guide in our own words with its sources (Exophase for name/description/grade, PSNProfiles for PSN counts, PowerPyx/GTABase via OutputLag and GTA-Zone for methods), its PSN count, and a per-trophy note field.
- **Roadmap to Platinum** — three phases (story 60–80 h, 100% grind ~100 h, cleanup ~10 h; ~200 h total, difficulty 4/10) with live per-phase progress.
- **Missables** — exactly one trophy can be missed (Positive Mental Attitude); the page also lists the time-sensitive items and the six trophies whose exact triggers are still unconfirmed, labelled as such — never guessed.
- **Next up** — the five best next trophies for where you are now.
- **Two themes** (paper / night) and keyboard shortcuts (`/` search, `1`–`4` sections, `S` spoilers, `T` theme).

## The trophy list — verified

55 trophies: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden; all single-player, 0 online. The list was frozen 2026-11-18 from Exophase and PSNProfiles, which agree on every name, description and grade, and cross-checked against OutputLag and GTA-Zone. Honest caveat, stated in the app too: Rockstar has not published its own list — “official” here means the PSN-published list as frozen by Exophase and PSNProfiles. PSN counts are from Exophase, 2026-11-19.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: `app/` is plain static files (`index.html`, `app.js`, `style.css`, `data/trophies.json`).

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, stdlib only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts` (copied from the kit unchanged).

## Files

- `app/` — the guide (static files, works offline)
- `app/data/trophies.json` — all 55 trophies: official name, description, grade, hidden flag, PSN count, kind, missable flag, roadmap stage, target, guide and sources
- `screenshots/` — real renders of the guide
- `main.ts` — entrypoint; `serve.ts` — local static server
- `vendor/makefun-frontend.ts` — make.fun library, unchanged from the kit

## License

MIT — see [LICENSE](LICENSE). An unofficial, fan-made guide: no Rockstar logo, artwork, box art or game screenshots anywhere. Trophy names and descriptions are shown as PlayStation publishes them.

---
Built for [make.fun](https://make.fun) — bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).
