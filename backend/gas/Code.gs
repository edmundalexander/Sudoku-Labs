// ============================================================================
// Sudoku-Labs: Google Apps Script Backend API
// ============================================================================
//
// REST API backend for the Sudoku Logic Lab game.
// Frontend is hosted on GitHub Pages; this script provides data persistence
// and game generation via Google Sheets.
//
// DEPLOYMENT REQUIREMENTS:
// 1. Deploy as "Web App"
// 2. Execute as: Your email address (the account that owns the Sheet)
// 3. Who has access: "Anyone" (CRITICAL - must be set to "Anyone")
// 4. After deploying, copy the deployment URL
// 5. Update frontend config/config.local.js GAS_URL to match deployment URL
//
// SHEETS STRUCTURE:
// - Leaderboard: userId, difficulty, time, date
// - Chat: id, sender, text, timestamp, status
// - Logs: type, message, userAgent, timestamp, count
// - Users: username, userId, passwordHash, email, avatarId, bio, createdAt
// - UserState: userId, stateJson, lastUpdated
//
// @version 2.2.0
// ============================================================================

// Prefer a Script Property for the sheet id (safer for deployments). Falls back to the hardcoded id.
const SHEET_ID = (function () {
  try {
    const prop =
      PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    if (prop && prop.trim()) return prop.trim();
  } catch (e) {
    // PropertiesService may not be available in some execution contexts
  }
  return "1QU6QNWy6w6CNivq-PvmVJNcM1tUFWgQFzpN01Mo7QFs";
})();

// ============================================================================
// API ROUTER - All requests route through doGet and doPost
// ============================================================================

function doGet(e) {
  const action =
    e && e.parameter && e.parameter.action ? e.parameter.action : "";

  try {
    switch (action) {
      case "generateSudoku":
        const difficulty = e.parameter.difficulty || "Easy";
        return makeJsonResponse(generateSudoku(difficulty));

      case "getLeaderboard":
        return makeJsonResponse(getLeaderboardData());

      case "getChat":
        return makeJsonResponse(getChatData());

      case "saveScore":
        // Handle saveScore via GET to avoid POST redirect issues
        return makeJsonResponse(saveLeaderboardScore(e.parameter));

      case "postChat":
        // Handle postChat via GET to avoid POST redirect issues
        return makeJsonResponse(postChatData(e.parameter));

      case "logError":
        // Handle logError via GET to avoid POST redirect issues
        return makeJsonResponse(logClientError(e.parameter));

      case "ping":
        return makeJsonResponse({
          ok: true,
          timestamp: new Date().toISOString(),
        });

      case "register":
        return makeJsonResponse(registerUser(e.parameter));

      case "login":
        return makeJsonResponse(loginUser(e.parameter));

      case "getUserProfile":
        return makeJsonResponse(getUserProfile(e.parameter));

      case "updateUserProfile":
        return makeJsonResponse(updateUserProfile(e.parameter));

      case "getUserState":
        return makeJsonResponse(getUserState(e.parameter));

      case "saveUserState":
        return makeJsonResponse(saveUserState(e.parameter));

      case "getUserBadges":
        return makeJsonResponse(getUserBadges(e.parameter));

      case "awardBadge":
        return makeJsonResponse(awardBadge(e.parameter));

      // Admin endpoints
      case "adminLogin":
        return makeJsonResponse(adminLogin(e.parameter));

      case "getAdminStats":
        return makeJsonResponse(getAdminStats(e.parameter));

      case "getAdminChatHistory":
        return makeJsonResponse(getAdminChatHistory(e.parameter));

      case "getAdminUsers":
        return makeJsonResponse(getAdminUsers(e.parameter));

      case "deleteMessages":
        return makeJsonResponse(deleteMessages(e.parameter));

      case "banUser":
        return makeJsonResponse(banUser(e.parameter));

      case "unbanUser":
        return makeJsonResponse(unbanUser(e.parameter));

      case "muteUser":
        return makeJsonResponse(muteUser(e.parameter));

      case "updateUserStats":
        return makeJsonResponse(updateUserStats(e.parameter));

      case "clearAllChat":
        return makeJsonResponse(clearAllChat(e.parameter));

      case "performMaintenance":
        // Admin-protected maintenance trigger. Requires `token` param matching
        // the Script Property `ADMIN_TRIGGER_TOKEN` to run.
        return makeJsonResponse(runPerformMaintenance_(e.parameter));

      default:
        return makeJsonResponse({ error: "Unknown action: " + action });
    }
  } catch (err) {
    Logger.log("doGet error: " + err);
    return makeJsonResponse({ error: "Server error: " + err.toString() });
  }
}

function doPost(e) {
  const action =
    e && e.parameter && e.parameter.action ? e.parameter.action : "";
  let data = {};

  try {
    if (e.postData && e.postData.contents) {
      // Try JSON first, then fall back to form-urlencoded parsing
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        try {
          // parse application/x-www-form-urlencoded (key1=val1&key2=val2)
          const contents = e.postData.contents || "";
          const parts = contents.split("&");
          const obj = {};
          parts.forEach((p) => {
            if (!p) return;
            const kv = p.split("=");
            const k = decodeURIComponent(kv[0] || "").trim();
            const v = decodeURIComponent(kv.slice(1).join("=") || "").trim();
            if (k) obj[k] = v;
          });
          data = obj;
        } catch (formErr) {
          return makeJsonResponse({ error: "Invalid request body" });
        }
      }
    }
  } catch (parseErr) {
    return makeJsonResponse({ error: "Invalid request body" });
  }

  try {
    switch (action) {
      case "saveScore":
        return makeJsonResponse(saveLeaderboardScore(data));

      case "postChat":
        return makeJsonResponse(postChatData(data));

      case "logError":
        return makeJsonResponse(logClientError(data));

      default:
        return makeJsonResponse({ error: "Unknown action: " + action });
    }
  } catch (err) {
    Logger.log("doPost error: " + err);
    return makeJsonResponse({ error: "Server error: " + err.toString() });
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
    const sheet = getSpreadsheet_().getSheetByName("Leaderboard");
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // only header

    return data
      .slice(1)
      .map((row) => ({
        name: sanitizeOutput_(row[0]),
        time: Number(row[1]) || 0,
        difficulty: sanitizeOutput_(row[2]),
        date: sanitizeOutput_(row[3]),
      }))
      .filter((r) => r.name && r.time > 0);
  } catch (err) {
    Logger.log("getLeaderboardData error: " + err);
    return [];
  }
}

function saveLeaderboardScore(entry) {
  if (!entry || typeof entry !== "object") {
    return getLeaderboardData();
  }

  // Validate
  const validDiffs = ["Easy", "Medium", "Hard", "Daily"];
  if (
    typeof entry.time !== "number" ||
    !validDiffs.includes(entry.difficulty)
  ) {
    return getLeaderboardData();
  }

  // Sanitize
  const safeName = sanitizeInput_(entry.name || "Anonymous", 20);
  const safeTime = Number(entry.time);
  const safeDiff = sanitizeInput_(entry.difficulty, 10);
  const safeDate = sanitizeInput_(entry.date || new Date().toISOString(), 20);

  try {
    const sheet = getSpreadsheet_().getSheetByName("Leaderboard");
    if (sheet) {
      sheet.appendRow([safeName, safeTime, safeDiff, safeDate]);
    }
  } catch (err) {
    Logger.log("saveLeaderboardScore error: " + err);
  }

  return getLeaderboardData();
}

// ============================================================================
// CHAT ENDPOINTS
// ============================================================================

function getChatData() {
  try {
    const sheet = getSpreadsheet_().getSheetByName("Chat");
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    // Return last 50 messages
    return data
      .slice(1)
      .slice(-50)
      .map((row) => ({
        id: sanitizeOutput_(row[0]),
        sender: sanitizeOutput_(row[1]),
        text: sanitizeOutput_(row[2]),
        timestamp: row[3] ? new Date(row[3]).getTime() : Date.now(),
        status: sanitizeOutput_(row[4] || ""),
      }));
  } catch (err) {
    Logger.log("getChatData error: " + err);
    return [];
  }
}

function postChatData(msg) {
  if (!msg || typeof msg !== "object") {
    return getChatData();
  }

  if (!msg.text || typeof msg.text !== "string" || msg.text.trim() === "") {
    return getChatData();
  }

  // Sanitize
  const safeSender = sanitizeInput_(msg.sender || "User", 20);
  const safeText = sanitizeInput_(msg.text, 140);
  const safeId = sanitizeInput_(msg.id || "", 50);
  const safeStatus = sanitizeInput_(msg.status || "", 50);

  // Check if user is banned or muted
  const userStatus = checkUserStatus_(safeSender);
  if (userStatus.banned) {
    return {
      error: "You have been banned from chat",
      banned: true,
      messages: getChatData(),
    };
  }

  if (userStatus.muted) {
    const muteMinutes = Math.ceil((userStatus.muteUntil - Date.now()) / 60000);
    return {
      error: `You are muted for ${muteMinutes} more minute(s)`,
      muted: true,
      muteUntil: userStatus.muteUntil,
      messages: getChatData(),
    };
  }

  const timestamp = new Date().toISOString();

  try {
    const sheet = getSpreadsheet_().getSheetByName("Chat");
    if (sheet) {
      sheet.appendRow([safeId, safeSender, safeText, timestamp, safeStatus]);
    }
  } catch (err) {
    Logger.log("postChatData error: " + err);
  }

  return getChatData();
}

// ============================================================================
// LOGGING ENDPOINT
// ============================================================================

function logClientError(entry) {
  if (!entry || typeof entry !== "object") {
    return { logged: false };
  }

  try {
    const sheet = getSpreadsheet_().getSheetByName("Logs");
    if (sheet) {
      const safeType = sanitizeInput_(entry.type || "error", 20);
      const safeMsg = sanitizeInput_(entry.message || "", 200);
      const safeAgent = sanitizeInput_(entry.userAgent || "", 100);
      const safeCount = Number(entry.count) || 1;

      sheet.appendRow([
        new Date().toISOString(),
        safeType,
        safeMsg,
        safeAgent,
        safeCount,
      ]);
    }
    return { logged: true };
  } catch (err) {
    Logger.log("logClientError error: " + err);
    return { logged: false };
  }
}

// ============================================================================
// USER AUTHENTICATION ENDPOINTS
// ============================================================================

function registerUser(data) {
  if (!data || typeof data !== "object") {
    return { success: false, error: "Invalid request data" };
  }

  ensureUsersSheetHeaders_();

  const username = sanitizeInput_(data.username || "", 20).trim();
  const password = sanitizeInput_(data.password || "", 100);

  // Validate inputs
  if (username.length < 3) {
    return { success: false, error: "Username must be at least 3 characters" };
  }

  if (username.length > 20) {
    return { success: false, error: "Username must be 20 characters or less" };
  }

  // Only allow alphanumeric characters and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      success: false,
      error: "Username can only contain letters, numbers, and underscores",
    };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  if (password.length > 100) {
    return { success: false, error: "Password must be 100 characters or less" };
  }

  try {
    const sheet = getSpreadsheet_().getSheetByName("Users");
    if (!sheet) {
      return { success: false, error: "Users sheet not found" };
    }

    // Check if username already exists (case-insensitive)
    const sheetData = sheet.getDataRange().getValues();
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][1].toLowerCase() === username.toLowerCase()) {
        return { success: false, error: "Username already exists" };
      }
    }

    // Create simple hash (NOT secure for production - for demo purposes only)
    const passwordHash = simpleHash_(password);
    const userId =
      "user_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000);
    const createdAt = new Date().toISOString();

    // Create new user row with all columns in order:
    // UserID | Username | PasswordHash | CreatedAt | DisplayName | TotalGames | TotalWins |
    // EasyWins | MediumWins | HardWins | PerfectWins | FastWins |
    // UnlockedThemes | ActiveTheme | UnlockedSoundPacks | ActiveSoundPack | GameStats | Badges | Unlocks
    const newUserRow = [
      userId, // UserID
      username, // Username
      passwordHash, // PasswordHash
      createdAt, // CreatedAt
      username, // DisplayName (defaults to username)
      0, // TotalGames
      0, // TotalWins
      0, // EasyWins
      0, // MediumWins
      0, // HardWins
      0, // PerfectWins
      0, // FastWins
      "", // UnlockedThemes (empty array as string)
      "default", // ActiveTheme
      "", // UnlockedSoundPacks (empty array as string)
      "classic", // ActiveSoundPack
      "{}", // GameStats (empty object as JSON string)
      "[]", // Badges (empty array as JSON string)
      "{}", // Unlocks (empty object as JSON string)
    ];
    sheet.appendRow(newUserRow);

    return {
      success: true,
      user: {
        userId: userId,
        username: username,
        displayName: username,
        totalGames: 0,
        totalWins: 0,
        easyWins: 0,
        mediumWins: 0,
        hardWins: 0,
        perfectWins: 0,
        fastWins: 0,
        createdAt: createdAt,
      },
    };
  } catch (err) {
    Logger.log("registerUser error: " + err);
    return { success: false, error: "Registration failed" };
  }
}

function loginUser(data) {
  if (!data || typeof data !== "object") {
    return { success: false, error: "Invalid request data" };
  }

  ensureUsersSheetHeaders_();

  const username = sanitizeInput_(data.username || "", 20);
  const password = sanitizeInput_(data.password || "", 100);

  if (!username || !password) {
    return { success: false, error: "Username and password required" };
  }

  try {
    const sheet = getSpreadsheet_().getSheetByName("Users");
    if (!sheet) {
      return { success: false, error: "Users sheet not found" };
    }

    const sheetData = sheet.getDataRange().getValues();
    const passwordHash = simpleHash_(password);

    // Search for user (case-insensitive username match)
    for (let i = 1; i < sheetData.length; i++) {
      if (
        sheetData[i][1].toLowerCase() === username.toLowerCase() &&
        sheetData[i][2] === passwordHash
      ) {
        return {
          success: true,
          user: {
            userId: sheetData[i][0],
            username: sheetData[i][1],
            displayName: sheetData[i][4] || sheetData[i][1],
            totalGames: Number(sheetData[i][5]) || 0,
            totalWins: Number(sheetData[i][6]) || 0,
            easyWins: Number(sheetData[i][7]) || 0,
            mediumWins: Number(sheetData[i][8]) || 0,
            hardWins: Number(sheetData[i][9]) || 0,
            perfectWins: Number(sheetData[i][10]) || 0,
            fastWins: Number(sheetData[i][11]) || 0,
            createdAt: sheetData[i][3],
          },
        };
      }
    }

    return { success: false, error: "Invalid username or password" };
  } catch (err) {
    Logger.log("loginUser error: " + err);
    return { success: false, error: "Login failed" };
  }
}

function getUserProfile(data) {
  if (!data || !data.userId) {
    return { success: false, error: "User ID required" };
  }

  ensureUsersSheetHeaders_();

  const userId = sanitizeInput_(data.userId, 50);

  try {
    // Try to find by UserID first, then by Username (case-insensitive)
    let rowInfo = getUserRowById_(userId);
    if (!rowInfo) {
      rowInfo = getUserRowByUsername_(userId);
    }

    if (!rowInfo) {
      return { success: false, error: "User not found" };
    }

    const { row, map } = rowInfo;

    return {
      success: true,
      user: {
        userId: row[map["UserID"]],
        username: row[map["Username"]],
        displayName: row[map["DisplayName"]] || row[map["Username"]],
        totalGames: Number(row[map["TotalGames"]]) || 0,
        totalWins: Number(row[map["TotalWins"]]) || 0,
        easyWins: Number(row[map["EasyWins"]]) || 0,
        mediumWins: Number(row[map["MediumWins"]]) || 0,
        hardWins: Number(row[map["HardWins"]]) || 0,
        perfectWins: Number(row[map["PerfectWins"]]) || 0,
        fastWins: Number(row[map["FastWins"]]) || 0,
        createdAt: row[map["CreatedAt"]],
      },
    };
  } catch (err) {
    Logger.log("getUserProfile error: " + err);
    return { success: false, error: "Failed to get profile" };
  }
}

function updateUserProfile(data) {
  if (!data || !data.userId) {
    return { success: false, error: "User ID required" };
  }

  ensureUsersSheetHeaders_();

  const userId = sanitizeInput_(data.userId, 50);
  const displayName = data.displayName
    ? sanitizeInput_(data.displayName, 30)
    : null;
  // Handle both boolean true and string "true" (GET params come as strings)
  const incrementGames =
    data.incrementGames === true || data.incrementGames === "true";
  const incrementWins =
    data.incrementWins === true || data.incrementWins === "true";
  const difficulty = data.difficulty
    ? sanitizeInput_(data.difficulty, 10)
    : null;
  const perfectWin = data.perfectWin === true || data.perfectWin === "true";
  const fastWin = data.fastWin === true || data.fastWin === "true";

  try {
    const sheet = getSpreadsheet_().getSheetByName("Users");
    if (!sheet) {
      return { success: false, error: "Users sheet not found" };
    }

    const rowInfo = getUserRowById_(userId);
    if (!rowInfo) return { success: false, error: "User not found" };

    const { row, map } = rowInfo;
    const sheetRow =
      row.__index__ ||
      sheet
        .getDataRange()
        .getValues()
        .findIndex((r) => r[0] === userId) + 1;

    // Update display name if provided
    if (displayName) {
      sheet.getRange(sheetRow, map["DisplayName"] + 1).setValue(displayName);
    }

    // Track stat changes for GameStats JSON
    let statsChanged = false;
    let newStats = {};

    // Increment game counter if requested
    if (incrementGames) {
      const currentGames = Number(row[map["TotalGames"]]) || 0;
      const newGames = currentGames + 1;
      sheet.getRange(sheetRow, map["TotalGames"] + 1).setValue(newGames);
      newStats.totalGames = newGames;
      statsChanged = true;
    }

    // Increment win counters
    if (incrementWins) {
      // Increment total wins
      const currentWins = Number(row[map["TotalWins"]]) || 0;
      const newWins = currentWins + 1;
      sheet.getRange(sheetRow, map["TotalWins"] + 1).setValue(newWins);
      newStats.totalWins = newWins;
      statsChanged = true;

      // Increment difficulty-specific wins
      if (difficulty === "Easy") {
        const easyWins = Number(row[map["EasyWins"]]) || 0;
        const newEasy = easyWins + 1;
        sheet.getRange(sheetRow, map["EasyWins"] + 1).setValue(newEasy);
        newStats.easyWins = newEasy;
      } else if (difficulty === "Medium") {
        const mediumWins = Number(row[map["MediumWins"]]) || 0;
        const newMedium = mediumWins + 1;
        sheet.getRange(sheetRow, map["MediumWins"] + 1).setValue(newMedium);
        newStats.mediumWins = newMedium;
      } else if (difficulty === "Hard") {
        const hardWins = Number(row[map["HardWins"]]) || 0;
        const newHard = hardWins + 1;
        sheet.getRange(sheetRow, map["HardWins"] + 1).setValue(newHard);
        newStats.hardWins = newHard;
      }

      // Increment perfect wins if applicable
      if (perfectWin) {
        const perfectWins = Number(row[map["PerfectWins"]]) || 0;
        const newPerfect = perfectWins + 1;
        sheet.getRange(sheetRow, map["PerfectWins"] + 1).setValue(newPerfect);
        newStats.perfectWins = newPerfect;
      }

      // Increment fast wins if applicable
      if (fastWin) {
        const fastWins = Number(row[map["FastWins"]]) || 0;
        const newFast = fastWins + 1;
        sheet.getRange(sheetRow, map["FastWins"] + 1).setValue(newFast);
        newStats.fastWins = newFast;
      }
    }

    // Update GameStats JSON column if any stat changed
    if (statsChanged && map["GameStats"] !== undefined) {
      // Merge with existing GameStats if present
      let gameStats = {};
      try {
        gameStats = JSON.parse(row[map["GameStats"]] || "{}");
      } catch (e) {}
      Object.assign(gameStats, newStats);
      sheet
        .getRange(sheetRow, map["GameStats"] + 1)
        .setValue(JSON.stringify(gameStats).substring(0, 2000));
    }

    return { success: true };
  } catch (err) {
    Logger.log("updateUserProfile error: " + err);
    return { success: false, error: "Failed to update profile" };
  }
}

// Persist and retrieve per-user cosmetic/unlock state
// Unlocks column stores JSON: { unlockedThemes: string[], unlockedSoundPacks: string[] }
// GameStats column stores JSON as used by frontend for unlock logic
function getUserState(data) {
  if (!data || !data.userId) {
    return { success: false, error: "User ID required" };
  }

  const userId = sanitizeInput_(data.userId, 50);
  ensureUsersSheetHeaders_();

  const rowInfo = getUserRowById_(userId);
  if (!rowInfo) return { success: false, error: "User not found" };

  const { row, map } = rowInfo;
  const unlocksRaw = row[map["Unlocks"]] || "";
  const gameStatsRaw = row[map["GameStats"]] || "";

  const unlocks = safeParseJson_(unlocksRaw, {
    unlockedThemes: [],
    unlockedSoundPacks: [],
  });
  const gameStats = safeParseJson_(gameStatsRaw, {});

  return {
    success: true,
    state: {
      unlockedThemes: Array.isArray(unlocks.unlockedThemes)
        ? unlocks.unlockedThemes
        : [],
      unlockedSoundPacks: Array.isArray(unlocks.unlockedSoundPacks)
        ? unlocks.unlockedSoundPacks
        : [],
      activeTheme: row[map["ActiveTheme"]] || null,
      activeSoundPack: row[map["ActiveSoundPack"]] || null,
      gameStats: gameStats && typeof gameStats === "object" ? gameStats : {},
    },
  };
}

function saveUserState(data) {
  if (!data || !data.userId) {
    return { success: false, error: "User ID required" };
  }

  const userId = sanitizeInput_(data.userId, 50);
  ensureUsersSheetHeaders_();

  const rowInfo = getUserRowById_(userId);
  if (!rowInfo) return { success: false, error: "User not found" };

  const { rowIndex, map, sheet } = rowInfo;

  const unlockedThemes = Array.isArray(data.unlockedThemes)
    ? data.unlockedThemes
    : safeParseJson_(data.unlockedThemes, []);
  const unlockedSoundPacks = Array.isArray(data.unlockedSoundPacks)
    ? data.unlockedSoundPacks
    : safeParseJson_(data.unlockedSoundPacks, []);
  const activeTheme = data.activeTheme
    ? sanitizeInput_(data.activeTheme, 30)
    : null;
  const activeSoundPack = data.activeSoundPack
    ? sanitizeInput_(data.activeSoundPack, 30)
    : null;
  const gameStats =
    typeof data.gameStats === "string"
      ? safeParseJson_(data.gameStats, {})
      : data.gameStats || {};

  // Persist unlocks JSON
  if (map["Unlocks"] !== undefined) {
    const payload = {
      unlockedThemes: Array.isArray(unlockedThemes) ? unlockedThemes : [],
      unlockedSoundPacks: Array.isArray(unlockedSoundPacks)
        ? unlockedSoundPacks
        : [],
    };
    sheet
      .getRange(rowIndex, map["Unlocks"] + 1)
      .setValue(JSON.stringify(payload).substring(0, 2000));
  }

  // Persist active selections
  if (map["ActiveTheme"] !== undefined && activeTheme !== null) {
    sheet.getRange(rowIndex, map["ActiveTheme"] + 1).setValue(activeTheme);
  }
  if (map["ActiveSoundPack"] !== undefined && activeSoundPack !== null) {
    sheet
      .getRange(rowIndex, map["ActiveSoundPack"] + 1)
      .setValue(activeSoundPack);
  }

  // Persist game stats JSON (used to re-drive unlock logic client-side)
  if (
    map["GameStats"] !== undefined &&
    gameStats &&
    typeof gameStats === "object"
  ) {
    sheet
      .getRange(rowIndex, map["GameStats"] + 1)
      .setValue(JSON.stringify(gameStats).substring(0, 2000));
  }

  return { success: true };
}

// Simple hash function (NOT SECURE - for demo purposes only)
// In production, use proper authentication service or OAuth
function simpleHash_(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return "hash_" + Math.abs(hash).toString(36);
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
  if (difficulty === "Easy") removeCount = 30;
  if (difficulty === "Medium") removeCount = 45;
  if (difficulty === "Hard") removeCount = 55;
  if (difficulty === "Daily") {
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
    isHinted: false,
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
    if (
      board[(startRow + Math.floor(i / 3)) * 9 + (startCol + (i % 3))] === num
    )
      return false;
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
  const definitions = {
    Leaderboard: ["Name", "Time (seconds)", "Difficulty", "Date"],
    Chat: ["ID", "Sender", "Text", "Timestamp", "Status"],
    Logs: ["Timestamp", "Type", "Message", "UserAgent", "Count"],
    Users: [
      "UserID",
      "Username",
      "PasswordHash",
      "CreatedAt",
      "DisplayName",
      "MuteUntil",
      "Banned",
      "TotalGames",
      "TotalWins",
      "EasyWins",
      "MediumWins",
      "HardWins",
      "PerfectWins",
      "FastWins",
      "UnlockedThemes",
      "ActiveTheme",
      "UnlockedSoundPacks",
      "ActiveSoundPack",
      "GameStats",
      "Badges",
      "Unlocks",
    ],
  };

  Object.entries(definitions).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    ensureSheetHeaders_(sheet, headers);
  });

  Logger.log("Sheets initialized successfully with admin support");
}

// Ensure the Users sheet contains all expected columns. Adds missing columns to the header row.
function ensureUsersSheetHeaders_() {
  const sheet = getSpreadsheet_().getSheetByName("Users");
  if (!sheet) return;

  const required = [
    "UserID",
    "Username",
    "PasswordHash",
    "CreatedAt",
    "DisplayName",
    "MuteUntil",
    "Banned",
    "TotalGames",
    "TotalWins",
    "EasyWins",
    "MediumWins",
    "HardWins",
    "PerfectWins",
    "FastWins",
    "UnlockedThemes",
    "ActiveTheme",
    "UnlockedSoundPacks",
    "ActiveSoundPack",
    "GameStats",
    "Badges",
    "Unlocks",
  ];
  ensureSheetHeaders_(sheet, required);
}

// Ensure a sheet's header row contains the required fields in order; append missing headers if needed.
function ensureSheetHeaders_(sheet, requiredHeaders) {
  if (!sheet || !Array.isArray(requiredHeaders) || requiredHeaders.length === 0)
    return;

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const existing =
    lastRow >= 1 && lastCol > 0
      ? sheet.getRange(1, 1, 1, lastCol).getValues()[0]
      : [];

  const headers = [...existing];
  requiredHeaders.forEach((h, idx) => {
    if (headers[idx] !== h) {
      headers[idx] = h;
    }
  });

  // Expand to full width
  const targetWidth = Math.max(headers.length, requiredHeaders.length);
  while (headers.length < targetWidth) headers.push("");

  sheet
    .getRange(1, 1, 1, targetWidth)
    .setValues([headers.slice(0, targetWidth)]);
}

function getUserHeaderMap_() {
  const sheet = getSpreadsheet_().getSheetByName("Users");
  if (!sheet) return null;
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return null;
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};
  headers.forEach((h, idx) => {
    map[h] = idx;
  });
  return { map, sheet, headers };
}

function getUserRowById_(userId) {
  const info = getUserHeaderMap_();
  if (!info) return null;
  const { map, sheet } = info;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][map["UserID"]] === userId) {
      return { rowIndex: i + 1, row: data[i], map, sheet };
    }
  }
  return null;
}

function getUserRowByUsername_(username) {
  const info = getUserHeaderMap_();
  if (!info) return null;
  const { map, sheet } = info;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (
      data[i][map["Username"]] &&
      data[i][map["Username"]].toLowerCase() === username.toLowerCase()
    ) {
      return { rowIndex: i + 1, row: data[i], map, sheet };
    }
  }
  return null;
}

function safeParseJson_(str, fallback) {
  if (typeof str !== "string") return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

function sanitizeInput_(str, maxLength) {
  if (typeof str !== "string") return "";
  let clean = str.trim().substring(0, maxLength);
  // Prevent formula injection
  if (clean.startsWith("=")) clean = "'" + clean;
  return clean;
}

function sanitizeOutput_(val) {
  if (typeof val === "string") return val;
  return String(val || "");
}

// ============================================================================
// BADGE SYSTEM
// ============================================================================

/**
 * Get user badges
 * @param {Object} data - Request data with userId
 * @returns {Object} Success response with badges array
 */
function getUserBadges(data) {
  if (!data || !data.userId) {
    return { success: false, error: "User ID required" };
  }

  const userId = sanitizeInput_(data.userId, 50);
  ensureUsersSheetHeaders_();

  const rowInfo = getUserRowById_(userId);
  if (!rowInfo) return { success: false, error: "User not found" };

  const { row, map } = rowInfo;
  const badgesRaw = row[map["Badges"]] || "[]";
  const badges = safeParseJson_(badgesRaw, []);

  return {
    success: true,
    badges: Array.isArray(badges) ? badges : [],
  };
}

/**
 * Award a badge to a user
 * @param {Object} data - Request data with userId and badge
 * @returns {Object} Success response
 */
function awardBadge(data) {
  if (!data || !data.userId || !data.badge) {
    return { success: false, error: "User ID and badge required" };
  }

  const userId = sanitizeInput_(data.userId, 50);
  const badgeId = sanitizeInput_(data.badge, 50);
  ensureUsersSheetHeaders_();

  const rowInfo = getUserRowById_(userId);
  if (!rowInfo) return { success: false, error: "User not found" };

  const { rowIndex, row, map, sheet } = rowInfo;
  const badgesRaw = row[map["Badges"]] || "[]";
  const badges = safeParseJson_(badgesRaw, []);

  // Check if badge already exists
  if (Array.isArray(badges) && badges.some((b) => b.id === badgeId)) {
    return { success: true, message: "Badge already awarded" };
  }

  // Add badge with timestamp
  const newBadge = {
    id: badgeId,
    awardedAt: new Date().toISOString(),
  };

  const updatedBadges = Array.isArray(badges)
    ? [...badges, newBadge]
    : [newBadge];

  if (map["Badges"] !== undefined) {
    const badgesJson = JSON.stringify(updatedBadges);
    // Google Sheets cell limit is ~50,000 characters; warn if approaching limit
    if (badgesJson.length > 10000) {
      Logger.log(
        "Warning: Badge data for user " +
          userId +
          " is large (" +
          badgesJson.length +
          " chars)"
      );
    }
    sheet
      .getRange(rowIndex, map["Badges"] + 1)
      .setValue(badgesJson.substring(0, 50000));
  }

  return { success: true, badge: newBadge };
}
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
const ADMIN_SESSION_TIMEOUT = 30 * 60; // 30 minutes (in seconds for CacheService)

/**
 * Check if a user is banned or muted
 * @param {string} username - Username to check
 * @returns {Object} Status object with banned, muted, muteUntil properties
 */
function checkUserStatus_(username) {
  try {
    ensureUsersSheetHeaders_();
    const rowInfo = getUserRowByUsername_(username);

    if (!rowInfo) {
      return { banned: false, muted: false, muteUntil: 0 };
    }

    const { row, map } = rowInfo;
    const banned = row[map["Banned"]] === true || row[map["Banned"]] === "TRUE";
    const muteUntil = Number(row[map["MuteUntil"]]) || 0;
    const muted = muteUntil > Date.now();

    return { banned, muted, muteUntil };
  } catch (e) {
    Logger.log("checkUserStatus_ error: " + e);
    return { banned: false, muted: false, muteUntil: 0 };
  }
}

/**
 * Verify admin session token
 */
function verifyAdminToken_(token) {
  if (!token) {
    return false;
  }

  const cache = CacheService.getScriptCache();
  const sessionData = cache.get("admin_session_" + token);

  if (!sessionData) {
    return false;
  }

  try {
    const session = JSON.parse(sessionData);
    if (Date.now() > session.expiry) {
      cache.remove("admin_session_" + token);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
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
  const session = {
    username: username,
    createdAt: Date.now(),
    expiry: Date.now() + ADMIN_SESSION_TIMEOUT * 1000,
  };

  // Store in cache (persists across requests)
  const cache = CacheService.getScriptCache();
  cache.put(
    "admin_session_" + token,
    JSON.stringify(session),
    ADMIN_SESSION_TIMEOUT
  );

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

    // Get user data - now including MuteUntil(col 6) and Banned(col 7)
    // Columns: UserID(0), Username(1), PasswordHash(2), CreatedAt(3), DisplayName(4),
    //          MuteUntil(5), Banned(6), TotalGames(7), TotalWins(8), EasyWins(9),
    //          MediumWins(10), HardWins(11), PerfectWins(12), FastWins(13)...
    const lastRow = usersSheet.getLastRow();
    const lastCol = Math.max(14, usersSheet.getLastColumn()); // Get at least 14 columns
    const data = usersSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    const now = Date.now();
    const users = data.map((row) => {
      const muteUntil = row[5] ? Number(row[5]) : 0;
      const isMuted = muteUntil > now;

      return {
        username: sanitizeOutput_(row[1]) || sanitizeOutput_(row[0]), // Username or UserID
        userId: sanitizeOutput_(row[0]),
        displayName: sanitizeOutput_(row[4]) || "",
        totalGames: row[7] || 0,
        totalWins: row[8] || 0,
        easyWins: row[9] || 0,
        mediumWins: row[10] || 0,
        hardWins: row[11] || 0,
        perfectWins: row[12] || 0,
        fastWins: row[13] || 0,
        banned: row[6] || false,
        muted: isMuted,
        muteUntil: muteUntil,
      };
    });

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
      .getRange(2, 1, usersSheet.getLastRow() - 1, 7)
      .getValues();

    for (let i = 0; i < data.length; i++) {
      // Check both UserID (col 0) and Username (col 1)
      if (data[i][0] === username || data[i][1] === username) {
        usersSheet.getRange(i + 2, 7).setValue(true); // Set banned flag (column 7)

        // Post system message to chat
        try {
          const chatSheet = ss.getSheetByName("Chat");
          if (chatSheet) {
            const timestamp = new Date().toISOString();
            chatSheet.appendRow([
              "system_" + Date.now(),
              "System",
              `User ${username} has been banned`,
              timestamp,
              "system",
            ]);
          }
        } catch (chatErr) {
          Logger.log("Failed to post ban notification to chat: " + chatErr);
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
      .getRange(2, 1, usersSheet.getLastRow() - 1, 7)
      .getValues();

    for (let i = 0; i < data.length; i++) {
      // Check both UserID (col 0) and Username (col 1)
      if (data[i][0] === username || data[i][1] === username) {
        usersSheet.getRange(i + 2, 7).setValue(false); // Clear banned flag (column 7)
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
      .getRange(2, 1, usersSheet.getLastRow() - 1, 6)
      .getValues();

    for (let i = 0; i < data.length; i++) {
      // Check both UserID (col 0) and Username (col 1)
      if (data[i][0] === username || data[i][1] === username) {
        usersSheet.getRange(i + 2, 6).setValue(muteUntil); // Set mute expiry (column 6)

        // Post system message to chat
        try {
          const chatSheet = ss.getSheetByName("Chat");
          if (chatSheet) {
            const timestamp = new Date().toISOString();
            const minutes = Math.ceil(duration / 60000);
            chatSheet.appendRow([
              "system_" + Date.now(),
              "System",
              `User ${username} has been muted for ${minutes} minute(s)`,
              timestamp,
              "system",
            ]);
          }
        } catch (chatErr) {
          Logger.log("Failed to post mute notification to chat: " + chatErr);
        }

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
      .getRange(2, 1, usersSheet.getLastRow() - 1, 14)
      .getValues();

    for (let i = 0; i < data.length; i++) {
      // Check both UserID (col 0) and Username (col 1)
      if (data[i][0] === username || data[i][1] === username) {
        const row = i + 2;

        // Update stats - columns adjusted for new structure
        // TotalGames(8), TotalWins(9), EasyWins(10), MediumWins(11),
        // HardWins(12), PerfectWins(13), FastWins(14)
        if (params.totalGames !== undefined)
          usersSheet.getRange(row, 8).setValue(parseInt(params.totalGames));
        if (params.totalWins !== undefined)
          usersSheet.getRange(row, 9).setValue(parseInt(params.totalWins));
        if (params.easyWins !== undefined)
          usersSheet.getRange(row, 10).setValue(parseInt(params.easyWins));
        if (params.mediumWins !== undefined)
          usersSheet.getRange(row, 11).setValue(parseInt(params.mediumWins));
        if (params.hardWins !== undefined)
          usersSheet.getRange(row, 12).setValue(parseInt(params.hardWins));
        if (params.perfectWins !== undefined)
          usersSheet.getRange(row, 13).setValue(parseInt(params.perfectWins));
        if (params.fastWins !== undefined)
          usersSheet.getRange(row, 14).setValue(parseInt(params.fastWins));

        // Also update GameStats JSON column (if headers include it)
        try {
          const headerInfo = getUserHeaderMap_();
          if (
            headerInfo &&
            headerInfo.map &&
            headerInfo.map["GameStats"] !== undefined
          ) {
            const map = headerInfo.map;
            const gameStats = {};
            if (params.totalGames !== undefined)
              gameStats.totalGames = parseInt(params.totalGames);
            if (params.totalWins !== undefined)
              gameStats.totalWins = parseInt(params.totalWins);
            if (params.easyWins !== undefined)
              gameStats.easyWins = parseInt(params.easyWins);
            if (params.mediumWins !== undefined)
              gameStats.mediumWins = parseInt(params.mediumWins);
            if (params.hardWins !== undefined)
              gameStats.hardWins = parseInt(params.hardWins);
            if (params.perfectWins !== undefined)
              gameStats.perfectWins = parseInt(params.perfectWins);
            if (params.fastWins !== undefined)
              gameStats.fastWins = parseInt(params.fastWins);

            if (Object.keys(gameStats).length > 0) {
              usersSheet
                .getRange(row, map["GameStats"] + 1)
                .setValue(JSON.stringify(gameStats));
            }
          }
        } catch (e) {
          // Non-fatal: continue
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

/**
 * Run maintenance tasks for Users sheet:
 * - Ensure headers are present
 * - Normalize JSON columns: UnlockedThemes, UnlockedSoundPacks, GameStats, Badges, Unlocks
 * - Normalize ActiveTheme and ActiveSoundPack to single string values
 * - Return a summary of changes
 *
 * This function is intended to be run from the Apps Script editor or via an admin call.
 */
function performMaintenance(params) {
  const results = { updatedRows: 0, errors: [] };
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName("Users");
    if (!sheet) return { success: false, error: "Users sheet not found" };

    // Ensure headers
    ensureUsersSheetHeaders_();
    const info = getUserHeaderMap_();
    if (!info) return { success: false, error: "Failed to read headers" };
    const { map } = info;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 1)
      return { success: true, message: "No user rows to process" };

    const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    // Build updated rows in-memory to batch write back in a single call
    const updatedRows = data.map((r) => r.slice());
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const outRow = updatedRows[i];
      try {
        // Normalize UnlockedThemes -> JSON array string
        if (map["UnlockedThemes"] !== undefined) {
          const raw = row[map["UnlockedThemes"]];
          let out = "[]";
          try {
            if (typeof raw === "string" && raw.trim() !== "") {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) out = JSON.stringify(parsed);
              else if (typeof parsed === "string")
                out = JSON.stringify([parsed]);
              else out = JSON.stringify([]);
            } else if (Array.isArray(raw)) {
              out = JSON.stringify(raw);
            } else if (raw) {
              out = JSON.stringify([String(raw)]);
            } else {
              out = JSON.stringify(["default"]);
            }
          } catch (e) {
            const s = String(raw || "").trim();
            const parts = s ? s.split(/\s*,\s*/) : ["default"];
            out = JSON.stringify(parts.filter(Boolean));
          }
          outRow[map["UnlockedThemes"]] = out;
        }

        // Normalize UnlockedSoundPacks
        if (map["UnlockedSoundPacks"] !== undefined) {
          const raw = row[map["UnlockedSoundPacks"]];
          let out = "[]";
          try {
            if (typeof raw === "string" && raw.trim() !== "") {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) out = JSON.stringify(parsed);
              else if (typeof parsed === "string")
                out = JSON.stringify([parsed]);
              else out = JSON.stringify([]);
            } else if (Array.isArray(raw)) {
              out = JSON.stringify(raw);
            } else if (raw) {
              out = JSON.stringify([String(raw)]);
            } else {
              out = JSON.stringify(["classic"]);
            }
          } catch (e) {
            const s = String(raw || "").trim();
            const parts = s ? s.split(/\s*,\s*/) : ["classic"];
            out = JSON.stringify(parts.filter(Boolean));
          }
          outRow[map["UnlockedSoundPacks"]] = out;
        }

        // Normalize ActiveTheme to string
        if (map["ActiveTheme"] !== undefined) {
          const raw = row[map["ActiveTheme"]];
          let out = "";
          if (typeof raw === "string") {
            out = raw.trim();
            if (out.startsWith("[")) {
              try {
                const parsed = JSON.parse(out);
                out =
                  Array.isArray(parsed) && parsed.length > 0
                    ? String(parsed[0])
                    : "";
              } catch (e) {
                out = "";
              }
            }
          } else if (Array.isArray(raw)) {
            out = raw.length > 0 ? String(raw[0]) : "";
          } else if (raw) out = String(raw);
          if (!out) out = "default";
          outRow[map["ActiveTheme"]] = out;
        }

        // Normalize ActiveSoundPack to string
        if (map["ActiveSoundPack"] !== undefined) {
          const raw = row[map["ActiveSoundPack"]];
          let out = "";
          if (typeof raw === "string") {
            out = raw.trim();
            if (out.startsWith("[")) {
              try {
                const parsed = JSON.parse(out);
                out =
                  Array.isArray(parsed) && parsed.length > 0
                    ? String(parsed[0])
                    : "";
              } catch (e) {
                out = "";
              }
            }
          } else if (Array.isArray(raw)) {
            out = raw.length > 0 ? String(raw[0]) : "";
          } else if (raw) out = String(raw);
          if (!out) out = "classic";
          outRow[map["ActiveSoundPack"]] = out;
        }

        // Normalize GameStats to object JSON
        if (map["GameStats"] !== undefined) {
          const raw = row[map["GameStats"]];
          let out = "{}";
          try {
            if (typeof raw === "string" && raw.trim() !== "") {
              const parsed = JSON.parse(raw);
              if (
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)
              )
                out = JSON.stringify(parsed);
              else out = "{}";
            } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
              out = JSON.stringify(raw);
            } else {
              out = "{}";
            }
          } catch (e) {
            out = "{}";
          }
          outRow[map["GameStats"]] = out;
        }

        // Normalize Badges to array JSON
        if (map["Badges"] !== undefined) {
          const raw = row[map["Badges"]];
          let out = "[]";
          try {
            if (typeof raw === "string" && raw.trim() !== "") {
              const parsed = JSON.parse(raw);
              out = Array.isArray(parsed)
                ? JSON.stringify(parsed)
                : JSON.stringify([]);
            } else if (Array.isArray(raw)) {
              out = JSON.stringify(raw);
            } else out = JSON.stringify([]);
          } catch (e) {
            out = JSON.stringify([]);
          }
          outRow[map["Badges"]] = out;
        }

        // Normalize Unlocks to object JSON
        if (map["Unlocks"] !== undefined) {
          const raw = row[map["Unlocks"]];
          let out = "{}";
          try {
            if (typeof raw === "string" && raw.trim() !== "") {
              const parsed = JSON.parse(raw);
              out =
                parsed && typeof parsed === "object" && !Array.isArray(parsed)
                  ? JSON.stringify(parsed)
                  : "{}";
            } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
              out = JSON.stringify(raw);
            } else out = "{}";
          } catch (e) {
            out = "{}";
          }
          outRow[map["Unlocks"]] = out;
        }

        results.updatedRows += 1;
      } catch (rowErr) {
        results.errors.push({ row: i + 2, error: String(rowErr) });
      }
    }

    // Batch write all updated rows back to the sheet in one operation
    try {
      sheet.getRange(2, 1, updatedRows.length, lastCol).setValues(updatedRows);
    } catch (writeErr) {
      results.errors.push({ row: "batchWrite", error: String(writeErr) });
    }

    return { success: true, summary: results };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}
