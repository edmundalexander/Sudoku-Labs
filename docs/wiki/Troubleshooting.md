# Troubleshooting Guide

Common issues and their solutions. For detailed troubleshooting information, see [TROUBLESHOOTING.md](https://github.com/edmund-alexander/Sudoku-Labs/blob/main/docs/TROUBLESHOOTING.md).

## Quick Fixes

### Game Won't Load

**Try these first:**
1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Try incognito/private mode
4. Check browser console (F12) for errors
5. Try a different browser

### Leaderboard Not Working

**Check:**
- [ ] Backend is deployed (see [Backend Setup](Backend-Setup))
- [ ] `config/config.local.js` exists with correct GAS_URL
- [ ] GAS deployment has "Anyone" access
- [ ] Browser console for error messages

### Chat Not Working

**Check:**
- [ ] Backend is configured
- [ ] Network connection is stable
- [ ] No CORS errors in console
- [ ] Chat feature not disabled in settings

## Common Issues

### Issue: "CONFIG is not defined"

**Error:** Console shows `Uncaught ReferenceError: CONFIG is not defined`

**Cause:** Configuration file is missing.

**Solution:**
```bash
cp config/config.example.js config/config.local.js
# Edit config.local.js with your GAS URL (or leave empty for client-only mode)
```

---

### Issue: 302 Redirect or HTML Response from API

**Symptom:** API requests return HTML instead of JSON, or 302 redirect.

**Cause:** Google Apps Script deployment not set to "Anyone" access.

**Solution:**
1. Open your Apps Script project
2. Click **Deploy** → **Manage deployments**
3. Click edit icon (✏️) on your deployment
4. Change "Who has access" to **Anyone**
5. Click **Update**
6. Test again

See [detailed explanation](https://github.com/edmund-alexander/Sudoku-Labs/blob/main/docs/TROUBLESHOOTING.md#issue-gas-post-requests-failing-with-302-redirect).

---

### Issue: CORS Errors

**Error:** `Access to fetch has been blocked by CORS policy`

**Causes:**
1. Backend not deployed correctly
2. Deployment access restrictions
3. Incorrect URL

**Solutions:**
1. Ensure GAS deployment has "Anyone" access
2. Verify deployment URL is correct
3. Check browser console for exact error
4. Test with curl: `curl "$GAS_URL?action=ping"`

---

### Issue: Blank Page

**Symptom:** Page loads but shows nothing.

**Causes:**
1. JavaScript error breaking rendering
2. Missing dependencies (React, Babel)
3. Network issues loading CDN resources

**Solutions:**
1. Open browser console (F12) - check for errors
2. Verify internet connection
3. Try disabling browser extensions
4. Check if CDN URLs are accessible:
   - React: `https://unpkg.com/react@18/umd/react.production.min.js`
   - Babel: `https://unpkg.com/@babel/standalone/babel.min.js`
   - Tailwind: `https://cdn.tailwindcss.com`

---

### Issue: Puzzle Won't Generate

**Symptom:** Clicking "New Game" doesn't generate a puzzle.

**Causes:**
1. JavaScript error in generation code
2. Backend unavailable (if using server-side generation)
3. Browser compatibility issue

**Solutions:**
1. Check browser console for errors
2. Try a different difficulty
3. Refresh the page
4. Check if backend is reachable (if using it)
5. Test with curl: `curl "$GAS_URL?action=generateSudoku&difficulty=Easy"`

---

### Issue: Timer Not Working

**Symptom:** Timer doesn't start, update, or stop.

**Causes:**
1. JavaScript error
2. Browser tab suspended
3. React state issue

**Solutions:**
1. Refresh the page
2. Check browser console
3. Keep tab active (some browsers pause timers in background tabs)
4. Try a different browser

---

### Issue: Can't Submit Score

**Symptom:** Score submission fails or doesn't appear on leaderboard.

**Causes:**
1. Backend not configured
2. Invalid name (too long, special characters)
3. Network error
4. Google Sheets quota exceeded

**Solutions:**
1. Check name is 1-50 characters, alphanumeric + spaces
2. Check browser console for errors
3. Verify backend is working: `curl "$GAS_URL?action=ping"`
4. Check Google Sheets isn't full (10,000 row limit)

---

### Issue: Changes Not Appearing After Push

**Symptom:** Pushed changes to GitHub but site hasn't updated.

**Solutions:**
1. Wait 2-3 minutes for GitHub Pages to rebuild
2. Check repository Actions tab for build status
3. Hard refresh browser: Ctrl+Shift+R
4. Clear browser cache
5. Try incognito mode
6. Check correct branch is set in Pages settings

---

### Issue: Config File Not Loading

**Symptom:** Warning about config.local.js not found, even though file exists.

**Solutions:**
1. Verify file path: `config/config.local.js` (not `config.local.js` in root)
2. Check file is valid JavaScript (no syntax errors)
3. Ensure filename exactly matches (case-sensitive)
4. Hard refresh browser
5. Check browser console for specific error

---

### Issue: Slow Performance

**Causes:**
1. Too many browser tabs open
2. Browser extensions interfering
3. Weak internet connection
4. Old browser version

**Solutions:**
1. Close unused tabs
2. Disable browser extensions
3. Update browser to latest version
4. Try a different browser
5. Check internet speed

---

### Issue: Mobile Display Problems

**Symptoms:**
- Layout broken on mobile
- Buttons too small
- Text unreadable

**Solutions:**
1. Ensure viewport meta tag in index.html:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```
2. Test in mobile browser (not just resized desktop browser)
3. Check browser console on mobile (use remote debugging)
4. Clear mobile browser cache

---

### Issue: Chat Messages Not Appearing

**Causes:**
1. Backend not polling
2. Network delays
3. Chat sheet full
4. Incorrect message format

**Solutions:**
1. Refresh the page
2. Check backend logs in Apps Script
3. Test manually: `curl "$GAS_URL?action=getChat"`
4. Verify Chat sheet in Google Sheets has data
5. Check browser console for errors

## Debugging Techniques

### Browser Console

Open with F12 (Windows/Linux) or Cmd+Option+I (Mac):

**Check for errors:**
```javascript
// Look for red error messages
// Note the file and line number
```

**Test configuration:**
```javascript
console.log(CONFIG);
console.log(CONFIG.GAS_URL);
```

**Test API connectivity:**
```javascript
fetch(CONFIG.GAS_URL + '?action=ping')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Network Tab

Open DevTools → Network:
1. Clear network log
2. Trigger the action (e.g., load leaderboard)
3. Look for failed requests (red)
4. Click request to see:
   - Request URL
   - Status code
   - Response data
   - Timing

### React DevTools

Install React DevTools extension:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Firefox](https://addons.mozilla.org/firefox/addon/react-devtools/)

Use to inspect:
- Component tree
- Props and state
- Component renders

### Diagnostic Script

Use the included diagnostic script:

```bash
export GAS_URL="https://script.google.com/macros/s/YOUR_ID/exec"
./diagnostic.sh
```

This tests all API endpoints.

## Backend Issues

### Apps Script Errors

**Where to look:**
1. Apps Script editor → **Execution log** (bottom)
2. Apps Script editor → **View** → **Logs**
3. Apps Script editor → **Executions** (left sidebar)

**Common errors:**

**"Exception: The parameters don't match"**
- Wrong function signature
- Check function names match between frontend and backend

**"You do not have permission to call SpreadsheetApp.openById"**
- Sheet ID is wrong
- Script doesn't have permission
- Re-run authorization

**"Service invoked too many times"**
- Hit quota limits
- Wait until quota resets (daily)
- Optimize to reduce API calls

### Sheet Access Issues

**Can't access sheet:**
1. Verify Sheet ID in `Code.gs` is correct
2. Ensure account deploying script has access to sheet
3. Check "Execute as: Me" in deployment settings
4. Run authorization flow again

### Deployment Issues

**Deployment fails:**
1. Check for syntax errors in Code.gs
2. Ensure all functions are defined
3. Try deploying as new deployment (not update)
4. Check Apps Script console for errors

**Wrong deployment URL:**
1. Get URL from Deploy → Manage Deployments
2. Copy the full URL including `/exec` at the end
3. Update `config/config.local.js`
4. Test with curl

## Frontend Issues

### React Not Loading

**Check:**
1. React CDN URL is correct
2. No ad blocker blocking CDN
3. Internet connection working
4. Browser console for specific error

### Babel Compilation Errors

**Symptoms:** Page loads but React doesn't render

**Check:**
1. JSX syntax is valid in `src/app.jsx`
2. Babel CDN loaded correctly
3. Script has `type="text/babel"` attribute
4. No JavaScript errors in console

### Styling Issues

**Tailwind not working:**
1. Check Tailwind CDN loaded
2. Verify class names are correct
3. Check browser console for errors
4. Hard refresh to clear cache

## Getting More Help

If these solutions don't work:

1. **Check existing issues:** [GitHub Issues](https://github.com/edmund-alexander/Sudoku-Labs/issues)
2. **Open a new issue:** Include:
   - Description of problem
   - Steps to reproduce
   - Browser and OS
   - Console errors
   - Network tab screenshots
3. **Ask in discussions:** [GitHub Discussions](https://github.com/edmund-alexander/Sudoku-Labs/discussions)
4. **Read detailed docs:** [Full Troubleshooting Guide](https://github.com/edmund-alexander/Sudoku-Labs/blob/main/docs/TROUBLESHOOTING.md)

## Related Documentation

- [Backend Setup](Backend-Setup) - Initial backend configuration
- [Frontend Setup](Frontend-Setup) - Frontend deployment
- [Configuration Guide](Configuration-Guide) - Config file help
- [API Reference](API-Reference) - API endpoint details
- [FAQ](FAQ) - Common questions

---

**Still stuck?** [Open an issue](https://github.com/edmund-alexander/Sudoku-Labs/issues/new) with details!
