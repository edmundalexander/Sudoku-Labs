# Deploy to GitHub Pages

## Quick Start

Your repository is now configured for GitHub Pages deployment at:
**https://edmund-alexander.github.io/Sudoku-Labs/**

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/edmund-alexander/Sudoku-Labs
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: `main` 
   - **Folder**: `/ (root)`
4. Click **Save**

GitHub will automatically deploy your site in 1-2 minutes.

### Step 2: Create Production Config (For Production Deployment)

When you're ready to deploy to production, you'll need to create a production-specific config file:

**Option A: Use the setup script (recommended)**
```bash
./setup-production.sh
```

**Option B: Manual setup**
```bash
cp config/config.production.example.js config/config.local.js
```

Then edit `config/config.local.js` if you need different settings.

### Step 3: Commit and Push Production Config

**Important**: For GitHub Pages to work, you need to commit a config file. However, `config.local.js` is gitignored for security.

For GitHub Pages, you have two options:

**Option 1: Create a separate production config (Recommended)**
```bash
# Copy the production example to a new file that IS committed
cp config/config.production.example.js config/config.ghpages.js

# Update index.html to load this file instead
# (or keep both and have index.html try config.local.js first, then fall back to config.ghpages.js)

git add config/config.ghpages.js
git commit -m "Add GitHub Pages config"
git push origin main
```

**Option 2: Update index.html to use config.production.example.js directly**
```html
<!-- In index.html, change: -->
<script src="config/config.local.js"></script>

<!-- To: -->
<script src="config/config.local.js"></script>
<script src="config/config.production.example.js"></script>
```

This way, config.local.js loads if it exists (for local dev), and config.production.example.js loads for production.

### Step 4: Test Your Deployment

1. Wait 1-2 minutes for GitHub Pages to build
2. Visit: https://edmund-alexander.github.io/Sudoku-Labs/
3. Open Developer Tools → Console to check for errors
4. Test theme switching and verify background images load

## Troubleshooting

### Background Images Not Loading

If background images don't load:

1. **Check the config**: Make sure `BASE_PATH: '/Sudoku-Labs'` is set
2. **Check the browser console**: Look for 404 errors on asset paths
3. **Verify the assets exist**: 
   ```bash
   ls assets/themes/default/classic/
   # Should show: background.png, background.svg, etc.
   ```

### Assets Loading from Wrong Path

If you see 404 errors like `/assets/themes/...` instead of `/Sudoku-Labs/assets/themes/...`:

1. Check that `window.CONFIG.BASE_PATH` is set to `/Sudoku-Labs`
2. Clear your browser cache
3. Verify the config file is loading (check Network tab in DevTools)

## Configuration Files Explained

- **`config/config.example.js`** - Template for localhost (BASE_PATH: '')
- **`config/config.production.example.js`** - Template for GitHub Pages (BASE_PATH: '/Sudoku-Labs')
- **`config/config.local.js`** - Your local config (gitignored, for development)
- **`config/config.ghpages.js`** - Optional: committed production config

## Current Configuration

Your production config (`config/config.production.example.js`) is set to:
```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzZg11UDcIZGbwHvrtxb5E2enGspkQnjsBPbCP5Aw6BYP5Jo5cq3JqPr8PHOZgbgn2kOg/exec',
  BASE_PATH: '/Sudoku-Labs',
};
```

This is already configured for your deployment URL! 🎉

## Next Steps

After GitHub Pages is enabled and deployed:

1. Visit https://edmund-alexander.github.io/Sudoku-Labs/
2. Play a game to test functionality
3. Try switching themes to verify assets load
4. Check the leaderboard and chat features

## Need Help?

- See [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) for full deployment guide
- See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common issues
- See [THEME_FIX_SUMMARY.md](THEME_FIX_SUMMARY.md) for details on the BASE_PATH fix
