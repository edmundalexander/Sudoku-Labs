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

### Frontend (`index.html`)
- **React 18** (via CDN)
- **Game logic**: Sudoku generation, validation, solving
- **UI**: Game board, leaderboard, chat, campaign system
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
│   └── Code.gs                      ← Backend code
├── src/
│   └── app.jsx                      ← React application code
├── index.html                       ← HTML shell
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

## Why This Architecture Works

✅ **No CORS issues** - GAS allows cross-origin requests
✅ **Scalable** - Update frontend independently of backend
✅ **Serverless** - No VPS to manage
✅ **Free** - GitHub Pages + GAS quota
✅ **Decoupled** - Separate concerns
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
