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
