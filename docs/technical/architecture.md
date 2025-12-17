# Sudoku Logic Lab - Architecture

## System Design

**Decoupled Frontend and Backend**

```
GitHub Pages (Frontend)  ←→ (fetch)  ←→  Google Apps Script (Backend)
    ↓                                         ↓
  index.html                            Code.gs
  (React Game UI)                       (REST API)
  (Client-side logic)                   (Database interaction)
                                             ↓
                                        Google Sheets
                                    (Leaderboard, Chat, Logs)
```

## Components

### Frontend (Modular React Architecture)
- **React 18** (via CDN with in-browser Babel transformation)
- **Modular Design**: 5 separate files for maintainability
  - `constants.js` - Game constants, themes, sound packs, campaign data
  - `utils.js` - Validation, formatting, Sudoku helpers
  - `sound.js` - WebAudio SoundManager with procedural sound generation
  - `services.js` - API service layer, storage, and data management
  - `app.jsx` - React UI components and game state
- **Communication**: HTTP `fetch()` to GAS API (GET-only)
- **Hosting**: GitHub Pages

### Backend (`apps_script/Code.gs`)
- **API Routes**: `doGet()` handles all operations via `action` parameter
- **Operations**: Sudoku generation, leaderboard CRUD, chat, error logging
- **Database**: Google Sheets (3 sheets: Leaderboard, Chat, Logs)
- **Deployment**: Google Apps Script Web App (public access)
- **Authentication**: None required (anyone can play)

### Communication Protocol

All requests use **GET** with action parameter in URL:

```javascript
// Frontend example
const url = new URL(GAS_URL);
url.searchParams.set('action', 'generateSudoku');
url.searchParams.set('difficulty', 'Easy');
const response = await fetch(url.toString());
const data = await response.json();

// Backend routing
function doGet(e) {
  const action = e.parameter.action;
  switch(action) {
    case 'generateSudoku':
      return makeJsonResponse(generateSudoku(e.parameter.difficulty));
    // ... more cases
  }
}
```

**Why GET for all operations?** See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## API Endpoints

All endpoints: `https://script.google.com/macros/s/[ID]/exec?action=[ACTION]`

### Core Endpoints

| Action | Parameters | Returns |
|--------|-----------|---------|
| `generateSudoku` | `difficulty` (Easy/Medium/Hard/Daily) | Sudoku puzzle array |
| `getLeaderboard` | none | Array of scores |
| `getChat` | none | Last 50 chat messages |
| `saveScore` | `name`, `difficulty`, `time`, `date` | Updated leaderboard |
| `postChat` | `username`, `text`, `id` | Updated chat |
| `logError` | `type`, `message`, `userAgent`, `count` | `{logged: true}` |
| `ping` | none | `{ok: true, timestamp: "..."}` |

### Authentication Endpoints (Optional)

| Action | Parameters | Returns |
|--------|-----------|---------|
| `register` | `username`, `password` | `{success, user?, error?}` |
| `login` | `username`, `password` | `{success, user?, error?}` |
| `getUserProfile` | `userId` | `{success, user?, error?}` |
| `updateUserProfile` | `userId`, `displayName?`, `incrementGames?`, `incrementWins?` | `{success, error?}` |

See [AUTHENTICATION_SETUP.md](docs/AUTHENTICATION_SETUP.md) for details on the authentication system.

## File Structure

```
Sudoku-Labs/
├── apps_script/
│   └── Code.gs                      ← Backend API (REST endpoints)
├── src/
│   ├── constants.js                 ← Game constants (THEMES, SOUND_PACKS, CAMPAIGN_LEVELS)
│   ├── utils.js                     ← Utility functions (validation, formatting, helpers)
│   ├── sound.js                     ← SoundManager + 8 procedural sound packs
│   ├── services.js                  ← API layer (storage, leaderboard, chat, unlocks)
│   └── app.jsx                      ← React UI components (2063 lines)
├── index.html                       ← HTML shell + module loader
├── config/
│   ├── config.example.js           (Template)
│   ├── config.local.js             (Private GAS URL - in .gitignore)
│   └── README.md                   (Setup guide)
├── docs/
│   ├── ARCHITECTURE.md             (This file)
│   ├── DEPLOYMENT_CHECKLIST.md     (How to deploy)
│   ├── AUTHENTICATION_SETUP.md     (Auth system guide)
│   └── TROUBLESHOOTING.md          (Known issues & solutions)
└── diagnostic.sh                    (API health check script)
```

## Google Sheets Database

Connected via `SHEET_ID` constant in Code.gs

**Four sheets (auto-created):**

1. **Leaderboard**: Name | Time | Difficulty | Date
2. **Chat**: ID | Sender | Text | Timestamp
3. **Logs**: Timestamp | Type | Message | UserAgent | Count
4. **Users** (Optional Auth): UserID | Username | PasswordHash | CreatedAt | DisplayName | TotalGames | TotalWins

## Frontend Module Architecture

The frontend uses a **modular architecture** with clear separation of concerns:

### Module Loading Order

```html
<!-- index.html loads modules in this order: -->
<script src="src/constants.js"></script>    <!-- 1. Constants first -->
<script src="src/utils.js"></script>        <!-- 2. Utils depend on constants -->
<script src="src/sound.js"></script>        <!-- 3. Sound system -->
<script src="src/services.js"></script>     <!-- 4. Services depend on utils -->
<script type="text/babel" src="src/app.jsx"></script>  <!-- 5. React UI last -->
```

### Module Descriptions

**1. constants.js (277 lines)**
- `KEYS` - localStorage key constants
- `DIFFICULTY` - Puzzle difficulty settings
- `GAME_SETTINGS` - Validation limits
- `CAMPAIGN_LEVELS` - 8 campaign levels with unlock criteria
- `THEMES` - 8 UI themes with unlock conditions
- `SOUND_PACKS` - 8 sound packs with procedural generation configs
- `EMOJI_CATEGORIES` - Chat emoji picker data

**2. utils.js (307 lines)**
- Validation: `validateUsername()`, `validatePassword()`, `sanitizeText()`
- Formatting: `formatTime()`, `formatDate()`, `generateGuestId()`
- Sudoku helpers: `getRow()`, `getCol()`, `getBox()`, `isValidMove()`
- Game logic: `getRemainingNumbers()`, `getCompletedBoxes()`
- Local generator: `generateLocalBoard()` (fallback when GAS unavailable)
- UI effects: `triggerConfetti()`, `sortLeaderboard()`

**3. sound.js (371 lines)**
- `SoundManager` object with `init()`, `setPack()`, `play()` methods
- WebAudio API procedural sound generation
- 8 sound pack handlers:
  - `classic` - Traditional beeps and tones
  - `zen` - Calming nature-inspired sounds
  - `funfair` - Playful carnival effects
  - `retro` - 8-bit game sounds
  - `space` - Sci-fi synthesized effects
  - `nature` - Organic environmental sounds
  - `crystal` - Crystalline bell-like tones
  - `minimal` - Subtle UI feedback
- `buildVariantHandler()` factory for sound pack creation

**4. services.js (442 lines)**
- **API Layer**: `runGasFn()` - calls backend with action mapping
- **StorageService** (18 methods):
  - Game state: save/load/clear game progress
  - User data: session, status, campaign progress
  - Themes & sounds: unlock tracking, active selection
  - Stats: game statistics for unlock criteria
- **LeaderboardService**: get/save scores with server/local fallback
- **ChatService**: getMessage/postMessage with normalization
- **UnlockService**: `checkThemeUnlocks()`, `checkSoundPackUnlocks()`

**5. app.jsx (2063 lines - down from 2959)**
- `ErrorBoundary` - React error handler
- UI Components:
  - `Cell`, `SudokuBoard` - Game grid
  - `Icons` - SVG icon library (20+ icons)
  - `AwardsZone` - Theme & sound pack selector
  - `UserPanel` - Authentication UI
  - `CampaignMap` - Level progression map
  - `OpeningScreen`, `ClosingScreen` - Menu screens
  - `App` - Main game component with state management

### Module Communication

All modules export to the global `window` object for compatibility with in-browser Babel:

```javascript
// constants.js exports
window.KEYS = KEYS;
window.THEMES = THEMES;
// ... etc

// app.jsx imports
const { KEYS, THEMES, validateUsername, SoundManager, runGasFn } = window;
```

**Why not ES modules?**
- In-browser Babel doesn't support ES module imports in `<script type="text/babel">`
- Global `window` exports work seamlessly with UMD React from CDN
- Simple loading order in HTML ensures dependencies are available

### Benefits of Modular Architecture

✅ **Maintainability** - Each file has a single, clear purpose
✅ **Testability** - Pure functions in utils.js are easy to unit test
✅ **Reusability** - Service layer can be used by any UI component
✅ **Reduced complexity** - app.jsx reduced by 30% (896 lines)
✅ **Developer experience** - Easier to navigate and understand codebase
✅ **Collaboration** - Team members can work on different modules
✅ **Performance** - Browser caches individual files

## Why This Architecture Works

✅ **No CORS issues** - GAS allows cross-origin requests
✅ **Scalable** - Update frontend independently of backend
✅ **Serverless** - No VPS to manage
✅ **Free** - GitHub Pages + GAS quota
✅ **Decoupled** - Separate concerns
✅ **Modular frontend** - Clear separation of concerns
✅ **Simple deployment** - Two independent deployments

## Deployment Summary

1. **Frontend** (GitHub Pages)
   - Commit `index.html` to repo
   - Enable GitHub Pages in settings
   - Deployed at: `https://[user].github.io/[repo]/`

2. **Backend** (Google Apps Script)
   - Create Apps Script project
   - Paste `Code.gs` code
   - Deploy as Web App (Anyone access)
   - Update `config/config.local.js` with deployment URL

See [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) for detailed steps.
