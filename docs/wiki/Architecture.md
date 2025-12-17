# Architecture Overview

This page provides an overview of the Sudoku Logic Lab architecture. For the complete technical specification, see [ARCHITECTURE.md](https://github.com/edmund-alexander/Sudoku-Labs/blob/main/docs/ARCHITECTURE.md).

## System Design

Sudoku Logic Lab uses a decoupled frontend-backend architecture:

```
┌─────────────────────┐          ┌─────────────────────┐
│   GitHub Pages      │          │ Google Apps Script  │
│   (Frontend)        │◄────────►│    (Backend)        │
│                     │   HTTP   │                     │
│  - index.html       │   GET    │  - Code.gs          │
│  - src/             │          │  - doGet() router   │
│    ├ constants.js   │          │  - API endpoints    │
│    ├ utils.js       │          │                     │
│    ├ sound.js       │          │                     │
│    ├ services.js    │          │                     │
│    └ app.jsx        │          │                     │
│  - React UI         │          │                     │
│  - Client logic     │          │                     │
└─────────────────────┘          └──────────┬──────────┘
                                            │
                                            ▼
                                 ┌─────────────────────┐
                                 │  Google Sheets      │
                                 │  (Database)         │
                                 │                     │
                                 │  - Leaderboard      │
                                 │  - Chat             │
                                 │  - Logs             │
                                 │  - Users            │
                                 └─────────────────────┘
```

## Components

### Frontend (Client-Side)

**Technology Stack:**
- React 18 (via CDN)
- Tailwind CSS (via CDN)
- Babel Standalone (in-browser JSX compilation)

**Modular Architecture (5 files):**
1. **constants.js** - Game constants, themes, sound packs, campaign data
2. **utils.js** - Validation, formatting, Sudoku helpers
3. **sound.js** - WebAudio SoundManager with 8 procedural sound packs
4. **services.js** - API service layer, storage, data management
5. **app.jsx** - React UI components and game state

**Key Features:**
- Sudoku puzzle generation (client-side algorithm)
- Interactive game board
- Timer and move counter
- Campaign mode with 8 levels
- Theme system (8 themes with unlock criteria)
- Sound system (8 sound packs with procedural audio)
- UI/UX and animations

**Hosting:** GitHub Pages (free static hosting)

### Backend (Server-Side)

**Technology:** Google Apps Script (JavaScript-based)

**Key Features:**
- REST API via `doGet()` routing
- Sudoku generation (server-side)
- Data persistence
- Input sanitization
- Error logging

**Deployment:** Web App with public access

### Database

**Technology:** Google Sheets

**Three Sheets:**
1. **Leaderboard** - Player scores
2. **Chat** - Chat messages
3. **Logs** - Error logs

**Why Google Sheets?**
- Free
- Easy to manage
- No database server needed
- Built-in data visualization
- Accessible via GUI

## Communication Protocol

All communication uses **HTTP GET** requests:

```javascript
// Frontend request
const url = new URL(GAS_URL);
url.searchParams.set('action', 'generateSudoku');
url.searchParams.set('difficulty', 'Hard');

const response = await fetch(url.toString());
const data = await response.json();

// Backend routing
function doGet(e) {
  const action = e.parameter.action;
  switch(action) {
    case 'generateSudoku':
      return makeJsonResponse(generateSudoku(e.parameter.difficulty));
    // ... more actions
  }
}
```

### Why GET for Everything?

Google Apps Script public deployments have issues with POST requests (302 redirects to auth pages). Using GET for all operations (including writes) avoids this issue.

See [Troubleshooting Guide](https://github.com/edmund-alexander/Sudoku-Labs/blob/main/docs/TROUBLESHOOTING.md) for details.

## API Endpoints

| Action | Purpose | Parameters |
|--------|---------|------------|
| `ping` | Health check | none |
| `generateSudoku` | Create puzzle | `difficulty` |
| `getLeaderboard` | Fetch scores | none |
| `saveScore` | Save score | `name`, `time`, `difficulty`, `date` |
| `getChat` | Fetch messages | none |
| `postChat` | Send message | `username`, `text`, `id` |
| `logError` | Log error | `type`, `message`, `userAgent` |

See [API Reference](API-Reference) for complete documentation.

## Data Flow

### Generating a Puzzle

```
User clicks "New Game"
       ↓
Frontend calls generateSudoku API
       ↓
Backend generates puzzle
       ↓
Returns puzzle + solution
       ↓
Frontend displays puzzle
```

### Saving a Score

```
User completes puzzle
       ↓
Frontend calls saveScore API
       ↓
Backend validates input
       ↓
Sanitizes data
       ↓
Appends to Leaderboard sheet
       ↓
Returns success
       ↓
Frontend updates UI
```

### Chat System

```
User types message
       ↓
Frontend calls postChat API
       ↓
Backend sanitizes input
       ↓
Appends to Chat sheet
       ↓
Returns success
       ↓
Frontend polls getChat periodically
       ↓
Displays new messages
```

## File Structure

```
Sudoku-Labs/
├── index.html              # HTML shell, module loader
├── src/
│   ├── constants.js       # Game constants (themes, sounds, campaign)
│   ├── utils.js           # Utility functions (validation, formatting)
│   ├── sound.js           # SoundManager + 8 procedural sound packs
│   ├── services.js        # API layer (storage, leaderboard, chat)
│   └── app.jsx            # React UI components
├── apps_script/
│   └── Code.gs            # Backend API
├── config/
│   ├── config.example.js  # Config template
│   └── config.local.js    # Private config (gitignored)
├── docs/                  # Technical documentation
├── wiki/                  # User-friendly guides
└── diagnostic.sh          # API testing script
```

## Security

### Input Sanitization

All user inputs are sanitized on the backend:

```javascript
function sanitizeInput_(text) {
  return String(text)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
```

### Configuration Security

- `config.local.js` is gitignored
- No sensitive credentials required
- GAS URL can be public (it's just an API endpoint)

### No Authentication

The game is intentionally public:
- No login required
- Anonymous play
- Simple user experience

## Scalability

### Current Limitations

- Google Apps Script quotas (20,000 URL fetches/day)
- Google Sheets row limit (~10,000 scores)
- Single-threaded execution (30 concurrent max)

### Scaling Solutions

If needed:
- Archive old scores periodically
- Use multiple Google Sheets
- Implement caching
- Add pagination to leaderboard
- Rate limiting on chat

For most use cases, current limits are sufficient (hundreds to thousands of daily players).

## Why This Architecture?

### Advantages

✅ **Free Hosting** - GitHub Pages + Google Apps Script  
✅ **No Server Management** - Serverless architecture  
✅ **Easy Deployment** - Push to GitHub, done  
✅ **Scalable** - Handles typical game load  
✅ **Decoupled** - Update frontend/backend independently  
✅ **No CORS Issues** - GAS allows cross-origin requests  
✅ **Open Source** - Transparent and modifiable  

### Trade-offs

⚠️ **GAS Quotas** - Limited to Google's free tier  
⚠️ **GET-Only API** - Non-standard REST pattern  
⚠️ **In-Browser Babel** - Slight initial load overhead  
⚠️ **Public Data** - Everything is public (by design)  

## Deployment Process

### Frontend Deployment

1. Commit to GitHub
2. GitHub Pages auto-deploys
3. Changes live in 1-2 minutes

### Backend Deployment

1. Copy `Code.gs` to Apps Script
2. Deploy as Web App
3. Update frontend config with URL
4. Test API endpoints

See [Deployment Guide](Deployment-Guide) for details.

## Technical Specifications

### Frontend

- **React Version**: 18.2.0
- **Tailwind Version**: 3.x (JIT mode)
- **Babel**: Standalone 7.x
- **Browser Support**: Modern browsers (ES6+)

### Backend

- **Runtime**: Google Apps Script (V8)
- **Language**: JavaScript (ES6)
- **Quotas**: Free tier limits
- **Response Format**: JSON

### Database

- **Type**: Google Sheets
- **Access**: Via SpreadsheetApp API
- **Backup**: Manual CSV export

## Further Reading

- **[Complete Architecture Documentation](https://github.com/edmund-alexander/Sudoku-Labs/blob/main/docs/ARCHITECTURE.md)** - Technical deep-dive
- **[API Reference](API-Reference)** - API endpoint details
- **[Backend Setup](Backend-Setup)** - Deploy the backend
- **[Frontend Setup](Frontend-Setup)** - Deploy the frontend
- **[Configuration Guide](Configuration-Guide)** - Configuration details

---

**Questions?** See the [FAQ](FAQ) or open an [issue](https://github.com/edmund-alexander/Sudoku-Labs/issues).
