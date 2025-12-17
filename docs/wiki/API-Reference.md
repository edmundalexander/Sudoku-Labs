# API Reference

Complete reference for all API endpoints in the Sudoku Logic Lab backend.

## Base URL

All API requests use the Google Apps Script deployment URL:
```
https://script.google.com/macros/s/[YOUR_SCRIPT_ID]/exec
```

## Request Format

All requests use **HTTP GET** method with query parameters:
```
GET {BASE_URL}?action={ACTION}&param1=value1&param2=value2
```

### Why GET for Everything?

Google Apps Script public deployments have issues with POST requests (they trigger 302 redirects). To avoid this, all operations—including writes—use GET with query parameters. See [Troubleshooting](Troubleshooting) for details.

## Response Format

All responses return JSON:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

## Authentication

None required. The API is publicly accessible (anyone can play).

## Rate Limiting

Google Apps Script enforces quotas:
- **Script runtime**: 6 minutes per execution
- **URL Fetch calls**: 20,000 per day
- **Execution time**: 90 seconds per request

These limits are sufficient for typical game usage.

---

## Endpoints

### 1. Health Check

**Endpoint**: `ping`

**Description**: Verify the API is running and responsive.

**Parameters**: None

**Request**:
```bash
curl "https://script.google.com/macros/s/YOUR_ID/exec?action=ping"
```

**Response**:
```json
{
  "ok": true,
  "timestamp": "2025-12-14T18:00:00.000Z"
}
```

**Use Case**: Testing connectivity, monitoring uptime.

---

### 2. Generate Sudoku Puzzle

**Endpoint**: `generateSudoku`

**Description**: Generate a new Sudoku puzzle of specified difficulty.

**Parameters**:
- `difficulty` (string, optional): "Easy", "Medium", "Hard", or "Daily". Default: "Easy"

**Request**:
```bash
curl "https://script.google.com/macros/s/YOUR_ID/exec?action=generateSudoku&difficulty=Medium"
```

**Response**:
```json
{
  "puzzle": [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    ...
  ],
  "solution": [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    ...
  ],
  "difficulty": "Medium"
}
```

**Notes**:
- `0` represents empty cells in the puzzle
- Daily puzzles are deterministic based on the current date

---

### 3. Get Leaderboard

**Endpoint**: `getLeaderboard`

**Description**: Retrieve the top scores from the leaderboard.

**Parameters**: None

**Request**:
```bash
curl "https://script.google.com/macros/s/YOUR_ID/exec?action=getLeaderboard"
```

**Response**:
```json
{
  "scores": [
    {
      "name": "Alice",
      "time": 180,
      "difficulty": "Hard",
      "date": "2025-12-14"
    },
    {
      "name": "Bob",
      "time": 240,
      "difficulty": "Medium",
      "date": "2025-12-13"
    }
  ]
}
```

**Notes**:
- Times are in seconds
- Sorted by difficulty and time (fastest first)
- Maximum 100 entries returned

---

### 4. Save Score

**Endpoint**: `saveScore`

**Description**: Save a player's score to the leaderboard.

**Parameters**:
- `name` (string, required): Player name (max 50 characters)
- `time` (number, required): Time in seconds
- `difficulty` (string, required): "Easy", "Medium", or "Hard"
- `date` (string, optional): ISO date string. Default: current date

**Request**:
```bash
curl "https://script.google.com/macros/s/YOUR_ID/exec?action=saveScore&name=Charlie&time=300&difficulty=Easy&date=2025-12-14"
```

**Response**:
```json
{
  "success": true,
  "rank": 5,
  "message": "Score saved successfully"
}
```

**Validation**:
- Name: 1-50 characters, alphanumeric and spaces only
- Time: Positive number, max 7200 (2 hours)
- Difficulty: Must be "Easy", "Medium", or "Hard"

**Notes**:
- Duplicate scores are allowed (multiple plays)
- All inputs are sanitized to prevent XSS
- Sheet limit: ~10,000 rows (Google Sheets limit)

---

### 5. Get Chat Messages

**Endpoint**: `getChat`

**Description**: Retrieve recent chat messages.

**Parameters**: None

**Request**:
```bash
curl "https://script.google.com/macros/s/YOUR_ID/exec?action=getChat"
```

**Response**:
```json
{
  "messages": [
    {
      "id": "msg_12345",
      "username": "Alice",
      "text": "Great game!",
      "timestamp": "2025-12-14T18:00:00.000Z"
    },
    {
      "id": "msg_12346",
      "username": "Bob",
      "text": "Anyone have tips for Hard mode?",
      "timestamp": "2025-12-14T18:01:00.000Z"
    }
  ]
}
```

**Notes**:
- Returns last 50 messages
- Messages are sorted by timestamp (newest first)
- Message text is sanitized

---

### 6. Post Chat Message

**Endpoint**: `postChat`

**Description**: Post a new chat message.

**Parameters**:
- `username` (string, required): Username (max 30 characters)
- `text` (string, required): Message text (max 500 characters)
- `id` (string, optional): Message ID (auto-generated if not provided)

**Request**:
```bash
curl "https://script.google.com/macros/s/YOUR_ID/exec?action=postChat&username=Charlie&text=Hello+everyone&id=msg_12347"
```

**Response**:
```json
{
  "success": true,
  "messageId": "msg_12347",
  "timestamp": "2025-12-14T18:02:00.000Z"
}
```

**Validation**:
- Username: 1-30 characters
- Text: 1-500 characters
- Both are sanitized to prevent XSS

**Notes**:
- No profanity filter (consider adding)
- No rate limiting per user (consider adding)
- Messages persist indefinitely

---

### 7. Log Error

**Endpoint**: `logError`

**Description**: Log client-side errors for debugging.

**Parameters**:
- `type` (string, required): Error type (e.g., "TypeError", "NetworkError")
- `message` (string, required): Error message
- `userAgent` (string, optional): Browser user agent
- `count` (number, optional): Error occurrence count. Default: 1

**Request**:
```bash
curl "https://script.google.com/macros/s/YOUR_ID/exec?action=logError&type=TypeError&message=Cannot+read+property&userAgent=Mozilla/5.0..."
```

**Response**:
```json
{
  "logged": true,
  "errorId": "err_12345"
}
```

**Use Case**: 
- Debugging production issues
- Monitoring application health
- Tracking browser compatibility problems

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The 'difficulty' parameter must be Easy, Medium, or Hard"
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_PARAMETER` | Required parameter missing or invalid | 400 |
| `SHEET_ERROR` | Google Sheets access failed | 500 |
| `RATE_LIMIT` | Too many requests | 429 |
| `SERVER_ERROR` | Unexpected server error | 500 |

### HTTP Status Codes

Google Apps Script always returns `200 OK` with error details in the JSON body. Check the `success` field to determine request status.

---

## Code Examples

### JavaScript (Browser)

```javascript
// Fetch wrapper for API calls
async function callAPI(action, params = {}) {
  const url = new URL(CONFIG.GAS_URL);
  url.searchParams.set('action', action);
  
  Object.keys(params).forEach(key => {
    url.searchParams.set(key, params[key]);
  });
  
  const response = await fetch(url.toString());
  return await response.json();
}

// Usage examples
const puzzle = await callAPI('generateSudoku', { difficulty: 'Hard' });
const leaderboard = await callAPI('getLeaderboard');
const result = await callAPI('saveScore', {
  name: 'Alice',
  time: 180,
  difficulty: 'Hard',
  date: '2025-12-14'
});
```

### Python

```python
import requests
from urllib.parse import urlencode

BASE_URL = "https://script.google.com/macros/s/YOUR_ID/exec"

def call_api(action, **params):
    params['action'] = action
    url = f"{BASE_URL}?{urlencode(params)}"
    response = requests.get(url)
    return response.json()

# Usage
puzzle = call_api('generateSudoku', difficulty='Hard')
leaderboard = call_api('getLeaderboard')
result = call_api('saveScore', name='Alice', time=180, difficulty='Hard')
```

### cURL

```bash
# Store base URL
GAS_URL="https://script.google.com/macros/s/YOUR_ID/exec"

# Generate puzzle
curl "${GAS_URL}?action=generateSudoku&difficulty=Medium"

# Get leaderboard
curl "${GAS_URL}?action=getLeaderboard"

# Save score
curl "${GAS_URL}?action=saveScore&name=Alice&time=180&difficulty=Hard"

# Post chat
curl "${GAS_URL}?action=postChat&username=Alice&text=Hello"
```

---

## Data Sanitization

All user inputs are sanitized using these functions in `Code.gs`:

### Input Sanitization
```javascript
function sanitizeInput_(text) {
  return String(text)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
```

### Output Sanitization
```javascript
function sanitizeOutput_(text) {
  return String(text)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}
```

---

## Testing the API

Use the included `diagnostic.sh` script:

```bash
# Set your GAS URL
export GAS_URL="https://script.google.com/macros/s/YOUR_ID/exec"

# Run diagnostics
./diagnostic.sh
```

Or test individual endpoints:

```bash
# Test all endpoints
curl "${GAS_URL}?action=ping"
curl "${GAS_URL}?action=generateSudoku&difficulty=Easy"
curl "${GAS_URL}?action=getLeaderboard"
curl "${GAS_URL}?action=getChat"
```

---

## Next Steps

- **[Backend Setup](Backend-Setup)** - Deploy the API
- **[Configuration](Configuration-Guide)** - Configure the frontend
- **[Troubleshooting](Troubleshooting)** - Fix common issues
- **[Backend Code](https://github.com/edmund-alexander/Sudoku-Labs/blob/main/apps_script/Code.gs)** - See sanitization and security in backend

---

## Related Documentation

- [Architecture Overview](Architecture)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)
