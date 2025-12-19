import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import "./styles.css";
import "./lib/admin-access.js";

// Debug: Log when main module loads
console.log("[Sudoku Labs] Main module initializing...");

// Load config if available (for local dev)
// In Vite, we usually use .env, but to keep compatibility with existing config.local.js:
// We assume config.local.js is loaded via index.html script tag BEFORE this module.
// But Vite modules are deferred.
// If config.local.js is a script tag in index.html, it runs before module scripts.
// So window.CONFIG should be available.

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("[Sudoku Labs] FATAL: #root element not found!");
  } else {
    console.log("[Sudoku Labs] #root found, creating React root...");
    const root = ReactDOM.createRoot(rootElement);
    console.log("[Sudoku Labs] React root created, rendering App...");
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("[Sudoku Labs] App render called successfully");
  }
} catch (err) {
  console.error("[Sudoku Labs] FATAL render error:", err);
  document.body.innerHTML = '<div style="padding:20px;color:red;">App failed to load: ' + err.message + '</div>';
}
