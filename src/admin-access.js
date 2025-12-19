import React from "react";
import ReactDOM from "react-dom/client";
import { AdminConsole } from "./components/admin/AdminConsole.jsx";

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

  async login() {
    console.log(
      "%c🔐 Sudoku Labs Admin Console",
      "font-size: 20px; font-weight: bold; color: #ff0000;"
    );
    console.log(
      "%cThis is a secure administrative console.",
      "font-size: 14px; color: #ff6600;"
    );
    console.log(
      "%cUnauthorized access is prohibited.",
      "font-size: 14px; color: #ff6600;"
    );
    console.log("");

    // Check if already logged in
    if (this.sessionToken && Date.now() < this.sessionExpiry) {
      const remaining = Math.floor((this.sessionExpiry - Date.now()) / 60000);
      console.log(
        `✓ Already authenticated. Session expires in ${remaining} minutes.`
      );
      console.log("Run sudokuAdmin.open() to open the console.");
      return;
    }

    // Prompt for credentials
    const username = prompt("Admin Username:");
    if (!username) {
      console.log("❌ Login cancelled");
      return;
    }

    const password = prompt("Admin Password:");
    if (!password) {
      console.log("❌ Login cancelled");
      return;
    }

    // Hash password (SHA-256)
    console.log("[Debug] Hashing password...");
    const passwordHash = await this.sha256(password);
    console.log(`[Debug] Generated Hash: ${passwordHash}`);

    const gasUrl = window.CONFIG?.GAS_URL;
    console.log(`[Debug] GAS URL: ${gasUrl}`);

    if (!gasUrl) {
      console.error("❌ Configuration Error: GAS_URL is missing.");
      console.log("Check public/config/config.local.js");
      return;
    }

    const requestUrl = `${gasUrl}?action=adminLogin&username=${encodeURIComponent(
      username
    )}&passwordHash=${passwordHash}`;
    console.log(
      `[Debug] Requesting: ${requestUrl.replace(
        /passwordHash=[^&]+/,
        "passwordHash=***"
      )}`
    );

    // Request session token from backend
    try {
      const response = await fetch(requestUrl);
      console.log(`[Debug] Response status: ${response.status}`);

      const text = await response.text();
      console.log(`[Debug] Raw response: ${text.substring(0, 200)}...`);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error(
          "❌ Failed to parse JSON response. Server might be returning HTML error."
        );
        return;
      }

      if (data.success && data.token) {
        this.sessionToken = data.token;
        this.sessionExpiry =
          Date.now() + (window.ADMIN_CONFIG?.SESSION_TIMEOUT || 30 * 60 * 1000);

        console.log(
          "%c✓ Authentication successful!",
          "color: #00ff00; font-weight: bold;"
        );
        console.log(
          `Session expires at: ${new Date(
            this.sessionExpiry
          ).toLocaleTimeString()}`
        );
        console.log("");
        console.log(
          "%cRun sudokuAdmin.open() to access the admin console.",
          "font-size: 14px; color: #00ffff;"
        );
        console.log("Run sudokuAdmin.logout() to end your session.");
      } else {
        console.error(
          "❌ Authentication failed:",
          data.error || "Unknown error"
        );
      }
    } catch (err) {
      console.error("❌ Login error:", err.message);
      console.log("");
      console.log(
        "%cNote: Backend admin endpoints may not be deployed yet.",
        "color: #ffff00;"
      );
      console.log(
        "Verify GAS_URL is configured and admin functions are deployed."
      );
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
