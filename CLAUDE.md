# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

AirBoardGame is an open-source, browser-based tabletop simulator (React + Socket.io, client-to-client driven). Players share a virtual table: moving, flipping, tapping, or rotating an item is broadcast in real time to everyone in the session. It's also a game designer tool — non-developers can assemble a game from built-in item types (cards, dice, tokens, zones, boards...) without writing code.

The repo has **two independently-run parts**:
- **Frontend** (repo root, `src/`) — a Vite + React app.
- **Backend** (`backend/`) — glue code executed by [Ricochet.js](https://github.com/jrmi/ricochet.js), a generic serverless-ish backend framework (installed as the `ricochetjs` npm package), plus a [wire.io](https://github.com/jrmi/wire.io) socket.io relay for realtime sync.

Both must be running for the app to work in dev. See `docs/dev.md` for full first-time setup (registering a Ricochet.js "site", generating `RICOCHET_SITE_KEY`, etc.) — this is a real one-time setup step, not optional boilerplate.

## Commands

### Frontend (repo root)
```sh
npm start              # vite dev server, opens browser (port 3001)
npm run dev             # vite dev server, no auto-open
npm run build            # production build (vite build)
npm run serve             # preview a production build
npm run lint              # eslint src/
npm run prettier           # prettier --write src/
npm run check               # validates backend connectivity/config (checkConfig.mjs)
npm run i18n:scanner          # regenerate translation keys from source (i18next-scanner)
npm run cypress:open            # open Cypress e2e test runner
npm run cypress:run              # run Cypress e2e tests headlessly
```
There is no unit test runner configured — test coverage is Cypress e2e specs under `cypress/integration/`. To run a single spec: `npx cross-env VITE_CI=1 LANGUAGE=en cypress run --spec cypress/integration/<name>.spec.js`.

### Backend (`backend/`)
```sh
npm run all              # starts ricochetjs + wire.io + watch, concurrently (the normal dev command)
npm run ricochetjs         # just the Ricochet.js server (reads backend/.env)
npm run watch                # webpack watch: builds backend/src/*.js -> public/ricochet.json
npm run build                  # one-shot version of the watch build
npx wire.io@latest                # the realtime relay, standalone (needs npm >= 7)
```
`public/ricochet.json` is the encrypted, bundled backend logic actually executed by the Ricochet.js server; it's rebuilt by `npm run watch`/`build` from `backend/src/*.js` and encrypted with `RICOCHET_SITE_KEY` from `backend/.env`. If that key changes, `ricochet.json` must be rebuilt or the server fails to decrypt it — restart `npm run all` (or `npm run watch` alone) after any `RICOCHET_SITE_KEY` change.

Both `.env` and `backend/.env` are copied from `.env.dist` / `backend/.env.dist`. Default backend stores (`JSON_STORE_BACKEND=memory`, `FILE_STORE_BACKEND=memory`) lose all data (including the registered site) on every restart — use `nedb`/`disk` for anything persisted across restarts.

## Architecture

### Client-to-client sync via `react-sync-board`
Nearly all cross-component state (the item list, selection, board config, users, messages) is provided by the `react-sync-board` library's hooks — `useItemActions()`, `useSelectedItems()`, `useUsers()`, `useBoardConfig()`, `useItemInteraction()`, etc. — not React context written in this repo. Item CRUD (`getItems`, `batchUpdateItems`, `updateItem`, `pushItem(s)`, `removeItems`) always goes through `useItemActions()`. `getItems`/`getItemList` there are **live/authoritative**; `useDebouncedItems()` is a separate, intentionally-lagged read used for panels where re-rendering on every socket update would be wasteful — don't use the debounced value to compute deltas against live state (this caused a real bug: a rotation slider computing its delta from a debounced rotation desynced held items during fast drags).

`react-sync-board` also has its own internal logic that depends on an item's `linkedItems` field being a **flat array of plain string ids** (it walks that chain to move linked items together on drag, independent of anything in this repo). Never change `linkedItems` entries to a richer shape — store any extra per-item data as separate fields on the item itself instead.

### Item template system (`src/gameComponents/`)
Every placeable board item (Image, AdvancedImage, Zone, CheckerBoard, Die, Token, Meeple, Counter, Note, Generator, ...) is a folder under `src/gameComponents/<Type>/` exporting a template built with `createItemTemplate()` (`src/gameComponents/utils.js`): `{ type, component, form, defaultActions, availableActions, template (default field values), mapMedia }`. All templates are registered in `src/gameComponents/itemTemplates.js` (`itemLibrary` array → `itemTemplates` map keyed by `type`). To add a new item type, follow an existing folder's pattern (component + `*FormFields.jsx` + `index.js`) and register it there.

Shared item actions (rotate, tap, flip, stack, shuffle, align, clone, lock, generator logic, etc.) live in `src/gameComponents/useGameItemActions.jsx` as a single large hook (`actionMap`), consumed by the item toolbar/context menu and by the item edit panel (`src/views/BoardView/EditItemButton.jsx`).

**The "hold" / stacking mechanic** (an item like a token sitting on a card and rotating with it): `holdItems`/`linkedItems` membership is (re)computed in `getHeldItems()` (`src/utils/item.js`), called from each holder-capable component's `onPlaceItem` handler (Image, AdvancedImage, Zone, CheckerBoard). When an item newly becomes held, `captureHeldReferences()` writes `heldOffset`/`heldAngle` fields onto the *held item itself* (not onto `linkedItems`) — these anchor all future rotations to the placement moment instead of re-deriving position from the item's own already-rotated live position each time, which would let floating-point error compound. `computeHeldRotationUpdates()` in `useGameItemActions.jsx` consumes those fields.

### Game vs. Session vs. Room
- A **game** is a persisted design (board config, available item library, rules text) — created/edited in the "Studio" (`GameView`/`GameStudio`, route `/game/:gameId`), requires authentication to save.
- A **session** is an ephemeral, shareable play instance of a game (route `/session/:sessionId`) — no login needed, state lives in the Ricochet.js `session` box (`security: "public"`, see `backend/src/index.js`) and is normally lost when everyone leaves (unless auto-saved).
- A **room** (`/room/:roomId`) hosts a multi-board session.
Routing for all of this is centralized in `src/MainRoute.jsx`.

### Backend structure (`backend/src/`)
`index.js` is the Ricochet.js entrypoint: declares stores (`game`, `room`, `session`, `user`, `files` — each with a security level) and wires `hooks.before`/`hooks.after`/`hooks.beforeFile` (`hooks.js`) for auth/ownership checks (e.g. only the game owner or an admin can modify a `game`; `session`/`room` are public). `getConfToken.js` and `scheduled.js` (daily cleanup of old sessions) round out the backend logic. This is compiled+encrypted into `public/ricochet.json` by webpack (see Commands above) and executed remotely by the generic Ricochet.js server — it is **not** a conventional Express app you run directly.

### Other notable areas
- `src/mediaLibrary/` — the media/image upload & picker UI; uploads go through Ricochet.js's file-store endpoints (`src/utils/api.js`'s `uploadResourceImage`/`listResourceImage`/`deleteResourceImage`), namespaced per box/resource (e.g. `session/<sessionId>`).
- `src/utils/vassal.js` — importing Vassal module games.
- `src/i18n/` + `i18next-scanner.config.js` — translations; run `npm run i18n:scanner` after adding new `t("...")` strings.
- `src/utils/settings.js` — reads `VITE_*` env vars; `USE_PROXY`/`API_ENDPOINT` behavior depends on `VITE_USE_PROXY` and `vite.config.js`'s dev proxy (which forwards `/<siteId>` and `/file` to `VITE_API_ENDPOINT`).

### Z-index conventions (from `docs/dev.md`)
- 250–299: top UI (modals, color selector, cookie notice, bottom button bar)
- 200–249: over-items layer (navbar, side panels, selectors)
- 100–199: item zone (all board items)
- 0–99: underlay (board, background)

## Code style
ESLint config (`.eslintrc.js`): 2-space indent, double quotes, semicolons required, Prettier-enforced formatting, `react-hooks/exhaustive-deps` as a warning (also applied to `useRecoilCallback`). `react/prop-types` is off — don't add PropTypes.
