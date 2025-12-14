// ============================================================================
// Sudoku-Labs: Google Apps Script Backend (API-only, no HTML serving)
// ============================================================================
// This script serves as the backend API for the Sudoku game frontend.
// Frontend is hosted on GitHub Pages; this script handles Sudoku generation,
// leaderboard, chat, and error logging via fetch from the frontend.
//
// Deployment: Deploy as "Web App" with Execute as: Me, Access: Anyone
// ============================================================================

const SHEET_ID = '1a7-R53GPrnR0etBKPwqRA09-ZCHjO_DxPFvkKN_ZTWE';

// --- CORS & JSON helpers ---
function getSpreadsheet_() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function makeJsonOutput(data) {
  const json = JSON.stringify(data);
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// --- API Router ---
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  try {
    if (action === 'generateSudoku') {
      const difficulty = e.parameter.data || 'Easy';
      return makeJsonOutput(generateSudoku(difficulty));
    }
    if (action === 'getLeaderboard') {
      return makeJsonOutput(getLeaderboardData());
    }
    if (action === 'getChat') {
      return makeJsonOutput(getChatData());
    }
    if (action === 'ping') {
      return makeJsonOutput({ ok: true, timestamp: new Date().toISOString() });
    }
    return makeJsonOutput({ error: 'unknown action: ' + action });
  } catch (err) {
    Logger.log('doGet error: ' + err);
    return makeJsonOutput({ error: 'Server error: ' + String(err) });
  }
}

function doPost(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  let body = {};
  try {
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
  } catch (parseErr) {
    return makeJsonOutput({ error: 'Invalid JSON body' });
  }

  try {
    if (action === 'saveScore') {
      return makeJsonOutput(saveLeaderboardScore(body));
    }
    if (action === 'postChat') {
      return makeJsonOutput(postChatData(body));
    }
    if (action === 'logError') {
      return makeJsonOutput(logClientError(body));
    }
    return makeJsonOutput({ error: 'unknown action: ' + action });
  } catch (err) {
    Logger.log('doPost error: ' + err);
    return makeJsonOutput({ error: 'Server error: ' + String(err) });
  }
}

// --- Leaderboard Operations ---
function getLeaderboardData() {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName('Leaderboard');
  if (!sheet) {
    Logger.log('Leaderboard sheet not found');
    return [];
  }
  
  try {
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // only header
    
    const rows = data.slice(1);
    return rows.map(r => ({
      name: sanitizeOutput_(r[0]),
      time: Number(r[1]) || 0,
      difficulty: sanitizeOutput_(r[2]),
      date: sanitizeOutput_(r[3])
    })).filter(r => r.name && r.time > 0); // filter out empty rows
  } catch (err) {
    Logger.log('Error reading leaderboard: ' + err);
    return [];
  }
}

function saveLeaderboardScore(entry) {
  if (!entry || typeof entry !== 'object') return [];
  
  const validDiffs = ['Easy', 'Medium', 'Hard', 'Daily'];
  if (typeof entry.time !== 'number' || !validDiffs.includes(entry.difficulty)) {
    Logger.log('Invalid score entry: ' + JSON.stringify(entry));
    return getLeaderboardData();
  }

  try {
    const safeName = sanitizeInput_(entry.name, 20) || 'Anonymous';
    const safeDiff = sanitizeInput_(entry.difficulty, 10);
    const safeDate = sanitizeInput_(entry.date, 20);
    const timeValue = Math.max(0, Math.floor(entry.time));
    
    const ss = getSpreadsheet_();
    const sheet = ss.getSheetByName('Leaderboard');
    if (!sheet) {
      Logger.log('Leaderboard sheet not found');
      return [];
    }
    
    sheet.appendRow([safeName, timeValue, safeDiff, safeDate]);
    Logger.log('Score saved: ' + safeName + ' - ' + timeValue + 's (' + safeDiff + ')');
    return getLeaderboardData();
  } catch (err) {
    Logger.log('Error saving score: ' + err);
    return getLeaderboardData();
  }
}

// --- Chat Operations ---
function getChatData() {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName('Chat');
  if (!sheet) {
    Logger.log('Chat sheet not found');
    return [];
  }

  try {
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const rows = data.slice(1).slice(-50); // last 50 messages
    return rows.map(r => ({
      id: sanitizeOutput_(r[0]),
      sender: sanitizeOutput_(r[1]),
      text: sanitizeOutput_(r[2]),
      timestamp: new Date(r[3]).getTime() || Date.now()
    })).filter(r => r.sender && r.text);
  } catch (err) {
    Logger.log('Error reading chat: ' + err);
    return [];
  }
}

function postChatData(msg) {
  if (!msg || typeof msg !== 'object') return [];
  if (!msg.text || typeof msg.text !== 'string' || msg.text.trim() === '') {
    Logger.log('Invalid chat message');
    return getChatData();
  }

  try {
    const safeSender = sanitizeInput_(msg.sender, 20) || 'User';
    const safeText = sanitizeInput_(msg.text, 140);
    const safeId = sanitizeInput_(msg.id, 50) || 'msg_' + Date.now();
    const rawTimestamp = Number(msg.timestamp) || Date.now();
    const readableDate = Utilities.formatDate(new Date(rawTimestamp), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    
    const ss = getSpreadsheet_();
    const sheet = ss.getSheetByName('Chat');
    if (!sheet) {
      Logger.log('Chat sheet not found');
      return [];
    }
    
    sheet.appendRow([safeId, safeSender, safeText, readableDate]);
    Logger.log('Chat posted: ' + safeSender + ' - ' + safeText.substring(0, 50));
    return getChatData();
  } catch (err) {
    Logger.log('Error posting chat: ' + err);
    return getChatData();
  }
}

// --- Error Logging ---
function logClientError(entry) {
  if (!entry || typeof entry !== 'object') return { success: false };

  try {
    const ss = getSpreadsheet_();
    const sheet = ss.getSheetByName('Logs');
    if (!sheet) {
      Logger.log('Logs sheet not found');
      return { success: false };
    }

    const safeType = sanitizeInput_(entry.type, 20) || 'unknown';
    const safeMsg = sanitizeInput_(entry.message, 200) || '';
    const safeAgent = sanitizeInput_(entry.userAgent, 100) || 'unknown';
    const safeCount = Number(entry.count) || 1;
    
    sheet.appendRow([new Date().toISOString(), safeType, safeMsg, safeAgent, safeCount]);
    Logger.log('Error logged: ' + safeType + ' - ' + safeMsg.substring(0, 50));
    return { success: true };
  } catch (err) {
    Logger.log('Error logging error: ' + err);
    return { success: false };
  }
}

// --- Sudoku Generator ---
function generateSudoku(difficulty) {
  try {
    const boardArray = new Array(81).fill(0);
    fillDiagonal_(boardArray);
    solveSudoku_(boardArray);
    const solution = [...boardArray];

    // Determine how many cells to remove based on difficulty
    let removeCount = 20;
    if (difficulty === 'Easy') removeCount = 30;
    else if (difficulty === 'Medium') removeCount = 45;
    else if (difficulty === 'Hard') removeCount = 55;
    else if (difficulty === 'Daily') {
      const date = new Date().getDate();
      removeCount = 40 + (date % 10);
    }

    // Remove cells
    let attempts = 0;
    let maxAttempts = removeCount * 2; // prevent infinite loop
    while (attempts < removeCount && maxAttempts-- > 0) {
      const idx = Math.floor(Math.random() * 81);
      if (boardArray[idx] !== 0) {
        boardArray[idx] = 0;
        attempts++;
      }
    }

    // Convert to cell objects
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
  } catch (err) {
    Logger.log('Error generating sudoku: ' + err);
    return [];
  }
}

// --- Sudoku Logic Helpers ---
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

  // Check row
  for (let i = 0; i < 9; i++) {
    if (board[row * 9 + i] === num) return false;
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i * 9 + col] === num) return false;
  }

  // Check 3x3 box
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[(startRow + i) * 9 + (startCol + j)] === num) return false;
    }
  }

  return true;
}

function fillDiagonal_(board) {
  for (let i = 0; i < 9; i = i + 3) {
    fillBox_(board, i * 9 + i);
  }
}

function fillBox_(board, startNode) {
  const row = getRow_(startNode);
  const col = getCol_(startNode);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let num;
      let attempts = 0;
      do {
        num = Math.floor(Math.random() * 9) + 1;
        attempts++;
      } while (!isSafeInBox_(board, row, col, num) && attempts < 10);
      board[(row + i) * 9 + (col + j)] = num;
    }
  }
}

function isSafeInBox_(board, row, col, num) {
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[(startRow + i) * 9 + (startCol + j)] === num) {
        return false;
      }
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

// --- Setup Helper (run once manually in editor) ---
function setupSheets_() {
  const ss = getSpreadsheet_();
  const sheetsToCreate = [
    { name: 'Leaderboard', headers: ['Name', 'Time', 'Difficulty', 'Date'] },
    { name: 'Chat', headers: ['ID', 'Sender', 'Text', 'Timestamp'] },
    { name: 'Logs', headers: ['Timestamp', 'Type', 'Message', 'UserAgent', 'Count'] }
  ];

  sheetsToCreate.forEach(config => {
    let sheet = ss.getSheetByName(config.name);
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
      Logger.log('Created sheet: ' + config.name);
    }
    
    // Add headers if empty
    const data = sheet.getDataRange().getValues();
    if (data.length === 0 || data[0].every(cell => cell === '')) {
      sheet.appendRow(config.headers);
      Logger.log('Added headers to: ' + config.name);
    }
  });
  
  Logger.log('Sheets setup complete');
}

// --- Sanitization & Security ---
function sanitizeInput_(str, maxLength) {
  if (typeof str !== 'string') return '';
  
  let clean = str
    .trim()
    .substring(0, maxLength);
  
  // Prevent formula injection
  if (clean.startsWith('=') || clean.startsWith('+') || clean.startsWith('-') || clean.startsWith('@')) {
    clean = "'" + clean;
  }
  
  return clean;
}

function sanitizeOutput_(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    return val.trim();
  }
  return String(val);
}
