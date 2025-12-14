# Deployment Checklist

## ✅ Code is Ready to Deploy

Your Code.gs and index.html are now committed to GitHub and ready to use in Google Apps Script.

## Steps to Deploy

### 1. Create New Apps Script Project
- Go to https://script.google.com/home
- Click **"New project"**
- Name it "Sudoku Logic Lab" (or whatever you want)

### 2. Copy Code.gs
- In this repository, open `apps_script/Code.gs`
- Copy ALL the code
- In your Apps Script editor, replace the default Code.gs with this code
- **Update SHEET_ID** to your Google Sheet ID (see step 4)

### 3. Create index.html File
- In Apps Script editor, click **"+" → "HTML"**
- Name it **"index"** (MUST be exactly "index")
- Copy content from this repo's `index.html`
- Paste it in

### 4. Create Google Sheet
- Go to https://sheets.google.com
- Create new sheet (or use existing)
- Copy the sheet ID from URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
- Update `SHEET_ID` in Code.gs with this value

### 5. Save and Deploy
- In Apps Script, press **Ctrl+S** to save
- Click **Deploy** → **New Deployment**
- Type: **Web App**
- Execute as: **Your email address**
- Who has access: **Anyone** ⚠️ IMPORTANT!
- Click **Deploy**
- Copy the URL that appears

### 6. Initialize Database
- In Apps Script editor, go to Code.gs
- Find `setupSheets_()` function
- Click **Select function** dropdown and choose `setupSheets_`
- Click **Run** button (▶️)
- Check the Execution log for success
- This creates Leaderboard, Chat, and Logs sheets

### 7. Test
- Open the deployment URL in browser
- Game should load immediately
- Try:
  - Starting a new game
  - Making a move
  - Checking leaderboard (if available)
  - Testing chat (if available)

## Common Issues

### "Moved Temporarily" or 403 Forbidden
- ❌ Wrong: "Who has access" is set to "Only me"
- ✅ Fix: Re-deploy with "Who has access: Anyone"

### Sheet not found error
- ❌ Wrong: SHEET_ID is incorrect or you didn't have permissions
- ✅ Fix: 
  1. Verify SHEET_ID is correct
  2. Check you have access to the sheet
  3. Run setupSheets_() to create missing sheets

### "Cannot find file index"
- ❌ Wrong: HTML file is named something other than "index"
- ✅ Fix: Rename to exactly "index"

### 404 Deployment not found
- ❌ Wrong: Deployment URL is copied incorrectly
- ✅ Fix: Copy the full URL from the deployment dialog

## Files in Repository

- **apps_script/Code.gs** ← Copy this to Apps Script
- **index.html** ← Copy this as "index.html" in Apps Script
- **ARCHITECTURE.md** ← Understanding the architecture
- **GAS_TROUBLESHOOTING.md** ← More detailed troubleshooting

## Success Indicators

✅ **Code.gs saved without syntax errors**
✅ **index.html file exists in Apps Script**
✅ **setupSheets_() ran successfully**
✅ **Sheets created: Leaderboard, Chat, Logs**
✅ **Deployment URL is accessible**
✅ **Game loads when you visit the URL**
✅ **Score saves to leaderboard**
✅ **Chat messages send/receive**

## No More External Configuration Needed

- ❌ Old way: GitHub Pages + config files (403 errors)
- ✅ New way: Embedded GAS app (simple, works!)

Just copy the code, deploy, and go!

---

**Questions?** Check ARCHITECTURE.md or GAS_TROUBLESHOOTING.md
