# Copilot / AI Agent Instructions for Sudoku-Labs

Short, actionable guide to get an AI coding agent productive in this repo.

**Big picture**
- Frontend: [index.html](index.html) is the HTML shell. The app source is [src/app.jsx](src/app.jsx) and is compiled in-browser with Babel (see the `<script type="text/babel">` include).
- Backend: [apps_script/Code.gs](apps_script/Code.gs) — Google Apps Script (GAS) Web App. All API traffic uses `doGet(e)` with an `action` query parameter.
- Data store: Google Sheets (sheets: `Leaderboard`, `Chat`, `Logs`) accessed via `SHEET_ID` in `Code.gs`.

**Key repo conventions & gotchas (must-know)**
- All client ↔ GAS calls use HTTP GET with `action=...` (see `runGasFn` mapping in [src/app.jsx](src/app.jsx)). Writes (saveScore, postChat, logError) are implemented as GET to avoid GAS POST redirect/auth issues.
- `config/config.example.js` is the template. Developers provide a local `config/config.local.js` (gitignored) that sets `CONFIG.GAS_URL`. The app falls back to a local generator and localStorage when `GAS_URL` is missing.
- Deploy GAS as a *Web App* with **Who has access = "Anyone (even anonymous)"**; otherwise requests will redirect (302) to a Google auth page and return HTML instead of JSON.

**Data flows & integration points**
- Frontend → GAS: `runGasFn(fnName, payload)` builds a URL with `action` and query params. Mapping in [src/app.jsx](src/app.jsx): `generateSudoku`, `getLeaderboard`, `saveScore`, `getChat`, `postChat`, `logError`.
- Local fallback: [src/app.jsx](src/app.jsx) contains `generateLocalBoard()` and localStorage helpers (`saveGame`, `loadGame`) and a `KEYS` constant. Use these for offline/dev behavior.

**Important code locations**
- API router & helpers: [apps_script/Code.gs](apps_script/Code.gs)
- Frontend app & GAS client: [src/app.jsx](src/app.jsx)
- HTML shell & runtime config load: [index.html](index.html)
- Config template: [config/config.example.js](config/config.example.js) and [config/README.md](config/README.md)
- Deployment & troubleshooting: [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md), [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

**Developer workflows (explicit commands & checks)**
- Quick backend health check (replace with your GAS_URL):
  ```bash
  curl "$GAS_URL?action=ping"
  curl "$GAS_URL?action=generateSudoku&difficulty=Easy"
  ```
- **Edit/deploy GAS (Manual method)**:
  1. Paste `apps_script/Code.gs` into a new Apps Script project.
  2. Run `setupSheets_()` once to create `Leaderboard`, `Chat`, `Logs`, `Users`.
  3. Deploy → Web App, execute as owner, set Who has access = Anyone (even anonymous).
  4. Copy the deployment URL into `config/config.local.js` as `CONFIG.GAS_URL`.
- **Edit/deploy GAS (Automated method - for AI agents)**:
  1. Install dependencies: `npm install`
  2. Set up clasp: `./scripts/setup-clasp.sh` (requires OAuth credentials)
  3. Deploy: `npm run deploy:gas` or `node scripts/deploy-gas.js`
  4. GitHub Actions: Commit with `[deploy-gas]` in message to auto-deploy
  5. See [docs/AI_AGENT_DEPLOYMENT.md](docs/AI_AGENT_DEPLOYMENT.md) for full details
- Frontend local testing: serve the repo (simple Python/Node static server) and open `index.html`. The app compiles `src/app.jsx` in-browser; for production precompile and bundle.

**Patterns & conventions to preserve when coding**
- Keep `doGet(e)` action names and `runGasFn` mapping in sync. Example: adding `action=foo` requires a `runGasFn` mapping entry and handler in `Code.gs`.
- Always sanitize sheet inputs in GAS using `sanitizeInput_` and `sanitizeOutput_`.
- Avoid introducing POST-only endpoints (public GAS redirects POSTs). If you must support POST, provide a GET-compatible alternative or document the auth requirements.
- Use the `KEYS` and localStorage helpers in `src/app.jsx` for state persistence: `sudoku_v2_state`, `sudoku_v2_leaderboard`, `sudoku_v2_chat`, `sudoku_v2_uid`, `sudoku_v2_sound`, `sudoku_v2_campaign`.

**Project-specific features to be aware of**
- Campaign mode: `CAMPAIGN_LEVELS` in `src/app.jsx` drives the map UI and unlock logic; progress saved to `CAMPAIGN_PROGRESS` key.
- SoundManager: lightweight WebAudio-based manager in `src/app.jsx` — call `SoundManager.init()` before play in browsers that suspend audio contexts.
- Local fallback puzzle generator: `generateLocalBoard()` mirrors server generator for dev and offline use.

**Debugging tips (project-specific)**
- If GAS returns HTML, confirm deployment access. Use `curl -v` to inspect `Location:` headers.
- Use `diagnostic.sh` for pre-built curl checks and `docs/TROUBLESHOOTING.md` for flags and examples.
- When investigating frontend behavior, inspect `runGasFn` caller sites in `src/app.jsx` and check Network tab for the built query string.

If you'd like, I can expand this with a step-by-step example: add a new GAS action + update `runGasFn` + test with `curl`.
# Copilot / AI Agent Instructions for Sudoku-Labs

Short, actionable guidance to get coding agents productive in this repo.

1) Big picture
-- Frontend: [index.html](../index.html) — HTML shell. The React/Babel app was moved to `src/app.jsx` and is compiled in-browser (Babel standalone). Hosted on GitHub Pages.
- Backend: [apps_script/Code.gs](../apps_script/Code.gs) — Google Apps Script Web App exposing a GET-based API routed via `doGet()` using an `action` query parameter.
- Data store: Google Sheets (three sheets: `Leaderboard`, `Chat`, `Logs`) accessed by `SHEET_ID` in `Code.gs`.

2) Key conventions and gotchas
-- All client ↔ GAS calls use HTTP GET with `action` query param (see `runGasFn` in [index.html](../index.html) / `src/app.jsx` and `doGet` in [apps_script/Code.gs](../apps_script/Code.gs)). Avoid introducing POST-only patterns — public GAS deployments redirect POSTs to auth pages.
- Config: `config/config.example.js` is the template; local secrets live in `config/config.local.js` (gitignored). The frontend loads `config/config.local.js` if present.
- Deployment: GAS must be deployed as a Web App with access set to "Anyone (even anonymous)" — otherwise requests will 302/403. See [docs/DEPLOYMENT_CHECKLIST.md](../docs/DEPLOYMENT_CHECKLIST.md).

3) Developer workflows (what to run / test)
- Local frontend development: Run a local web server (e.g., `python3 -m http.server 8000` and open `http://localhost:8000`, or `npx serve` and use the URL it provides). The app loads `src/app.jsx` via in-browser Babel compilation.
- Quick API health check: `diagnostic.sh` (curl-based) — use this to verify `ping` and headers.
- Backend edits: copy `apps_script/Code.gs` into a new Apps Script project, run `setupSheets_()` from the Apps Script editor, then Deploy → Web App and copy URL into `config/config.local.js`.
- Frontend edits: Edit `src/app.jsx` or `index.html`, refresh browser to see changes. No build step needed (Babel compiles in-browser). For production, consider precompiling/bundling (Vite/webpack).

4) Where to make changes (patterns to follow)
-- Add API actions in `doGet(e)` and mirror them in the `runGasFn` mapping found in `src/app.jsx` (previously inline in `index.html`).
- Persisted data must be sanitized using existing helpers `sanitizeInput_` / `sanitizeOutput_` in `Code.gs`.
- To add config values, update `config/config.example.js` and expect developers to mirror them in `config.local`.

5) Tests & debugging tips
- Reproduce endpoints locally with `curl "${GAS_URL}?action=..."` (examples in [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)).
- Use `curl -I -H 'Origin: http://localhost:8000' "$GAS_URL?action=ping"` to inspect CORS-like behavior; `diagnostic.sh` already includes useful examples.
- When changing `Code.gs`, re-deploy Apps Script and update `config/config.local.js` if the deployment URL changes.

6) Secure handling
- Never commit `config/config.local.js` or any real GAS URLs / credentials. The repo expects this file in `.gitignore` and shows `config/config.example.js` as the template.

7) Files to inspect when troubleshooting
- [apps_script/Code.gs](../apps_script/Code.gs) — routing, SHEET_ID constant, helpers
- [index.html](../index.html) — HTML shell; loads `src/app.jsx` (Babel/React) and `config/config.local.js`.
- [src/app.jsx](../src/app.jsx) — extracted in-browser React/Babel app (components, `runGasFn`, UI logic). Edit here for frontend behavior.
- [config/config.example.js](../config/config.example.js) and [config/README.md](../config/README.md)
- [docs/DEPLOYMENT_CHECKLIST.md](../docs/DEPLOYMENT_CHECKLIST.md) and [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)
- `diagnostic.sh` — quick CLI checks

If anything is unclear or you'd like this tailored (more examples, test commands, or a checklist for PR reviewers), tell me which sections to expand.
