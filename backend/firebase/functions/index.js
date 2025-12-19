const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const sudoku = require("./sudoku");
const axios = require("axios");
const path = require("path");

// Initialize Firebase Admin
// In Cloud Run (App Hosting), we should rely on ADC (Application Default Credentials)
// The service account file is likely not present in the container unless we copy it,
// and using ADC is the preferred method.
try {
  admin.initializeApp();
  console.log("Firebase Admin initialized with default credentials");
} catch (e) {
  console.error("Failed to initialize Firebase Admin:", e);
}

const db = admin.firestore();

// --- CONFIGURATION ---
// IMPORTANT: Set this via: firebase functions:config:set auth.api_key="YOUR_WEB_API_KEY"
// Or hardcode it temporarily for testing (NOT RECOMMENDED FOR PRODUCTION)
let FIREBASE_WEB_API_KEY;
try {
  FIREBASE_WEB_API_KEY = functions.config().auth
    ? functions.config().auth.api_key
    : process.env.FIREBASE_WEB_API_KEY;
} catch (e) {
  FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY;
}

// Helper to sanitize input (basic XSS prevention)
function sanitizeInput(str, maxLength) {
  if (!str) return "";
  const s = String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  return maxLength ? s.substring(0, maxLength) : s;
}

exports.api = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Support both GET (query) and POST (body)
    const params = req.method === "GET" ? req.query : req.body;
    const action = params.action;

    try {
      let result;
      switch (action) {
        case "generateSudoku":
          const difficulty = params.difficulty || "Easy";
          result = sudoku.generateSudoku(difficulty);
          break;

        case "getLeaderboard":
          result = await getLeaderboard();
          break;

        case "saveScore":
          result = await saveScore(params);
          break;

        case "getChat":
          result = await getChat();
          break;

        case "postChat":
          result = await postChat(params);
          break;

        case "logError":
          result = await logError(params);
          break;

        case "register":
          result = await registerUser(params);
          break;

        case "login":
          result = await loginUser(params);
          break;

        case "getUserProfile":
          result = await getUserProfile(params);
          break;

        case "updateUserProfile":
          result = await updateUserProfile(params);
          break;

        case "getUserState":
          result = await getUserState(params);
          break;

        case "saveUserState":
          result = await saveUserState(params);
          break;

        case "getUserBadges":
          result = await getUserBadges(params);
          break;

        case "awardBadge":
          result = await awardBadge(params);
          break;

        // --- Admin Endpoints ---
        case "adminLogin":
          result = await adminLogin(params);
          break;
        case "getAdminStats":
          result = await getAdminStats(params);
          break;
        case "getAdminChatHistory":
          result = await getAdminChatHistory(params);
          break;
        case "getAdminUsers":
          result = await getAdminUsers(params);
          break;
        case "deleteMessages":
          result = await deleteMessages(params);
          break;
        case "banUser":
          result = await banUser(params);
          break;
        case "unbanUser":
          result = await unbanUser(params);
          break;
        case "muteUser":
          result = await muteUser(params);
          break;
        case "updateUserStats":
          result = await updateUserStats(params);
          break;
        case "clearAllChat":
          result = await clearAllChat(params);
          break;

        case "ping":
          result = { ok: true, timestamp: new Date().toISOString() };
          break;

        default:
          result = { error: "Unknown action: " + action };
      }
      res.json(result);
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Server error: " + error.toString() });
    }
  });
});

// --- Implementation Functions ---

async function getLeaderboard() {
  const snapshot = await db
    .collection("leaderboard")
    .orderBy("time", "asc")
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => doc.data());
}

async function saveScore(params) {
  const { name, time, difficulty, date } = params;
  const entry = {
    name: sanitizeInput(name || "Anonymous", 20),
    time: Number(time),
    difficulty: sanitizeInput(difficulty, 10),
    date: sanitizeInput(date || new Date().toISOString(), 20),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("leaderboard").add(entry);
  return getLeaderboard();
}

async function getChat() {
  const snapshot = await db
    .collection("chat")
    .orderBy("timestamp", "desc") // Get newest first
    .limit(50)
    .get();

  // Return oldest first for the UI
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp ? data.timestamp.toMillis() : Date.now(),
      };
    })
    .reverse();
}

async function postChat(params) {
  const { sender, text, id, status } = params;
  if (!text || !text.trim()) return getChat();

  const entry = {
    id: sanitizeInput(id, 50),
    sender: sanitizeInput(sender || "User", 20),
    text: sanitizeInput(text, 140),
    status: sanitizeInput(status, 50),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("chat").add(entry);
  return getChat();
}

async function logError(params) {
  const { type, message, userAgent, count } = params;
  await db.collection("logs").add({
    type: sanitizeInput(type, 20),
    message: sanitizeInput(message, 200),
    userAgent: sanitizeInput(userAgent, 100),
    count: Number(count) || 1,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { logged: true };
}

async function registerUser(params) {
  const username = sanitizeInput(params.username, 20).trim();
  const password = sanitizeInput(params.password, 100);
  const email = sanitizeInput(params.email, 100).trim();

  if (username.length < 3)
    return { success: false, error: "Username too short" };
  if (password.length < 6)
    return { success: false, error: "Password too short" };
  if (!email || !email.includes("@"))
    return { success: false, error: "Invalid email address" };

  // Check if username is taken in Firestore
  const snapshot = await db
    .collection("users")
    .where("username_lower", "==", username.toLowerCase())
    .get();

  if (!snapshot.empty) {
    return { success: false, error: "Username already exists" };
  }

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: username,
    });

    const userId = userRecord.uid;
    const createdAt = new Date().toISOString();

    const newUser = {
      userId,
      username,
      username_lower: username.toLowerCase(),
      email,
      displayName: username,
      totalGames: 0,
      totalWins: 0,
      easyWins: 0,
      mediumWins: 0,
      hardWins: 0,
      perfectWins: 0,
      fastWins: 0,
      createdAt,
    };

    await db.collection("users").doc(userId).set(newUser);

    // Return user without sensitive data
    const { username_lower: __, ...safeUser } = newUser;
    return { success: true, user: safeUser };
  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error: error.message };
  }
}

async function loginUser(params) {
  const username = sanitizeInput(params.username, 20);
  const password = sanitizeInput(params.password, 100);

  if (!FIREBASE_WEB_API_KEY) {
    return {
      success: false,
      error: "Server configuration error: Missing API Key",
    };
  }

  // 1. Find email for username
  const snapshot = await db
    .collection("users")
    .where("username_lower", "==", username.toLowerCase())
    .limit(1)
    .get();

  if (snapshot.empty) {
    return { success: false, error: "Invalid username or password" };
  }

  const userDoc = snapshot.docs[0].data();
  const email = userDoc.email;

  try {
    // 2. Verify password via Firebase Auth REST API
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`,
      {
        email: email,
        password: password,
        returnSecureToken: true,
      }
    );

    // 3. If successful, return user profile
    const { username_lower: __, ...safeUser } = userDoc;
    return {
      success: true,
      user: safeUser,
      token: response.data.idToken, // Return ID token for future use if needed
    };
  } catch (error) {
    console.error(
      "Login Error:",
      error.response ? error.response.data : error.message
    );
    return { success: false, error: "Invalid username or password" };
  }
}

async function getUserProfile(params) {
  const userId = sanitizeInput(params.userId, 50);

  // Try by ID first
  let doc = await db.collection("users").doc(userId).get();

  if (!doc.exists) {
    // Try by username
    const snapshot = await db
      .collection("users")
      .where("username_lower", "==", userId.toLowerCase())
      .limit(1)
      .get();
    if (!snapshot.empty) {
      doc = snapshot.docs[0];
    }
  }

  if (!doc.exists) {
    return { success: false, error: "User not found" };
  }

  const user = doc.data();
  const { username_lower: __, ...safeUser } = user;
  return { success: true, user: safeUser };
}

async function updateUserProfile(params) {
  const userId = sanitizeInput(params.userId, 50);
  const docRef = db.collection("users").doc(userId);
  const doc = await docRef.get();

  if (!doc.exists) return { success: false, error: "User not found" };

  const updates = {};
  if (params.displayName)
    updates.displayName = sanitizeInput(params.displayName, 30);

  if (params.incrementGames === "true" || params.incrementGames === true) {
    updates.totalGames = admin.firestore.FieldValue.increment(1);
  }
  if (params.incrementWins === "true" || params.incrementWins === true) {
    updates.totalWins = admin.firestore.FieldValue.increment(1);

    const diff = params.difficulty;
    if (diff === "Easy")
      updates.easyWins = admin.firestore.FieldValue.increment(1);
    if (diff === "Medium")
      updates.mediumWins = admin.firestore.FieldValue.increment(1);
    if (diff === "Hard")
      updates.hardWins = admin.firestore.FieldValue.increment(1);

    if (params.perfectWin === "true" || params.perfectWin === true) {
      updates.perfectWins = admin.firestore.FieldValue.increment(1);
    }
    if (params.fastWin === "true" || params.fastWin === true) {
      updates.fastWins = admin.firestore.FieldValue.increment(1);
    }
  }

  await docRef.update(updates);
  return { success: true };
}

async function getUserState(params) {
  const userId = sanitizeInput(params.userId, 50);
  const doc = await db.collection("userState").doc(userId).get();

  if (!doc.exists) {
    return { success: false, error: "State not found" };
  }

  return { success: true, state: doc.data() };
}

async function saveUserState(params) {
  const userId = sanitizeInput(params.userId, 50);
  const stateData = {
    ...params,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  };
  delete stateData.action; // Remove action param

  await db.collection("userState").doc(userId).set(stateData, { merge: true });
  return { success: true };
}

async function getUserBadges(params) {
  const userId = sanitizeInput(params.userId, 50);
  const doc = await db.collection("users").doc(userId).get();
  if (!doc.exists) return { success: false, badges: [] };
  return { success: true, badges: doc.data().badges || [] };
}

async function awardBadge(params) {
  const userId = sanitizeInput(params.userId, 50);
  const badgeId = sanitizeInput(params.badgeId, 50);

  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) return { success: false, error: "User not found" };

  await userRef.update({
    badges: admin.firestore.FieldValue.arrayUnion(badgeId),
  });

  return { success: true, badgeId };
}

// --- Admin Implementation ---

// Hardcoded admin password hash (SHA-256 for "admin")
// In production, store this in Firestore or use Firebase Auth Claims
const ADMIN_PASSWORD_HASH =
  "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
const ADMIN_TOKEN_SECRET = "admin-secret-token-123"; // Simple token for session

function verifyAdminToken(token) {
  // In a real app, use JWT or Firebase Auth ID Token with custom claims
  return token === ADMIN_TOKEN_SECRET;
}

async function adminLogin(params) {
  const { username, passwordHash } = params;
  // Simple check: username "admin" and matching hash
  if (username === "admin" && passwordHash === ADMIN_PASSWORD_HASH) {
    return {
      success: true,
      token: ADMIN_TOKEN_SECRET,
      expiry: Date.now() + 3600000,
    };
  }
  return { success: false, error: "Invalid credentials" };
}

async function getAdminStats(params) {
  if (!verifyAdminToken(params.token))
    return { success: false, error: "Unauthorized" };

  const usersSnap = await db.collection("users").count().get();
  const gamesSnap = await db.collection("leaderboard").count().get();
  const chatSnap = await db.collection("chat").count().get();

  return {
    success: true,
    stats: {
      totalUsers: usersSnap.data().count,
      totalGames: gamesSnap.data().count,
      totalMessages: chatSnap.data().count,
      serverTime: new Date().toISOString(),
    },
  };
}

async function getAdminChatHistory(params) {
  if (!verifyAdminToken(params.token))
    return { success: false, error: "Unauthorized" };

  const snapshot = await db
    .collection("chat")
    .orderBy("timestamp", "desc")
    .limit(100)
    .get();
  const messages = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toMillis(),
  }));
  return { success: true, messages };
}

async function getAdminUsers(params) {
  if (!verifyAdminToken(params.token))
    return { success: false, error: "Unauthorized" };

  const snapshot = await db.collection("users").limit(100).get();
  const users = snapshot.docs.map((doc) => doc.data());

  // Get banned/muted users (stored in a separate collection or flag)
  // For now, we'll just return empty lists as we haven't implemented banning logic fully
  return { success: true, users, bannedUsers: [], mutedUsers: [] };
}

async function deleteMessages(params) {
  if (!verifyAdminToken(params.token))
    return { success: false, error: "Unauthorized" };

  const messageIds = (params.messageIds || "").split(",");
  const batch = db.batch();

  messageIds.forEach((id) => {
    if (id) batch.delete(db.collection("chat").doc(id));
  });

  await batch.commit();
  return { success: true };
}

async function banUser(params) {
  if (!verifyAdminToken(params.token))
    return { success: false, error: "Unauthorized" };
  // Implement ban logic (e.g., add to 'banned' collection)
  return { success: true };
}

async function unbanUser(params) {
  if (!verifyAdminToken(params.token))
    return { success: false, error: "Unauthorized" };
  // Implement unban logic
  return { success: true };
}

async function muteUser(params) {
  if (!verifyAdminToken(params.token))
    return { success: false, error: "Unauthorized" };
  // Implement mute logic
  return { success: true };
}

async function updateUserStats(params) {
  if (!verifyAdminToken(params.token))
    return { success: false, error: "Unauthorized" };
  // Reuse updateUserProfile logic but bypass auth checks if any
  return updateUserProfile(params);
}

async function clearAllChat(params) {
  if (!verifyAdminToken(params.token))
    return { success: false, error: "Unauthorized" };

  // Delete all chat messages (batch delete)
  const snapshot = await db.collection("chat").limit(500).get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  return { success: true };
}
