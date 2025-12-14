# ✅ Sudoku Logic Lab - GitHub Pages + GAS API Architecture

## Architecture Overview

**Separated Frontend and Backend** - GitHub Pages + Google Apps Script API

```
GitHub Pages                           Google Apps Script
(Frontend)                             (Backend API)
    ↓                                       ↓
index.html                           Code.gs (doGet/doPost)
(React, Game UI)      ←→ (fetch)      (Sudoku logic,
(google.script.run)      HTTP           Leaderboard,
                                        Chat, Logs)
                             ↓
                        Google Sheets
                    (Leaderboard, Chat, Logs)
```

## How It Works

### Frontend (GitHub Pages)
- **File**: `index.html` (React game)
- **Hosted on**: GitHub Pages (or any static host)
- **Calls backend via**: `fetch()` HTTP requests
- **No authentication needed**: Anyone can play

### Backend (Google Apps Script)
- **File**: `apps_script/Code.gs`
- **Deployed as**: Web App with public access
- **API endpoints**: doGet/doPost with action parameter
- **Stores data in**: Google Sheets via SpreadsheetApp API

### Communication Pattern

#### GET Requests (Read operations)
```javascript
// Frontend calls:
const url = new URL(GAS_URL);
url.searchParams.set('action', 'generateSudoku');
url.searchParams.set('difficulty', 'Easy');
fetch(url).then(r => r.json());

// Backend handles:
function doGet(e) {
  if (e.parameter.action === 'generateSudoku') {
    return makeJsonResponse(generateSudoku(e.parameter.difficulty));
  }
}
```

#### POST Requests (Write operations)
```javascript
// Frontend calls:
fetch(GAS_URL + '?action=saveScore', {
  method: 'POST',
  body: JSON.stringify({ name, time, difficulty })
}).then(r => r.json());

// Backend handles:
function doPost(e) {
  if (e.parameter.action === 'saveScore') {
    const data = JSON.parse(e.postData.contents);
    return makeJsonResponse(saveLeaderboardScore(data));
  }
}
```

## API Endpoints

All endpoints are called via `https://script.google.com/macros/s/[ID]/exec?action=[ACTION]`

### GET Endpoints

| Action | Parameters | Returns |
|--------|-----------|---------|
| `generateSudoku` | `difficulty` (Easy/Medium/Hard/Daily) | Sudoku puzzle array |
| `getLeaderboard` | none | Array of scores |
| `getChat` | none | Last 50 chat messages |
| `ping` | none | `{ok: true, timestamp: "..."}` |

### POST Endpoints

| Action | Body | Returns |
|--------|------|---------|
| `saveScore` | `{name, time, difficulty, date}` | Updated leaderboard |
| `postChat` | `{sender, text, id, timestamp}` | Updated chat |
| `logError` | `{type, message, userAgent, count}` | `{logged: true}` |

## File Structure

```
Sudoku-Labs/
├── apps_script/
│   └── Code.gs                 ← Copy to Apps Script editor
├── index.html                  ← Deploy to GitHub Pages
├── config/
│   ├── config.example.js      (Template - commit to GitHub)
│   ├── config.local.js        (Private - not committed)
│   └── README.md              (Setup guide)
├── ARCHITECTURE.md            (This file)
├── DEPLOYMENT_CHECKLIST.md    (Deployment steps)
└── CONFIGURATION.md           (Config system docs)
```

## Frontend Function Wrapper

The `runGasFn()` function in index.html handles all backend calls:

```javascript
const runGasFn = async (fnName, ...args) => {
  // Maps function names to API actions
  // Handles GET/POST routing automatically
  // Returns parsed JSON response
};

// Usage examples:
const puzzle = await runGasFn('generateSudoku', 'Easy');
const scores = await runGasFn('getLeaderboardData');
await runGasFn('saveLeaderboardScore', { name, time, difficulty, date });
await runGasFn('postChatData', { sender, text, id, timestamp });
```

## Google Sheets Database

Connected via `SHEET_ID = '1a7-R53GPrnR0etBKPwqRA09-ZCHjO_DxPFvkKN_ZTWE'`

**Three sheets (auto-created by setupSheets_()):**

1. **Leaderboard**
   - Name | Time (seconds) | Difficulty | Date
   - Stores all game scores

2. **Chat**
   - ID | Sender | Text | Timestamp
   - Last 50 messages returned to frontend

3. **Logs**
   - Timestamp | Type | Message | UserAgent | Count
   - Client-side errors logged server-side

## Deployment

### GitHub Pages (Frontend)
1. Commit `index.html` to GitHub
2. Enable GitHub Pages in repo settings
3. Frontend is now live at `https://[username].github.io/[repo]/`

### Google Apps Script (Backend)
1. Create new Apps Script project
2. Paste `Code.gs` content
3. Update `SHEET_ID` to your Google Sheet
4. Deploy as **Web App**:
   - Execute as: Your email
   - Who has access: **Anyone** (CRITICAL!)
5. Copy deployment URL
6. Update `config/config.local.js` with GAS URL
7. Run `setupSheets_()` in Apps Script editor

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed steps.

## Why This Architecture Works

✅ **Separation of concerns** - Frontend and backend independent
✅ **No CORS issues** - GAS allows cross-origin requests from anywhere
✅ **Scalable** - Update frontend on GitHub without touching GAS
✅ **Serverless** - No VPS/server to manage
✅ **Free hosting** - GitHub Pages (frontend) + GAS quota (backend)
✅ **Open data** - Anyone can access the public GAS API
✅ **Secure** - Private functions (ending with _) not callable

## Key Differences from Embedded Approach

| Feature | Embedded GAS | API (This) |
|---------|-------------|-----------|
| Frontend | Served by GAS | GitHub Pages |
| Backend | Same project | Separate project |
| Calls | `google.script.run` | `fetch()` |
| Deployment | Single URL | Two deployments |
| Complexity | Simpler | More flexible |
| Distribution | GAS only | Anywhere |
| CORS issues | None (same-origin) | Can fetch from any origin |

This approach gives you more flexibility while maintaining security and simplicity!


## Key Components

### Code.gs (Google Apps Script Backend)
- **SHEET_ID**: `1a7-R53GPrnR0etBKPwqRA09-ZCHjO_DxPFvkKN_ZTWE`
- **doGet()**: Serves the frontend HTML directly
- **Public Functions** (callable from frontend):
  - `generateSudoku(difficulty)` - Creates new puzzle
  - `getLeaderboardData()` - Fetches scores
  - `saveLeaderboardScore(entry)` - Saves score
  - `getChatData()` - Fetches chat messages
  - `postChatData(msg)` - Posts chat message
  - `logClientError(entry)` - Logs errors
  
- **Private Functions** (helper functions, not callable from frontend):
  - `setupSheets_()` - Creates required sheets
  - Sudoku logic: `fillDiagonal_()`, `solveSudoku_()`, `isValid_()`, etc.
  - Security: `sanitizeInput_()`, `sanitizeOutput_()`

### index.html (Frontend)
- **Technology**: React 18, Babel standalone, Tailwind CSS
- **Function Calls**: Uses `google.script.run` for all GAS calls
- **No fetch() calls** - Everything goes through google.script.run
- **No CORS issues** - Same-origin by design

## Frontend-Backend Communication

### Old Way (GitHub Pages + Fetch - Didn't Work)
```javascript
// ❌ HTTP fetch with action params
fetch('https://script.google.com/macros/s/.../exec?action=generateSudoku')
```

### New Way (Embedded GAS - Works!)
```javascript
// ✅ Direct google.script.run calls
google.script.run
  .withSuccessHandler(resolve)
  .withFailureHandler(reject)
  .generateSudoku('Easy');
```

## Unified Frontend Call Wrapper

```javascript
const runGasFn = async (fnName, ...args) => {
  return new Promise((resolve, reject) => {
    window.google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      [fnName](...args);
  });
};

// Usage:
const puzzle = await runGasFn('generateSudoku', 'Easy');
const scores = await runGasFn('getLeaderboardData');
```

## Deployment Steps

1. **In Google Apps Script Editor**:
   - Create new Apps Script project
   - Upload Code.gs (copy entire content from apps_script/Code.gs)
   - Create index.html file
   - Paste content from index.html
   - Update SHEET_ID to your Google Sheet

2. **Deploy as Web App**:
   - Click **Deploy** → **New Deployment**
   - Select **Web App**
   - Execute as: **Your email address**
   - Who has access: **Anyone**
   - Click **Deploy**
   - Copy the deployment URL (looks like: https://script.google.com/macros/s/.../exec)
   - This URL is where users access the game

3. **Google Sheets Setup**:
   - Create a Google Sheet
   - Copy sheet ID from URL (between /d/ and /edit)
   - Update SHEET_ID in Code.gs
   - In GAS editor, run `setupSheets_()` manually
   - This creates Leaderboard, Chat, and Logs sheets

## File Structure

```
apps_script/
└── Code.gs                     # Backend (API, sudoku logic, security)

index.html                      # Frontend (React, game UI, google.script.run calls)

config/
├── config.example.js          # Not used anymore (was for external deployments)
├── config.local.js            # Not used anymore
└── README.md                  # Documentation

CONFIGURATION.md               # Config setup guide (now obsolete)
GAS_TROUBLESHOOTING.md        # Troubleshooting guide
```

## Why This Works

✅ **No CORS issues** - Frontend and backend in same origin
✅ **No 403 errors** - google.script.run doesn't need special permissions
✅ **Direct function calls** - All GAS functions directly accessible
✅ **Same codebase** - Both served from one Apps Script project
✅ **Simpler** - No fetch logic, no action routing, no URL parameters
✅ **Secure** - Private functions (ending with _) are not callable

## Google Sheets Database

Connected via `SHEET_ID = '1a7-R53GPrnR0etBKPwqRA09-ZCHjO_DxPFvkKN_ZTWE'`

**Sheets created automatically by setupSheets_():**

1. **Leaderboard**
   - Columns: Name | Time | Difficulty | Date
   - Stores all game scores

2. **Chat**
   - Columns: ID | Sender | Text | Timestamp
   - Last 50 messages returned to frontend

3. **Logs**
   - Columns: Timestamp | Type | Message | UserAgent | Count
   - Client-side errors logged here

## Testing

1. Deploy Code.gs and index.html as Web App
2. Open the deployment URL in browser
3. Game should load immediately
4. Try:
   - Starting a game (generateSudoku)
   - Saving a score (saveLeaderboardScore)
   - Sending chat messages (postChatData)
   - Checking leaderboard (getLeaderboardData)

## Differences from Original Plan

We initially planned:
- ❌ GitHub Pages frontend + GAS API backend (fetch-based)
- ❌ External config files for GAS URL

We now use:
- ✅ Embedded GAS web app (frontend + backend in one project)
- ✅ google.script.run for all function calls
- ✅ Simple, secure, no configuration needed

This works perfectly and avoids all deployment/permission issues!
