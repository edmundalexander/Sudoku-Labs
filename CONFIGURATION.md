# Configuration System

## Overview

The frontend uses a secure configuration system to store the GAS deployment URL without committing sensitive data to GitHub.

## Files

### `config/config.example.js` (Public - Committed)
Template file showing what configuration is needed:

```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
};
```

### `config/config.local.js` (Private - Not Committed)
Your actual configuration. Listed in `.gitignore` so it's never pushed to GitHub:

```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzZg11UDcIZGbwHvrtxb5E2enGspkQnjsBPbCP5Aw6BYP5Jo5cq3JqPr8PHOZgbgn2kOg/exec',
};
```

## How It Works

1. **Frontend loads config** (`index.html` line ~131):
   ```html
   <script src="config/config.local.js"></script>
   ```

2. **Frontend uses it** (`index.html` line ~263):
   ```javascript
   const GAS_URL = (typeof CONFIG !== 'undefined' && CONFIG.GAS_URL) ? CONFIG.GAS_URL : '';
   ```

3. **If missing, app continues** with empty GAS_URL (shows error in console, but doesn't crash)

## Setup Instructions

### For Development
1. Copy `config/config.example.js` to `config/config.local.js`
2. Update `config/config.local.js` with your actual GAS URL
3. Never commit `config/config.local.js`

### For Deployment
Your `config/config.local.js` stays private locally:
- ✅ Not in GitHub (`.gitignore`)
- ✅ Not in GitHub Pages (only index.html is deployed)
- ✅ Only needed locally when testing via GitHub Pages

## Why This System

✅ **Security** - Private keys/URLs stay off GitHub
✅ **Simplicity** - No build step needed
✅ **Flexibility** - Easy to swap endpoints for testing
✅ **Scalability** - Add more config values as needed

## Adding More Configuration

To add more settings:

1. Update `config/config.example.js`:
   ```javascript
   const CONFIG = {
     GAS_URL: 'https://...',
     FEATURE_FLAG: true,
   };
   ```

2. Update `config/config.local.js` with actual values

3. Use in code:
   ```javascript
   if (CONFIG.FEATURE_FLAG) { /* ... */ }
   ```

See `config/README.md` for more details.
