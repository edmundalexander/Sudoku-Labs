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
  // Replace with your admin username
  ADMIN_USERNAME: "admin",

  // Replace with your admin password hash (SHA-256)
  // To generate: Use a SHA-256 generator with your password
  // Example online tool: https://emn178.github.io/online-tools/sha256.html
  ADMIN_PASSWORD_HASH: "YOUR_SHA256_HASH_HERE",

  // Session timeout in milliseconds (default 30 minutes)
  SESSION_TIMEOUT: 30 * 60 * 1000,
};
