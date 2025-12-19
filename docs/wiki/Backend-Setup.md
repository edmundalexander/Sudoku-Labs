# Backend Setup Guide

Complete guide to setting up the Google Apps Script backend for Sudoku Logic Lab.

## Overview

The backend provides:

- Sudoku puzzle generation
- Leaderboard persistence (Google Sheets)
- Chat system
- Error logging

**Time Required**: 10-15 minutes

## Prerequisites

- Google account
- Access to Google Sheets
- Access to Google Apps Script
- Basic understanding of configuration

## Step-by-Step Instructions

### Step 1: Create Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Name it "Sudoku Logic Lab Database"
4. Copy the Sheet ID from the URL

**URL Format:**

```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
                                      ^^^^^^^^^^^^
```

**Example Sheet ID:**

```
ABC123xyz_EXAMPLE_SHEET_ID_456def
```

This is just an example - your actual Sheet ID will be different.

### Step 2: Create Apps Script Project

1. Go to [script.google.com](https://script.google.com/home)
2. Click **+ New project**
3. Name it "Sudoku Logic Lab API"

### Step 3: Add the Code

1. Open `apps_script/Code.gs` from the repository
2. Select all the code (Ctrl+A / Cmd+A)
3. Copy it (Ctrl+C / Cmd+C)
4. In Apps Script editor, delete the default code
5. Paste the copied code (Ctrl+V / Cmd+V)
6. Save (Ctrl+S / Cmd+S)

### Step 4: Update Sheet ID

In the Apps Script editor, find line ~15:

```javascript
const SHEET_ID = "1QU6QNWy6w6CNivq-PvmVJNcM1tUFWgQFzpN01Mo7QFs";
```

Replace the value with your Sheet ID from Step 1:

```javascript
const SHEET_ID = "YOUR_SHEET_ID_HERE";
```

**Save** again (Ctrl+S / Cmd+S).

### Step 5: Initialize Database

1. In Apps Script editor, find the function dropdown (above the code)
2. Select **`setupSheets_`** from the dropdown
3. Click the **Run** button (▶️)
4. You'll see a permission dialog:
   - Click **Review Permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to Sudoku Logic Lab API (unsafe)**
   - Click **Allow**
5. Wait for execution to complete (check Execution log at bottom)
6. You should see "Setup completed successfully"

**Verify:** Check your Google Sheet—it should now have 3 sheets:

- Leaderboard
- Chat
- Logs

### Step 7: Configure Admin & Maintenance Access

To enable admin features, you must set **Script Properties** in your GAS project.

1. In the Apps Script editor, click **Project Settings** (gear icon ⚙️).
2. Scroll to **Script Properties**.
3. Click **Edit script properties** and add the following:

#### A. For Admin Console (Human Login)

| Property              | Value                    | Description                |
| --------------------- | ------------------------ | -------------------------- |
| `ADMIN_USERNAME`      | `admin` (or your choice) | Username for browser login |
| `ADMIN_PASSWORD_HASH` | `[SHA-256 Hash]`         | Hash of your password      |

> **Generate Hash**: Use an [Online SHA-256 Generator](https://emn178.github.io/online-tools/sha256.html). Enter your password and copy the result.

#### B. For Maintenance Automation (Bot Access)

| Property              | Value             | Description                        |
| --------------------- | ----------------- | ---------------------------------- |
| `ADMIN_TRIGGER_TOKEN` | `[Random String]` | Secret token for automated scripts |

> **Generate Token**: You can use a UUID or any long random string.

4. Click **Save script properties**.

### Step 8: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "Production API" (or whatever you like)
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** ⚠️ **CRITICAL - Must be "Anyone"**
5. Click **Deploy**
6. You'll see a permissions dialog again:
   - Click **Authorize access**
   - Choose your account
   - Grant permissions
7. Copy the **Web app URL**

### Step 7: Save Deployment URL

The deployment URL looks like:

```
https://script.google.com/macros/s/AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
```

**Save this URL!** You'll need it in the next step.

### Step 8: Configure Frontend

1. In the repository, open `config/config.local.js`
2. If it doesn't exist, copy from `config.example.js`:
   ```bash
   cp config/config.example.js config/config.local.js
   ```
3. Edit `config/config.local.js`:
   ```javascript
   const CONFIG = {
     GAS_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_URL/exec",
   };
   ```
4. Replace with your actual deployment URL from Step 7
5. Save the file

### Step 9: Test the Backend

Test using `curl` or browser:

```bash
# Set your URL
export GAS_URL="https://script.google.com/macros/s/YOUR_ID/exec"

# Test ping endpoint
curl "$GAS_URL?action=ping"

# Expected response:
# {"ok":true,"timestamp":"2025-12-14T..."}
```

Or use the diagnostic script:

```bash
./diagnostic.sh
```

### Step 10: Test in Frontend

1. Open `index.html` in your browser
2. Open browser console (F12)
3. Run this test:
   ```javascript
   fetch(CONFIG.GAS_URL + "?action=ping")
     .then((r) => r.json())
     .then(console.log);
   ```
4. You should see: `{ok: true, timestamp: "..."}`

## Verification Checklist

- [ ] Google Sheet created with 3 tabs
- [ ] Apps Script project created
- [ ] Code pasted and saved
- [ ] Sheet ID updated in code
- [ ] `setupSheets_` function executed successfully
- [ ] Deployed as Web App with "Anyone" access
- [ ] Deployment URL copied
- [ ] `config/config.local.js` updated with URL
- [ ] `curl` test returns JSON
- [ ] Frontend can reach backend

## Troubleshooting

### Issue: "Exception: The parameters (String) don't match the method signature"

**Cause:** Sheet ID is incorrect or not updated.

**Solution:** Double-check the Sheet ID in line 15 of `Code.gs` matches your Google Sheet.

### Issue: "ReferenceError: SpreadsheetApp is not defined"

**Cause:** Running in wrong environment or Apps Script not initialized.

**Solution:** Ensure you're running in Apps Script editor, not local JavaScript.

### Issue: 302 Redirect or HTML Response

**Cause:** Deployment access is not set to "Anyone".

**Solution:**

1. Go to **Deploy** → **Manage deployments**
2. Click edit icon ✏️
3. Change "Who has access" to **Anyone**
4. Click **Update**

### Issue: "You do not have permission to call SpreadsheetApp.openById"

**Cause:** Script doesn't have permission to access the Sheet.

**Solution:**

1. Re-run the authorization flow
2. Ensure "Execute as: Me" in deployment settings
3. Check Sheet ID is correct

### Issue: curl Returns Empty or Error

**Possible causes:**

- Wrong deployment URL
- Deployment not set to "Anyone"
- Backend has errors

**Debug:**

1. Check Apps Script execution logs
2. Verify deployment URL
3. Test ping endpoint first
4. Check CORS settings (should work by default)

## Understanding the Backend

### API Structure

The backend uses a single entry point (`doGet`) that routes requests based on the `action` parameter:

```javascript
function doGet(e) {
  const action = e.parameter.action;

  switch (action) {
    case "ping":
      return ping();
    case "generateSudoku":
      return generateSudoku(e.parameter.difficulty);
    case "getLeaderboard":
      return getLeaderboardData();
    // ... more actions
  }
}
```

### Data Storage

Three Google Sheets store all data:

**Leaderboard Sheet:**
| Name | Time | Difficulty | Date |
|------|------|------------|------|
| Alice | 180 | Hard | 2025-12-14 |

**Chat Sheet:**
| ID | Sender | Text | Timestamp |
|----|--------|------|-----------|
| msg_123 | Bob | Hello! | 2025-12-14T... |

**Logs Sheet:**
| Timestamp | Type | Message | UserAgent | Count |
|-----------|------|---------|-----------|-------|
| 2025-12-14T... | Error | ... | Mozilla/5.0 | 1 |

### Security

- All inputs are sanitized using `sanitizeInput_()`
- Outputs are sanitized using `sanitizeOutput_()`
- No authentication (public API)
- Rate limiting via Google Apps Script quotas

## Redeployment

If you update the backend code:

1. Edit `apps_script/Code.gs` in the repository
2. Copy the updated code
3. Paste into Apps Script editor
4. Save (Ctrl+S)
5. **Deploy** → **Manage deployments**
6. Click edit icon ✏️ on your deployment
7. Click **Update** (deployment URL stays the same)

   OR create a new deployment (new URL):

8. **Deploy** → **New deployment**
9. Follow steps 6-8 above
10. Update `config/config.local.js` with new URL if changed

## Advanced Configuration

### Custom Sheet Names

By default, sheets are named:

- Leaderboard
- Chat
- Logs

To customize, edit `setupSheets_()` in `Code.gs`:

```javascript
function setupSheets_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // Custom names
  getOrCreateSheet_(ss, "MyLeaderboard");
  getOrCreateSheet_(ss, "MyChat");
  getOrCreateSheet_(ss, "MyLogs");
}
```

Then update references throughout the code.

### Multiple Environments

For dev/staging/prod environments:

**Option 1: Multiple Sheets**

- One Sheet per environment
- Update Sheet ID in code
- Deploy separately

**Option 2: Multiple Deployments**

- Same code
- Different deployments
- Same Sheet or different Sheets

### Backup Strategy

**Manual Backup:**

1. In Google Sheet: **File** → **Download** → **CSV** (for each sheet)
2. Store backups regularly

**Automated Backup:**

- Use Google Sheets API
- Set up scheduled exports
- Store in Google Drive or external storage

## API Quotas

Google Apps Script has daily quotas:

| Resource                | Free Tier       |
| ----------------------- | --------------- |
| URL Fetch calls         | 20,000/day      |
| Script runtime          | 6 min/execution |
| Triggers                | 90 min/day      |
| Simultaneous executions | 30              |

These limits are sufficient for typical game usage (100s-1000s of players/day).

## Next Steps

- **[Frontend Setup](Frontend-Setup)** - Configure GitHub Pages
- **[API Reference](API-Reference)** - Learn the API endpoints
- **[Troubleshooting](Troubleshooting)** - Fix common issues
- **[Configuration](Configuration-Guide)** - Advanced configuration

---

**Backend setup complete! 🎉**

Test the full application by opening `index.html` in your browser.
