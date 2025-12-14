// Apps Script API router for Sudoku-Labs
// Paste the body of your server-side logic (from code.js) into this file when creating
// a new Apps Script project. This file exposes `doGet` and `doPost` endpoints that
// return JSON so the GitHub Pages frontend can call the script via fetch.

const SHEET_ID = '1a7-R53GPrnR0etBKPwqRA09-ZCHjO_DxPFvkKN_ZTWE';

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SHEET_ID);
}

// --- Helper wrappers: call existing server functions from action names ---
function handleGenerateSudoku_(params) {
  const difficulty = params && params.diff ? params.diff : 'Easy';
  return generateSudoku(difficulty);
}

function handleGetLeaderboard_() { return getLeaderboardData(); }
function handleSaveScore_(body) { return saveLeaderboardScore(body); }
function handleGetChat_() { return getChatData(); }
function handlePostChat_(body) { return postChatData(body); }
function handleLogError_(body) { return logClientError(body); }

function makeJsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  try {
    if (action === 'generateSudoku') return makeJsonOutput(handleGenerateSudoku_(e.parameter));
    if (action === 'getLeaderboard') return makeJsonOutput(handleGetLeaderboard_());
    if (action === 'getChat') return makeJsonOutput(handleGetChat_());
    // health-check
    if (action === 'ping') return makeJsonOutput({ ok: true });

    return makeJsonOutput({ error: 'unknown action' });
  } catch (err) {
    return makeJsonOutput({ error: String(err) });
  }
}

function doPost(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  try {
    if (action === 'saveScore') return makeJsonOutput(handleSaveScore_(body));
    if (action === 'postChat') return makeJsonOutput(handlePostChat_(body));
    if (action === 'logError') return makeJsonOutput(handleLogError_(body));
    return makeJsonOutput({ error: 'unknown action' });
  } catch (err) {
    return makeJsonOutput({ error: String(err) });
  }
}

// --- Include the game & sheet logic below (copied from your code.js) ---

// --- Public endpoints and game logic ---

function getLeaderboardData() {
  const sheet = getSpreadsheet_().getSheetByName('Leaderboard');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  return rows.map(r => ({
    name: sanitizeOutput_(r[0]),
    time: Number(r[1]),
    difficulty: sanitizeOutput_(r[2]),
    date: sanitizeOutput_(r[3])
  }));
}

function saveLeaderboardScore(entry) {
  if (!entry || typeof entry !== 'object') return [];
  const validDiffs = ['Easy', 'Medium', 'Hard', 'Daily'];
  if (typeof entry.time !== 'number' || !validDiffs.includes(entry.difficulty)) {
    return getLeaderboardData();
  }
  const safeName = sanitizeInput_(entry.name, 20) || 'Anonymous';
  const safeDiff = sanitizeInput_(entry.difficulty, 10);
  const safeDate = sanitizeInput_(entry.date, 20);
  const sheet = getSpreadsheet_().getSheetByName('Leaderboard');
  if (sheet) sheet.appendRow([safeName, entry.time, safeDiff, safeDate]);
  return getLeaderboardData();
}

function getChatData() {
  const sheet = getSpreadsheet_().getSheetByName('Chat');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1).slice(-50);
  return rows.map(r => ({ id: r[0], sender: sanitizeOutput_(r[1]), text: sanitizeOutput_(r[2]), timestamp: new Date(r[3]).getTime() }));
}

function postChatData(msg) {
  if (!msg || typeof msg !== 'object') return [];
  if (!msg.text || typeof msg.text !== 'string' || msg.text.trim() === '') return getChatData();
  const safeSender = sanitizeInput_(msg.sender, 20) || 'User';
  const safeText = sanitizeInput_(msg.text, 140);
  const safeId = sanitizeInput_(msg.id, 50);
  const rawTimestamp = Number(msg.timestamp) || Date.now();
  const readableDate = Utilities.formatDate(new Date(rawTimestamp), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  const sheet = getSpreadsheet_().getSheetByName('Chat');
  if (sheet) sheet.appendRow([safeId, safeSender, safeText, readableDate]);
  return getChatData();
}

function logClientError(entry) {
  if (!entry || typeof entry !== 'object') return true;
  const sheet = getSpreadsheet_().getSheetByName('Logs');
  if (sheet) {
    const safeType = sanitizeInput_(entry.type, 20);
    const safeMsg = sanitizeInput_(entry.message, 200);
    const safeAgent = sanitizeInput_(entry.userAgent, 100);
    const safeCount = Number(entry.count) || 1;
    sheet.appendRow([new Date().toISOString(), safeType, safeMsg, safeAgent, safeCount]);
  }
  return true;
}

// --- Sudoku generator & helpers ---

function generateSudoku(difficulty) {
  const boardArray = new Array(81).fill(0);
  fillDiagonal_(boardArray);
  solveSudoku_(boardArray);
  const solution = [...boardArray];
  let removeCount = 20;
  if (difficulty === 'Easy') removeCount = 30;
  if (difficulty === 'Medium') removeCount = 45;
  if (difficulty === 'Hard') removeCount = 55;
  if (difficulty === 'Daily') { const date = new Date().getDate(); removeCount = 40 + (date % 10); }
  let attempts = 0;
  while (attempts < removeCount) {
    const idx = Math.floor(Math.random() * 81);
    if (boardArray[idx] !== 0) { boardArray[idx] = 0; attempts++; }
  }
  return boardArray.map((val, index) => ({ id: index, row: getRow_(index), col: getCol_(index), value: val === 0 ? null : val, solution: solution[index], isFixed: val !== 0, notes: [], isError: false, isHinted: false }));
}

function getRow_(index) { return Math.floor(index / 9); }
function getCol_(index) { return index % 9; }
function getBox_(index) { const row = getRow_(index); const col = getCol_(index); return Math.floor(row / 3) * 3 + Math.floor(col / 3); }
function isValid_(board, index, num) { const row = getRow_(index); const col = getCol_(index); const startRow = Math.floor(row / 3) * 3; const startCol = Math.floor(col / 3) * 3; for (let i = 0; i < 9; i++) { if (board[row * 9 + i] === num) return false; if (board[i * 9 + col] === num) return false; if (board[(startRow + Math.floor(i / 3)) * 9 + (startCol + (i % 3))] === num) return false; } return true; }
function fillDiagonal_(board) { for (let i = 0; i < 9; i = i + 3) { fillBox_(board, i * 9 + i); } }
function fillBox_(board, startNode) { let num; const row = getRow_(startNode); const col = getCol_(startNode); for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) { do { num = Math.floor(Math.random() * 9) + 1; } while (!isSafeInBox_(board, row, col, num)); board[(row + i) * 9 + (col + j)] = num; } } }
function isSafeInBox_(board, row, col, num) { const startRow = Math.floor(row / 3) * 3; const startCol = Math.floor(col / 3) * 3; for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) { if (board[(startRow + i) * 9 + (startCol + j)] === num) return false; } } return true; }
function solveSudoku_(board) { for (let i = 0; i < 81; i++) { if (board[i] === 0) { for (let num = 1; num <= 9; num++) { if (isValid_(board, i, num)) { board[i] = num; if (solveSudoku_(board)) return true; board[i] = 0; } } return false; } } return true; }

// --- Setup helpers ---
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

function sanitizeInput_(str, maxLength) { if (typeof str !== 'string') return ''; let clean = str.trim().substring(0, maxLength); if (clean.startsWith('=')) clean = "'" + clean; return clean; }
function sanitizeOutput_(val) { if (typeof val === 'string') { return val; } return val; }
