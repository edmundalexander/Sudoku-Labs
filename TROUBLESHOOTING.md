# Troubleshooting Guide - Sudoku Labs

## Issue: GAS POST Requests Failing with 302 Redirect

### Problem
When the frontend tried to make POST requests to the Google Apps Script deployment, they were getting 302 "Moved Temporarily" responses instead of JSON responses. The request was being redirected to a Google Drive authentication page.

### Root Cause
Google Apps Script deployments handle HTTP requests differently depending on the request method:
- **GET requests**: Work directly with the deployed URL
- **POST requests**: Trigger a 302 redirect to an authentication handler before reaching your `doPost()` function

This is a security feature but makes traditional REST APIs (using POST) difficult to implement with public GAS deployments.

### Solution: Use GET for All Operations

**Instead of separating by REST convention** (GET for read, POST for write), we **use GET for all operations** with an `action` parameter in the URL.

#### Before (Broken):
```javascript
// Frontend - POST request fails with 302 redirect
fetch(GAS_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'action=postChat&username=User&text=Hello',
  redirect: 'follow'  // Even with redirect:follow, it still fails
});
```

#### After (Working):
```javascript
// Frontend - GET request works (no redirect issues)
const url = new URL(GAS_URL);
url.searchParams.set('action', 'postChat');
url.searchParams.set('username', 'User');
url.searchParams.set('text', 'Hello');

fetch(url.toString(), {
  method: 'GET',
  redirect: 'follow'
});
```

#### Backend Adjustment:
```javascript
function doGet(e) {
  const action = e.parameter.action;
  
  // Handle all operations via GET
  switch(action) {
    case 'saveScore':
      return makeJsonResponse(saveLeaderboardScore(e.parameter));
    case 'postChat':
      return makeJsonResponse(postChatData(e.parameter));
    case 'logError':
      return makeJsonResponse(logClientError(e.parameter));
    // ... other cases
  }
}
```

### Why This Works

1. **No authentication redirect**: GET requests to public GAS deployments reach `doGet()` directly
2. **All data in URL**: Parameters are passed via URL query string, not request body
3. **No Content-Type header**: GET requests don't require custom headers, avoiding CORS preflight
4. **Still RESTful**: Action parameter acts like URL path (e.g., `/postChat`, `/saveScore`)

### Implementation Details

**File**: `index.html` (function `runGasFn`)
- Maps all functions to GET requests
- Encodes all data as URL parameters using `URLSearchParams`
- All 6 endpoints use `method: 'GET'`

**File**: `apps_script/Code.gs` (function `doGet`)
- `saveScore` moved from `doPost` to `doGet`
- `postChat` moved from `doPost` to `doGet`
- `logError` moved from `doPost` to `doGet`
- `doPost` still exists for backward compatibility

### Testing

Verify all endpoints work:
```bash
GAS_URL="https://script.google.com/macros/s/YOUR_ID/exec"

# All these should return JSON
curl "$GAS_URL?action=ping"
curl "$GAS_URL?action=generateSudoku&difficulty=Easy"
curl "$GAS_URL?action=getLeaderboard"
curl "$GAS_URL?action=saveScore&name=User&difficulty=Medium&time=300"
curl "$GAS_URL?action=postChat&username=User&text=Hello"
curl "$GAS_URL?action=getChat"
```

### Alternative Solutions (Not Used)

1. **Use Apps Script library instead of Web App**: More complex, not necessary
2. **Add authentication to deployment**: Would require login, breaks public access
3. **Proxy through a third-party server**: Adds complexity and latency
4. **Use `google.script.run`**: Only works in Apps Script UI, not from external sites

### References

- [Google Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
- [HTTP Requests with GAS](https://developers.google.com/apps-script/guides/services/external_apis)
- REST vs GET-only APIs for constrained backends

---

## Other Common Issues

### Issue: "config.local.js not found" warning in console
**Solution**: This is expected. The file is in `.gitignore` for security. If you want the warning to go away, see `config/README.md`.

### Issue: Leaderboard shows empty or old data
**Solution**: Check Google Sheet directly to verify data is being saved. Run one test from the browser console:
```javascript
fetch(CONFIG.GAS_URL + '?action=getLeaderboard').then(r => r.json()).then(console.log);
```

### Issue: Chat not working
**Solution**: Make sure you're passing all required parameters. Test directly:
```javascript
const url = new URL(CONFIG.GAS_URL);
url.searchParams.set('action', 'postChat');
url.searchParams.set('username', 'Test');
url.searchParams.set('text', 'Hello');
fetch(url).then(r => r.json()).then(console.log);
```

### Issue: Sudoku board won't generate
**Solution**: Check that difficulty parameter is valid: `Easy`, `Medium`, `Hard`, or `Daily`
