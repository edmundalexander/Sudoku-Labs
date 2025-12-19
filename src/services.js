/**
 * Sudoku Logic Lab - Services (API & Storage)
 *
 * API service layer for GAS backend communication and local storage management.
 * This file uses plain JavaScript (no JSX) and can be loaded before React.
 *
 * @version 2.3.0
 */

import {
  KEYS,
  GAME_SETTINGS,
  THEMES,
  SOUND_PACKS,
  BADGES,
} from "./constants.js";
import { generateGuestId, sortLeaderboard } from "./utils.js";

// ============================================================================
// CONFIGURATION
// ============================================================================

// GAS Backend API URL - Configure via config/config.local.js
export const DEFAULT_GAS_URL = "";

// Helper to get GAS_URL dynamically to handle race conditions with config loading
const getGasUrl = () =>
  (typeof window.CONFIG !== "undefined" && window.CONFIG.GAS_URL) ||
  DEFAULT_GAS_URL;

/**
 * Check if GAS backend is properly configured
 * @returns {boolean} Whether GAS is available
 */
export const isGasEnvironment = () => {
  try {
    const url = getGasUrl();
    if (typeof url !== "string" || !url) return false;
    const host = new URL(url).host;
    return host === "script.google.com";
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
export const runGasFn = async (fnName, ...args) => {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    console.error("GAS_URL not configured");
    return null;
  }

  try {
    // Map function names to API actions
    const actionMap = {
      generateSudoku: { action: "generateSudoku", method: "GET" },
      getLeaderboardData: { action: "getLeaderboard", method: "GET" },
      saveLeaderboardScore: { action: "saveScore", method: "GET" },
      getChatData: { action: "getChat", method: "GET" },
      postChatData: { action: "postChat", method: "GET" },
      logClientError: { action: "logError", method: "GET" },
      registerUser: { action: "register", method: "GET" },
      loginUser: { action: "login", method: "GET" },
      getUserProfile: { action: "getUserProfile", method: "GET" },
      updateUserProfile: { action: "updateUserProfile", method: "GET" },
      getUserState: { action: "getUserState", method: "GET" },
      saveUserState: { action: "saveUserState", method: "GET" },
      getUserBadges: { action: "getUserBadges", method: "GET" },
      awardBadge: { action: "awardBadge", method: "GET" },
    };

    const mapping = actionMap[fnName];
    if (!mapping) {
      console.error("Unknown function:", fnName);
      return null;
    }

    const { action } = mapping;
    const url = new URL(gasUrl);
    url.searchParams.set("action", action);
    // Cache-bust to avoid stale GET responses (especially for auth endpoints)
    url.searchParams.set("_ts", Date.now().toString());

    // Add all arguments as URL parameters
    if (args[0] !== undefined) {
      if (typeof args[0] === "object") {
        Object.entries(args[0]).forEach(([k, v]) => {
          const value =
            v !== null && typeof v === "object" ? JSON.stringify(v) : v;
          if (value !== undefined) url.searchParams.set(k, value);
        });
      } else {
        url.searchParams.set("data", args[0]);
      }
    }

    // All requests use GET to avoid GAS POST redirect issues
    // Keep this a "simple request" (no custom headers) to avoid CORS preflight on GAS
    const response = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("GAS API Error:", error);
    // Provide a clearer error message for CORS / deployment problems
    const guidance =
      "Failed to reach GAS backend. This is commonly caused by CORS or a web app deployment access level.\n" +
      "Ensure your Apps Script Web App is deployed as 'Anyone (even anonymous)' and that CONFIG.GAS_URL is the published deployment URL.\n" +
      'Quick check (run in terminal): curl -I "$GAS_URL?action=ping" — should return HTTP 200, not a 302 redirect.\n' +
      "If you see a CORS error in the browser ('No Access-Control-Allow-Origin header'), redeploy the web app and verify access settings.";

    const wrapped = new Error(`${error.message || error} — ${guidance}`);
    wrapped.original = error;
    throw wrapped;
  }
};

/**
 * Retry wrapper for GAS calls that may fail transiently (network/CORS/etc).
 * Usage: await robustRunGasFn('updateUserProfile', { ... }, { retries: 2, backoff: 300 });
 */
export const robustRunGasFn = async (fnName, args = {}, opts = {}) => {
  const retries = Number(opts.retries || 2);
  const backoff = Number(opts.backoff || 300);
  let attempt = 0;
  while (true) {
    try {
      return await runGasFn(fnName, args);
    } catch (err) {
      attempt++;
      // If we've exhausted retries, rethrow
      if (attempt > retries) throw err;
      // Wait before retrying (exponential-ish backoff)
      await new Promise((res) => setTimeout(res, backoff * attempt));
    }
  }
};

// Expose to global for quick access

/**
 * Log an error to the backend
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
export const logError = async (message, error) => {
  console.log(message, error);
  try {
    await runGasFn("logClientError", {
      type: error?.name || "Error",
      message: message || error?.message || "Unknown error",
      userAgent: navigator.userAgent,
      count: 1,
    });
  } catch (e) {
    console.error("Failed to log error to GAS:", e);
  }
};

// ============================================================================
// LOCAL STORAGE SERVICE
// ============================================================================

export const StorageService = {
  /**
   * Check if localStorage is available and has space
   * @returns {boolean} Whether localStorage is usable
   */
  isAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn("localStorage not available:", e);
      return false;
    }
  },

  /**
   * Handle quota exceeded error
   */
  handleQuotaExceeded() {
    console.warn("localStorage quota exceeded, attempting cleanup...");
    try {
      // Essential keys to preserve
      const essentialKeys = [
        KEYS.GAME_STATE,
        KEYS.USER_SESSION,
        KEYS.USER_ID,
        KEYS.UNLOCKED_THEMES,
        KEYS.UNLOCKED_SOUND_PACKS,
        KEYS.ACTIVE_THEME,
        KEYS.ACTIVE_SOUND_PACK,
        KEYS.GAME_STATS,
        "theme", // Dark mode preference
        "APP_VERSION",
      ];

      const allKeys = Object.keys(localStorage);
      allKeys.forEach((key) => {
        if (!essentialKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error("Failed to clean up localStorage:", e);
    }
  },

  /**
   * Save game state to localStorage
   * @param {Object} state - Game state to save
   */
  saveGame(state) {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(KEYS.GAME_STATE, JSON.stringify(state));
    } catch (e) {
      if (e.name === "QuotaExceededError") {
        this.handleQuotaExceeded();
        // Try again after cleanup
        try {
          localStorage.setItem(KEYS.GAME_STATE, JSON.stringify(state));
        } catch (retryErr) {
          console.error("Failed to save game even after cleanup:", retryErr);
        }
      } else {
        console.error("Failed to save game:", e);
      }
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
      console.warn("Failed to save user session to localStorage:", e);
    }
  },

  /**
   * Clear user session
   */
  clearUserSession() {
    this.clearUserScopedData();
    const guestId = generateGuestId();
    localStorage.setItem(KEYS.USER_ID, guestId);
  },

  /**
   * Clear all user-scoped cached data while preserving global prefs
   */
  clearUserScopedData() {
    try {
      const keysToClear = [
        KEYS.USER_SESSION,
        KEYS.USER_STATUS,
        KEYS.GAME_STATE,
        KEYS.UNLOCKED_THEMES,
        KEYS.ACTIVE_THEME,
        KEYS.UNLOCKED_SOUND_PACKS,
        KEYS.ACTIVE_SOUND_PACK,
        KEYS.GAME_STATS,
        KEYS.CHAT,
      ];
      keysToClear.forEach((key) => localStorage.removeItem(key));
      // Badges use a dedicated key outside KEYS
      localStorage.removeItem("sudoku_v2_user_badges");
    } catch (e) {
      console.warn("Failed to clear user-scoped data:", e);
    }
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
      return localStorage.getItem(KEYS.USER_STATUS) || "";
    } catch (e) {
      return "";
    }
  },

  /**
   * Save user status
   * @param {string} status - Status text
   */
  saveUserStatus(status) {
    try {
      const trimmed = (status || "").slice(0, GAME_SETTINGS.STATUS_MAX_LENGTH);
      localStorage.setItem(KEYS.USER_STATUS, trimmed);
    } catch (e) {}
  },

  /**
   * Get game stats
   * @returns {Object} Game stats
   */
  getGameStats() {
    try {
      const stored = localStorage.getItem(KEYS.GAME_STATS);
      return stored
        ? JSON.parse(stored)
        : {
            totalWins: 0,
            easyWins: 0,
            mediumWins: 0,
            hardWins: 0,
            perfectWins: 0,
            fastWins: 0,
          };
    } catch (e) {
      return {
        totalWins: 0,
        easyWins: 0,
        mediumWins: 0,
        hardWins: 0,
        perfectWins: 0,
        fastWins: 0,
      };
    }
  },

  /**
   * Save game stats
   * @param {Object} stats - Game stats
   */
  saveGameStats(stats) {
    try {
      localStorage.setItem(KEYS.GAME_STATS, JSON.stringify(stats));
    } catch (e) {}
  },

  /**
   * Get unlocked themes
   * @returns {string[]} Array of unlocked theme IDs
   */
  getUnlockedThemes() {
    try {
      const stored = localStorage.getItem(KEYS.UNLOCKED_THEMES);
      return stored ? JSON.parse(stored) : ["default"];
    } catch (e) {
      return ["default"];
    }
  },

  /**
   * Save unlocked themes
   * @param {string[]} themes - Array of theme IDs
   */
  saveUnlockedThemes(themes) {
    try {
      localStorage.setItem(KEYS.UNLOCKED_THEMES, JSON.stringify(themes));
    } catch (e) {}
  },

  /**
   * Get active theme
   * @returns {string} Active theme ID
   */
  getActiveTheme() {
    try {
      const raw = localStorage.getItem(KEYS.ACTIVE_THEME);
      if (!raw) return "default";
      if (raw.trim().startsWith("[")) {
        try {
          const parsed = JSON.parse(raw);
          if (
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            typeof parsed[0] === "string"
          )
            return THEMES && THEMES[parsed[0]] ? parsed[0] : "default";
        } catch (e) {
          /* fallthrough */
        }
      }
      const val =
        typeof raw === "string" && raw.trim() ? raw.trim() : "default";
      return THEMES && THEMES[val] ? val : "default";
    } catch (e) {
      return "default";
    }
  },

  /**
   * Save active theme
   * @param {string} themeId - Theme ID
   */
  saveActiveTheme(themeId) {
    try {
      let value = themeId;
      if (Array.isArray(themeId)) value = themeId[0] || "default";
      if (typeof themeId === "object" && themeId !== null) {
        try {
          const s = JSON.stringify(themeId);
          if (s.trim().startsWith("[")) {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed) && parsed.length > 0) value = parsed[0];
            else value = "default";
          } else {
            value = String(themeId);
          }
        } catch (e) {
          value = "default";
        }
      }
      // Ensure the value is a valid visual theme id
      const final =
        typeof value === "string" &&
        value.trim() &&
        THEMES &&
        THEMES[value.trim()]
          ? value.trim()
          : "default";
      localStorage.setItem(KEYS.ACTIVE_THEME, final);
    } catch (e) {}
  },

  /**
   * Get unlocked sound packs
   * @returns {string[]} Array of unlocked sound pack IDs
   */
  getUnlockedSoundPacks() {
    try {
      const stored = localStorage.getItem(KEYS.UNLOCKED_SOUND_PACKS);
      return stored ? JSON.parse(stored) : ["classic", "zen"];
    } catch (e) {
      return ["classic", "zen"];
    }
  },

  /**
   * Save unlocked sound packs
   * @param {string[]} packs - Array of sound pack IDs
   */
  saveUnlockedSoundPacks(packs) {
    try {
      localStorage.setItem(KEYS.UNLOCKED_SOUND_PACKS, JSON.stringify(packs));
    } catch (e) {}
  },

  /**
   * Get active sound pack
   * @returns {string} Active sound pack ID
   */
  getActiveSoundPack() {
    try {
      const raw = localStorage.getItem(KEYS.ACTIVE_SOUND_PACK);
      if (!raw) return "classic";
      // If stored as JSON array (old bug), pick first element
      if (raw.trim().startsWith("[")) {
        try {
          const parsed = JSON.parse(raw);
          if (
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            typeof parsed[0] === "string"
          )
            return SOUND_PACKS && SOUND_PACKS[parsed[0]]
              ? parsed[0]
              : "classic";
        } catch (e) {
          /* fallthrough */
        }
      }
      // If the value looks like a JSON object or array-as-string, fall back
      if (raw === "null" || raw === "undefined") return "classic";
      const val =
        typeof raw === "string" && raw.trim() ? raw.trim() : "classic";
      return SOUND_PACKS && SOUND_PACKS[val] ? val : "classic";
    } catch (e) {
      return "classic";
    }
  },

  /**
   * Save active sound pack
   * @param {string} packId - Sound pack ID
   */
  saveActiveSoundPack(packId) {
    try {
      let value = packId;
      // Coerce arrays/objects to a safe string (pick first element for arrays)
      if (Array.isArray(packId)) value = packId[0] || "classic";
      if (typeof packId === "object" && packId !== null) {
        try {
          const s = JSON.stringify(packId);
          // If it was an array encoded as string, try parse back
          if (s.trim().startsWith("[")) {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed) && parsed.length > 0) value = parsed[0];
            else value = "classic";
          } else {
            value = String(packId);
          }
        } catch (e) {
          value = "classic";
        }
      }
      const final =
        typeof value === "string" &&
        value.trim() &&
        SOUND_PACKS &&
        SOUND_PACKS[value.trim()]
          ? value.trim()
          : "classic";
      localStorage.setItem(KEYS.ACTIVE_SOUND_PACK, final);
    } catch (e) {}
  },
};

// ============================================================================
// LEADERBOARD SERVICE
// ============================================================================

export const LeaderboardService = {
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
        await runGasFn("saveLeaderboardScore", entry);
      } catch (e) {}
    }
    const current = this.getLocal();
    current.push(entry);
    sortLeaderboard(current);
    localStorage.setItem(
      KEYS.LEADERBOARD,
      JSON.stringify(current.slice(0, GAME_SETTINGS.LEADERBOARD_MAX_ENTRIES))
    );
  },

  /**
   * Get leaderboard (from server or local)
   * @returns {Promise<Array>} Leaderboard entries
   */
  async get() {
    if (isGasEnvironment()) {
      try {
        const data = await runGasFn("getLeaderboardData");
        if (Array.isArray(data)) {
          sortLeaderboard(data);
          return data;
        }
      } catch (e) {}
    }
    return this.getLocal();
  },
};

// ============================================================================
// CHAT SERVICE
// ============================================================================

export const ChatService = {
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
      status: msg.status || "",
    };
  },

  /**
   * Get chat messages (from server or local)
   * @returns {Promise<Array>} Chat messages
   */
  async getMessages() {
    if (isGasEnvironment()) {
      try {
        const data = await runGasFn("getChatData");
        if (Array.isArray(data)) return data.map(this.normalizeMessage);
      } catch (e) {}
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
        const data = await runGasFn("postChatData", msg);

        // Check if user is banned or muted
        if (data && data.error) {
          if (data.banned) {
            throw new Error("BANNED: You have been banned from chat");
          }
          if (data.muted) {
            const minutes = Math.ceil((data.muteUntil - Date.now()) / 60000);
            throw new Error(
              `MUTED: You are muted for ${minutes} more minute(s)`
            );
          }
          throw new Error(data.error);
        }

        if (Array.isArray(data)) return data.map(this.normalizeMessage);
        if (data && data.messages && Array.isArray(data.messages)) {
          return data.messages.map(this.normalizeMessage);
        }
      } catch (e) {
        // Re-throw ban/mute errors so they can be shown to user
        if (e.message.startsWith("BANNED:") || e.message.startsWith("MUTED:")) {
          throw e;
        }
      }
    }
    const current = this.getLocal();
    current.push(this.normalizeMessage(msg));
    const trimmed =
      current.length > GAME_SETTINGS.CHAT_MAX_MESSAGES
        ? current.slice(current.length - GAME_SETTINGS.CHAT_MAX_MESSAGES)
        : current;
    localStorage.setItem(KEYS.CHAT, JSON.stringify(trimmed));
    return trimmed;
  },
};

// ============================================================================
// UNLOCK SERVICE
// ============================================================================

export const UnlockService = {
  /**
   * Check for theme unlocks based on stats
   * @param {Object} stats - Game stats
   * @returns {string[]} Newly unlocked theme IDs
   */
  checkThemeUnlocks(stats) {
    const newlyUnlocked = [];
    const currentUnlocked = StorageService.getUnlockedThemes();

    // Ocean: Win 5 games
    if (stats.totalWins >= 5 && !currentUnlocked.includes("ocean")) {
      newlyUnlocked.push("ocean");
    }

    // Forest: Win 10 games
    if (stats.totalWins >= 10 && !currentUnlocked.includes("forest")) {
      newlyUnlocked.push("forest");
    }

    // Sunset: Complete a Hard puzzle
    if (stats.hardWins >= 1 && !currentUnlocked.includes("sunset")) {
      newlyUnlocked.push("sunset");
    }

    // Midnight: Win with 0 mistakes
    if (stats.perfectWins >= 1 && !currentUnlocked.includes("midnight")) {
      newlyUnlocked.push("midnight");
    }

    // Sakura: Win 3 Easy puzzles
    if (stats.easyWins >= 3 && !currentUnlocked.includes("sakura")) {
      newlyUnlocked.push("sakura");
    }

    // Volcano: Win 3 Medium puzzles
    if (stats.mediumWins >= 3 && !currentUnlocked.includes("volcano")) {
      newlyUnlocked.push("volcano");
    }

    // Arctic: Win in under 3 minutes
    if (stats.fastWins >= 1 && !currentUnlocked.includes("arctic")) {
      newlyUnlocked.push("arctic");
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

    tryUnlock("funfair", stats.totalWins >= 3);
    tryUnlock("retro", stats.easyWins >= 3);
    tryUnlock("space", stats.hardWins >= 1);
    tryUnlock("nature", stats.mediumWins >= 3);
    tryUnlock("crystal", stats.perfectWins >= 1);
    tryUnlock("minimal", stats.fastWins >= 1);

    if (newlyUnlocked.length > 0) {
      const updated = [...currentUnlocked, ...newlyUnlocked];
      StorageService.saveUnlockedSoundPacks(updated);
    }

    return newlyUnlocked;
  },
};

// ============================================================================
// CONVENIENCE WRAPPER FUNCTIONS
// ============================================================================

/**
 * Get leaderboard (convenience wrapper)
 * @returns {Promise<Array>} Leaderboard entries
 */
export const getLeaderboard = () => LeaderboardService.get();

/**
 * Save score (convenience wrapper)
 * @param {Object} entry - Score entry
 */
export const saveScore = (entry) => LeaderboardService.saveScore(entry);

/**
 * Get chat messages (convenience wrapper)
 * @returns {Promise<Array>} Chat messages
 */
export const getChatMessages = () => ChatService.getMessages();

/**
 * Post chat message (convenience wrapper)
 * @param {Object} msg - Message to post
 * @returns {Promise<Array>} Updated chat messages
 */
export const postChatMessage = (msg) => ChatService.postMessage(msg);

/**
 * Check if user is authenticated (convenience wrapper)
 * @returns {boolean} Whether user is authenticated
 */
export const isUserAuthenticated = () => StorageService.isUserAuthenticated();

// ============================================================================
// BADGE SERVICE
// ============================================================================

export const BadgeService = {
  /**
   * Get user's badges from local storage
   * @returns {Array} Array of badge objects with id and awardedAt
   */
  getUserBadges() {
    const badges = localStorage.getItem("sudoku_v2_user_badges");
    try {
      return badges ? JSON.parse(badges) : [];
    } catch {
      return [];
    }
  },

  /**
   * Save user's badges to local storage
   * @param {Array} badges - Array of badge objects
   */
  saveUserBadges(badges) {
    localStorage.setItem("sudoku_v2_user_badges", JSON.stringify(badges));
  },

  /**
   * Check if user has a specific badge
   * @param {string} badgeId - Badge ID to check
   * @returns {boolean} Whether user has the badge
   */
  hasBadge(badgeId) {
    const badges = this.getUserBadges();
    return badges.some((b) => b.id === badgeId);
  },

  /**
   * Award a badge to the user
   * @param {string} badgeId - Badge ID to award
   * @returns {boolean} Whether badge was newly awarded
   */
  awardBadge(badgeId) {
    if (this.hasBadge(badgeId)) return false;

    const badges = this.getUserBadges();
    const newBadge = {
      id: badgeId,
      awardedAt: new Date().toISOString(),
    };
    badges.push(newBadge);
    this.saveUserBadges(badges);

    // If user is authenticated, also save to backend
    if (isUserAuthenticated() && isGasEnvironment()) {
      const session = StorageService.getUserSession();
      if (session && session.userId) {
        runGasFn("awardBadge", {
          userId: session.userId,
          badge: badgeId,
        }).catch((err) =>
          console.error("Failed to save badge to backend:", err)
        );
      }
    }

    return true;
  },

  /**
   * Check for newly earned badges based on game stats
   * @param {Object} stats - Game statistics
   * @param {Object} additionalContext - Additional context (time, chatCount, etc.)
   * @returns {string[]} Array of newly awarded badge IDs
   */
  checkAndAwardBadges(stats, additionalContext = {}) {
    const newlyAwarded = [];
    const { currentTime, chatMessageCount } = additionalContext;

    // Milestone badges
    if (stats.totalWins >= 1 && !this.hasBadge("first_win")) {
      if (this.awardBadge("first_win")) newlyAwarded.push("first_win");
    }
    if (stats.totalWins >= 10 && !this.hasBadge("wins_10")) {
      if (this.awardBadge("wins_10")) newlyAwarded.push("wins_10");
    }
    if (stats.totalWins >= 25 && !this.hasBadge("wins_25")) {
      if (this.awardBadge("wins_25")) newlyAwarded.push("wins_25");
    }
    if (stats.totalWins >= 50 && !this.hasBadge("wins_50")) {
      if (this.awardBadge("wins_50")) newlyAwarded.push("wins_50");
    }
    if (stats.totalWins >= 100 && !this.hasBadge("wins_100")) {
      if (this.awardBadge("wins_100")) newlyAwarded.push("wins_100");
    }

    // Difficulty badges
    if (stats.easyWins >= 20 && !this.hasBadge("easy_specialist")) {
      if (this.awardBadge("easy_specialist"))
        newlyAwarded.push("easy_specialist");
    }
    if (stats.mediumWins >= 20 && !this.hasBadge("medium_master")) {
      if (this.awardBadge("medium_master")) newlyAwarded.push("medium_master");
    }
    if (stats.hardWins >= 20 && !this.hasBadge("hard_hero")) {
      if (this.awardBadge("hard_hero")) newlyAwarded.push("hard_hero");
    }

    // Achievement badges
    if (stats.perfectWins >= 1 && !this.hasBadge("perfect_game")) {
      if (this.awardBadge("perfect_game")) newlyAwarded.push("perfect_game");
    }
    if (stats.perfectWins >= 5 && !this.hasBadge("perfect_5")) {
      if (this.awardBadge("perfect_5")) newlyAwarded.push("perfect_5");
    }
    if (stats.fastWins >= 1 && !this.hasBadge("speed_demon")) {
      if (this.awardBadge("speed_demon")) newlyAwarded.push("speed_demon");
    }
    if (stats.fastWins >= 10 && !this.hasBadge("lightning_fast")) {
      if (this.awardBadge("lightning_fast"))
        newlyAwarded.push("lightning_fast");
    }

    // Special time-based badges
    if (currentTime) {
      const hour = currentTime.getHours();
      if (hour < 8 && !this.hasBadge("early_bird")) {
        if (this.awardBadge("early_bird")) newlyAwarded.push("early_bird");
      }
      if (hour >= 0 && hour < 6 && !this.hasBadge("night_owl")) {
        if (this.awardBadge("night_owl")) newlyAwarded.push("night_owl");
      }
    }

    // Chat badge
    if (chatMessageCount >= 50 && !this.hasBadge("social_butterfly")) {
      if (this.awardBadge("social_butterfly"))
        newlyAwarded.push("social_butterfly");
    }

    // Collection badges
    const unlockedThemes = StorageService.getUnlockedThemes();
    const allThemes = Object.keys(THEMES);
    if (
      unlockedThemes.length >= allThemes.length &&
      !this.hasBadge("theme_collector")
    ) {
      if (this.awardBadge("theme_collector"))
        newlyAwarded.push("theme_collector");
    }

    const unlockedPacks = StorageService.getUnlockedSoundPacks();
    const allPacks = Object.keys(SOUND_PACKS);
    if (
      unlockedPacks.length >= allPacks.length &&
      !this.hasBadge("sound_collector")
    ) {
      if (this.awardBadge("sound_collector"))
        newlyAwarded.push("sound_collector");
    }

    // Completionist badge (has all other badges)
    const allBadgeIds = Object.keys(BADGES).filter(
      (id) => id !== "completionist"
    );
    const userBadges = this.getUserBadges();
    if (
      allBadgeIds.every((id) => userBadges.some((b) => b.id === id)) &&
      !this.hasBadge("completionist")
    ) {
      if (this.awardBadge("completionist")) newlyAwarded.push("completionist");
    }

    return newlyAwarded;
  },

  /**
   * Sync local badges with backend for authenticated users
   */
  async syncBadgesWithBackend() {
    if (!isUserAuthenticated() || !isGasEnvironment()) return;

    const session = StorageService.getUserSession();
    if (!session || !session.userId) return;

    try {
      // Get badges from backend
      const result = await runGasFn("getUserBadges", {
        userId: session.userId,
      });
      if (result && result.success) {
        const backendBadges = result.badges || [];
        const localBadges = this.getUserBadges();

        // Merge: use backend badges as source of truth, but keep any local-only badges
        const merged = [...backendBadges];
        localBadges.forEach((local) => {
          if (!merged.some((b) => b.id === local.id)) {
            merged.push(local);
            // Also save this local badge to backend
            runGasFn("awardBadge", {
              userId: session.userId,
              badge: local.id,
            }).catch((err) =>
              console.error("Failed to sync badge to backend:", err)
            );
          }
        });

        this.saveUserBadges(merged);
      }
    } catch (err) {
      console.error("Failed to sync badges:", err);
    }
  },
};

// Make services available globally

// Convenience wrappers
