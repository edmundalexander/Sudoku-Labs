// ============================================================================
// Admin Endpoints for Sudoku-Labs Backend
// ============================================================================
//
// Add these functions to your Code.gs file to enable admin functionality.
// These endpoints provide secure administrative access to manage users,
// chat, and game data.
//
// SECURITY NOTES:
// 1. Store admin credentials in Script Properties (File → Project Properties → Script Properties)
// 2. Add properties: ADMIN_USERNAME and ADMIN_PASSWORD_HASH
// 3. Generate password hash with SHA-256: https://emn178.github.io/online-tools/sha256.html
// 4. Session tokens expire after 30 minutes
//
// Add these to your doGet() switch statement:
//
// case 'adminLogin':
//   return makeJsonResponse(adminLogin(e.parameter));
// case 'getAdminStats':
//   return makeJsonResponse(getAdminStats(e.parameter));
// case 'getAdminChatHistory':
//   return makeJsonResponse(getAdminChatHistory(e.parameter));
// case 'getAdminUsers':
//   return makeJsonResponse(getAdminUsers(e.parameter));
// case 'deleteMessages':
//   return makeJsonResponse(deleteMessages(e.parameter));
// case 'banUser':
//   return makeJsonResponse(banUser(e.parameter));
// case 'unbanUser':
//   return makeJsonResponse(unbanUser(e.parameter));
// case 'muteUser':
//   return makeJsonResponse(muteUser(e.parameter));
// case 'updateUserStats':
//   return makeJsonResponse(updateUserStats(e.parameter));
// case 'clearAllChat':
//   return makeJsonResponse(clearAllChat(e.parameter));
//
// ============================================================================

// Admin session tokens (in-memory storage, expires with script restart or 30 min timeout)
const ADMIN_SESSIONS = {};
const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Verify admin session token
 */
function verifyAdminToken_(token) {
  if (!token || !ADMIN_SESSIONS[token]) {
    return false;
  }

  const session = ADMIN_SESSIONS[token];
  if (Date.now() > session.expiry) {
    delete ADMIN_SESSIONS[token];
    return false;
  }

  return true;
}

/**
 * Admin login - generates a one-time session token
 */
function adminLogin(params) {
  const username = params.username;
  const passwordHash = params.passwordHash;

  if (!username || !passwordHash) {
    return { success: false, error: "Missing credentials" };
  }

  // Get admin credentials from Script Properties
  const scriptProperties = PropertiesService.getScriptProperties();
  const adminUsername = scriptProperties.getProperty("ADMIN_USERNAME");
  const adminPasswordHash = scriptProperties.getProperty("ADMIN_PASSWORD_HASH");

  if (!adminUsername || !adminPasswordHash) {
    return {
      success: false,
      error: "Admin credentials not configured in Script Properties",
    };
  }

  // Verify credentials
  if (username !== adminUsername || passwordHash !== adminPasswordHash) {
    return { success: false, error: "Invalid credentials" };
  }

  // Generate session token
  const token = Utilities.getUuid();
  ADMIN_SESSIONS[token] = {
    username: username,
    createdAt: Date.now(),
    expiry: Date.now() + ADMIN_SESSION_TIMEOUT,
  };

  return { success: true, token: token };
}

/**
 * Get system statistics
 */
function getAdminStats(params) {
  if (!verifyAdminToken_(params.token)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // Get user count
    const usersSheet = ss.getSheetByName("Users");
    const totalUsers = usersSheet
      ? Math.max(0, usersSheet.getLastRow() - 1)
      : 0;

    // Get chat message count
    const chatSheet = ss.getSheetByName("Chat");
    const totalChatMessages = chatSheet
      ? Math.max(0, chatSheet.getLastRow() - 1)
      : 0;

    // Get leaderboard entries (games played)
    const leaderboardSheet = ss.getSheetByName("Leaderboard");
    const totalGames = leaderboardSheet
      ? Math.max(0, leaderboardSheet.getLastRow() - 1)
      : 0;

    // Calculate active users (last 24h) - approximate from recent scores
    let activeUsers24h = 0;
    if (leaderboardSheet && leaderboardSheet.getLastRow() > 1) {
      const data = leaderboardSheet
        .getRange(2, 1, leaderboardSheet.getLastRow() - 1, 4)
        .getValues();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentUsers = new Set();

      data.forEach((row) => {
        const dateStr = row[3]; // date column
        try {
          const rowDate = new Date(dateStr);
          if (rowDate >= yesterday) {
            recentUsers.add(row[0]); // userId
          }
        } catch (e) {}
      });

      activeUsers24h = recentUsers.size;
    }

    return {
      success: true,
      stats: {
        totalUsers: totalUsers,
        totalGames: totalGames,
        totalChatMessages: totalChatMessages,
        activeUsers24h: activeUsers24h,
      },
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Get full chat history with metadata
 */
function getAdminChatHistory(params) {
  if (!verifyAdminToken_(params.token)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const chatSheet = ss.getSheetByName("Chat");

    if (!chatSheet || chatSheet.getLastRow() <= 1) {
      return { success: true, messages: [] };
    }

    const data = chatSheet
      .getRange(2, 1, chatSheet.getLastRow() - 1, 5)
      .getValues();
    const messages = data.map((row) => ({
      id: row[0],
      sender: sanitizeOutput_(row[1]),
      text: sanitizeOutput_(row[2]),
      timestamp: row[3],
      status: row[4] || "",
    }));

    return { success: true, messages: messages };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Get all users with stats
 */
function getAdminUsers(params) {
  if (!verifyAdminToken_(params.token)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const usersSheet = ss.getSheetByName("Users");

    if (!usersSheet || usersSheet.getLastRow() <= 1) {
      return { success: true, users: [], bannedUsers: [], mutedUsers: [] };
    }

    // Get user data (username, userId, email, totalGames, totalWins, etc.)
    const lastRow = usersSheet.getLastRow();
    const data = usersSheet.getRange(2, 1, lastRow - 1, 15).getValues();

    const users = data.map((row) => ({
      username: sanitizeOutput_(row[0]),
      userId: sanitizeOutput_(row[1]),
      email: sanitizeOutput_(row[3]) || "",
      totalGames: row[8] || 0,
      totalWins: row[9] || 0,
      easyWins: row[10] || 0,
      mediumWins: row[11] || 0,
      hardWins: row[12] || 0,
      perfectWins: row[13] || 0,
      fastWins: row[14] || 0,
      banned: row[7] || false,
      muted: row[6] || false,
    }));

    const bannedUsers = users.filter((u) => u.banned).map((u) => u.username);
    const mutedUsers = users.filter((u) => u.muted).map((u) => u.username);

    return {
      success: true,
      users: users,
      bannedUsers: bannedUsers,
      mutedUsers: mutedUsers,
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Delete chat messages by IDs
 */
function deleteMessages(params) {
  if (!verifyAdminToken_(params.token)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const messageIds = params.messageIds ? params.messageIds.split(",") : [];
    if (messageIds.length === 0) {
      return { success: false, error: "No message IDs provided" };
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const chatSheet = ss.getSheetByName("Chat");

    if (!chatSheet) {
      return { success: false, error: "Chat sheet not found" };
    }

    const data = chatSheet
      .getRange(2, 1, chatSheet.getLastRow() - 1, 5)
      .getValues();
    const rowsToDelete = [];

    data.forEach((row, index) => {
      if (messageIds.includes(String(row[0]))) {
        rowsToDelete.push(index + 2); // +2 for header and 0-based index
      }
    });

    // Delete rows in reverse order to maintain indices
    rowsToDelete
      .sort((a, b) => b - a)
      .forEach((rowNum) => {
        chatSheet.deleteRow(rowNum);
      });

    return { success: true, deleted: rowsToDelete.length };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Ban a user
 */
function banUser(params) {
  if (!verifyAdminToken_(params.token)) {
    return { success: false, error: "Unauthorized" };
  }

  const username = params.username;
  if (!username) {
    return { success: false, error: "Username required" };
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const usersSheet = ss.getSheetByName("Users");

    if (!usersSheet) {
      return { success: false, error: "Users sheet not found" };
    }

    const data = usersSheet
      .getRange(2, 1, usersSheet.getLastRow() - 1, 8)
      .getValues();

    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === username) {
        usersSheet.getRange(i + 2, 8).setValue(true); // Set banned flag
        return { success: true };
      }
    }

    return { success: false, error: "User not found" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Unban a user
 */
function unbanUser(params) {
  if (!verifyAdminToken_(params.token)) {
    return { success: false, error: "Unauthorized" };
  }

  const username = params.username;
  if (!username) {
    return { success: false, error: "Username required" };
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const usersSheet = ss.getSheetByName("Users");

    if (!usersSheet) {
      return { success: false, error: "Users sheet not found" };
    }

    const data = usersSheet
      .getRange(2, 1, usersSheet.getLastRow() - 1, 8)
      .getValues();

    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === username) {
        usersSheet.getRange(i + 2, 8).setValue(false); // Clear banned flag
        return { success: true };
      }
    }

    return { success: false, error: "User not found" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Mute a user for a duration
 */
function muteUser(params) {
  if (!verifyAdminToken_(params.token)) {
    return { success: false, error: "Unauthorized" };
  }

  const username = params.username;
  const duration = parseInt(params.duration) || 3600000; // Default 1 hour

  if (!username) {
    return { success: false, error: "Username required" };
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const usersSheet = ss.getSheetByName("Users");

    if (!usersSheet) {
      return { success: false, error: "Users sheet not found" };
    }

    const muteUntil = Date.now() + duration;
    const data = usersSheet
      .getRange(2, 1, usersSheet.getLastRow() - 1, 7)
      .getValues();

    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === username) {
        usersSheet.getRange(i + 2, 7).setValue(muteUntil); // Set mute expiry timestamp
        return { success: true, muteUntil: muteUntil };
      }
    }

    return { success: false, error: "User not found" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Update user statistics
 */
function updateUserStats(params) {
  if (!verifyAdminToken_(params.token)) {
    return { success: false, error: "Unauthorized" };
  }

  const username = params.username;
  if (!username) {
    return { success: false, error: "Username required" };
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const usersSheet = ss.getSheetByName("Users");

    if (!usersSheet) {
      return { success: false, error: "Users sheet not found" };
    }

    const data = usersSheet
      .getRange(2, 1, usersSheet.getLastRow() - 1, 15)
      .getValues();

    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === username) {
        const row = i + 2;

        // Update stats (columns 9-15)
        if (params.totalGames)
          usersSheet.getRange(row, 9).setValue(parseInt(params.totalGames));
        if (params.totalWins)
          usersSheet.getRange(row, 10).setValue(parseInt(params.totalWins));
        if (params.easyWins)
          usersSheet.getRange(row, 11).setValue(parseInt(params.easyWins));
        if (params.mediumWins)
          usersSheet.getRange(row, 12).setValue(parseInt(params.mediumWins));
        if (params.hardWins)
          usersSheet.getRange(row, 13).setValue(parseInt(params.hardWins));
        if (params.perfectWins)
          usersSheet.getRange(row, 14).setValue(parseInt(params.perfectWins));
        if (params.fastWins)
          usersSheet.getRange(row, 15).setValue(parseInt(params.fastWins));

        // Also update GameStats JSON column (col 17 if present)
        var gameStatsCol = 17; // 17th column (Q) is GameStats if sheet matches default
        var gameStats = {};
        // Build gameStats object from provided params (only include if present)
        if (params.totalGames)
          gameStats.totalGames = parseInt(params.totalGames);
        if (params.totalWins) gameStats.totalWins = parseInt(params.totalWins);
        if (params.easyWins) gameStats.easyWins = parseInt(params.easyWins);
        if (params.mediumWins)
          gameStats.mediumWins = parseInt(params.mediumWins);
        if (params.hardWins) gameStats.hardWins = parseInt(params.hardWins);
        if (params.perfectWins)
          gameStats.perfectWins = parseInt(params.perfectWins);
        if (params.fastWins) gameStats.fastWins = parseInt(params.fastWins);
        // Only update if at least one stat is present
        if (
          Object.keys(gameStats).length > 0 &&
          usersSheet.getLastColumn() >= gameStatsCol
        ) {
          usersSheet
            .getRange(row, gameStatsCol)
            .setValue(JSON.stringify(gameStats));
        }

        return { success: true };
      }
    }

    return { success: false, error: "User not found" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Clear all chat messages
 */
function clearAllChat(params) {
  if (!verifyAdminToken_(params.token)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const chatSheet = ss.getSheetByName("Chat");

    if (!chatSheet) {
      return { success: false, error: "Chat sheet not found" };
    }

    // Keep header, delete all data rows
    if (chatSheet.getLastRow() > 1) {
      chatSheet.deleteRows(2, chatSheet.getLastRow() - 1);
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}
