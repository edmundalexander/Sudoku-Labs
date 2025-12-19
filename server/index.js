const express = require("express");
const path = require("path");
const fs = require("fs");
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
app.use("/api", apiRouter);

// Static Files
// Determine the path to the built public directory. We only serve compiled assets
// to avoid accidentally exposing source files when a build has not been run.
const candidatePublicDirs = [
  path.join(__dirname, "../dist/public"), // running from repository root
  path.join(__dirname, "../public"), // running from the dist bundle
];

const PUBLIC_DIR = candidatePublicDirs.find((dir) =>
  fs.existsSync(path.join(dir, "index.html"))
);

if (PUBLIC_DIR) {
  console.log(`Serving static files from: ${PUBLIC_DIR}`);
  app.use(express.static(PUBLIC_DIR));
  const indexHtml = fs.readFileSync(
    path.join(PUBLIC_DIR, "index.html"),
    "utf8"
  );

  // SPA Fallback
  app.get("*", (req, res) => {
    res.type("html").send(indexHtml);
  });
} else {
  const checkedPaths = candidatePublicDirs
    .map((dir) => `- ${dir}`)
    .join("\n");
  const missingBuildMessage = [
    "Server misconfigured: build artifacts missing.",
    "Checked paths:",
    checkedPaths,
    "Run `npm run build` before starting the server.",
  ].join("\n");
  console.error(missingBuildMessage);
  app.get("*", (req, res) => res.status(503).send(missingBuildMessage));
}

// Start the server if run directly
const PORT = parseInt(process.env.PORT) || 8080;
const HOST = "0.0.0.0"; // Listen on all network interfaces

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Server running and listening on http://${HOST}:${PORT}`);
  });
}

module.exports = app;
