# Configuration Directory

This directory stores sensitive configuration that should NOT be committed to GitHub.

## Files

- **`config.example.js`** - Template for local/root deployments (SAFE to commit)
- **`config.production.example.js`** - Template for subdirectory deployments like GitHub Pages (SAFE to commit)
- **`config.local.js`** - Your actual configuration with real API keys and URLs (MUST NOT commit - listed in .gitignore)

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
