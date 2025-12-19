# Configuration Directory

This directory stores sensitive configuration that should NOT be committed to GitHub.

## Configuration Files

### 1. Main Application Config (`config.local.js`)
Controls the connection to the backend API.

- **Template**: `config.example.js`
- **Local File**: `config.local.js` (Gitignored)
- **Key Settings**:
  - `GAS_URL`: The URL of your Google Apps Script Web App.
  - `BASE_PATH`: Subdirectory path (e.g., `/Sudoku-Labs`) for GitHub Pages.

### 2. Admin & Maintenance Config (`admin.local.js`)
Controls administrative access and automated maintenance tasks.

- **Template**: `admin.example.js`
- **Local File**: `admin.local.js` (Gitignored)
- **Key Settings**:
  - `SESSION_TIMEOUT`: Duration of admin console sessions (default: 30 mins).
  - `ADMIN_TRIGGER_TOKEN`: Secret token for **Maintenance Automation** (bots/scripts).

---

## Authentication Systems

We use two separate authentication systems for different purposes:

### A. Admin Console Login (Human Access)
Used by humans to access the UI-based Admin Console in the browser.

- **Usage**: `sudokuAdmin.login()` in browser console.
- **Credentials**: Username & Password.
- **Storage**:
  - **Backend**: Stored in GAS **Script Properties** as `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH`.
  - **Frontend**: Passwords are hashed locally before sending.
- **Setup**: See [docs/ADMIN_CONSOLE.md](../docs/ADMIN_CONSOLE.md).

### B. Maintenance Automation (Bot Access)
Used by automated scripts (e.g., GitHub Actions, cron jobs) to trigger maintenance tasks.

- **Usage**: Server-to-server HTTP requests.
- **Credentials**: Bearer Token (`ADMIN_TRIGGER_TOKEN`).
- **Storage**:
  - **Backend**: Stored in GAS **Script Properties** as `ADMIN_TRIGGER_TOKEN`.
  - **Local**: Stored in `config/admin.local.js` for local scripts to use.
- **Example**: `curl "$GAS_URL?action=performMaintenance&token=$ADMIN_TRIGGER_TOKEN"`

---

## Setup Instructions

### For Developers

1. **First time setup:**
   ```bash
   cp config/config.example.js config/config.local.js
   ```

2. **Fill in your values in `config.local.js`:**
   ```javascript
   const CONFIG = {
     GAS_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
     BASE_PATH: '', // Empty for localhost or root domain
   };
   ```

3. **Verify it's ignored:**
   ```bash
   git status  # config.local.js should NOT appear in output
   ```

### For Production Deployment (Subdirectory)

If deploying to a subdirectory (e.g., GitHub Pages at `username.github.io/Sudoku-Labs`):

1. **Use the production template:**
   ```bash
   cp config/config.production.example.js config/config.local.js
   ```

2. **Update `config.local.js` with your subdirectory:**
   ```javascript
   const CONFIG = {
     GAS_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
     BASE_PATH: '/Sudoku-Labs', // Your subdirectory name
   };
   ```

3. **This fixes asset paths for themes and backgrounds**
   - Without `BASE_PATH`: `/public/assets/themes/...` → ❌ Broken on subdirectory deployments
   - With `BASE_PATH`: `/Sudoku-Labs/public/assets/themes/...` → ✅ Works everywhere

### For End Users / Root Domain Deployment

1. Copy `config.example.js` to `config.local.js`
2. Update `GAS_URL` with your Google Apps Script deployment URL
3. Leave `BASE_PATH` empty (`''`) for root domain deployments
4. The frontend will automatically load your configuration at runtime

## Security Notes

- ✅ `config.local.js` is in `.gitignore` - it will never be committed
- ✅ `config.example.js` is public - it shows what to configure but has dummy values
- ✅ GitHub never sees your real deployment URLs or API keys
- ⚠️ Always double-check your `.gitignore` before pushing sensitive data

## How the Frontend Uses It

The `index.html` file loads `config.local.js` before initializing the game:

```html
<!-- Load configuration (local values, not exposed publicly) -->
<script src="config/config.local.js"></script>

<!-- Then the app loads and uses window.CONFIG.GAS_URL -->
```

If `config.local.js` doesn't exist or `GAS_URL` is not set, the app will run in developer mode and use a local puzzle generator and `localStorage` for persistence. To enable full cloud functionality (leaderboard, chat, logs), create `config/config.local.js` with a valid `GAS_URL` as shown in `config/config.example.js`.

## Adding More Configuration

To add more settings:

1. Add the key to both `config.example.js` (with dummy value) and `config.local.js` (with real value)
2. Reference it in your code as `window.CONFIG.MY_KEY` or `CONFIG.MY_KEY`
3. Remember: Only config.local.js needs updating for deployment - config.example.js is just documentation
