# Quick Start Guide

Get Sudoku Logic Lab running on your machine in less than 5 minutes.

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Git installed on your computer
- A text editor (VS Code, Sublime, etc.)
- **Optional**: Python or Node.js for local HTTP server

## Step 1: Clone the Repository

```bash
git clone https://github.com/edmund-alexander/Sudoku-Labs.git
cd Sudoku-Labs
```

## Step 2: Set Up Configuration

```bash
# Copy the example config
cp config/config.example.js config/config.local.js
```

## Step 3: Open in Browser

You have several options:

### Option A: Direct File Open
Simply open `index.html` in your browser:
```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

### Option B: Python HTTP Server
```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

### Option C: Node.js HTTP Server
```bash
# Install globally (one-time)
npm install -g http-server

# Run server
http-server

# Then open: http://localhost:8080
```

### Option D: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## Step 4: Play the Game!

The game is now running! You can:
- ✅ Generate and solve Sudoku puzzles
- ✅ Use the timer and move counter
- ✅ Validate your solutions
- ⚠️ Leaderboard and chat require backend setup (see below)

## What Works Without Backend?

**Working:**
- Sudoku puzzle generation (client-side algorithm)
- Puzzle solving and validation
- Timer and move counter
- Difficulty selection
- Campaign mode
- UI and animations

**Not Working:**
- Leaderboard (shows empty)
- Chat system (disabled)
- Score persistence
- Error logging to backend

## Next Steps

### For Playing Only
Just play! The game works great offline with client-side puzzle generation.

### For Full Features (Leaderboard/Chat)
Follow the [Backend Setup](Backend-Setup) guide to deploy Google Apps Script.

### For Development
Continue to the [Development Setup](Development-Setup) guide for a complete dev environment.

## Quick Backend Setup

Want leaderboard and chat? Here's the 2-minute version:

1. **Create Google Sheet**: Go to [sheets.google.com](https://sheets.google.com), create a new sheet
2. **Copy Sheet ID**: From URL `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
3. **Create Apps Script**: Go to [script.google.com](https://script.google.com), create new project
4. **Paste Code**: Copy all of `apps_script/Code.gs`, paste into Apps Script editor
5. **Update Sheet ID**: In Code.gs line 15, replace with your Sheet ID
6. **Run Setup**: Select `setupSheets_` function, click Run
7. **Deploy**: Deploy → New Deployment → Web App → Anyone access
8. **Copy URL**: Copy the deployment URL
9. **Update Config**: Paste URL into `config/config.local.js`
10. **Reload**: Refresh the game in your browser

Full details: [Backend Setup](Backend-Setup)

## Verification

### Test Puzzle Generation
1. Click "New Game"
2. Select a difficulty
3. A puzzle should appear

### Test Backend (if configured)
Open browser console (F12) and run:
```javascript
// Test ping
fetch(CONFIG.GAS_URL + '?action=ping')
  .then(r => r.json())
  .then(console.log);

// Should return: {ok: true, timestamp: "..."}
```

## Common Issues

### Issue: "CONFIG is not defined"
**Solution**: You forgot to create `config/config.local.js`. Copy from `config.example.js`.

### Issue: Leaderboard shows "Leaderboard disabled"
**Solution**: This is normal without backend setup. The game still works!

### Issue: CORS errors in console
**Solution**: Use an HTTP server instead of opening `index.html` directly.

### Issue: Blank page
**Solution**: 
1. Check browser console (F12) for errors
2. Ensure `src/app.jsx` exists
3. Try clearing browser cache

## File Structure Overview

```
Sudoku-Labs/
├── index.html              # Main entry point (open this)
├── src/
│   └── app.jsx            # React application code
├── config/
│   ├── config.example.js  # Template (committed to git)
│   └── config.local.js    # Your config (NOT committed)
├── apps_script/
│   └── Code.gs            # Backend API code
├── docs/                  # Documentation
└── wiki/                  # Wiki pages (this file)
```

## Next Steps

- **Learn More**: [Architecture](Architecture)
- **Deploy Backend**: [Backend Setup](Backend-Setup)
- **Deploy Frontend**: [Frontend Setup](Frontend-Setup)
- **Develop**: [Development Setup](Development-Setup)
- **Play**: [How to Play](How-to-Play)

## Need Help?

- **Documentation**: Check the [Troubleshooting](Troubleshooting) guide
- **Issues**: [Report a bug](https://github.com/edmund-alexander/Sudoku-Labs/issues)
- **Questions**: Open a [Discussion](https://github.com/edmund-alexander/Sudoku-Labs/discussions)

---

**You're ready to go! Have fun solving Sudoku! 🎉**
