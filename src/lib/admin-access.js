import React from "react";
import ReactDOM from "react-dom/client";
import { AdminConsole } from "../components/admin/AdminConsole.jsx";

/**
 * Sudoku Logic Lab - Admin Console Access
 *
 * This file provides browser console access to the admin panel.
 * Must be loaded after admin.jsx and React
 *
 * Usage: sudokuAdmin.login()
 */

// Admin Console Manager
const AdminManager = {
  sessionToken: null,
  sessionExpiry: null,
  consoleInstance: null,

  // Helper to render the "GUI" header
  renderHeader() {
    // console.clear(); // Don't clear console to preserve history/errors
    console.log(
      "%c🔐 Sudoku Labs Admin System",
      "font-size: 24px; font-weight: bold; color: #4f46e5; padding: 10px; border-bottom: 2px solid #4f46e5;"
    );
    console.log("");
  },

  // Helper to render status messages
  renderStatus(message, type = "info") {
    const styles = {
      info: "color: #3b82f6; font-weight: bold;",
      success: "color: #10b981; font-weight: bold; font-size: 14px;",
      error: "color: #ef4444; font-weight: bold;",
      warning: "color: #f59e0b; font-weight: bold;",
    };
    console.log(`%c${message}`, styles[type] || styles.info);
  },

  async login() {
    this.renderHeader();
    this.renderStatus("Initializing secure connection...", "info");

    // Check if already logged in
    if (this.sessionToken && Date.now() < this.sessionExpiry) {
      const remaining = Math.floor((this.sessionExpiry - Date.now()) / 60000);
      this.renderStatus(
        `✓ Already authenticated. Session active for ${remaining}m`,
        "success"
      );
      console.log("");
      console.log(
        "%c>> Run sudokuAdmin.open() to launch interface <<",
        "background: #4f46e5; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;"
      );
      return;
    }

    // Prompt for credentials
    const username = prompt("Admin Username:");
    if (!username) {
      this.renderStatus("❌ Login cancelled", "error");
      return;
    }

    const password = prompt("Admin Password:");
    if (!password) {
      this.renderStatus("❌ Login cancelled", "error");
      return;
    }

    this.renderStatus("🔒 Encrypting credentials...", "info");

    // Hash password (SHA-256)
    const passwordHash = await this.sha256(password);

    const apiUrl = window.CONFIG?.API_URL;
    if (!apiUrl) {
      this.renderStatus("❌ Configuration Error: API_URL is missing.", "error");
      console.log("Check public/config/config.local.js");
      return;
    }

    this.renderStatus("📡 Connecting to secure backend...", "info");

    const requestUrl = `${apiUrl}?action=adminLogin&username=${encodeURIComponent(
      username
    )}&passwordHash=${passwordHash}`;

    // Request session token from backend
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(requestUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        this.renderStatus(
          "❌ Protocol Error: Invalid response from server",
          "error"
        );
        console.log("Raw response:", text.substring(0, 100));
        return;
      }

      if (data.success && data.token) {
        this.sessionToken = data.token;
        this.sessionExpiry =
          Date.now() + (window.ADMIN_CONFIG?.SESSION_TIMEOUT || 30 * 60 * 1000);

        // this.renderHeader(); // Removed to prevent console grouping confusion
        console.log("");
        this.renderStatus("✓ ACCESS GRANTED", "success");
        console.log("----------------------------------------");
        console.log("");
        console.log(
          `%cSession Token: ${this.sessionToken.substring(0, 12)}...`,
          "color: #6b7280; font-family: monospace;"
        );
        console.log(
          `%cExpires: ${new Date(this.sessionExpiry).toLocaleTimeString()}`,
          "color: #6b7280;"
        );
        console.log("");
        console.log(
          "%c>> Run sudokuAdmin.open() to launch interface <<",
          "background: #4f46e5; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px; display: block; margin-top: 10px;"
        );

        // Auto-open prompt
        console.log("");
        console.log(
          "%c(Or type sudokuAdmin.logout() to exit)",
          "color: #9ca3af; font-size: 11px;"
        );
      } else {
        this.renderStatus(
          `❌ Access Denied: ${data.error || "Invalid credentials"}`,
          "error"
        );
      }
    } catch (err) {
      this.renderStatus(`❌ Connection Failed: ${err.message}`, "error");
      console.log("Verify backend deployment and network connection.");
    }
  },

  open() {
    if (!this.sessionToken || Date.now() >= this.sessionExpiry) {
      console.error("❌ Not authenticated. Run sudokuAdmin.login() first.");
      return;
    }

    if (this.consoleInstance) {
      console.log("⚠️ Console already open");
      return;
    }

    // Check if React and AdminConsole are available
    if (!React || !AdminConsole) {
      console.error(
        "❌ Admin Console component not loaded. Ensure admin.jsx is included."
      );
      return;
    }

    // Create container
    const container = document.createElement("div");
    container.id = "admin-console-root";
    document.body.appendChild(container);

    // Render admin console
    const root = ReactDOM.createRoot(container);
    root.render(
      React.createElement(AdminConsole, {
        sessionToken: this.sessionToken,
        onClose: () => {
          root.unmount();
          container.remove();
          this.consoleInstance = null;
          console.log("✓ Admin console closed");
        },
      })
    );

    this.consoleInstance = root;
    console.log("✓ Admin console opened");
  },

  logout() {
    this.sessionToken = null;
    this.sessionExpiry = null;

    if (this.consoleInstance) {
      // Close console if open
      const container = document.getElementById("admin-console-root");
      if (container) {
        const root = ReactDOM.createRoot(container);
        root.unmount();
        container.remove();
      }
      this.consoleInstance = null;
    }

    console.log("✓ Logged out successfully");
  },

  status() {
    if (!this.sessionToken || Date.now() >= this.sessionExpiry) {
      console.log("Status: Not authenticated");
      console.log("Run sudokuAdmin.login() to authenticate");
      return;
    }

    const remaining = Math.floor((this.sessionExpiry - Date.now()) / 60000);
    console.log("Status: Authenticated ✓");
    console.log(`Session expires in: ${remaining} minutes`);
    console.log("Commands:");
    console.log("  sudokuAdmin.open()   - Open admin console");
    console.log("  sudokuAdmin.logout() - End session");
  },

  help() {
    console.log(
      "%c📖 Sudoku Labs Admin Console - Help",
      "font-size: 16px; font-weight: bold;"
    );
    console.log("");
    console.log("%cAvailable Commands:", "font-weight: bold;");
    console.log("  sudokuAdmin.login()  - Authenticate with admin credentials");
    console.log("  sudokuAdmin.open()   - Open the admin console interface");
    console.log("  sudokuAdmin.logout() - End your session");
    console.log("  sudokuAdmin.status() - Check authentication status");
    console.log("  sudokuAdmin.help()   - Show this help message");
    console.log("");
    console.log("%cConfiguration:", "font-weight: bold;");
    console.log("  Admin credentials are stored in config/admin.local.js");
    console.log("  This file must be created from admin.example.js");
    console.log("  Never commit admin.local.js to version control!");
    console.log("");
    console.log("%cSecurity Notes:", "font-weight: bold; color: #ff6600;");
    console.log("  • Sessions expire after 30 minutes");
    console.log("  • Passwords are hashed with SHA-256");
    console.log("  • One-time tokens are generated per session");
    console.log("  • Always logout when done");
  },

  // SHA-256 hash function
  async sha256(message) {
    if (!crypto || !crypto.subtle) {
      console.error(
        "❌ Web Crypto API not available. Ensure you are using HTTPS or localhost."
      );
      throw new Error("Web Crypto API unavailable");
    }
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  },
};

// Expose to window
window.sudokuAdmin = AdminManager;

// Show welcome message on load
console.log("%c🎮 Sudoku Labs", "font-size: 16px; font-weight: bold;");
console.log(
  "%cAdmin console available. Type sudokuAdmin.help() for commands.",
  "color: #666;"
);
