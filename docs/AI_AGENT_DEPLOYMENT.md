# AI Agent Deployment Guide

This guide explains how AI agents can automatically deploy updates to the Google Apps Script backend and Google Sheets database.

## Overview

The Sudoku-Labs project uses a **hybrid deployment** approach:
- **Frontend**: Automatically deployed to GitHub Pages via GitHub Actions
- **Backend**: Can be deployed automatically using the `clasp` CLI tool (Google Apps Script Command Line)

## Automated Backend Deployment

### Prerequisites

1. **Google Apps Script Project**: A GAS project must exist with a Script ID
2. **Google Sheets Database**: A Google Sheet with the appropriate structure
3. **OAuth Credentials**: Service account or OAuth credentials for clasp authentication
4. **Environment Variables**: Required credentials stored securely

### Required Environment Variables

For automated deployment, the following environment variables must be configured:

```bash
# GAS Project Configuration
CLASP_SCRIPT_ID="your-script-id-here"          # Script ID from GAS project
GAS_SHEET_ID="your-sheet-id-here"              # Google Sheets ID for database

# OAuth Credentials (from Google Cloud Console)
CLASP_ACCESS_TOKEN="access-token"              # OAuth access token
CLASP_REFRESH_TOKEN="refresh-token"            # OAuth refresh token  
CLASP_CLIENT_ID="client-id"                    # OAuth client ID
CLASP_CLIENT_SECRET="client-secret"            # OAuth client secret
```

### How to Get Credentials

#### 1. Get Script ID

- Open your GAS project at [script.google.com](https://script.google.com)
- Click **Project Settings** (gear icon)
- Copy the **Script ID**

#### 2. Get Sheet ID

- Open your Google Sheet
- Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

#### 3. Get OAuth Credentials

**Option A: Use existing clasp credentials (manual setup once)**

```bash
# Install clasp globally
npm install -g @google/clasp

# Login to Google (opens browser)
clasp login

# Credentials are stored in ~/.clasprc.json
cat ~/.clasprc.json
```

Copy the values from `~/.clasprc.json` to your environment variables.

**Option B: Create service account (for CI/CD)**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable **Google Apps Script API**
4. Create OAuth 2.0 credentials
5. Use the OAuth credentials with clasp

### Deployment Methods

#### Method 1: Using npm script

```bash
# Set environment variables
export CLASP_SCRIPT_ID="your-script-id"
export GAS_SHEET_ID="your-sheet-id"
export CLASP_ACCESS_TOKEN="token"
export CLASP_REFRESH_TOKEN="refresh"
export CLASP_CLIENT_ID="client-id"
export CLASP_CLIENT_SECRET="secret"

# Run deployment
npm run deploy:gas
```

#### Method 2: Direct script execution

```bash
node scripts/deploy-gas.js
```

#### Method 3: Manual clasp commands

```bash
# Setup .clasp.json (one-time)
echo '{"scriptId":"YOUR_SCRIPT_ID","rootDir":"apps_script"}' > .clasp.json

# Login (one-time)
clasp login

# Push code
clasp push --force

# Deploy new version
clasp deploy --description "Updated by AI agent"
```

### Script Options

The `deploy-gas.js` script supports several options:

```bash
# Push code only (no new deployment)
node scripts/deploy-gas.js --push-only

# Create deployment only (no code push)
node scripts/deploy-gas.js --deploy-only

# Dry run (show what would happen)
node scripts/deploy-gas.js --dry-run

# Show help
node scripts/deploy-gas.js --help
```

## GitHub Actions Integration

To enable automated deployment in GitHub Actions, add the required secrets to your repository:

### 1. Add Repository Secrets

Go to **Settings** > **Secrets and variables** > **Actions** and add:

- `CLASP_SCRIPT_ID`
- `GAS_SHEET_ID`
- `CLASP_ACCESS_TOKEN`
- `CLASP_REFRESH_TOKEN`
- `CLASP_CLIENT_ID`
- `CLASP_CLIENT_SECRET`

### 2. Update GitHub Actions Workflow

Add a job to `.github/workflows/deploy.yml`:

```yaml
deploy-gas:
  runs-on: ubuntu-latest
  if: contains(github.event.head_commit.message, '[deploy-gas]')
  steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm install
    
    - name: Deploy to Google Apps Script
      env:
        CLASP_SCRIPT_ID: ${{ secrets.CLASP_SCRIPT_ID }}
        GAS_SHEET_ID: ${{ secrets.GAS_SHEET_ID }}
        CLASP_ACCESS_TOKEN: ${{ secrets.CLASP_ACCESS_TOKEN }}
        CLASP_REFRESH_TOKEN: ${{ secrets.CLASP_REFRESH_TOKEN }}
        CLASP_CLIENT_ID: ${{ secrets.CLASP_CLIENT_ID }}
        CLASP_CLIENT_SECRET: ${{ secrets.CLASP_CLIENT_SECRET }}
      run: npm run deploy:gas
```

Now commits with `[deploy-gas]` in the message will trigger automated deployment.

## AI Agent Usage

### For AI Coding Agents

When you need to deploy backend changes:

1. **Make changes** to `apps_script/Code.gs`
2. **Commit changes** with message containing `[deploy-gas]`
3. **GitHub Actions** will automatically:
   - Push code to Google Apps Script
   - Create new deployment
   - Update Sheet ID if configured

### Verification

After deployment, verify:

```bash
# Test the ping endpoint
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=ping"

# Should return:
# {"ok":true,"timestamp":"2025-12-14T..."}
```

### Troubleshooting

**Problem**: `Error: Could not read API credentials`

**Solution**: Ensure all environment variables are set correctly

---

**Problem**: `Error: Script ID not found`

**Solution**: Verify the Script ID is correct and the project exists

---

**Problem**: `Error: Permission denied`

**Solution**: Check OAuth credentials have necessary scopes:
- `https://www.googleapis.com/auth/script.projects`
- `https://www.googleapis.com/auth/script.webapp.deploy`
- `https://www.googleapis.com/auth/drive.file`

## Manual Deployment (Fallback)

If automated deployment fails, you can always deploy manually:

1. Copy `apps_script/Code.gs`
2. Open [script.google.com](https://script.google.com)
3. Paste code into the editor
4. Click **Deploy** > **New deployment**
5. Configure and deploy

See [DEPLOYMENT_CHECKLIST.md](../docs/DEPLOYMENT_CHECKLIST.md) for detailed manual steps.

## Security Considerations

### Credential Storage

- **Never commit** `.clasp.json` or `.clasprc.json` (both are gitignored)
- **Use GitHub Secrets** for CI/CD credentials
- **Rotate credentials** periodically
- **Use least privilege** OAuth scopes

### Access Control

- **Script execution**: "Execute as: Me" (owner)
- **Web app access**: "Anyone" (for public API)
- **Sheet access**: Only script owner needs access

## Database Management

### Initialize Database

The script automatically updates the `SHEET_ID` in `Code.gs`, but you still need to run `setupSheets_()` once:

```bash
# Option 1: Via clasp
clasp run setupSheets_

# Option 2: Manual
# Open script.google.com, select setupSheets_ and click Run
```

This creates the required sheets:
- Leaderboard
- Chat
- Logs
- Users

### Database Schema

The schema is defined in the `setupSheets_()` function in `Code.gs`. Modifications to the schema require manual intervention or additional automation.

## Limitations

### What Can Be Automated

✅ Pushing code changes to GAS  
✅ Creating new deployments  
✅ Updating SHEET_ID in code  
✅ Managing deployment versions  

### What Cannot Be Automated (Currently)

❌ Initial GAS project creation  
❌ First-time OAuth authorization  
❌ Google Sheet structure changes  
❌ Deployment URL retrieval (must check manually)  

## Best Practices

1. **Test locally first**: Use `--dry-run` to verify changes
2. **Incremental deployments**: Make small, frequent changes
3. **Version descriptions**: Include meaningful deployment messages
4. **Backup data**: Export Google Sheets data before major changes
5. **Monitor logs**: Check Apps Script execution logs after deployment

## Future Enhancements

Potential improvements to the automation system:

- [ ] Google Sheets API integration for schema updates
- [ ] Automated deployment URL retrieval and config update
- [ ] Rollback mechanism for failed deployments
- [ ] Integration tests for deployed API
- [ ] Automated database migration scripts

## Resources

- [clasp Documentation](https://github.com/google/clasp)
- [Google Apps Script API](https://developers.google.com/apps-script/api)
- [OAuth 2.0 for Apps Script](https://developers.google.com/apps-script/guides/services/authorization)

---

**Questions?** See [TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md) or open an issue.
