# GAS Connection Testing Guide

This directory contains tools to test the Google Apps Script (GAS) backend connection for Sudoku Labs.

## Overview

The Sudoku Labs application uses Google Apps Script as a backend API that stores data in Google Sheets. This guide helps you verify that the connection is working correctly by deploying a test log entry to the database.

## Test Tools

### 1. `test-gas-connection.sh` (Shell Script)

**Best for:** Automated testing, CI/CD pipelines, command-line users

**Requirements:**
- Bash shell
- `curl` command
- `jq` command (for JSON processing)
- Internet access to script.google.com

**Usage:**
```bash
./test-gas-connection.sh
```

**What it does:**
1. Pings the GAS endpoint to verify it's reachable
2. Sends a test log entry with a timestamp
3. Verifies the response from the server
4. Reports success or failure

**Expected Output:**
```
==========================================
SUDOKU-LABS GAS CONNECTION TEST
==========================================

Testing GAS endpoint: https://script.google.com/macros/s/.../exec

Test 1: Ping endpoint
=====================
Sending ping request...
Response: {"ok":true,"timestamp":"2024-..."}
✓ Ping successful!

Test 2: Deploy test log entry
==============================
Sending test log entry...
  Type: test
  Message: GAS connection test - 2024-...
  UserAgent: test-gas-connection.sh/1.0

Response: {"logged":true}
✓ Test log successfully deployed to Google Sheets!

SUCCESS: GAS connection is working!
Check the 'Logs' sheet in your Google Sheets database to verify the entry.
```

### 2. `test-gas-connection.html` (Web Interface)

**Best for:** Manual testing, developers, visual verification

**Requirements:**
- Modern web browser
- Internet access

**Usage:**
1. Open `test-gas-connection.html` in your web browser
2. Click the "Run Connection Test" button
3. Wait for the test to complete
4. Check the results displayed on the page

**Features:**
- Visual status indicators (pending/success/error)
- Detailed error messages with troubleshooting steps
- JSON response preview
- Works with `config/config.local.js` for custom GAS URLs

**Screenshot:**
The test interface shows:
- Test status indicator (gray → orange → green/red)
- One-click test button
- Detailed results with JSON response
- Troubleshooting guidance

## Verifying Test Results

After running either test tool, you should:

1. **Open your Google Sheets database**
   - The Sheet ID is defined in `apps_script/Code.gs` as `SHEET_ID`
   - URL format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

2. **Navigate to the "Logs" tab**
   - This sheet should exist (created by `setupSheets_()` function)

3. **Look for the test entry**
   - **Timestamp:** Recent date/time (when you ran the test)
   - **Type:** "test"
   - **Message:** "GAS connection test - [timestamp]"
   - **UserAgent:** "test-gas-connection.sh/1.0" or your browser's user agent
   - **Count:** 1

Example log entry:
```
Timestamp               | Type  | Message                              | UserAgent                  | Count
2024-12-15T00:03:44Z   | test  | GAS connection test - 2024-12-15...  | test-gas-connection.sh/1.0 | 1
```

## Troubleshooting

### Test fails with "Could not resolve host"
- **Cause:** No internet access or DNS issues
- **Solution:** 
  - Check your internet connection
  - Try from a different network
  - Use the HTML test tool in a browser instead

### Test fails with "302 Redirect" or HTML response
- **Cause:** GAS deployment access is not set to "Anyone"
- **Solution:**
  1. Open your Apps Script project
  2. Click "Deploy" → "Manage deployments"
  3. Edit the deployment
  4. Set "Who has access" to "Anyone" (not "Anyone with Google Account")
  5. Save and copy the new deployment URL

### Test fails with "404 Not Found"
- **Cause:** Incorrect deployment URL
- **Solution:**
  1. Verify the URL in `config/config.local.js` or the test script
  2. Get the correct URL from Apps Script → Deploy → Manage deployments
  3. Update the URL and try again

### Ping succeeds but log deployment fails
- **Cause:** Missing "Logs" sheet in Google Sheets
- **Solution:**
  1. Open your Google Sheets database
  2. Run the `setupSheets_()` function from Apps Script editor
  3. Verify the "Logs" sheet exists with headers: Timestamp, Type, Message, UserAgent, Count

### Response shows `{"logged": false}`
- **Cause:** Error writing to Google Sheets (permissions or sheet structure)
- **Solution:**
  1. Check that the Apps Script has edit access to the Sheet
  2. Verify SHEET_ID in `Code.gs` matches your Google Sheet
  3. Check Apps Script logs for detailed error messages

## Integration with Application

The test tools use the same API endpoint as the main application:

### Frontend Integration
The main app (`src/app.jsx`) calls the log endpoint via:
```javascript
await runGasFn('logClientError', {
    type: error?.name || 'Error',
    message: message || error?.message || 'Unknown error',
    userAgent: navigator.userAgent,
    count: 1
});
```

### Backend Handler
The GAS backend (`apps_script/Code.gs`) handles logs via:
```javascript
case 'logError':
    return makeJsonResponse(logClientError(e.parameter));
```

## Configuration

### Using Custom GAS URL

To test with a custom GAS deployment URL:

**For Shell Script:**
Edit `test-gas-connection.sh` and update:
```bash
GAS_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```

**For HTML Test:**
Create `config/config.local.js`:
```javascript
const CONFIG = {
    GAS_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
};
window.CONFIG = CONFIG;
```

Then open `test-gas-connection.html` in a browser.

## Automated Testing

### In CI/CD Pipelines

Add to your CI workflow:
```yaml
- name: Test GAS Connection
  run: |
    chmod +x test-gas-connection.sh
    ./test-gas-connection.sh
  env:
    # Optional: Override GAS_URL via environment variable
    GAS_URL: ${{ secrets.GAS_URL }}
```

### Pre-deployment Checks

Run before deploying changes:
```bash
# Test backend connection
./test-gas-connection.sh

# If successful, proceed with deployment
if [ $? -eq 0 ]; then
    echo "GAS connection verified, proceeding with deployment"
    # ... deployment steps ...
fi
```

## Related Documentation

- **`docs/DEPLOYMENT_CHECKLIST.md`** - Full deployment guide
- **`docs/TROUBLESHOOTING.md`** - Comprehensive troubleshooting
- **`config/README.md`** - Configuration management
- **`diagnostic.sh`** - Low-level API diagnostics

## Need Help?

If you're still experiencing issues:

1. Check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
2. Review the [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)
3. Check the Google Apps Script execution logs
4. Verify your Google Sheets database structure
5. Test with `diagnostic.sh` for more detailed network diagnostics

## License

These test tools are part of the Sudoku Labs project and follow the same license.
