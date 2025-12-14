# AI Agent Quick Reference - Automated GAS Deployment

**For AI Coding Agents working on Sudoku-Labs**

## TL;DR

```bash
# When you modify apps_script/Code.gs, commit with:
git commit -m "Update backend API [deploy-gas]"
git push

# This automatically:
# 1. Pushes code to Google Apps Script
# 2. Creates new deployment version
# 3. Updates SHEET_ID if GAS_SHEET_ID is set
```

## What Gets Automated

✅ **Automated:**
- Pushing `apps_script/Code.gs` to Google Apps Script
- Creating new deployment versions
- Updating SHEET_ID constant in Code.gs
- GitHub Actions CI/CD integration

❌ **Still Manual:**
- Initial GAS project creation
- First OAuth authentication (`clasp login`)
- Running `setupSheets_()` to initialize database
- Getting deployment URL for frontend config

## Quick Commands

### Local Deployment

```bash
# One-time setup
npm install
clasp login  # Opens browser for OAuth
cp .clasp.json.example .clasp.json
# Edit .clasp.json with your script ID

# Deploy
npm run deploy:gas

# Options
npm run deploy:gas -- --dry-run     # Test without deploying
npm run deploy:gas -- --push-only   # Update code only
```

### CI/CD Deployment

1. **Add GitHub Secrets** (Settings > Secrets > Actions):
   ```
   CLASP_SCRIPT_ID       = "your-script-id"
   GAS_SHEET_ID          = "your-sheet-id"  
   CLASP_ACCESS_TOKEN    = "from ~/.clasprc.json"
   CLASP_REFRESH_TOKEN   = "from ~/.clasprc.json"
   CLASP_CLIENT_ID       = "from ~/.clasprc.json"
   CLASP_CLIENT_SECRET   = "from ~/.clasprc.json"
   ```

2. **Commit with trigger**:
   ```bash
   git commit -m "Fix backend bug [deploy-gas]"
   git push
   ```

3. **GitHub Actions will**:
   - Install clasp
   - Configure OAuth
   - Push to GAS
   - Create deployment

## File Structure

```
Sudoku-Labs/
├── apps_script/
│   ├── Code.gs              ← Your backend code
│   └── appsscript.json      ← GAS manifest (auto-created)
├── scripts/
│   ├── deploy-gas.js        ← Deployment automation
│   ├── setup-clasp.sh       ← Environment setup
│   └── README.md            ← Script documentation
├── .clasp.json.example      ← Template (copy to .clasp.json)
├── .clasp.json              ← Your config (gitignored)
└── package.json             ← NPM scripts
```

## Common Workflows

### Making Backend Changes

1. **Edit** `apps_script/Code.gs`
2. **Test locally** (optional):
   ```bash
   npm run deploy:gas -- --dry-run
   ```
3. **Commit and deploy**:
   ```bash
   git add apps_script/Code.gs
   git commit -m "Add new API endpoint [deploy-gas]"
   git push
   ```
4. **Verify** at [script.google.com](https://script.google.com)

### Updating Database Schema

Database changes (adding sheets, columns) are NOT automated. You need to:

1. Update `setupSheets_()` function in `Code.gs`
2. Deploy the code
3. Manually run `setupSheets_()` from GAS console

### Changing SHEET_ID

**Option A: Automatic (recommended)**
```bash
export GAS_SHEET_ID="new-sheet-id"
npm run deploy:gas
```

**Option B: Manual**
```javascript
// Edit Code.gs line ~15
const SHEET_ID = 'new-sheet-id';
```

## Environment Variables

### Required for Deployment

```bash
CLASP_SCRIPT_ID       # GAS project script ID
CLASP_ACCESS_TOKEN    # OAuth access token
CLASP_REFRESH_TOKEN   # OAuth refresh token
CLASP_CLIENT_ID       # OAuth client ID
CLASP_CLIENT_SECRET   # OAuth client secret
```

### Optional

```bash
GAS_SHEET_ID          # Auto-updates SHEET_ID in Code.gs
```

### Getting Credentials

```bash
# Install clasp
npm install -g @google/clasp

# Login (opens browser)
clasp login

# View credentials
cat ~/.clasprc.json
```

See [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) for detailed instructions.

## Troubleshooting

### "clasp is not installed"

```bash
npm install -g @google/clasp
```

### "Missing environment variables"

Check which are missing:
```bash
./scripts/setup-clasp.sh
```

### "Invalid credentials"

Re-authenticate:
```bash
clasp login
```

### Deployment succeeds but changes not visible

1. Check you're looking at the right project
2. Refresh the Apps Script console
3. Check execution logs for errors
4. Verify the deployment URL hasn't changed

### GitHub Actions fails

1. Check secrets are set in repository settings
2. Verify OAuth credentials haven't expired
3. Check workflow logs for specific error

## Script Options

### deploy-gas.js

```bash
# Full deployment (push + new version)
node scripts/deploy-gas.js

# Push code only
node scripts/deploy-gas.js --push-only

# Create deployment only
node scripts/deploy-gas.js --deploy-only

# Dry run
node scripts/deploy-gas.js --dry-run

# Help
node scripts/deploy-gas.js --help
```

## Security Notes

🔒 **Never commit:**
- `.clasp.json` (gitignored)
- `.clasprc.json` (gitignored)
- OAuth credentials
- Script IDs (use env vars)

✅ **Safe to commit:**
- `.clasp.json.example`
- `appsscript.json`
- `package.json`
- Deployment scripts

## Complete Documentation

- [AI Agent Deployment Guide](AI_AGENT_DEPLOYMENT.md) - Full setup
- [OAuth Setup Guide](OAUTH_SETUP_GUIDE.md) - Getting credentials
- [Scripts README](../scripts/README.md) - Script documentation
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Manual deployment
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues

## Example: First-Time Setup

```bash
# 1. Install dependencies
npm install
npm install -g @google/clasp

# 2. Authenticate
clasp login

# 3. Get credentials
cat ~/.clasprc.json

# 4. Set environment variables
export CLASP_SCRIPT_ID="your-script-id"
export CLASP_ACCESS_TOKEN="..."
export CLASP_REFRESH_TOKEN="..."
export CLASP_CLIENT_ID="..."
export CLASP_CLIENT_SECRET="..."
export GAS_SHEET_ID="your-sheet-id"

# 5. Test deployment
npm run deploy:gas -- --dry-run

# 6. Deploy
npm run deploy:gas

# 7. Verify
curl "$GAS_URL?action=ping"
```

## Example: CI/CD Setup

```bash
# 1. Get OAuth credentials
clasp login
cat ~/.clasprc.json

# 2. Add to GitHub Secrets
# (via repository Settings > Secrets > Actions)

# 3. Commit with trigger
git commit -m "Update API [deploy-gas]"
git push

# 4. Monitor GitHub Actions
# (via repository Actions tab)
```

## Tips for AI Agents

1. **Always test with `--dry-run` first**
2. **Check environment variables before deploying**
3. **Include `[deploy-gas]` in commit message when needed**
4. **Verify deployment succeeded via curl or browser**
5. **Document any manual steps needed**

## Getting Help

- Check logs: `./scripts/deploy-gas.js --help`
- View workflow: `.github/workflows/deploy.yml`
- Test scripts: `npm run deploy:gas -- --dry-run`
- Read docs: `docs/AI_AGENT_DEPLOYMENT.md`

---

**Last Updated:** December 2025  
**Maintained by:** Sudoku-Labs Team
