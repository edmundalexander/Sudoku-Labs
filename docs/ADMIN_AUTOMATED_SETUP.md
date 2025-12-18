# Automated Admin Console Setup

## Overview

We now offer **two setup methods** for the admin console:

### 1. 🚀 Fully Automated Setup (Recommended)
**Script**: `bash scripts/setup-admin-full.sh`

Automates EVERYTHING including Google Apps Script deployment:
- ✅ Frontend configuration
- ✅ Google authentication
- ✅ Code deployment to GAS
- ✅ Script Properties setup
- ✅ Database initialization
- ✅ One-command setup!

### 2. ⚙️ Manual Setup
**Script**: `bash scripts/setup-admin.sh`

Traditional setup requiring manual GAS configuration:
- ✅ Frontend configuration only
- ⚠️ Manual GAS code copying
- ⚠️ Manual property setup
- ⚠️ Manual deployment

---

## Automated Setup (Recommended)

### Prerequisites

1. **Node.js and npm** installed
2. **Google account** with access to create/edit Apps Script projects
3. **Existing Google Apps Script project** with a Google Sheet
   - Or create one at: https://script.google.com

### Step-by-Step

#### 1. Run the Setup Script

```bash
cd /path/to/Sudoku-Labs
bash scripts/setup-admin-full.sh
```

#### 2. Follow the Prompts

The script will:

**a) Install clasp (if needed)**
- Google's official Apps Script CLI
- Installs globally via npm
- One-time installation

**b) Authenticate with Google**
- Opens browser for OAuth (local environment)
- Or provides URL + code flow (remote environments like Codespaces)
- One-time authentication
- Credentials stored securely locally
- **Codespaces/Gitpod**: Automatically uses manual auth flow

**c) Configure Your Project**
- Enter your GAS Script ID
  - Find it: Project Settings → Script ID
  - Or create new project at script.google.com

**d) Set Admin Credentials**
- Enter username
- Enter password (hashed with SHA-256)
- Creates `config/admin.local.js` (gitignored)

**e) Deploy Everything**
- Pushes Code.gs to your GAS project
- Sets Script Properties automatically
- Runs setupSheets_() to init database
- Prepares web app deployment

#### 3. Complete Web App Deployment (One Manual Step)

Due to Google's API limitations, you need to manually complete the deployment:

1. Open your GAS project in browser
2. Click **Deploy → New Deployment** (or Manage Deployments)
3. Settings:
   - Type: **Web App**
   - Execute as: **Your email**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Copy the deployment URL
6. Update `config/config.local.js` with the URL

#### 4. Test!

```javascript
// In browser console (F12)
sudokuAdmin.login()   // Enter your credentials
sudokuAdmin.open()    // Admin panel appears!
```

---

## What Gets Automated?

### ✅ Fully Automated
- Frontend configuration (admin.local.js)
- Google authentication (OAuth)
- Code deployment to GAS
- Script Properties (ADMIN_USERNAME, ADMIN_PASSWORD_HASH)
- Database initialization (setupSheets_)
- Most of web app deployment

### ⚠️ Requires Manual Step
- Final web app deployment click (Google API limitation)
- Copying deployment URL to config

---

## How It Works

### Technologies Used

**clasp** - Google Apps Script CLI
- Official Google tool
- Manages GAS projects from terminal
- Handles authentication, code push, function execution
- Install: `npm install -g @google/clasp`
- Docs: https://github.com/google/clasp

### Authentication Flow

1. **First Time**: `clasp login`
   - Opens browser
   - Google OAuth consent screen
   - Grants permissions
   - Saves credentials locally (~/.clasprc.json)

2. **Subsequent Runs**: Automatic
   - Uses saved credentials
   - No re-authentication needed

### What the Script Does

```
setup-admin-full.sh
├─ Check for clasp (install if needed)
├─ Authenticate with Google (if needed)
├─ Configure GAS project (.clasp.json)
├─ Generate admin credentials
│  ├─ Prompt for username/password
│  ├─ Generate SHA-256 hash
│  └─ Create admin.local.js
├─ Deploy code to GAS
│  ├─ Push Code.gs
│  └─ Push all backend files
├─ Set Script Properties
│  ├─ Create temporary setter function
│  ├─ Execute via clasp run
│  └─ Clean up
├─ Initialize database
│  └─ Execute setupSheets_()
└─ Display deployment instructions
```

---

## Troubleshooting

### "clasp: command not found"

**Solution**: Install clasp globally
```bash
npm install -g @google/clasp
```

### "Apps Script API has not been used"

**Solution**: Enable the API
1. Visit: https://script.google.com/home/usersettings
2. Toggle on: "Google Apps Script API"
3. Run script again

### "Unauthorized" or "Permission denied"

**Solution**: Re-authenticate
```bash
clasp logout
clasp login
```

Then run setup script again.

### "Browser won't open" or "Running in GitHub Codespaces"

**Solution**: The script automatically detects remote environments and uses manual auth flow

If you need to force manual auth:
```bash
clasp login --no-localhost
```

This will:
1. Display a URL
2. You copy and open it in your browser
3. Authorize and get a code
4. Paste the code back in terminal

**For Codespaces users**: The script handles this automatically!

### "No credentials found" after successful login

### "Could not find script ID"

**Solution**: Get your Script ID
1. Open your GAS project
2. Click ⚙️ Project Settings
3. Copy "Script ID"
4. Provide when prompted

### "Script Properties not set"

**Solution**: Set manually
1. Open GAS project
2. File → Project Properties → Script Properties
3. Add:
   - Key: `ADMIN_USERNAME` / Value: your username
   - Key: `ADMIN_PASSWORD_HASH` / Value: your hash
4. Hash is displayed in script output

### Deployment URL Not Working

**Solution**: Verify deployment
1. GAS project → Deploy → Manage Deployments
2. Should show active "Web App" deployment
3. Copy the URL (looks like: https://script.google.com/...)
4. Update `config/config.local.js`:
   ```javascript
   window.CONFIG = {
     GAS_URL: 'your-deployment-url-here'
   };
   ```

---

## Manual Setup Alternative

If automated setup doesn't work for your environment, use the manual method:

```bash
bash scripts/setup-admin.sh
```

Then follow instructions in `docs/ADMIN_QUICKSTART.md`

---

## Security Notes

### What Gets Stored Locally

**~/.clasprc.json** (Google OAuth)
- Credentials for clasp
- Stored by Google's tool
- Secure, encrypted
- Never committed to git

**config/admin.local.js** (Admin credentials)
- Username and password hash
- Gitignored
- Local only

**.clasp.json** (Project config)
- Script ID only
- Gitignored
- No sensitive data

### Best Practices

1. **Use strong passwords** (12+ characters)
2. **Never commit** admin.local.js or .clasp.json
3. **Logout when done**: `sudokuAdmin.logout()`
4. **Regularly rotate** admin passwords
5. **Monitor** admin actions

---

## Comparison: Automated vs Manual

| Feature | Automated | Manual |
|---------|-----------|--------|
| Setup Time | ~5 minutes | ~15 minutes |
| Technical Skill | Beginner | Intermediate |
| Google Auth Required | Yes (OAuth) | No |
| Code Deployment | Automatic | Manual copy/paste |
| Property Setup | Automatic | Manual entry |
| Database Init | Automatic | Manual run |
| Error Prone | Low | Medium |
| Repeatable | Yes | Moderate |

---

## FAQ

### Q: Is Google authentication safe?
**A**: Yes! It uses official Google OAuth. Your credentials are never exposed to our scripts.

### Q: Can I use this in CI/CD?
**A**: Yes, but you'll need to handle authentication tokens securely. See clasp docs for CI/CD setup.

### Q: Does this work on Windows?
**A**: Yes, but you need bash (Git Bash, WSL, or similar).

### Q: Does this work in GitHub Codespaces or Gitpod?
**A**: Yes! The script automatically detects remote environments and uses the manual auth flow (`clasp login --no-localhost`). You'll copy a URL, authorize in your browser, and paste the code back.

### Q: What if I don't have Node.js?
**A**: Use the manual setup: `bash scripts/setup-admin.sh`

### Q: Can I automate multiple projects?
**A**: Yes! Just run with different Script IDs.

### Q: Is this secure for production?
**A**: Yes, but follow security best practices:
- Use strong passwords
- Enable 2FA on Google account
- Restrict GAS deployment access
- Monitor logs

---

## Advanced: Custom Configuration

### Environment Variables

You can preset values with environment variables:

```bash
export GAS_SCRIPT_ID="your-script-id"
export ADMIN_USERNAME="admin"
export ADMIN_PASSWORD="your-password"

bash scripts/setup-admin-full.sh
```

### Headless Mode (Future)

Coming soon: Fully headless setup for CI/CD environments.

---

## Getting Help

- 📚 **Full Documentation**: `docs/ADMIN_CONSOLE.md`
- 🚀 **Quick Start**: `docs/ADMIN_QUICKSTART.md`
- 🐛 **Issues**: Check script output for specific errors
- 💬 **Questions**: Refer to troubleshooting section above

---

**Remember**: The automated script makes setup much easier, but you can always fall back to manual setup if needed! 🎉
