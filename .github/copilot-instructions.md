# Copilot / AI Agent Instructions for Sudoku-Labs

Essential knowledge for AI agents to be productive in this codebase.

## Architecture Overview

**Frontend**: In-browser React app with modular architecture, no build step required
- HTML shell: `public/index.html` loads 5 modules in strict order via script tags
- Load sequence (critical): `constants.js` → `utils.js` → `sound.js` → `services.js` → `app.jsx`
- All modules export to `window` object (no ES modules) for in-browser Babel compatibility
- React/Babel loaded from CDN; JSX compiled in browser at runtime
- Styling: Tailwind CSS compiled via `npm run build:css` (not hot-reloaded)

**Backend**: Google Apps Script (GAS) serverless API
- Single file: `backend/gas/Code.gs` handles all API routes via `doGet(e)` 
- Data store: Google Sheets with 4 sheets (`Leaderboard`, `Chat`, `Logs`, `Users`)
- **Critical**: ALL requests use GET (see "GAS POST Issue" below)

**Configuration**: Runtime config injection
- Template: `config/config.example.js` (committed)
- Local: `config/config.local.js` (gitignored, required for backend features)
- Two config properties: `GAS_URL` (backend endpoint), `BASE_PATH` (subdirectory prefix)
- Fallback: Without `GAS_URL`, app runs offline with local puzzle generation + localStorage

## Critical Gotchas

### GAS POST Issue (non-negotiable pattern)
- **All API calls use HTTP GET**, including writes (saveScore, postChat, logError)
- Why: GAS public deployments redirect POSTs (302) to auth pages, breaking API
- Pattern: `runGasFn(fnName, args)` in `src/services.js` builds GET URL with `action` param
- Example: `?action=saveScore&name=Alice&difficulty=Easy&time=180`
- Adding new endpoints: Update both `actionMap` in `runGasFn` AND `doGet()` switch in `Code.gs`

### Module Load Order
- `constants.js` must load first (defines `KEYS`, `THEMES`, `SOUND_PACKS`, `CAMPAIGN_LEVELS`)
- `utils.js` depends on constants (uses `GAME_SETTINGS`)
- `services.js` depends on utils and constants (uses `KEYS`, validation functions)
- `app.jsx` depends on all previous modules
- Breaking this order causes undefined reference errors

### GAS Deployment Access Level
- Must deploy as Web App with "Anyone (even anonymous)" access
- Restricted access causes 302 redirects and HTML responses instead of JSON
- Verify: `curl -I "$GAS_URL?action=ping"` should return `200 OK`, not `302 Found`

### GitHub Pages Subdirectory Deployments
- Set `BASE_PATH = '/Sudoku-Labs'` for `username.github.io/Sudoku-Labs`
- Fixes asset paths: themes, backgrounds, favicon
- Root deployments: `BASE_PATH = ''`

## Key File Locations

| Purpose | File | Contents |
|---------|------|----------|
| API router | `backend/gas/Code.gs` | All `doGet()` actions, sheet operations, auth |
| React UI | `src/app.jsx` | All components, game logic |
| API client | `src/services.js` | `runGasFn` mapping, StorageService (18 methods) |
| Game constants | `src/constants.js` | `KEYS`, `THEMES`, `SOUND_PACKS`, `CAMPAIGN_LEVELS` |
| Utilities | `src/utils.js` | Validation, formatting, `generateLocalBoard()` |
| Sound system | `src/sound.js` | `SoundManager` with 8 procedural sound packs |
| Config template | `config/config.example.js` | Required config keys |
| Deployment guide | `docs/deployment/checklist.md` | Step-by-step deploy |

## Developer Workflows

**Local development:**
```bash
# 1. Setup config (first time)
cp config/config.example.js config/config.local.js
# Edit config.local.js to add GAS_URL (or leave empty for offline mode)

# 2. Rebuild Tailwind CSS (if editing styles)
npm run build:css   # or npm run watch:css for auto-rebuild

# 3. Start local server
npm run dev         # Runs: python3 -m http.server 8000
# Visit: http://localhost:8000/public/

# 4. Backend health check (if using GAS)
curl "$GAS_URL?action=ping"
curl "$GAS_URL?action=generateSudoku&difficulty=Easy"
```

**Adding a new GAS endpoint:**
```javascript
// 1. Add to backend/gas/Code.gs doGet() switch
case 'myAction':
  return makeJsonResponse(myFunction(e.parameter));

// 2. Add to src/services.js runGasFn actionMap
const actionMap = {
  myActionName: { action: 'myAction', method: 'GET' },
  // ...
};

// 3. Call from frontend
const result = await runGasFn('myActionName', { param: 'value' });

// 4. Test with curl
curl "$GAS_URL?action=myAction&param=value"
```

**GAS deployment:**
1. Create new Apps Script project at script.google.com
2. Paste `backend/gas/Code.gs` 
3. Update `SHEET_ID` on line ~26
4. Run `setupSheets_()` once (creates 4 sheets)
5. Deploy → Web App → Execute as: me → Access: Anyone → Deploy
6. Copy deployment URL to `config/config.local.js`

## Code Conventions

**State persistence**: Use `KEYS` constants + StorageService methods
```javascript
// Good
StorageService.set(KEYS.GAME_STATE, gameState);
const state = StorageService.get(KEYS.GAME_STATE);

// Bad - hardcoded strings scattered everywhere
localStorage.setItem('sudoku_v2_state', JSON.stringify(state));
```

**Input sanitization**: Always sanitize in GAS handlers
```javascript
// In Code.gs
const username = sanitizeInput_(e.parameter.username);
```

**Window exports**: All non-JSX modules export to window
```javascript
// In src/services.js
window.runGasFn = runGasFn;
window.StorageService = StorageService;
```

## Project-Specific Features

**Campaign Mode**: Defined in `CAMPAIGN_LEVELS` (constants.js), progress tracked via StorageService
**Sound System**: `SoundManager.init()` required before first play (browser autoplay policy)
**Local Puzzle Generator**: `generateLocalBoard()` in utils.js provides offline fallback
**Authentication**: Optional demo-grade auth (username/password hashed), stored in Users sheet

## Debugging Tips

**GAS returns HTML instead of JSON**: Deployment access is wrong (must be "Anyone")
```bash
curl -v "$GAS_URL?action=ping" 2>&1 | grep Location  # Should be empty
```

**Module load errors**: Check browser console for undefined references, verify script load order in index.html

**Asset 404s on GitHub Pages**: `BASE_PATH` config mismatch, should match repo name

**Diagnostic script**: `scripts/dev/diagnostic.sh` runs pre-built health checks

**No tests**: This repo has no test suite; validate changes manually via local server