const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

// Global error handlers to prevent silent crashes
process.on('uncaughtException', (err) => {
  console.error('CRITICAL ERROR: Uncaught Exception:', err);
  // Don't exit immediately to allow logs to flush? 
  // But usually we should exit.
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL ERROR: Unhandled Rejection:', reason);
});

const PORT = parseInt(process.env.PORT) || 8080;
const HOST = '0.0.0.0'; // Explicitly bind to all interfaces
const PUBLIC_DIR = path.join(__dirname, 'dist');

console.log(`Starting server initialization...`);
console.log(`Environment: PORT=${PORT}, NODE_ENV=${process.env.NODE_ENV}`);

// --- Backend Logic Integration ---
let apiHandler = null;
try {
  // Attempt to load the Firebase Functions logic
  // We need to ensure the environment is set up correctly for this to work
  const functionsIndex = require("./backend/firebase/functions/index.js");
  apiHandler = functionsIndex.api;
  console.log("Backend API logic loaded.");
} catch (e) {
  console.warn("Backend API logic could not be loaded:", e.message);
}

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".woff": "application/font-woff",
  ".woff2": "font/woff2",
  ".ttf": "application/font-ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "application/font-otf",
};

const server = http.createServer((req, res) => {
  // Parse URL to handle query parameters
  const parsedUrl = url.parse(req.url, true);
  const urlPath = parsedUrl.pathname;

  // --- API Handling ---
  // Intercept requests that look like API calls
  // The frontend sends ?action=... to the configured API_URL
  // If API_URL is set to "/" (relative), requests will come to this server
  if (
    apiHandler &&
    (urlPath === "/api" || (urlPath === "/" && parsedUrl.query.action))
  ) {
    // Polyfill req.query and req.body for the Firebase Functions handler
    req.query = parsedUrl.query;

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          req.body = JSON.parse(body);
        } catch (e) {
          req.body = {};
        }
        // Call the Firebase Function handler
        apiHandler(req, res);
      });
    } else {
      req.body = {};
      // Call the Firebase Function handler
      apiHandler(req, res);
    }
    return;
  }

  // --- Static File Serving ---
  let filePath = urlPath === "/" ? "index.html" : urlPath;

  // Prevent directory traversal
  const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, "");
  let absPath = path.join(PUBLIC_DIR, safePath);

  fs.stat(absPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file not found, and it looks like a route (no extension), serve index.html
      if (!path.extname(urlPath)) {
        absPath = path.join(PUBLIC_DIR, "index.html");
        fs.readFile(absPath, (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end("Server Error: index.html not found");
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
          }
        });
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    } else {
      fs.readFile(absPath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end("Server Error");
        } else {
          const ext = path.extname(absPath).toLowerCase();
          const contentType = MIME_TYPES[ext] || "application/octet-stream";
          res.writeHead(200, { "Content-Type": contentType });
          res.end(data);
        }
      });
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server running and listening on http://${HOST}:${PORT}`);
});
