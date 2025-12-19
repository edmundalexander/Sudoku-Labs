/**
 * Admin Configuration Template
 *
 * Copy this file to admin.local.js (gitignored) and set your admin credentials.
 * NEVER commit admin.local.js to version control!
 *
 * Usage in browser console:
 *   sudokuAdmin.login()
 */

window.ADMIN_CONFIG = {
  // Session timeout in milliseconds (default 30 minutes)
  SESSION_TIMEOUT: 30 * 60 * 1000,

  // Admin Trigger Token
  // Used for automated maintenance tasks (server-to-server)
  // Not used for browser login
  ADMIN_TRIGGER_TOKEN: "YOUR_TRIGGER_TOKEN_HERE",
};
