# Background Images & Theme System Fix

## Problem
Background images and the theme system were working on `localhost` but not on production (`www`). 

### Root Cause
The asset paths were hardcoded as relative paths (`assets/themes/...`) which work fine when the app is deployed at the root domain, but fail when deployed to a subdirectory (e.g., GitHub Pages at `username.github.io/Sudoku-Labs/`).

When deployed to `/Sudoku-Labs/`:
- ❌ Browser requests: `/assets/themes/ocean/classic/background.png`
- ✅ Actual location: `/Sudoku-Labs/assets/themes/ocean/classic/background.png`

## Solution
Added a configurable `BASE_PATH` setting that prepends the subdirectory path to all asset URLs.

### Changes Made

1. **Updated Configuration Files**
   - Added `BASE_PATH` field to `config/config.example.js`
   - Added `BASE_PATH` field to `config/config.local.js` (set to `''` for localhost)
   - Created `config/config.production.example.js` for subdirectory deployments

2. **Updated Asset Path Generation** ([src/constants.js](src/constants.js#L875-L880))
   ```javascript
   // Before (hardcoded relative path)
   const assetBase = `assets/themes/${visualId}/${audioId}`;
   
   // After (uses BASE_PATH from config)
   const basePath = (window.CONFIG && window.CONFIG.BASE_PATH) || '';
   const assetBase = `${basePath}/assets/themes/${visualId}/${audioId}`.replace(/^\/\//, '/');
   ```

3. **Updated Documentation**
   - Enhanced `config/README.md` with subdirectory deployment instructions
   - Added production configuration example

## Usage

### For Localhost / Root Domain Deployment
```javascript
// config/config.local.js
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/YOUR_ID/exec',
  BASE_PATH: '', // Empty for root deployment
};
```

### For Subdirectory Deployment (e.g., GitHub Pages)
```javascript
// config/config.local.js
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/YOUR_ID/exec',
  BASE_PATH: '/Sudoku-Labs', // Your subdirectory path
};
```

## Testing

1. **Localhost (Root)**: `BASE_PATH: ''`
   - ✅ Assets load from: `/assets/themes/...`
   
2. **Production (Subdirectory)**: `BASE_PATH: '/Sudoku-Labs'`
   - ✅ Assets load from: `/Sudoku-Labs/assets/themes/...`

## Files Modified
- `config/config.example.js` - Added BASE_PATH documentation
- `config/config.local.js` - Added BASE_PATH (empty for localhost)
- `config/config.production.example.js` - NEW: Production template
- `src/constants.js` - Updated `getThemeAssetSet()` to use BASE_PATH
- `config/README.md` - Added deployment instructions

## Backward Compatibility
✅ Fully backward compatible - if `BASE_PATH` is not defined, it defaults to `''` (empty string), maintaining current behavior for root deployments.
