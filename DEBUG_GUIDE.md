# 🔧 Sudoku-Labs Debug Guide

This guide explains how to test and verify that all systems are working correctly.

## Quick Start

### Browser Console Debug (Recommended)

1. **Open the game in your browser**
2. **Press `F12` or `Ctrl+Shift+I` to open Developer Tools**
3. **Go to the Console tab**
4. **Run the debug command:**

```javascript
window.runDebugTests()
```

This will:
- ✅ Test backend connectivity
- ✅ Check user authentication status
- ✅ Fetch and display user profile (if logged in)
- ✅ Verify unlock state synchronization
- ✅ Check local storage functionality
- ✅ Display formatted results table

### Expected Output

If everything is working correctly, you'll see:

```
✅ Backend Ping
✅ User Session
✅ User Profile Retrieved:
   Total Games: X
   Total Wins: Y
   Easy Wins: A
   Medium Wins: B
   Hard Wins: C
   Perfect Wins: D
   Fast Wins: E
   Win Rate: Z%
✅ User State Fetched
✅ Local Storage Check

📊 DEBUG TEST SUMMARY
✅ Passed: 5 tests
❌ Failed: 0 tests
```

## Testing Scenarios

### Scenario 1: Profile Stats Not Updating

**Test Steps:**
1. Log in to the game
2. Open browser console
3. Run `window.runDebugTests()`
4. Note the current stats (Total Games, Total Wins)
5. Play a game and win
6. Run `window.runDebugTests()` again
7. Stats should have incremented

**Expected Result:**
- Total Games increases by 1
- Total Wins increases by 1
- Relevant difficulty win count increases (EasyWins, MediumWins, HardWins)

**If failing:**
- Check backend is deployed and GAS_URL is correct
- Verify Google Sheet has proper columns (EasyWins, MediumWins, etc.)
- Check browser console for API errors

### Scenario 2: Awards Not Unlocking

**Test Steps:**
1. Log in and play games to reach an unlock threshold
   - Ocean theme: 5 total wins
   - Forest theme: 10 total wins
   - Sunset theme: 1 Hard win
   - Midnight theme: 1 Perfect win (0 mistakes)
   - Sakura theme: 3 Easy wins
   - Volcano theme: 3 Medium wins
   - Arctic theme: 1 Fast win (< 3 minutes)
2. Win enough games to meet a criteria
3. Click on Awards button
4. New theme should appear unlocked

**Expected Result:**
- Newly unlocked themes show without lock icon
- Can select the newly unlocked theme
- Theme applies when selected

**If failing:**
- Manually edit database: Set TotalWins to 5 in Users sheet
- Open Awards panel - should show Ocean theme as unlocked
- Check browser console for unlock check errors

### Scenario 3: Manual Database Edit Testing

**Test Steps:**
1. Open your Google Sheet
2. Go to Users sheet
3. Edit a user row - increase TotalWins to 5
4. In game, open Awards
5. Ocean theme should show as unlocked

**Expected Result:**
- Stats sync from backend when Awards opens
- Unlock checks run
- New unlocks appear immediately in Awards panel

**If failing:**
- Run `window.runDebugTests()` - check if getUserState returns correct stats
- Verify your GAS_URL is set correctly in config/config.local.js
- Check that backend deployment has "Anyone" access enabled

## Manual API Testing

If you need to test endpoints directly:

### Using curl (Command Line)

```bash
# Replace YOUR_GAS_URL with your actual deployment URL
GAS_URL="https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/useweb"

# Test 1: Ping backend
curl "$GAS_URL?action=ping"

# Test 2: Generate sudoku
curl "$GAS_URL?action=generateSudoku&difficulty=Easy"

# Test 3: Get leaderboard
curl "$GAS_URL?action=getLeaderboard"

# Test 4: Get chat (if implemented)
curl "$GAS_URL?action=getChat"
```

### Using Browser Network Tab

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Play a game or interact with the app
4. Look for requests to your GAS_URL
5. Click each request to see:
   - Request parameters
   - Response data
   - Status code (should be 200)

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Backend connection failed" | GAS_URL not configured | Check config/config.local.js has correct GAS_URL |
| Profile shows 0 stats | Backend not updating stats | Run game, check database was updated, run debugTests |
| Awards won't unlock | Unlock checks didn't run | Open Awards panel (triggers sync), check console |
| Games not saving | Backend deployment issue | Verify GAS deployed with "Anyone" access |
| Different stats on refresh | Local storage vs backend mismatch | Close and reopen browser, let it sync |

## Key Data Flow

1. **Game Win:**
   ```
   Game Complete → calculateStats → localStorage → backend API
   ```

2. **Profile Update:**
   ```
   getUserProfile() → Backend → Display in UserPanel
   ```

3. **Award Unlock:**
   ```
   Win Game → Check Criteria → Save to localStorage → 
   Open Awards → Sync from backend → Re-check Criteria → Unlock
   ```

4. **Stats Sync (Awards Panel):**
   ```
   Click Awards → getUserState() → Check for new unlocks → 
   Update unlockedThemes/unlockedSoundPacks → Display
   ```

## Debugging Tips

### Check Local Storage

```javascript
// In browser console:

// View all game stats
StorageService.getGameStats()

// View unlocked themes
StorageService.getUnlockedThemes()

// View unlocked sound packs
StorageService.getUnlockedSoundPacks()

// View user session
StorageService.getUserSession()
```

### Monitor API Calls

```javascript
// In browser console:

// See last API response
window.lastResponse

// Log all API calls
const original = runGasFn;
window.runGasFn = async function(fn, payload) {
  console.log('API Call:', fn, payload);
  const result = await original(fn, payload);
  window.lastResponse = result;
  console.log('API Response:', result);
  return result;
};
```

### Simulate Game Win

```javascript
// In browser console:
// This doesn't actually complete a game, but shows how stats work:

const stats = StorageService.getGameStats();
stats.totalWins++;
stats.easyWins++;
StorageService.saveGameStats(stats);
console.log('Stats updated:', stats);
```

## Backend Troubleshooting

### Check Apps Script Logs

1. Open your Google Apps Script project
2. Click **Execution log** (or View → Execution log)
3. Look for error messages or `Logger.log()` outputs
4. Common issues:
   - `Users sheet not found` → Run setupSheets_() in Apps Script editor
   - `User not found` → Check userId format
   - `Failed to update profile` → Check column headers match Users sheet

### Verify Sheet Structure

Run this in Apps Script editor:

```javascript
// Execute: setupSheets_()
// This ensures all required columns exist
setupSheets_()
```

## Performance Notes

- Debug tests take ~2-3 seconds (API calls involved)
- Award unlock checks happen on every Awards panel open
- Profile syncs happen when:
  - Game is won
  - Awards panel opens
  - User logs in
  - Manual refresh triggered

## Next Steps

After verifying everything works:

1. ✅ Test with multiple user accounts
2. ✅ Verify stats carry over across devices
3. ✅ Check unlock progression feels natural
4. ✅ Monitor performance on slow connections
5. ✅ Set up recurring backup of Google Sheet

---

**Need help?** Check the console output of `window.runDebugTests()` - it will tell you exactly what's failing!
