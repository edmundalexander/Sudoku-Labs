# Scripts Directory

This directory contains automation scripts for the Sudoku-Labs project.

## Scripts Overview

### `deploy-gas.js`
**Purpose**: Automates deployment of Google Apps Script backend

**Usage**:
```bash
# Full deployment (push code + create deployment)
node scripts/deploy-gas.js

# Push code only (no new deployment version)
node scripts/deploy-gas.js --push-only

# Create deployment only (don't push code)
node scripts/deploy-gas.js --deploy-only

# Dry run (show what would happen)
node scripts/deploy-gas.js --dry-run

# Show help
node scripts/deploy-gas.js --help
```

**Requirements**:
- Node.js 18+
- clasp installed (`npm install -g @google/clasp`)
- Environment variables configured (see below)

**Environment Variables**:
```bash
CLASP_SCRIPT_ID       # GAS project script ID (required)
GAS_SHEET_ID          # Google Sheets database ID (optional)
CLASP_ACCESS_TOKEN    # OAuth access token (required)
CLASP_REFRESH_TOKEN   # OAuth refresh token (required)
CLASP_CLIENT_ID       # OAuth client ID (required)
CLASP_CLIENT_SECRET   # OAuth client secret (required)
```

**What it does**:
1. Creates `.clasp.json` with script ID
2. Creates `.clasprc.json` with OAuth credentials
3. Updates `SHEET_ID` in `Code.gs` if `GAS_SHEET_ID` is set
4. Pushes code to Google Apps Script
5. Creates new deployment version
6. Cleans up credential files

---

### `setup-clasp.sh`
**Purpose**: Sets up clasp environment for deployment

**Usage**:
```bash
./scripts/setup-clasp.sh
```

**Requirements**:
- Bash shell
- Node.js and npm
- Environment variables configured

**What it does**:
1. Checks prerequisites (Node.js, npm)
2. Installs clasp globally (in CI) or locally
3. Validates environment variables
4. Creates `.clasp.json` and `.clasprc.json`
5. Verifies access to GAS project

---

### `cleanup-merged-branches.sh`
**Purpose**: Cleans up merged Git branches

**Usage**:
```bash
./scripts/cleanup-merged-branches.sh
```

**What it does**:
- Removes local branches that have been merged to main
- Helps keep repository clean

---

## Quick Start for AI Agents

### First-Time Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables** (in CI/CD or locally):
   ```bash
   export CLASP_SCRIPT_ID="your-script-id"
   export GAS_SHEET_ID="your-sheet-id"
   export CLASP_ACCESS_TOKEN="token"
   export CLASP_REFRESH_TOKEN="refresh"
   export CLASP_CLIENT_ID="client-id"
   export CLASP_CLIENT_SECRET="secret"
   ```

3. **Run setup**:
   ```bash
   ./scripts/setup-clasp.sh
   ```

4. **Deploy**:
   ```bash
   npm run deploy:gas
   ```

### GitHub Actions Integration

Commits with `[deploy-gas]` in the message automatically trigger GAS deployment:

```bash
git commit -m "Update backend API [deploy-gas]"
git push
```

The GitHub Actions workflow will:
- Install dependencies
- Set up clasp
- Push code to GAS
- Create new deployment

## NPM Scripts

The following npm scripts are available:

```bash
# Deploy GAS backend (full deployment)
npm run deploy:gas

# Setup clasp (interactive)
npm run setup:clasp

# Push code only
npm run push:gas

# Create deployment only
npm run deploy:gas-version

# Open GAS project in browser
npm run open:gas
```

## Troubleshooting

### Error: "clasp is not installed"

**Solution**: Install clasp globally
```bash
npm install -g @google/clasp
```

### Error: "Missing environment variables"

**Solution**: Ensure all required environment variables are set
```bash
# Check which variables are missing
./scripts/setup-clasp.sh
```

### Error: "Could not read API credentials"

**Solution**: Verify OAuth credentials are correct and not expired

### Error: "Permission denied"

**Solution**: Check that OAuth scopes include:
- `https://www.googleapis.com/auth/script.projects`
- `https://www.googleapis.com/auth/script.webapp.deploy`
- `https://www.googleapis.com/auth/drive.file`

## Security Notes

- **Never commit** `.clasp.json` or `.clasprc.json` (gitignored)
- **Use GitHub Secrets** for CI/CD credentials
- **Rotate credentials** periodically
- **Use least privilege** OAuth scopes

## Documentation

For detailed documentation on automated deployment:
- [AI Agent Deployment Guide](../docs/AI_AGENT_DEPLOYMENT.md)
- [Deployment Checklist](../docs/DEPLOYMENT_CHECKLIST.md)
- [Troubleshooting Guide](../docs/TROUBLESHOOTING.md)

## Getting OAuth Credentials

### Option 1: Use clasp login (easiest)

```bash
# Install clasp
npm install -g @google/clasp

# Login (opens browser)
clasp login

# View credentials
cat ~/.clasprc.json
```

### Option 2: Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable **Google Apps Script API**
4. Create OAuth 2.0 credentials
5. Configure authorized redirect URIs
6. Use credentials with clasp

## Examples

### Deploy with custom options

```bash
# Dry run to see what would happen
node scripts/deploy-gas.js --dry-run

# Push code only (for testing)
node scripts/deploy-gas.js --push-only

# Deploy with all environment variables
CLASP_SCRIPT_ID="abc123" \
GAS_SHEET_ID="xyz789" \
CLASP_ACCESS_TOKEN="token" \
CLASP_REFRESH_TOKEN="refresh" \
CLASP_CLIENT_ID="client-id" \
CLASP_CLIENT_SECRET="secret" \
node scripts/deploy-gas.js
```

### Manual deployment with clasp

```bash
# Create .clasp.json manually
echo '{"scriptId":"YOUR_SCRIPT_ID","rootDir":"apps_script"}' > .clasp.json

# Login to Google
clasp login

# Push code
clasp push --force

# Create deployment
clasp deploy --description "Manual deployment"

# View deployments
clasp deployments
```

## Contributing

When adding new scripts:

1. Add to this README
2. Make executable: `chmod +x scripts/your-script.sh`
3. Add appropriate comments and documentation
4. Test in both local and CI environments
5. Update relevant documentation

## License

MIT License - See [LICENSE](../LICENSE) for details
