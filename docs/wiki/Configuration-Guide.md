# Configuration Guide

This page explains how to configure Sudoku Logic Lab. For detailed configuration documentation, see [CONFIGURATION.md](https://github.com/edmund-alexander/Sudoku-Labs/blob/main/docs/CONFIGURATION.md).

## Overview

Sudoku Logic Lab uses a simple configuration system that keeps sensitive data (like API URLs) separate from the codebase.

## Configuration Files

### `config/config.example.js` (Template)

Public file showing what configuration is needed:

```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
};
```

✅ Committed to Git  
✅ Safe to share publicly  
✅ Used as template  

### `config/config.local.js` (Your Config)

Private file with your actual configuration:

```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzXXXX.../exec',
};
```

❌ NOT committed to Git (in `.gitignore`)  
❌ Contains your deployment URL  
✅ Used by the application  

## Quick Setup

### Step 1: Copy Template

```bash
cd Sudoku-Labs
cp config/config.example.js config/config.local.js
```

### Step 2: Add Your URL

Edit `config/config.local.js`:

```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/[YOUR_DEPLOYMENT_ID]/exec',
};
```

Replace `[YOUR_DEPLOYMENT_ID]` with your Google Apps Script deployment URL.

### Step 3: Verify

Check that the file is ignored by Git:

```bash
git status
# config.local.js should NOT appear in the output
```

## How It Works

### Loading Configuration

In `index.html`, the config is loaded before the app:

```html
<!-- Load configuration -->
<script src="config/config.local.js"></script>

<!-- Then load the app -->
<script type="text/babel" src="src/app.jsx"></script>
```

### Using Configuration

In your code, access via the global `CONFIG` object:

```javascript
// Check if config exists
if (typeof CONFIG !== 'undefined' && CONFIG.GAS_URL) {
  // Use the configured URL
  const response = await fetch(CONFIG.GAS_URL + '?action=ping');
} else {
  // Fallback behavior (client-only mode)
  console.warn('CONFIG not found, running in offline mode');
}
```

## Configuration Options

### GAS_URL (Required for full features)

The Google Apps Script deployment URL:

```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/DEPLOYMENT_ID/exec',
};
```

**What it does:**
- Enables leaderboard
- Enables chat
- Enables error logging
- Enables server-side puzzle generation

**Without it:**
- Client-side puzzle generation still works
- Leaderboard shows as disabled
- Chat is disabled
- Game is still playable

### Adding Custom Options

You can add more configuration options:

```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/DEPLOYMENT_ID/exec',
  
  // Custom options
  DEBUG: true,
  THEME: 'dark',
  ENABLE_HINTS: false,
  API_TIMEOUT: 5000,
};
```

Then use them in your code:

```javascript
if (CONFIG.DEBUG) {
  console.log('Debug mode enabled');
}

if (CONFIG.ENABLE_HINTS) {
  showHintButton();
}
```

## Environment-Specific Config

### Development vs Production

**Option 1: Multiple Config Files**

```javascript
// config/config.dev.js
const CONFIG = {
  GAS_URL: 'https://script.google.com/.../exec', // Dev backend
  DEBUG: true,
};

// config/config.prod.js
const CONFIG = {
  GAS_URL: 'https://script.google.com/.../exec', // Prod backend
  DEBUG: false,
};
```

Update `index.html` to load the appropriate file:

```html
<!-- Development -->
<script src="config/config.dev.js"></script>

<!-- Production -->
<script src="config/config.prod.js"></script>
```

**Option 2: Single File with Environment Detection**

```javascript
const CONFIG = {
  GAS_URL: window.location.hostname === 'localhost'
    ? 'https://script.google.com/.../dev-exec'  // Dev
    : 'https://script.google.com/.../prod-exec', // Prod
  
  DEBUG: window.location.hostname === 'localhost',
};
```

## Security Considerations

### What's Safe to Commit

✅ **Safe:**
- `config/config.example.js` (template with dummy values)
- Documentation about configuration
- Default values

❌ **Never Commit:**
- `config/config.local.js` (your actual config)
- Real API keys or tokens
- Production URLs (if you want to keep them private)

### Is the GAS URL Sensitive?

**Short answer:** Not really.

The Google Apps Script deployment URL is a public API endpoint. Anyone can call it. There's no secret authentication, by design (it's a public game).

**However:**
- Keeping it out of Git prevents automated scrapers
- Prevents accidental quota exhaustion from bots
- Gives you flexibility to change backends

### Using .gitignore

Verify `config/config.local.js` is in `.gitignore`:

```bash
# Check .gitignore
cat .gitignore | grep config.local

# Should see:
# config/config.local.js
```

### Accidentally Committed?

If you accidentally committed `config.local.js`:

1. Remove it from Git:
   ```bash
   git rm --cached config/config.local.js
   git commit -m "Remove accidentally committed config"
   git push
   ```

2. If it contained truly sensitive data, rotate your credentials:
   - Redeploy Apps Script (new URL)
   - Update your local config
   - Test the new URL

## Troubleshooting

### "CONFIG is not defined"

**Symptom:** Console error: `Uncaught ReferenceError: CONFIG is not defined`

**Cause:** `config/config.local.js` doesn't exist or isn't loaded.

**Solution:**
```bash
cp config/config.example.js config/config.local.js
```

Then edit with your URL.

### Config file not loading

**Symptom:** Application doesn't use your config.

**Causes:**
1. Wrong file path in `index.html`
2. JavaScript error in config file
3. File not saved

**Debug:**
```javascript
// In browser console
console.log(typeof CONFIG);     // Should be "object"
console.log(CONFIG);             // Should show your config
console.log(CONFIG.GAS_URL);     // Should show your URL
```

### Changes not taking effect

**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check browser console for errors
4. Verify file is saved

### "Failed to load resource" for config.local.js

**This is normal!** If `config.local.js` doesn't exist, the browser will show this error, but the app will continue to work in client-only mode.

**To remove the warning:** Create the file (even with an empty GAS_URL):

```javascript
const CONFIG = {
  GAS_URL: '', // Empty = client-only mode
};
```

## Configuration Best Practices

### Do's ✅

- Keep config files simple
- Use comments to explain options
- Test config changes locally first
- Document custom options
- Use version control for templates

### Don'ts ❌

- Don't commit sensitive data
- Don't hardcode URLs in code
- Don't use complex logic in config files
- Don't store passwords in config
- Don't share real config publicly

## Advanced Configuration

### Feature Flags

Add feature flags to control functionality:

```javascript
const CONFIG = {
  GAS_URL: '...',
  
  FEATURES: {
    hints: false,
    multiplayer: false,
    achievements: true,
    darkMode: true,
  },
};
```

Use in code:

```javascript
if (CONFIG.FEATURES.hints) {
  renderHintButton();
}
```

### API Configuration

Configure API behavior:

```javascript
const CONFIG = {
  GAS_URL: '...',
  
  API: {
    timeout: 10000,      // 10 seconds
    retries: 3,
    retryDelay: 1000,
  },
};
```

### UI Configuration

Customize UI settings:

```javascript
const CONFIG = {
  GAS_URL: '...',
  
  UI: {
    theme: 'dark',
    animations: true,
    sounds: false,
    language: 'en',
  },
};
```

## Documentation

- **[Complete Configuration Guide](https://github.com/edmund-alexander/Sudoku-Labs/blob/main/docs/CONFIGURATION.md)** - Detailed docs
- **[Backend Setup](Backend-Setup)** - Get your GAS_URL
- **[Frontend Setup](Frontend-Setup)** - Deploy with config
- **[Development Setup](Development-Setup)** - Dev environment

## Need Help?

- Check [FAQ](FAQ) for common questions
- See [Troubleshooting](Troubleshooting) for issues
- Open an [issue](https://github.com/edmund-alexander/Sudoku-Labs/issues) for bugs

---

**Configuration complete! 🎉**

Your app is now configured and ready to use.
