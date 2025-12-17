# Copilot / AI Agent Instructions for Sudoku-Labs

Short, actionable guide to get an AI coding agent productive in this repo.

**Big picture**
- Frontend: [public/index.html](../public/index.html) is the HTML shell. The app uses a **modular architecture** with 5 source files loaded in order:
  - [src/constants.js](../src/constants.js) - Game constants, themes, sound packs, campaign data
  - [src/utils.js](../src/utils.js) - Validation, formatting, Sudoku helpers
  - [src/sound.js](../src/sound.js) - WebAudio SoundManager with 8 procedural sound packs
  - [src/services.js](../src/services.js) - API service layer, storage, data management
  - [src/app.jsx](../src/app.jsx) - React UI components (compiled in-browser with Babel)
- Backend: [backend/gas/Code.gs](../backend/gas/Code.gs) — Google Apps Script (GAS) Web App. All API traffic uses `doGet(e)` with an `action` query parameter.
- Data store: Google Sheets (sheets: `Leaderboard`, `Chat`, `Logs`, `Users`) accessed via `SHEET_ID` in `Code.gs`.

**Key repo conventions & gotchas (must-know)**
- **Modular frontend**: All modules export to `window` object for in-browser Babel compatibility (no ES modules). Load order matters: constants → utils → sound → services → app.
- All client ↔ GAS calls use HTTP GET with `action=...` (see `runGasFn` mapping in [src/services.js](../src/services.js)). Writes (saveScore, postChat, logError) are implemented as GET to avoid GAS POST redirect/auth issues.
- `config/config.example.js` is the template. Developers provide a local `config/config.local.js` (gitignored) that sets `CONFIG.GAS_URL`. The app falls back to a local generator and localStorage when `GAS_URL` is missing.
- Deploy GAS as a *Web App* with **Who has access = "Anyone (even anonymous)"**; otherwise requests will redirect (302) to a Google auth page and return HTML instead of JSON.

**Data flows & integration points**
- Frontend → GAS: `runGasFn(fnName, payload)` builds a URL with `action` and query params. Mapping in [src/services.js](../src/services.js): `generateSudoku`, `getLeaderboard`, `saveScore`, `getChat`, `postChat`, `logError`.
- Local fallback: [src/utils.js](../src/utils.js) contains `generateLocalBoard()` for offline puzzle generation. [src/services.js](../src/services.js) contains StorageService with 18 methods for localStorage management.

**Important code locations**
- API router & helpers: [backend/gas/Code.gs](../backend/gas/Code.gs)
- Frontend app & GAS client: [src/app.jsx](../src/app.jsx)
- Constants & configuration: [src/constants.js](../src/constants.js) - THEMES, SOUND_PACKS, CAMPAIGN_LEVELS
- Utilities & helpers: [src/utils.js](../src/utils.js) - validation, formatting, Sudoku logic
- Sound system: [src/sound.js](../src/sound.js) - SoundManager with 8 procedural packs
- Service layer: [src/services.js](../src/services.js) - API, storage, leaderboard, chat, unlocks
- HTML shell & runtime config load: [public/index.html](../public/index.html)
- Config template: [config/config.example.js](../config/config.example.js) and [config/README.md](../config/README.md)
- Deployment & troubleshooting: [docs/deployment/checklist.md](../docs/deployment/checklist.md), [docs/deployment/troubleshooting.md](../docs/deployment/troubleshooting.md)

**Developer workflows (explicit commands & checks)**
- Quick backend health check (replace with your GAS_URL):
  ```bash
  curl "$GAS_URL?action=ping"
  curl "$GAS_URL?action=generateSudoku&difficulty=Easy"
  ```
- Edit/deploy GAS:
  1. Paste `backend/gas/Code.gs` into a new Apps Script project.
  2. Run `setupSheets_()` once to create `Leaderboard`, `Chat`, `Logs`.
  3. Deploy → Web App, execute as owner, set Who has access = Anyone (even anonymous).
  4. Copy the deployment URL into `config/config.local.js` as `CONFIG.GAS_URL`.
- Frontend local testing: serve the repo (simple Python/Node static server) and open `public/index.html`. The app loads `src/app.jsx` via in-browser Babel compilation.

**Patterns & conventions to preserve when coding**
- Keep `doGet(e)` action names and `runGasFn` mapping in sync. Example: adding `action=foo` requires a `runGasFn` mapping entry in [src/services.js](../src/services.js) and handler in `Code.gs`.
- Always sanitize sheet inputs in GAS using `sanitizeInput_` and `sanitizeOutput_`.
- Avoid introducing POST-only endpoints (public GAS redirects POSTs). If you must support POST, provide a GET-compatible alternative or document the auth requirements.
- Use the `KEYS` and localStorage helpers in `src/services.js` for state persistence: `sudoku_v2_state`, `sudoku_v2_leaderboard`, `sudoku_v2_chat`, `sudoku_v2_uid`, `sudoku_v2_sound`, `sudoku_v2_campaign`.

**Project-specific features to be aware of**
- Campaign mode: `CAMPAIGN_LEVELS` in [src/constants.js](../src/constants.js) drives the map UI and unlock logic; progress saved via StorageService.
- SoundManager: lightweight WebAudio-based manager in [src/sound.js](../src/sound.js) — call `SoundManager.init()` before play in browsers that suspend audio contexts.
- Local fallback puzzle generator: `generateLocalBoard()` in [src/utils.js](../src/utils.js) mirrors server generator for dev and offline use.

**Debugging tips (project-specific)**
- If GAS returns HTML, confirm deployment access. Use `curl -v` to inspect `Location:` headers.
- Use `diagnostic.sh` for pre-built curl checks and `docs/TROUBLESHOOTING.md` for flags and examples.
- When investigating frontend behavior, inspect `runGasFn` caller sites in `src/services.js` and check Network tab for the built query string.

If you'd like, I can expand this with a step-by-step example: add a new GAS action + update `runGasFn` + test with `curl`.