// Google Apps Script Backend
// Ensure this file is named 'Code.gs' in your Google Apps Script editor.

/*
 * SECURITY & DEPLOYMENT CONFIGURATION:
 * 1. Deploy this project as a "Web App".
 * 2. Execute as: "Me" (verifying that the script runs with YOUR permissions).
 * 3. Who has access: "Anyone" (allows public access without Google Sign-in).
 * 
 * This setup ensures users interact ONLY through the public functions defined below
 * and never have direct read/write access to your Spreadsheet.
 */

const SHEET_ID = '1a7-R53GPrnR0etBKPwqRA09-ZCHjO_DxPFvkKN_ZTWE';

// --- Public Endpoints (Callable from Client) ---

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Sudoku Logic Lab v2.1')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getLeaderboardData() {
  const sheet = getSpreadsheet_().getSheetByName('Leaderboard');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  // Skip header, return rows
  const rows = data.slice(1);
  return rows.map(r => ({
    name: sanitizeOutput_(r[0]),
    time: Number(r[1]),
    difficulty: sanitizeOutput_(r[2]),
    date: sanitizeOutput_(r[3])
  }));
}

function saveLeaderboardScore(entry) {
  // 1. Strict Validation
  if (!entry || typeof entry !== 'object') return [];
  
  const validDiffs = ['Easy', 'Medium', 'Hard', 'Daily'];
  if (typeof entry.time !== 'number' || !validDiffs.includes(entry.difficulty)) {
    return getLeaderboardData(); // Reject invalid data silently
  }

  // 2. Sanitization (Prevent Formula Injection & spam)
  const safeName = sanitizeInput_(entry.name, 20) || 'Anonymous';
  const safeDiff = sanitizeInput_(entry.difficulty, 10);
  const safeDate = sanitizeInput_(entry.date, 20);

  const sheet = getSpreadsheet_().getSheetByName('Leaderboard');
  if (sheet) {
    sheet.appendRow([safeName, entry.time, safeDiff, safeDate]);
  }
  return getLeaderboardData();
}

function getChatData() {
  const sheet = getSpreadsheet_().getSheetByName('Chat');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  // Return last 50 messages
  const rows = data.slice(1).slice(-50); 
  return rows.map(r => ({
    id: r[0],
    sender: sanitizeOutput_(r[1]),
    text: sanitizeOutput_(r[2]),
    // Convert Sheet Date Object (or string) back to millis for the frontend
    timestamp: new Date(r[3]).getTime() 
  }));
}

function postChatData(msg) {
  // 1. Strict Validation
  if (!msg || typeof msg !== 'object') return [];
  if (!msg.text || typeof msg.text !== 'string' || msg.text.trim() === '') return getChatData();

  // 2. Sanitization
  const safeSender = sanitizeInput_(msg.sender, 20) || 'User';
  const safeText = sanitizeInput_(msg.text, 140); // Max tweet length
  const safeId = sanitizeInput_(msg.id, 50);
  
  // Convert raw millis to Human Readable Date String
  const rawTimestamp = Number(msg.timestamp) || Date.now();
  const readableDate = Utilities.formatDate(new Date(rawTimestamp), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  const sheet = getSpreadsheet_().getSheetByName('Chat');
  if (sheet) {
    sheet.appendRow([safeId, safeSender, safeText, readableDate]);
  }
  return getChatData();
}

function logClientError(entry) {
  if (!entry || typeof entry !== 'object') return true;

  const sheet = getSpreadsheet_().getSheetByName('Logs');
  if (sheet) {
    // Truncate logs to prevent storage bloat
    const safeType = sanitizeInput_(entry.type, 20);
    const safeMsg = sanitizeInput_(entry.message, 200);
    const safeAgent = sanitizeInput_(entry.userAgent, 100);
    const safeCount = Number(entry.count) || 1;

    sheet.appendRow([
      new Date().toISOString(), 
      safeType, 
      safeMsg, 
      safeAgent,
      safeCount
    ]);
  }
  return true;
}

// --- SUDOKU LOGIC (Moved from Client) ---

function generateSudoku(difficulty) {
  const boardArray = new Array(81).fill(0);
  fillDiagonal_(boardArray);
  solveSudoku_(boardArray);
  const solution = [...boardArray];

  let removeCount = 20; 
  if (difficulty === 'Easy') removeCount = 30;
  if (difficulty === 'Medium') removeCount = 45;
  if (difficulty === 'Hard') removeCount = 55;
  if (difficulty === 'Daily') {
    const date = new Date().getDate();
    removeCount = 40 + (date % 10);
  }

  let attempts = 0;
  while (attempts < removeCount) {
    const idx = Math.floor(Math.random() * 81);
    if (boardArray[idx] !== 0) {
      boardArray[idx] = 0;
      attempts++;
    }
  }

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

// --- Logic Helpers (Private) ---

function getRow_(index) { return Math.floor(index / 9); }
function getCol_(index) { return index % 9; }
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


// --- Private Helpers (NOT Callable from Client) ---
// Note: Ending a function with '_' makes it private in GAS.

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SHEET_ID);
}

// Run this manually in the editor to setup. It cannot be called from the web app.
function setupSheets_() {
  const ss = getSpreadsheet_();
  const sheets = ['Leaderboard', 'Chat', 'Logs'];
  sheets.forEach(name => {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
      const sheet = ss.getSheetByName(name);
      if (name === 'Leaderboard') sheet.appendRow(['Name', 'Time', 'Difficulty', 'Date']);
      if (name === 'Chat') sheet.appendRow(['ID', 'Sender', 'Text', 'Timestamp']);
      if (name === 'Logs') sheet.appendRow(['Timestamp', 'Type', 'Message', 'UserAgent', 'Count']);
    }
  });
}

function sanitizeInput_(str, maxLength) {
  if (typeof str !== 'string') return '';
  let clean = str.trim().substring(0, maxLength);
  // Prevent formula injection (starting with =)
  if (clean.startsWith('=')) clean = "'" + clean;
  return clean;
}

function sanitizeOutput_(val) {
  if (typeof val === 'string') {
    // Basic XSS prevention if needed, though React handles escaping mostly.
    return val; 
  }
  return val;
}

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
// Instructions:
// 1. Open Google Apps Script editor
// 2. Copy this entire Code.gs content
// 3. In the editor console, run setupSheets_() to initialize the spreadsheet
function setupSheets_() {
  const ss = getSpreadsheet_();
  
  const sheetsToCreate = [
    {
      name: 'Leaderboard',
      headers: ['Name', 'Time (seconds)', 'Difficulty', 'Date'],
      description: 'Stores completed game scores'
    },
    {
      name: 'Chat',
      headers: ['ID', 'Sender', 'Text', 'Timestamp'],
      description: 'Community chat messages'
    },
    {
      name: 'Logs',
      headers: ['Timestamp', 'Type', 'Message', 'UserAgent', 'Count'],
      description: 'Client-side error and event logs'
    }
  ];

  sheetsToCreate.forEach(config => {
    let sheet = ss.getSheetByName(config.name);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
      Logger.log('✓ Created sheet: ' + config.name);
    } else {
      Logger.log('✓ Sheet already exists: ' + config.name);
    }
    
    // Add headers if sheet is empty or headers are missing
    try {
      const data = sheet.getDataRange().getValues();
      const isEmpty = data.length === 0 || (data.length === 1 && data[0].every(cell => cell === ''));
      
      if (isEmpty) {
        sheet.appendRow(config.headers);
        Logger.log('  ├─ Added headers: ' + config.headers.join(', '));
      } else {
        Logger.log('  ├─ Headers already present');
      }
      
      Logger.log('  └─ Description: ' + config.description);
    } catch (err) {
      Logger.log('  └─ Error setting up ' + config.name + ': ' + err);
    }
  });
  
  Logger.log('\n✓ Sheets setup complete!');
  Logger.log('\nNext steps:');
  Logger.log('1. Deploy this script as a Web App');
  Logger.log('2. Execute as: Me');
  Logger.log('3. Who has access: Anyone');
  Logger.log('4. Copy the deployment URL into frontend GAS_URL constant');
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
