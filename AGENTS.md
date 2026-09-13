# Repository Guidelines

## Project Structure & Module Organization

The Vite/React client lives in `src/`, with reusable UI in `src/ui/`, game-specific components in `src/gameComponents/`, state and domain features in folders such as `src/games/`, `src/views/`, and `src/hooks/`, and translations in `src/i18n/`. Static files and game assets are under `public/`. The Ricochet.js backend is in `backend/src/`, with its Webpack configurations in `backend/`. End-to-end tests are in `cypress/integration/`; test fixtures and Cypress setup are in `cypress/fixtures/`, `cypress/support/`, and `cypress/plugins/`. Read `docs/dev.md` for the full local-stack setup.

## Build, Test, and Development Commands

Run these from the repository root unless noted otherwise:

- `npm ci` installs frontend dependencies; run `cd backend && npm ci` for backend dependencies.
- `npm start` launches the Vite development server (normally on port 3001).
- `npm run build` creates the production frontend bundle; `npm run serve` previews it.
- `npm run lint` checks JavaScript/JSX with ESLint; `npm run prettier` formats files under `src/`.
- `npm run check` validates local configuration and environment variables.
- `npm run cypress:open` opens the interactive Cypress runner; `npm run cypress:run` runs the suite headlessly.
- In `backend/`, use `npm run watch` for rebuilds, `npm run build` for a production backend bundle, or `npm run all` for the local Ricochet/wire.io stack.

Copy `.env.dist` to `.env` and set the required `VITE_RICOCHET_SITEID` plus backend/socket endpoints before starting the client. Keep secrets out of Git.

## Coding Style & Naming Conventions

Use two-space indentation, double quotes, semicolons, and Unix line endings. Follow the existing ESLint/Prettier configuration. Use PascalCase for React components, camelCase for functions and variables, and descriptive kebab-free names consistent with nearby files. Keep translations in both `src/i18n/en.json` and `src/i18n/fr.json` when adding user-facing text.

## Testing Guidelines

Cypress is the primary test framework. Name browser tests `*.spec.js` and place them in `cypress/integration/`; run the focused spec interactively or use `npm run cypress:run` before submitting changes. Update fixtures or test games only when behavior and expected data intentionally change.

## Commit & Pull Request Guidelines

Recent commits use short, imperative descriptions such as `Fix counter` and `Change server (#471)`. Keep commits focused and concise. Pull requests should explain user-visible and configuration changes, link relevant issues, include test commands/results, and attach screenshots or recordings for UI changes.
