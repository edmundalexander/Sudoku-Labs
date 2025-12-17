/**
 * Sudoku Logic Lab - Utility Functions
 * 
 * Pure utility functions for validation, formatting, and common operations.
 * This file uses plain JavaScript (no JSX) and can be loaded before React.
 * 
 * @version 2.3.0
 */

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }
  
  const trimmed = username.trim();
  
  if (trimmed.length < GAME_SETTINGS.USERNAME_MIN_LENGTH) {
    return { valid: false, error: `Username must be at least ${GAME_SETTINGS.USERNAME_MIN_LENGTH} characters` };
  }
  
  if (trimmed.length > GAME_SETTINGS.USERNAME_MAX_LENGTH) {
    return { valid: false, error: `Username must be ${GAME_SETTINGS.USERNAME_MAX_LENGTH} characters or less` };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { valid: true };
};

/**
 * Validate password format
 * @param {string} password - Password to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < GAME_SETTINGS.PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${GAME_SETTINGS.PASSWORD_MIN_LENGTH} characters` };
  }
  
  if (password.length > GAME_SETTINGS.PASSWORD_MAX_LENGTH) {
    return { valid: false, error: `Password must be ${GAME_SETTINGS.PASSWORD_MAX_LENGTH} characters or less` };
  }
  
  return { valid: true };
};

// ============================================================================
// TEXT UTILITIES
// ============================================================================

/**
 * Sanitize text to prevent XSS when rendering user content
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format date for display
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
};

// ============================================================================
// CRYPTO UTILITIES
// ============================================================================

/**
 * Generate a cryptographically random guest ID
 * @returns {string} Guest ID in format "UserXXXX"
 */
const generateGuestId = () => {
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return 'User' + (array[0] % 10000);
  }
  // Fallback (not cryptographically secure)
  return 'User' + Math.floor(Math.random() * 10000);
};

// ============================================================================
// SUDOKU UTILITIES
// ============================================================================

/**
 * Get row index from cell index
 * @param {number} index - Cell index (0-80)
 * @returns {number} Row index (0-8)
 */
const getRow = (index) => Math.floor(index / 9);

/**
 * Get column index from cell index
 * @param {number} index - Cell index (0-80)
 * @returns {number} Column index (0-8)
 */
const getCol = (index) => index % 9;

/**
 * Get box index from cell index
 * @param {number} index - Cell index (0-80)
 * @returns {number} Box index (0-8)
 */
const getBox = (index) => {
  const row = getRow(index);
  const col = getCol(index);
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
};

/**
 * Check if a number is valid at a given position
 * @param {number[]} board - Sudoku board as flat array
 * @param {number} index - Cell index
 * @param {number} num - Number to check (1-9)
 * @returns {boolean} Whether the number is valid
 */
const isValidMove = (board, index, num) => {
  const row = getRow(index);
  const col = getCol(index);
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    // Check row
    if (board[row * 9 + i] === num) return false;
    // Check column
    if (board[i * 9 + col] === num) return false;
    // Check box
    if (board[(startRow + Math.floor(i / 3)) * 9 + (startCol + (i % 3))] === num) return false;
  }
  return true;
};

/**
 * Get remaining count for each number on the board
 * @param {Array<{value: number|null}>} board - Board with cell objects
 * @returns {number[]} Array of remaining counts (index 0 unused, 1-9 are counts)
 */
const getRemainingNumbers = (board) => {
  const counts = Array(10).fill(9);
  board.forEach(cell => {
    if (cell.value) counts[cell.value]--;
  });
  return counts;
};

/**
 * Get completed box indices
 * @param {Array<{row: number, col: number, value: number|null}>} board - Board with cell objects
 * @returns {number[]} Array of completed box indices
 */
const getCompletedBoxes = (board) => {
  const completed = [];
  for (let b = 0; b < 9; b++) {
    const cells = board.filter(c => 
      Math.floor(c.row / 3) * 3 + Math.floor(c.col / 3) === b
    );
    if (cells.length !== 9) continue;
    const values = cells.map(c => c.value).filter(v => v !== null);
    if (new Set(values).size === 9) completed.push(b);
  }
  return completed;
};

// ============================================================================
// LOCAL BOARD GENERATOR (fallback for dev/offline)
// ============================================================================

/**
 * Generate a local Sudoku board (fallback when GAS unavailable)
 * @param {string} difficulty - Difficulty level
 * @returns {Array<Object>} Array of cell objects
 */
const generateLocalBoard = (difficulty) => {
  // Known valid solution to use as baseline
  const solution = [
    5, 3, 4, 6, 7, 8, 9, 1, 2, 6, 7, 2, 1, 9, 5, 3, 4, 8, 1, 9, 8, 3, 4, 2, 5, 6, 7,
    8, 5, 9, 7, 6, 1, 4, 2, 3, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3, 9, 2, 4, 8, 5, 6,
    9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7, 4, 1, 9, 6, 3, 5, 3, 4, 5, 2, 8, 6, 1, 7, 9
  ];

  let boardArray = [...solution];

  const removeCount = DIFFICULTY_REMOVE_COUNTS[difficulty] || 30;

  let attempts = 0;
  const indices = Array.from({ length: 81 }, (_, i) => i);
  while (attempts < removeCount && indices.length) {
    const idx = Math.floor(Math.random() * indices.length);
    const i = indices.splice(idx, 1)[0];
    if (boardArray[i] !== 0) {
      boardArray[i] = 0;
      attempts++;
    }
  }

  return boardArray.map((val, index) => ({
    id: index,
    row: getRow(index),
    col: getCol(index),
    value: val === 0 ? null : val,
    solution: solution[index],
    isFixed: val !== 0,
    notes: [],
    isError: false,
    isHinted: false
  }));
};

// ============================================================================
// VISUAL EFFECTS
// ============================================================================

/**
 * Trigger confetti animation
 */
const triggerConfetti = () => {
  const colors = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'];
  const root = document.getElementById('root');
  if (!root) return;
  
  const pieces = [];
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div');
    el.classList.add('confetti-piece');
    el.style.left = Math.random() * 100 + 'vw';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.animation = `confettiDrop ${1 + Math.random() * 2}s linear forwards`;
    root.appendChild(el);
    pieces.push(el);
  }
  
  // Clean up confetti pieces after animation completes
  setTimeout(() => {
    pieces.forEach(el => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }, 3000);
};

// ============================================================================
// LEADERBOARD UTILITIES
// ============================================================================

/**
 * Sort leaderboard by difficulty (descending) then time (ascending)
 * @param {Array<{difficulty: string, time: number}>} list - Leaderboard entries
 */
const sortLeaderboard = (list) => {
  const diffOrder = { 'Hard': 3, 'Medium': 2, 'Daily': 1.5, 'Easy': 1 };
  list.sort((a, b) => {
    if (diffOrder[a.difficulty] !== diffOrder[b.difficulty]) {
      return diffOrder[b.difficulty] - diffOrder[a.difficulty];
    }
    return a.time - b.time;
  });
};

// Make utilities available globally
window.validateUsername = validateUsername;
window.validatePassword = validatePassword;
window.sanitizeText = sanitizeText;
window.formatTime = formatTime;
window.formatDate = formatDate;
window.generateGuestId = generateGuestId;
window.getRow = getRow;
window.getCol = getCol;
window.getBox = getBox;
window.isValidMove = isValidMove;
window.getRemainingNumbers = getRemainingNumbers;
window.getCompletedBoxes = getCompletedBoxes;
window.generateLocalBoard = generateLocalBoard;
window.triggerConfetti = triggerConfetti;
window.sortLeaderboard = sortLeaderboard;
