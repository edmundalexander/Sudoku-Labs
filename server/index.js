const express = require("express");
const path = require("path");
const cors = require("cors");
const admin = require("firebase-admin");
const apiRouter = require("./controllers/api");

// Initialize Firebase Admin
try {
  admin.initializeApp();
  console.log("Firebase Admin initialized with default credentials");
} catch (e) {
  console.error("Failed to initialize Firebase Admin:", e);
}

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
// Mount the API router at /api AND at root for legacy compatibility
app.use("/api", apiRouter);
app.use("/", (req, res, next) => {
  // Only handle requests with ?action= as API calls
  if (req.query.action || (req.body && req.body.action)) {
    return apiRouter(req, res, next);
  }
  next();
});

// Static Files
const PUBLIC_DIR = path.join(__dirname, "../dist");
app.use(express.static(PUBLIC_DIR));

// SPA Fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

module.exports = app;
