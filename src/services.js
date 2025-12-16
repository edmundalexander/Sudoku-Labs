/**
 * Sudoku Logic Lab - Services (API & Storage)
 * 
 * API service layer for GAS backend communication and local storage management.
 * This file uses plain JavaScript (no JSX) and can be loaded before React.
 * 
 * @version 2.3.0
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// GAS Backend API URL - Configure via config/config.local.js
const DEFAULT_GAS_URL = '';
const GAS_URL = (typeof CONFIG !== 'undefined' && CONFIG.GAS_URL) || DEFAULT_GAS_URL;

/**
 * Check if GAS backend is properly configured
 * @returns {boolean} Whether GAS is available
 */
const isGasEnvironment = () => {
  try {
    if (typeof GAS_URL !== 'string') return false;
    const host = (new URL(GAS_URL)).host;
    return host === 'script.google.com';
  } catch (e) {
    return false;
  }
};

// ============================================================================
// GAS API SERVICE
// ============================================================================

/**
 * Call a GAS API function
 * @param {string} fnName - Function name to call
 * @param {Object} args - Arguments to pass
 * @returns {Promise<any>} API response
 */
const runGasFn = async (fnName, ...args) => {
  if (!GAS_URL) {
    console.error('GAS_URL not configured');
    return null;
  }

  try {
    // Map function names to API actions
    const actionMap = {
      generateSudoku: { action: 'generateSudoku', method: 'GET' },
      getLeaderboardData: { action: 'getLeaderboard', method: 'GET' },
      saveLeaderboardScore: { action: 'saveScore', method: 'GET' },
      getChatData: { action: 'getChat', method: 'GET' },
      postChatData: { action: 'postChat', method: 'GET' },
      logClientError: { action: 'logError', method: 'GET' },
      registerUser: { action: 'register', method: 'GET' },
      loginUser: { action: 'login', method: 'GET' },
      getUserProfile: { action: 'getUserProfile', method: 'GET' },
      updateUserProfile: { action: 'updateUserProfile', method: 'GET' },
      getUserState: { action: 'getUserState', method: 'GET' },
      saveUserState: { action: 'saveUserState', method: 'GET' }
    };

    const mapping = actionMap[fnName];
    if (!mapping) {
      console.error('Unknown function:', fnName);
      return null;
    }

    const { action } = mapping;
    const url = new URL(GAS_URL);
    url.searchParams.set('action', action);

    // Add all arguments as URL parameters
    if (args[0] !== undefined) {
      if (typeof args[0] === 'object') {
        Object.entries(args[0]).forEach(([k, v]) => {
          const value = (v !== null && typeof v === 'object') ? JSON.stringify(v) : v;
          if (value !== undefined) url.searchParams.set(k, value);
        });
      } else {
        url.searchParams.set('data', args[0]);
      }
    }

    // All requests use GET to avoid GAS POST redirect issues
    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('GAS API Error:', error);
    throw error;
  }
};

/**
 * Log an error to the backend
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
const logError = async (message, error) => {
  console.log(message, error);
  try {
    await runGasFn('logClientError', {
      type: error?.name || 'Error',
      message: message || error?.message || 'Unknown error',
      userAgent: navigator.userAgent,
      count: 1
    });
  } catch (e) {
    console.error('Failed to log error to GAS:', e);
  }
};

// ============================================================================
// LOCAL STORAGE SERVICE
// ============================================================================

const StorageService = {
  /**
   * Save game state to localStorage
   * @param {Object} state - Game state to save
   */
  saveGame(state) {
    try {
      localStorage.setItem(KEYS.GAME_STATE, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  },

  /**
   * Load game state from localStorage
   * @returns {Object|null} Saved game state or null
   */
  loadGame() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.GAME_STATE));
    } catch (e) {
      return null;
    }
  },

  /**
   * Clear saved game
   */
  clearSavedGame() {
    localStorage.removeItem(KEYS.GAME_STATE);
  },

  /**
   * Get user ID (generate if not exists)
   * @returns {string} User ID
   */
  getUserId() {
    let uid = localStorage.getItem(KEYS.USER_ID);
    if (!uid) {
      uid = generateGuestId();
      localStorage.setItem(KEYS.USER_ID, uid);
    }
    return uid;
  },

  /**
   * Get user session
   * @returns {Object|null} User session or null
   */
  getUserSession() {
    try {
      const session = localStorage.getItem(KEYS.USER_SESSION);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Set user session
   * @param {Object} user - User data
   */
  setUserSession(user) {
    try {
      localStorage.setItem(KEYS.USER_SESSION, JSON.stringify(user));
      if (user && user.username) {
        localStorage.setItem(KEYS.USER_ID, user.username);
      }
    } catch (e) {
      console.warn('Failed to save user session to localStorage:', e);
    }
  },

  /**
   * Clear user session
   */
  clearUserSession() {
    localStorage.removeItem(KEYS.USER_SESSION);
    const guestId = generateGuestId();
    localStorage.setItem(KEYS.USER_ID, guestId);
  },

  /**
   * Get current user ID (authenticated or guest)
   * @returns {string} Current user ID
   */
  getCurrentUserId() {
    const session = this.getUserSession();
    if (session && session.username) {
      return session.username;
    }
    return this.getUserId();
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Whether user is authenticated
   */
  isUserAuthenticated() {
    const session = this.getUserSession();
    return session !== null && session.userId;
  },

  /**
   * Get user status
   * @returns {string} User status
   */
  getUserStatus() {
    try {
      return localStorage.getItem(KEYS.USER_STATUS) || '';
    } catch (e) {
      return '';
    }
  },

  /**
   * Save user status
   * @param {string} status - Status text
   */
  saveUserStatus(status) {
    try {
      const trimmed = (status || '').slice(0, GAME_SETTINGS.STATUS_MAX_LENGTH);
      localStorage.setItem(KEYS.USER_STATUS, trimmed);
    } catch (e) { }
  },

  /**
   * Get game stats
   * @returns {Object} Game stats
   */
  getGameStats() {
    try {
      const stored = localStorage.getItem(KEYS.GAME_STATS);
      return stored ? JSON.parse(stored) : {
        totalWins: 0,
        easyWins: 0,
        mediumWins: 0,
        hardWins: 0,
        perfectWins: 0,
        fastWins: 0
      };
    } catch (e) {
      return { totalWins: 0, easyWins: 0, mediumWins: 0, hardWins: 0, perfectWins: 0, fastWins: 0 };
    }
  },

  /**
   * Save game stats
   * @param {Object} stats - Game stats
   */
  saveGameStats(stats) {
    try {
      localStorage.setItem(KEYS.GAME_STATS, JSON.stringify(stats));
    } catch (e) { }
  },

  /**
   * Get unlocked themes
   * @returns {string[]} Array of unlocked theme IDs
   */
  getUnlockedThemes() {
    try {
      const stored = localStorage.getItem(KEYS.UNLOCKED_THEMES);
      return stored ? JSON.parse(stored) : ['default'];
    } catch (e) {
      return ['default'];
    }
  },

  /**
   * Save unlocked themes
   * @param {string[]} themes - Array of theme IDs
   */
  saveUnlockedThemes(themes) {
    try {
      localStorage.setItem(KEYS.UNLOCKED_THEMES, JSON.stringify(themes));
    } catch (e) { }
  },

  /**
   * Get active theme
   * @returns {string} Active theme ID
   */
  getActiveTheme() {
    try {
      return localStorage.getItem(KEYS.ACTIVE_THEME) || 'default';
    } catch (e) {
      return 'default';
    }
  },

  /**
   * Save active theme
   * @param {string} themeId - Theme ID
   */
  saveActiveTheme(themeId) {
    try {
      localStorage.setItem(KEYS.ACTIVE_THEME, themeId);
    } catch (e) { }
  },

  /**
   * Get unlocked sound packs
   * @returns {string[]} Array of unlocked sound pack IDs
   */
  getUnlockedSoundPacks() {
    try {
      const stored = localStorage.getItem(KEYS.UNLOCKED_SOUND_PACKS);
      return stored ? JSON.parse(stored) : ['classic', 'zen'];
    } catch (e) {
      return ['classic', 'zen'];
    }
  },

  /**
   * Save unlocked sound packs
   * @param {string[]} packs - Array of sound pack IDs
   */
  saveUnlockedSoundPacks(packs) {
    try {
      localStorage.setItem(KEYS.UNLOCKED_SOUND_PACKS, JSON.stringify(packs));
    } catch (e) { }
  },

  /**
   * Get active sound pack
   * @returns {string} Active sound pack ID
   */
  getActiveSoundPack() {
    try {
      return localStorage.getItem(KEYS.ACTIVE_SOUND_PACK) || 'classic';
    } catch (e) {
      return 'classic';
    }
  },

  /**
   * Save active sound pack
   * @param {string} packId - Sound pack ID
   */
  saveActiveSoundPack(packId) {
    try {
      localStorage.setItem(KEYS.ACTIVE_SOUND_PACK, packId);
    } catch (e) { }
  }
};

// ============================================================================
// LEADERBOARD SERVICE
// ============================================================================

const LeaderboardService = {
  /**
   * Get local leaderboard
   * @returns {Array} Leaderboard entries
   */
  getLocal() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.LEADERBOARD)) || [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Save score (locally and to server)
   * @param {Object} entry - Score entry
   */
  async saveScore(entry) {
    if (isGasEnvironment()) {
      try {
        await runGasFn('saveLeaderboardScore', entry);
      } catch (e) { }
    }
    const current = this.getLocal();
    current.push(entry);
    sortLeaderboard(current);
    localStorage.setItem(KEYS.LEADERBOARD, JSON.stringify(current.slice(0, GAME_SETTINGS.LEADERBOARD_MAX_ENTRIES)));
  },

  /**
   * Get leaderboard (from server or local)
   * @returns {Promise<Array>} Leaderboard entries
   */
  async get() {
    if (isGasEnvironment()) {
      try {
        const data = await runGasFn('getLeaderboardData');
        if (Array.isArray(data)) {
          sortLeaderboard(data);
          return data;
        }
      } catch (e) { }
    }
    return this.getLocal();
  }
};

// ============================================================================
// CHAT SERVICE
// ============================================================================

const ChatService = {
  /**
   * Get local chat messages
   * @returns {Array} Chat messages
   */
  getLocal() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.CHAT)) || [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Normalize a chat message
   * @param {Object} msg - Message object
   * @returns {Object} Normalized message
   */
  normalizeMessage(msg) {
    return {
      id: msg.id,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
      status: msg.status || ''
    };
  },

  /**
   * Get chat messages (from server or local)
   * @returns {Promise<Array>} Chat messages
   */
  async getMessages() {
    if (isGasEnvironment()) {
      try {
        const data = await runGasFn('getChatData');
        if (Array.isArray(data)) return data.map(this.normalizeMessage);
      } catch (e) { }
    }
    return this.getLocal().map(this.normalizeMessage);
  },

  /**
   * Post a chat message
   * @param {Object} msg - Message to post
   * @returns {Promise<Array>} Updated chat messages
   */
  async postMessage(msg) {
    if (isGasEnvironment()) {
      try {
        const data = await runGasFn('postChatData', msg);
        if (Array.isArray(data)) return data.map(this.normalizeMessage);
      } catch (e) { }
    }
    const current = this.getLocal();
    current.push(this.normalizeMessage(msg));
    const trimmed = current.length > GAME_SETTINGS.CHAT_MAX_MESSAGES 
      ? current.slice(current.length - GAME_SETTINGS.CHAT_MAX_MESSAGES) 
      : current;
    localStorage.setItem(KEYS.CHAT, JSON.stringify(trimmed));
    return trimmed;
  }
};

// ============================================================================
// UNLOCK SERVICE
// ============================================================================

const UnlockService = {
  /**
   * Check for theme unlocks based on stats
   * @param {Object} stats - Game stats
   * @returns {string[]} Newly unlocked theme IDs
   */
  checkThemeUnlocks(stats) {
    const newlyUnlocked = [];
    const currentUnlocked = StorageService.getUnlockedThemes();

    // Ocean: Win 5 games
    if (stats.totalWins >= 5 && !currentUnlocked.includes('ocean')) {
      newlyUnlocked.push('ocean');
    }

    // Forest: Win 10 games
    if (stats.totalWins >= 10 && !currentUnlocked.includes('forest')) {
      newlyUnlocked.push('forest');
    }

    // Sunset: Complete a Hard puzzle
    if (stats.hardWins >= 1 && !currentUnlocked.includes('sunset')) {
      newlyUnlocked.push('sunset');
    }

    // Midnight: Win with 0 mistakes
    if (stats.perfectWins >= 1 && !currentUnlocked.includes('midnight')) {
      newlyUnlocked.push('midnight');
    }

    // Sakura: Win 3 Easy puzzles
    if (stats.easyWins >= 3 && !currentUnlocked.includes('sakura')) {
      newlyUnlocked.push('sakura');
    }

    // Volcano: Win 3 Medium puzzles
    if (stats.mediumWins >= 3 && !currentUnlocked.includes('volcano')) {
      newlyUnlocked.push('volcano');
    }

    // Arctic: Win in under 3 minutes
    if (stats.fastWins >= 1 && !currentUnlocked.includes('arctic')) {
      newlyUnlocked.push('arctic');
    }

    if (newlyUnlocked.length > 0) {
      const updatedUnlocked = [...currentUnlocked, ...newlyUnlocked];
      StorageService.saveUnlockedThemes(updatedUnlocked);
    }

    return newlyUnlocked;
  },

  /**
   * Check for sound pack unlocks based on stats
   * @param {Object} stats - Game stats
   * @returns {string[]} Newly unlocked sound pack IDs
   */
  checkSoundPackUnlocks(stats) {
    const newlyUnlocked = [];
    const currentUnlocked = StorageService.getUnlockedSoundPacks();

    const tryUnlock = (id, condition) => {
      if (!currentUnlocked.includes(id) && condition) newlyUnlocked.push(id);
    };

    tryUnlock('funfair', stats.totalWins >= 3);
    tryUnlock('retro', stats.easyWins >= 3);
    tryUnlock('space', stats.hardWins >= 1);
    tryUnlock('nature', stats.mediumWins >= 3);
    tryUnlock('crystal', stats.perfectWins >= 1);
    tryUnlock('minimal', stats.fastWins >= 1);

    if (newlyUnlocked.length > 0) {
      const updated = [...currentUnlocked, ...newlyUnlocked];
      StorageService.saveUnlockedSoundPacks(updated);
    }

    return newlyUnlocked;
  }
};

// ============================================================================
// CONVENIENCE WRAPPER FUNCTIONS
// ============================================================================

/**
 * Get leaderboard (convenience wrapper)
 * @returns {Promise<Array>} Leaderboard entries
 */
const getLeaderboard = () => LeaderboardService.get();

/**
 * Save score (convenience wrapper)
 * @param {Object} entry - Score entry
 */
const saveScore = (entry) => LeaderboardService.saveScore(entry);

/**
 * Get chat messages (convenience wrapper)
 * @returns {Promise<Array>} Chat messages
 */
const getChatMessages = () => ChatService.getMessages();

/**
 * Post chat message (convenience wrapper)
 * @param {Object} msg - Message to post
 * @returns {Promise<Array>} Updated chat messages
 */
const postChatMessage = (msg) => ChatService.postMessage(msg);

/**
 * Check if user is authenticated (convenience wrapper)
 * @returns {boolean} Whether user is authenticated
 */
const isUserAuthenticated = () => StorageService.isUserAuthenticated();

// Make services available globally
window.GAS_URL = GAS_URL;
window.isGasEnvironment = isGasEnvironment;
window.runGasFn = runGasFn;
window.logError = logError;
window.StorageService = StorageService;
window.LeaderboardService = LeaderboardService;
window.ChatService = ChatService;
window.UnlockService = UnlockService;

// Convenience wrappers
window.getLeaderboard = getLeaderboard;
window.saveScore = saveScore;
window.getChatMessages = getChatMessages;
window.postChatMessage = postChatMessage;
window.isUserAuthenticated = isUserAuthenticated;
