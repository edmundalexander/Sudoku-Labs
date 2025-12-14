# Configuration Directory

This directory stores sensitive configuration that should NOT be committed to GitHub.

## Files

- **`config.example.js`** - Template showing available configuration options (SAFE to commit)
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
   };
   ```

3. **Verify it's ignored:**
   ```bash
   git status  # config.local.js should NOT appear in output
   ```

### For End Users / Deployment

1. Copy `config.example.js` to `config.local.js`
2. Update `GAS_URL` with your Google Apps Script deployment URL
3. The frontend will automatically load your configuration at runtime

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

If `config.local.js` doesn't exist, the app falls back to a hardcoded default in index.html.

## Adding More Configuration

To add more settings:

1. Add the key to both `config.example.js` (with dummy value) and `config.local.js` (with real value)
2. Reference it in your code as `window.CONFIG.MY_KEY` or `CONFIG.MY_KEY`
3. Remember: Only config.local.js needs updating for deployment - config.example.js is just documentation
