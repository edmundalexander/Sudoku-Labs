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
- This creates: Leaderboard, Chat, Logs, Users sheets in your Google Sheet
  - **Note:** The Users sheet is for the optional authentication system

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

### 1. Update Configuration (Local Dev)

- Copy `public/config/config.example.js` to `public/config/config.local.js`
- Update `GAS_URL` with your deployment URL from Part 1, Step 6
- This file is for local development only and is gitignored.

### 2. Configure GitHub Actions

- Ensure `.github/workflows/deploy.yml` exists in your repository.
- This workflow handles building and deploying your site automatically.

### 3. Enable GitHub Pages

- Go to GitHub repo settings
- Scroll to **Pages** section
- **Source**: Select **GitHub Actions**
- Save

### 4. Access Your Game

- Push your changes to `main`
- Wait for the "Deploy to GitHub Pages" action to complete (check "Actions" tab)
- Go to: `https://[username].github.io/[repo-name]/`
- Game should load!

### 5. Test Frontend

- Start a game (pick difficulty)
- Solve and submit (score should save)
- Send chat message (should appear in sheet)
- Check browser console (F12) for any errors

## Part 3: Production Configuration

### 1. Add GAS_URL as a Repository Secret (Optional)

If you want to inject the GAS URL during the build process (instead of loading it from a file):

- In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**.
- Click **New repository secret**.
- Name the secret `GAS_URL`.
- Paste your full Google Apps Script deployment URL into the "Value" field.
- _Note: You will need to update the workflow to use this secret if you choose this method._

### 2. Using Config Files (Recommended)

- The build process copies `public/config/` to the output.
- You can commit a `public/config/config.production.js` (or similar) and update `index.html` to load it, OR
- Rely on the fact that `config.local.js` is ignored, and you might need a way to supply config in production.
- **Current Setup**: The app looks for `window.CONFIG`. You can create a `public/config/config.js` with your production settings and commit it, then ensure `index.html` loads it.

---

## Verification Checklist

- [ ] GAS backend test returns `{"ok":true,...}`
- [ ] GitHub Pages site loads without errors
- [ ] All 5 source files load in correct order (check browser DevTools → Network tab):
  - [ ] constants.js (game configuration)
  - [ ] utils.js (helper functions)
  - [ ] sound.js (audio system)
  - [ ] services.js (API layer)
  - [ ] app.jsx (React components)
- [ ] Game board generates correctly
- [ ] Score saves to leaderboard
- [ ] Chat messages post and display
- [ ] No 404 or CORS errors in console
- [ ] Difficulty selection works
- [ ] Timer and move counter work
- [ ] Sound effects work (if enabled)
- [ ] Theme switching works
- [ ] Campaign mode loads

## If Something Goes Wrong

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common issues and solutions.

## Optional: Authentication System

The game now includes an optional authentication system that allows users to:

- Continue as Guest (default, works exactly as before)
- Register for an account to track stats across devices
- Login to sync progress

**To enable authentication, no extra setup is needed!** The system is already included in the deployment above.

For detailed information about the authentication system, see [AUTHENTICATION_SETUP.md](docs/AUTHENTICATION_SETUP.md).

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
