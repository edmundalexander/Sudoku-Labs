// ============================================================================
// Sudoku-Labs: Google Apps Script Backend API
// ============================================================================
// This script is a REST API backend for the Sudoku game frontend.
// Frontend is hosted on GitHub Pages and calls this API via HTTP fetch.
// 
// DEPLOYMENT REQUIREMENTS:
// 1. Deploy as "Web App"
// 2. Execute as: Your email address (the account that owns the Sheet)
// 3. Who has access: "Anyone" (CRITICAL - must be set to "Anyone")
// 4. After deploying, copy the deployment URL
// 5. Update frontend GAS_URL to match this deployment URL
// ============================================================================

const SHEET_ID = '1a7-R53GPrnR0etBKPwqRA09-ZCHjO_DxPFvkKN_ZTWE';

// ============================================================================
// API ROUTER - All requests route through doGet and doPost
// ============================================================================

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  
  try {
    switch(action) {
      case 'generateSudoku':
        const difficulty = e.parameter.difficulty || 'Easy';
        return makeJsonResponse(generateSudoku(difficulty));
      
      case 'getLeaderboard':
        return makeJsonResponse(getLeaderboardData());
      
      case 'getChat':
        return makeJsonResponse(getChatData());
      
      case 'ping':
        return makeJsonResponse({ ok: true, timestamp: new Date().toISOString() });
      
      default:
        return makeJsonResponse({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    Logger.log('doGet error: ' + err);
    return makeJsonResponse({ error: 'Server error: ' + err.toString() });
  }
}

function doPost(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  let data = {};
  
  try {
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
  } catch (parseErr) {
    return makeJsonResponse({ error: 'Invalid JSON in request body' });
  }
  
  try {
    switch(action) {
      case 'saveScore':
        return makeJsonResponse(saveLeaderboardScore(data));
      
      case 'postChat':
        return makeJsonResponse(postChatData(data));
      
      case 'logError':
        return makeJsonResponse(logClientError(data));
      
      default:
        return makeJsonResponse({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    Logger.log('doPost error: ' + err);
    return makeJsonResponse({ error: 'Server error: ' + err.toString() });
  }
}

// ============================================================================
// HELPER - JSON Response with CORS headers
// ============================================================================

function makeJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers (though GAS doesn't fully respect them, it helps)
  // Note: The key is having "Anyone" access on the deployment
  return output;
}

// ============================================================================
// LEADERBOARD ENDPOINTS
// ============================================================================

function getLeaderboardData() {
  try {
    const sheet = getSpreadsheet_().getSheetByName('Leaderboard');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // only header
    
    return data.slice(1).map(row => ({
      name: sanitizeOutput_(row[0]),
      time: Number(row[1]) || 0,
      difficulty: sanitizeOutput_(row[2]),
      date: sanitizeOutput_(row[3])
    })).filter(r => r.name && r.time > 0);
  } catch (err) {
    Logger.log('getLeaderboardData error: ' + err);
    return [];
  }
}

function saveLeaderboardScore(entry) {
  if (!entry || typeof entry !== 'object') {
    return getLeaderboardData();
  }
  
  // Validate
  const validDiffs = ['Easy', 'Medium', 'Hard', 'Daily'];
  if (typeof entry.time !== 'number' || !validDiffs.includes(entry.difficulty)) {
    return getLeaderboardData();
  }
  
  // Sanitize
  const safeName = sanitizeInput_(entry.name || 'Anonymous', 20);
  const safeTime = Number(entry.time);
  const safeDiff = sanitizeInput_(entry.difficulty, 10);
  const safeDate = sanitizeInput_(entry.date || new Date().toISOString(), 20);
  
  try {
    const sheet = getSpreadsheet_().getSheetByName('Leaderboard');
    if (sheet) {
      sheet.appendRow([safeName, safeTime, safeDiff, safeDate]);
    }
  } catch (err) {
    Logger.log('saveLeaderboardScore error: ' + err);
  }
  
  return getLeaderboardData();
}

// ============================================================================
// CHAT ENDPOINTS
// ============================================================================

function getChatData() {
  try {
    const sheet = getSpreadsheet_().getSheetByName('Chat');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    // Return last 50 messages
    return data.slice(1).slice(-50).map(row => ({
      id: sanitizeOutput_(row[0]),
      sender: sanitizeOutput_(row[1]),
      text: sanitizeOutput_(row[2]),
      timestamp: row[3] ? new Date(row[3]).getTime() : Date.now()
    }));
  } catch (err) {
    Logger.log('getChatData error: ' + err);
    return [];
  }
}

function postChatData(msg) {
  if (!msg || typeof msg !== 'object') {
    return getChatData();
  }
  
  if (!msg.text || typeof msg.text !== 'string' || msg.text.trim() === '') {
    return getChatData();
  }
  
  // Sanitize
  const safeSender = sanitizeInput_(msg.sender || 'User', 20);
  const safeText = sanitizeInput_(msg.text, 140);
  const safeId = sanitizeInput_(msg.id || '', 50);
  
  const timestamp = new Date().toISOString();
  
  try {
    const sheet = getSpreadsheet_().getSheetByName('Chat');
    if (sheet) {
      sheet.appendRow([safeId, safeSender, safeText, timestamp]);
    }
  } catch (err) {
    Logger.log('postChatData error: ' + err);
  }
  
  return getChatData();
}

// ============================================================================
// LOGGING ENDPOINT
// ============================================================================

function logClientError(entry) {
  if (!entry || typeof entry !== 'object') {
    return { logged: false };
  }
  
  try {
    const sheet = getSpreadsheet_().getSheetByName('Logs');
    if (sheet) {
      const safeType = sanitizeInput_(entry.type || 'error', 20);
      const safeMsg = sanitizeInput_(entry.message || '', 200);
      const safeAgent = sanitizeInput_(entry.userAgent || '', 100);
      const safeCount = Number(entry.count) || 1;
      
      sheet.appendRow([
        new Date().toISOString(),
        safeType,
        safeMsg,
        safeAgent,
        safeCount
      ]);
    }
    return { logged: true };
  } catch (err) {
    Logger.log('logClientError error: ' + err);
    return { logged: false };
  }
}

// ============================================================================
// SUDOKU GENERATION
// ============================================================================

function generateSudoku(difficulty) {
  const boardArray = new Array(81).fill(0);
  fillDiagonal_(boardArray);
  solveSudoku_(boardArray);
  const solution = [...boardArray];

  // Determine difficulty
  let removeCount = 20;
  if (difficulty === 'Easy') removeCount = 30;
  if (difficulty === 'Medium') removeCount = 45;
  if (difficulty === 'Hard') removeCount = 55;
  if (difficulty === 'Daily') {
    const date = new Date().getDate();
    removeCount = 40 + (date % 10);
  }

  // Remove cells
  let attempts = 0;
  while (attempts < removeCount) {
    const idx = Math.floor(Math.random() * 81);
    if (boardArray[idx] !== 0) {
      boardArray[idx] = 0;
      attempts++;
    }
  }

  // Format for frontend
  return boardArray.map((val, index) => ({
    id: index,
    row: getRow_(index),
    col: getCol_(index),
    value: val === 0 ? null : val,
    solution: solution[index],
    isFixed: val !== 0,
    notes: [],
    isError: false,
    isHinted: false
  }));
}

// ============================================================================
// SUDOKU HELPERS
// ============================================================================

function getRow_(index) { 
  return Math.floor(index / 9); 
}

function getCol_(index) { 
  return index % 9; 
}

function getBox_(index) {
  const row = getRow_(index);
  const col = getCol_(index);
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

function isValid_(board, index, num) {
  const row = getRow_(index);
  const col = getCol_(index);
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (board[row * 9 + i] === num) return false;
    if (board[i * 9 + col] === num) return false;
    if (board[(startRow + Math.floor(i / 3)) * 9 + (startCol + (i % 3))] === num) return false;
  }
  return true;
}

function fillDiagonal_(board) {
  for (let i = 0; i < 9; i = i + 3) {
    fillBox_(board, i * 9 + i);
  }
}

function fillBox_(board, startNode) {
  let num;
  const row = getRow_(startNode);
  const col = getCol_(startNode);
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isSafeInBox_(board, row, col, num));
      board[(row + i) * 9 + (col + j)] = num;
    }
  }
}

function isSafeInBox_(board, row, col, num) {
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[(startRow + i) * 9 + (startCol + j)] === num) return false;
    }
  }
  return true;
}

function solveSudoku_(board) {
  for (let i = 0; i < 81; i++) {
    if (board[i] === 0) {
      for (let num = 1; num <= 9; num++) {
        if (isValid_(board, i, num)) {
          board[i] = num;
          if (solveSudoku_(board)) return true;
          board[i] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

// ============================================================================
// PRIVATE HELPERS
// ============================================================================

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function setupSheets_() {
  const ss = getSpreadsheet_();
  const sheets = ['Leaderboard', 'Chat', 'Logs'];
  
  sheets.forEach(name => {
    if (!ss.getSheetByName(name)) {
      const sheet = ss.insertSheet(name);
      
      if (name === 'Leaderboard') {
        sheet.appendRow(['Name', 'Time (seconds)', 'Difficulty', 'Date']);
      } else if (name === 'Chat') {
        sheet.appendRow(['ID', 'Sender', 'Text', 'Timestamp']);
      } else if (name === 'Logs') {
        sheet.appendRow(['Timestamp', 'Type', 'Message', 'UserAgent', 'Count']);
      }
    }
  });
  
  Logger.log('Sheets initialized successfully');
}

function sanitizeInput_(str, maxLength) {
  if (typeof str !== 'string') return '';
  let clean = str.trim().substring(0, maxLength);
  // Prevent formula injection
  if (clean.startsWith('=')) clean = "'" + clean;
  return clean;
}

function sanitizeOutput_(val) {
  if (typeof val === 'string') return val;
  return String(val || '');
}

