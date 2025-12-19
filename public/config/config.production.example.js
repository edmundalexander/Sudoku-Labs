// ============================================================================
// Production Configuration Example (GitHub Pages / Subdirectory Deployment)
// ============================================================================
// Copy this file to config/config.local.js when deploying to a subdirectory
// (e.g., GitHub Pages at username.github.io/Sudoku-Labs)
//
// For subdirectory deployments, set BASE_PATH to your subdirectory name
// For root deployments (example.com/), leave BASE_PATH empty ('')
// ============================================================================

const CONFIG = {
  // Google Apps Script Web App deployment URL
  // Get this from your Apps Script deployment (see docs/DEPLOYMENT_CHECKLIST.md)
  GAS_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",

  // Base path for GitHub Pages deployment
  // Production URL: https://edmund-alexander.github.io/Sudoku-Labs/
  BASE_PATH: '/Sudoku-Labs',
};

// Make CONFIG available globally
window.CONFIG = CONFIG;
