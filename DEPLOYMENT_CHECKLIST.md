# Deployment Checklist

## Prerequisites
- Google account with Google Sheets access
- GitHub account with GitHub Pages enabled
- Google Apps Script access

## Part 1: Google Apps Script Backend

### 1. Create Apps Script Project
- Go to https://script.google.com/home
- Click **"New project"**
- Name it "Sudoku Logic Lab API"

### 2. Setup Code
- Open `apps_script/Code.gs` in this repo
- Copy **all** the code
- In Apps Script editor, paste into `Code.gs`
- Save (Ctrl+S)

### 3. Update Sheet ID
- Create or use existing Google Sheet
- Get Sheet ID from URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
- In Code.gs line ~13, update: `const SHEET_ID = '[YOUR_SHEET_ID]'`
- Save

### 4. Initialize Database
- In Apps Script, select `setupSheets_` from function dropdown
- Click **Run** button (▶️)
- Check Execution log → should see success
- This creates: Leaderboard, Chat, Logs sheets in your Google Sheet

### 5. Deploy as Web App
- Click **Deploy** → **New Deployment**
- Type: **Web App**
- Execute as: **Your email address** (the account that owns the Sheet)
- Who has access: **"Anyone (even anonymous)"** ⚠️ **CRITICAL - MUST BE "Anyone"**
- Click **Deploy**

### 6. Copy Deployment URL
- You'll see a popup showing your deployment URL
- Format: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`
- **Copy this entire URL**

### 7. Test Backend
```bash
# Replace with your actual URL
curl "https://script.google.com/macros/s/YOUR_ID/exec?action=ping"

# Should return:
# {"ok":true,"timestamp":"2025-12-14T..."}
```

## Part 2: GitHub Pages Frontend

### 1. Update Configuration
- Open `config/config.local.js`
- Update `GAS_URL` with your deployment URL from Part 1, Step 6
- Save

### 2. Commit to GitHub
```bash
git add index.html config/config.local.js
git commit -m "Deploy: Add GAS URL configuration"
git push
```

### 3. Enable GitHub Pages
- Go to GitHub repo settings
- Scroll to **Pages** section
- Branch: **main**
- Folder: **/ (root)**
- Save

### 4. Access Your Game
- Wait 1-2 minutes for GitHub Pages to build
- Go to: `https://[username].github.io/[repo-name]/`
- Game should load!

### 5. Test Frontend
- Start a game (pick difficulty)
- Solve and submit (score should save)
- Send chat message (should appear in sheet)
- Check browser console (F12) for any errors

## Verification Checklist

- [ ] GAS backend test returns `{"ok":true,...}`
- [ ] GitHub Pages site loads without errors
- [ ] Game board generates correctly
- [ ] Score saves to leaderboard
- [ ] Chat messages post and display
- [ ] No 404 or CORS errors in console
- [ ] Difficulty selection works
- [ ] Timer and move counter work

## If Something Goes Wrong

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

## Redeployment

If you update `Code.gs`:
1. Paste new code into Apps Script editor
2. Click **Deploy** → **Manage Deployments**
3. Click the edit icon on your Web App deployment
4. Click **Update** (or create new deployment)
5. Update `config/config.local.js` if URL changed
6. Push to GitHub

If you update `index.html`:
1. Push to GitHub
2. GitHub Pages auto-deploys
3. Clear browser cache if needed

No additional config needed after initial setup!
