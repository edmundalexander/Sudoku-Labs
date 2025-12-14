# Automated Deployment Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPER / AI AGENT                        │
└───────────┬─────────────────────────────────────────────────────┘
            │
            │ 1. Edit apps_script/Code.gs
            │ 2. Commit with [deploy-gas]
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                         GITHUB REPOSITORY                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    GitHub Actions Workflow                   │ │
│  │                                                              │ │
│  │  1. Checkout code                                           │ │
│  │  2. Setup Node.js & install clasp                           │ │
│  │  3. Load OAuth credentials from Secrets                     │ │
│  │  4. Run scripts/deploy-gas.js                               │ │
│  └────────────────────────┬────────────────────────────────────┘ │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            │ 5. Create .clasp.json & .clasprc.json
                            │ 6. Push code via clasp
                            │
                            ▼
         ┌──────────────────────────────────────────┐
         │     Google Apps Script (GAS)             │
         │                                          │
         │  • Receives updated Code.gs              │
         │  • Creates new deployment version        │
         │  • Web App URL remains same              │
         │  • API endpoints updated                 │
         └──────────────┬───────────────────────────┘
                        │
                        │ 7. Connects to database
                        │
                        ▼
         ┌──────────────────────────────────────────┐
         │        Google Sheets Database            │
         │                                          │
         │  • Leaderboard                           │
         │  • Chat                                  │
         │  • Logs                                  │
         │  • Users                                 │
         └──────────────────────────────────────────┘
```

## Deployment Flow

### Manual Local Deployment

```
Developer
    │
    │ npm install
    │ clasp login  ─────────► Opens browser for OAuth
    │                                │
    │                                ▼
    │                         Google OAuth Consent
    │                                │
    │ ◄──────────────────────────────┘
    │ OAuth credentials saved to ~/.clasprc.json
    │
    │ npm run deploy:gas
    │
    ▼
scripts/deploy-gas.js
    │
    ├─► Check prerequisites
    ├─► Create .clasp.json
    ├─► Create .clasprc.json
    ├─► Update SHEET_ID (optional)
    ├─► clasp push --force
    └─► clasp deploy
         │
         ▼
    Google Apps Script
         │
         └─► New deployment created
```

### Automated CI/CD Deployment

```
Developer commits with [deploy-gas]
    │
    ▼
GitHub detects trigger
    │
    ▼
GitHub Actions Workflow starts
    │
    ├─► Job: deploy-gas
    │   │
    │   ├─► Checkout code
    │   ├─► Setup Node.js
    │   ├─► Install clasp globally
    │   ├─► Load secrets as env vars:
    │   │       • CLASP_SCRIPT_ID
    │   │       • CLASP_ACCESS_TOKEN
    │   │       • CLASP_REFRESH_TOKEN
    │   │       • CLASP_CLIENT_ID
    │   │       • CLASP_CLIENT_SECRET
    │   │       • GAS_SHEET_ID (optional)
    │   │
    │   ├─► Run: npm run deploy:gas
    │   │        │
    │   │        └─► scripts/deploy-gas.js
    │   │                 │
    │   │                 ├─► Validate env vars
    │   │                 ├─► Create .clasp.json
    │   │                 ├─► Create .clasprc.json
    │   │                 ├─► Update SHEET_ID
    │   │                 ├─► clasp push --force
    │   │                 └─► clasp deploy
    │   │
    │   └─► Clean up credentials
    │
    ▼
Google Apps Script updated
    │
    └─► GitHub Actions reports success/failure
```

## File Dependencies

```
Repository Files                    Generated Files (not committed)
─────────────────                   ──────────────────────────────
.clasp.json.example  ──────copy───► .clasp.json
                                    (contains scriptId)

~/.clasprc.json      ──────read───► .clasprc.json
(from clasp login)                  (OAuth credentials)

apps_script/Code.gs  ──────push───► Google Apps Script
                                    (via clasp)

GitHub Secrets       ──────load───► Environment Variables
                                    (in CI/CD)
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    FIRST TIME SETUP                         │
└─────────────────────────────────────────────────────────────┘

Developer runs: clasp login
    │
    ▼
Browser opens Google OAuth consent page
    │
    ├─► User signs in to Google
    ├─► Grants permissions:
    │   • Access Apps Script projects
    │   • Create deployments
    │   • Access Drive files
    │
    ▼
OAuth tokens generated
    │
    ├─► Access Token  (short-lived)
    ├─► Refresh Token (long-lived)
    ├─► Client ID
    └─► Client Secret
         │
         ▼
Saved to ~/.clasprc.json
         │
         ├─► Copy to GitHub Secrets (for CI/CD)
         └─► Used by deployment scripts

┌─────────────────────────────────────────────────────────────┐
│                  SUBSEQUENT DEPLOYMENTS                     │
└─────────────────────────────────────────────────────────────┘

Deployment script runs
    │
    ├─► Read OAuth tokens from:
    │   • GitHub Secrets (CI/CD), or
    │   • Environment variables (local)
    │
    ├─► Create .clasprc.json with tokens
    │
    ├─► clasp uses .clasprc.json for auth
    │
    └─► If access token expired:
        │
        └─► clasp refreshes using refresh token
            │
            └─► Gets new access token from Google
```

## Data Flow: Making Backend Changes

```
1. Developer edits Code.gs
   │
   ▼
2. Commits with [deploy-gas] tag
   │
   ▼
3. GitHub Actions triggered
   │
   ▼
4. scripts/deploy-gas.js runs
   │
   ├─► Validates environment
   ├─► Updates SHEET_ID if needed
   └─► Calls clasp push
        │
        ▼
5. clasp pushes to Google Apps Script
   │
   ├─► Authenticates with OAuth
   ├─► Uploads Code.gs
   └─► Uploads appsscript.json
        │
        ▼
6. GAS updates backend
   │
   ├─► Existing deployment URL unchanged
   ├─► New version available
   └─► API endpoints updated
        │
        ▼
7. Frontend continues using same GAS_URL
   │
   └─► No config changes needed!
```

## Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    SECURE CREDENTIAL FLOW                  │
└────────────────────────────────────────────────────────────┘

Developer runs: clasp login
    │
    ▼
OAuth credentials → ~/.clasprc.json (local machine only)
    │
    │ NEVER COMMITTED
    │ (.gitignore blocks .clasprc.json)
    │
    ├─► For CI/CD: Copy values to GitHub Secrets
    │               (encrypted by GitHub)
    │
    └─► For local: Read from ~/.clasprc.json
                   or environment variables

During Deployment:
    │
    ├─► Credentials loaded into memory
    ├─► .clasprc.json created temporarily
    ├─► Used by clasp for auth
    ├─► Deleted after deployment
    └─► Never written to git

Repository Contents (safe to commit):
    │
    ├─► .clasp.json.example (template only)
    ├─► scripts/ (automation scripts)
    ├─► docs/ (public documentation)
    └─► package.json (no secrets)
```

## Integration Points

```
┌──────────────────────────────────────────────────────────────┐
│                    SYSTEM COMPONENTS                         │
└──────────────────────────────────────────────────────────────┘

Frontend (GitHub Pages)
    │
    │ config/config.local.js contains GAS_URL
    │
    └───► Calls GAS API endpoints
           │
           ▼
Backend (Google Apps Script)
    │
    ├─► Deployed via clasp
    ├─► Web App URL stable across updates
    └─► Connects to Google Sheets
         │
         ▼
Database (Google Sheets)
    │
    ├─► SHEET_ID in Code.gs
    ├─► Can be updated via GAS_SHEET_ID env var
    └─► Schema managed via setupSheets_()

Automation (GitHub Actions)
    │
    ├─► Triggers on [deploy-gas] commits
    ├─► Uses GitHub Secrets
    └─► Runs deployment scripts
```

## Deployment States

```
┌─────────────────────┐
│   INITIAL STATE     │
│                     │
│ • No .clasp.json    │
│ • No deployment     │
│ • Manual setup      │
└──────┬──────────────┘
       │
       │ clasp login
       │ Setup OAuth
       │
       ▼
┌─────────────────────┐
│  CONFIGURED STATE   │
│                     │
│ • Has OAuth creds   │
│ • .clasp.json setup │
│ • Can deploy        │
└──────┬──────────────┘
       │
       │ npm run deploy:gas
       │ or commit with [deploy-gas]
       │
       ▼
┌─────────────────────┐
│   DEPLOYED STATE    │
│                     │
│ • GAS updated       │
│ • Version created   │
│ • API live          │
└──────┬──────────────┘
       │
       │ Make changes
       │
       └─► Loop back to deploy
```

---

**For more details, see:**
- [AI Agent Deployment Guide](AI_AGENT_DEPLOYMENT.md)
- [OAuth Setup Guide](OAUTH_SETUP_GUIDE.md)
- [Quick Reference](AI_AGENT_QUICK_REF.md)
