import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import "./styles.css";
import "./lib/admin-access.js";

// Load config if available (for local dev)
// In Vite, we usually use .env, but to keep compatibility with existing config.local.js:
// We assume config.local.js is loaded via index.html script tag BEFORE this module.
// But Vite modules are deferred.
// If config.local.js is a script tag in index.html, it runs before module scripts.
// So window.CONFIG should be available.

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
