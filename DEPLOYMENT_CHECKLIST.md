# Deployment Checklist - GitHub Pages + GAS API

Your code is ready to deploy! Follow these steps to get Sudoku Logic Lab live.

## Part 1: Google Apps Script Backend

### Step 1: Create Apps Script Project
- Go to https://script.google.com/home
- Click **"New project"**
- Name it "Sudoku Logic Lab API"

### Step 2: Copy Code.gs
- In this repository, open `apps_script/Code.gs`
- Copy ALL the code
- In your Apps Script editor, paste it into `Code.gs`
- Press **Ctrl+S** to save

### Step 3: Update SHEET_ID
- Open your Google Sheet
- Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
- In Code.gs, find line: `const SHEET_ID = '...'`
- Replace with your Sheet ID

### Step 4: Initialize Database
- In Apps Script editor, select `setupSheets_` from function dropdown
- Click **Run** button (▶️)
- Check Execution log (should see no errors)
- This creates: Leaderboard, Chat, Logs sheets

### Step 5: Deploy as Web App
- Click **Deploy** → **New Deployment**
- Type: Select **"Web App"**
- Execute as: **Your email address**
- Who has access: **"Anyone"** ⚠️ **CRITICAL - MUST BE "Anyone"**
- Click **Deploy**

### Step 6: Copy Deployment URL
- You'll see a popup with your deployment URL
- It looks like: `https://script.google.com/macros/s/[ID]/exec`
- **Copy this entire URL**
- Save it somewhere safe

### Step 7: Test GAS Backend
```bash
# Replace [URL] with your actual GAS URL
curl "[URL]?action=ping"

# Should return:
# {"ok":true,"timestamp":"2025-12-14T..."}
```

If you see 403 errors or "Moved Temporarily", the permissions aren't set correctly. Go back to Step 5 and verify "Who has access: Anyone"

---

## Part 2: GitHub Pages Frontend

### Step 1: Configure GAS URL
- Open `config/config.local.js`
- Replace the GAS_URL with your deployment URL from above:
  ```javascript
  const CONFIG = {
    GAS_URL: 'https://script.google.com/macros/s/[YOUR_ID]/exec',
  };
  ```
- Save the file

### Step 2: Enable GitHub Pages
- Go to your repository settings
- Click **"Pages"** in sidebar
- Source: Select **"Deploy from a branch"**
- Branch: Select **"main"** and **"/root"** folder
- Click **Save**
- Wait ~1 minute for deployment

### Step 3: Find Your URL
- In Pages settings, you'll see: `https://[username].github.io/Sudoku-Labs/`
- This is your game URL!

### Step 4: Test Frontend
- Open `https://[username].github.io/Sudoku-Labs/` in browser
- Game should load
- Try starting a game
- Try saving a score

---

## Verification Checklist

### GAS Backend
- [ ] Code.gs is saved without errors
- [ ] setupSheets_() ran successfully
- [ ] Sheets exist: Leaderboard, Chat, Logs
- [ ] Deployment is set to "Who has access: Anyone"
- [ ] Deployment URL responds to ping (returns JSON)

### GitHub Pages Frontend
- [ ] index.html committed to main branch
- [ ] GitHub Pages enabled in repo settings
- [ ] Custom domain configured (optional)
- [ ] Frontend loads without 403 errors
- [ ] Game title appears

### Integration
- [ ] Frontend loads (GitHub Pages URL)
- [ ] Game starts without errors
- [ ] Console shows no errors (F12)
- [ ] Saving a score works
- [ ] Leaderboard fetches data
- [ ] Chat sends/receives messages

---

## Troubleshooting

### "Cannot reach API" or 403 errors
- [ ] GAS deployment URL is correct
- [ ] GAS "Who has access" is set to "Anyone"
- [ ] SHEET_ID in Code.gs is correct
- [ ] Try: `curl "[GAS_URL]?action=ping"` - should return JSON

### "Cannot find index.html"
- [ ] index.html is in repository root
- [ ] GitHub Pages source is set to main branch
- [ ] Wait 1-2 minutes for Pages to rebuild

### "Cannot load config"
- [ ] config.local.js has correct GAS_URL
- [ ] File path is `config/config.local.js`
- [ ] Check console (F12) for actual error

### "Sheet not found"
- [ ] Run `setupSheets_()` in Apps Script editor
- [ ] Check SHEET_ID matches your Sheet
- [ ] Verify you have edit access to the Sheet

### Still broken?
1. Check browser Console (F12) for errors
2. Check GAS Execution log for errors
3. Verify GAS deployment URL with curl
4. See ARCHITECTURE.md for detailed explanation

---

## Success!

Once all checks pass:
- Share `https://[username].github.io/Sudoku-Labs/` with friends
- Anyone can play without Google sign-in
- Scores saved to Google Sheets
- Chat messages visible to all players

**No more 403 errors! 🎉**
