# Quick Start: Getting OAuth Credentials for Automated Deployment

This guide walks you through obtaining OAuth credentials for automated GAS deployment.

## Prerequisites

- Node.js 18+ installed
- A Google account
- A Google Apps Script project (or create one)

## Step-by-Step Guide

### Step 1: Install clasp

```bash
npm install -g @google/clasp
```

### Step 2: Login to Google

```bash
clasp login
```

This will:
1. Open your browser
2. Ask you to sign in to Google
3. Request permission for clasp to access your scripts
4. Save credentials to `~/.clasprc.json`

### Step 3: Extract OAuth Credentials

```bash
# On Linux/Mac
cat ~/.clasprc.json

# On Windows
type %USERPROFILE%\.clasprc.json
```

You'll see output like this:

```json
{
  "token": {
    "access_token": "ya29.a0AfH6SMBx...",
    "refresh_token": "1//0gJK5d...",
    "scope": "https://www.googleapis.com/auth/script.projects ...",
    "token_type": "Bearer",
    "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY...",
    "expiry_date": 1639234567890
  },
  "oauth2ClientSettings": {
    "clientId": "123456789-abcdefghijk.apps.googleusercontent.com",
    "clientSecret": "GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ",
    "redirectUri": "http://localhost"
  },
  "isLocalCreds": false
}
```

### Step 4: Set Environment Variables

**For Local Development:**

```bash
# Linux/Mac
export CLASP_SCRIPT_ID="your-script-id-here"
export GAS_SHEET_ID="your-sheet-id-here"
export CLASP_ACCESS_TOKEN="ya29.a0AfH6SMBx..."
export CLASP_REFRESH_TOKEN="1//0gJK5d..."
export CLASP_ID_TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6IjY..."
export CLASP_CLIENT_ID="123456789-abcdefghijk.apps.googleusercontent.com"
export CLASP_CLIENT_SECRET="GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ"
```

```powershell
# Windows PowerShell
$env:CLASP_SCRIPT_ID="your-script-id-here"
$env:GAS_SHEET_ID="your-sheet-id-here"
$env:CLASP_ACCESS_TOKEN="ya29.a0AfH6SMBx..."
$env:CLASP_REFRESH_TOKEN="1//0gJK5d..."
$env:CLASP_ID_TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6IjY..."
$env:CLASP_CLIENT_ID="123456789-abcdefghijk.apps.googleusercontent.com"
$env:CLASP_CLIENT_SECRET="GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ"
```

**For GitHub Actions:**

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each variable:
   - Name: `CLASP_SCRIPT_ID`, Value: your script ID
   - Name: `GAS_SHEET_ID`, Value: your sheet ID
   - Name: `CLASP_ACCESS_TOKEN`, Value: from `.clasprc.json`
   - Name: `CLASP_REFRESH_TOKEN`, Value: from `.clasprc.json`
   - Name: `CLASP_ID_TOKEN`, Value: from `.clasprc.json`
   - Name: `CLASP_CLIENT_ID`, Value: from `.clasprc.json`
   - Name: `CLASP_CLIENT_SECRET`, Value: from `.clasprc.json`

### Step 5: Get Script ID

If you don't have a script ID yet:

1. Go to [script.google.com](https://script.google.com)
2. Create a new project or open existing
3. Click **Project Settings** (gear icon)
4. Copy the **Script ID**

Or create a new project with clasp:

```bash
# Create new project
clasp create "Sudoku Labs API" --type webapp --rootDir apps_script

# This will create .clasp.json with the script ID
cat .clasp.json
```

### Step 6: Get Sheet ID

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new sheet or open existing
3. Copy the ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```

### Step 7: Test Deployment

```bash
# Dry run (doesn't actually deploy)
node scripts/deploy-gas.js --dry-run

# If successful, run actual deployment
npm run deploy:gas
```

## Troubleshooting

### Error: "User has not enabled the Apps Script API"

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Google Apps Script API**

### Error: "Invalid credentials"

Your access token may have expired. Run `clasp login` again to refresh.

### Error: "Permission denied"

Make sure the OAuth scopes include:
- `https://www.googleapis.com/auth/script.projects`
- `https://www.googleapis.com/auth/script.webapp.deploy`
- `https://www.googleapis.com/auth/drive.file`

## Security Best Practices

1. **Never commit credentials** - All credential files are gitignored
2. **Use GitHub Secrets** for CI/CD - Never hardcode in workflow files
3. **Rotate credentials periodically** - Revoke and regenerate if compromised
4. **Use separate credentials** for dev/prod environments
5. **Limit OAuth scopes** to only what's needed

## Next Steps

Once you have credentials configured:

1. Test locally: `npm run deploy:gas`
2. Set up GitHub Actions: Add secrets to repository
3. Commit with `[deploy-gas]`: Trigger automated deployment
4. Verify: Check [script.google.com](https://script.google.com) for deployment

## Getting Help

- Documentation: [AI_AGENT_DEPLOYMENT.md](AI_AGENT_DEPLOYMENT.md)
- clasp docs: [github.com/google/clasp](https://github.com/google/clasp)
- Troubleshooting: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
