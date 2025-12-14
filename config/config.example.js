// ============================================================================
// Configuration Template (EXAMPLE ONLY)
// ============================================================================
// Copy this file to config/config.local.js and fill in your real values.
// The config.local.js file is in .gitignore and will NOT be committed.
//
// DO NOT commit real API keys or deployment URLs to GitHub!
// ============================================================================

const CONFIG = {
  // Google Apps Script Web App deployment URL
  // Get this from: https://script.google.com/home after deploying your script
  GAS_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',

  // Optional: Add other sensitive config here
  // API_KEY: 'your-api-key',
  // SECRET: 'your-secret',
};

// Make CONFIG available globally
window.CONFIG = CONFIG;
