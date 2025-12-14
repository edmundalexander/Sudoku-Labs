#!/usr/bin/env node

/**
 * AI Agent GAS Deployment Script
 * 
 * This script enables AI agents to automatically deploy updates to
 * Google Apps Script backend and manage Google Sheets database.
 * 
 * Prerequisites:
 * 1. Environment variables set:
 *    - CLASP_SCRIPT_ID: The GAS project script ID
 *    - CLASP_ACCESS_TOKEN: OAuth access token for clasp
 *    - CLASP_REFRESH_TOKEN: OAuth refresh token
 *    - CLASP_CLIENT_ID: OAuth client ID
 *    - CLASP_CLIENT_SECRET: OAuth client secret
 *    - GAS_SHEET_ID: Google Sheets ID for database
 * 
 * 2. clasp installed (npm install -g @google/clasp)
 * 
 * Usage:
 *   node scripts/deploy-gas.js [options]
 * 
 * Options:
 *   --push-only    Only push code, don't create new deployment
 *   --deploy-only  Only create new deployment, don't push code
 *   --dry-run      Show what would be done without doing it
 *   --help         Show this help message
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  pushOnly: args.includes('--push-only'),
  deployOnly: args.includes('--deploy-only'),
  dryRun: args.includes('--dry-run'),
  help: args.includes('--help')
};

// Show help
if (options.help) {
  console.log(`
AI Agent GAS Deployment Script

This script automates deployment of Google Apps Script backend.

Prerequisites:
  1. clasp installed: npm install -g @google/clasp
  2. Environment variables configured (see script header)
  3. .clasp.json file created with script ID

Usage:
  node scripts/deploy-gas.js [options]

Options:
  --push-only    Only push code, don't create new deployment
  --deploy-only  Only create new deployment, don't push code
  --dry-run      Show what would be done without doing it
  --help         Show this help message

Environment Variables:
  CLASP_SCRIPT_ID       GAS project script ID
  CLASP_ACCESS_TOKEN    OAuth access token
  CLASP_REFRESH_TOKEN   OAuth refresh token
  CLASP_CLIENT_ID       OAuth client ID
  CLASP_CLIENT_SECRET   OAuth client secret
  GAS_SHEET_ID          Google Sheets database ID
`);
  process.exit(0);
}

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const CLASP_JSON_PATH = path.join(ROOT_DIR, '.clasp.json');
const CLASPRC_PATH = path.join(ROOT_DIR, '.clasprc.json');
const CODE_GS_PATH = path.join(ROOT_DIR, 'apps_script', 'Code.gs');

// Utility functions
function log(message) {
  console.log(`[deploy-gas] ${message}`);
}

function error(message) {
  console.error(`[deploy-gas] ERROR: ${message}`);
  process.exit(1);
}

function exec(command, options = {}) {
  if (options.dryRun) {
    log(`[DRY RUN] Would execute: ${command}`);
    return '';
  }
  try {
    return execSync(command, { 
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: ROOT_DIR
    });
  } catch (err) {
    if (options.ignoreError) {
      return '';
    }
    error(`Command failed: ${command}\n${err.message}`);
  }
}

function checkPrerequisites() {
  log('Checking prerequisites...');
  
  // Check if clasp is installed
  try {
    exec('clasp --version', { silent: true, dryRun: options.dryRun });
    log('✓ clasp is installed');
  } catch (err) {
    error('clasp is not installed. Run: npm install -g @google/clasp');
  }
  
  // Check environment variables
  const requiredEnvVars = [
    'CLASP_SCRIPT_ID',
    'CLASP_ACCESS_TOKEN',
    'CLASP_REFRESH_TOKEN',
    'CLASP_CLIENT_ID',
    'CLASP_CLIENT_SECRET'
  ];
  
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    error(`Missing environment variables: ${missing.join(', ')}`);
  }
  log('✓ All required environment variables are set');
  
  // Check if Code.gs exists
  if (!fs.existsSync(CODE_GS_PATH)) {
    error(`Code.gs not found at: ${CODE_GS_PATH}`);
  }
  log('✓ Code.gs file exists');
}

function setupClaspConfig() {
  log('Setting up clasp configuration...');
  
  // Create .clasp.json
  const claspConfig = {
    scriptId: process.env.CLASP_SCRIPT_ID,
    rootDir: 'apps_script'
  };
  
  if (!options.dryRun) {
    fs.writeFileSync(CLASP_JSON_PATH, JSON.stringify(claspConfig, null, 2));
    log(`✓ Created .clasp.json with script ID: ${process.env.CLASP_SCRIPT_ID}`);
  } else {
    log('[DRY RUN] Would create .clasp.json');
  }
  
  // Create .clasprc.json (OAuth credentials)
  const clasprcConfig = {
    token: {
      access_token: process.env.CLASP_ACCESS_TOKEN,
      refresh_token: process.env.CLASP_REFRESH_TOKEN,
      scope: 'https://www.googleapis.com/auth/script.projects https://www.googleapis.com/auth/script.webapp.deploy https://www.googleapis.com/auth/drive.file',
      token_type: 'Bearer',
      expiry_date: Date.now() + 3600000 // 1 hour from now
    },
    oauth2ClientSettings: {
      clientId: process.env.CLASP_CLIENT_ID,
      clientSecret: process.env.CLASP_CLIENT_SECRET,
      redirectUri: 'http://localhost'
    },
    isLocalCreds: false
  };
  
  if (!options.dryRun) {
    fs.writeFileSync(CLASPRC_PATH, JSON.stringify(clasprcConfig, null, 2));
    log('✓ Created .clasprc.json with OAuth credentials');
  } else {
    log('[DRY RUN] Would create .clasprc.json');
  }
}

function updateSheetId() {
  if (!process.env.GAS_SHEET_ID) {
    log('⚠ GAS_SHEET_ID not set, skipping Sheet ID update');
    return;
  }
  
  log('Updating SHEET_ID in Code.gs...');
  
  if (options.dryRun) {
    log(`[DRY RUN] Would update SHEET_ID to: ${process.env.GAS_SHEET_ID}`);
    return;
  }
  
  let code = fs.readFileSync(CODE_GS_PATH, 'utf8');
  const oldSheetIdMatch = code.match(/const SHEET_ID = ['"]([^'"]+)['"]/);
  
  if (oldSheetIdMatch) {
    const oldSheetId = oldSheetIdMatch[1];
    code = code.replace(
      /const SHEET_ID = ['"][^'"]+['"]/,
      `const SHEET_ID = '${process.env.GAS_SHEET_ID}'`
    );
    fs.writeFileSync(CODE_GS_PATH, code);
    log(`✓ Updated SHEET_ID from ${oldSheetId} to ${process.env.GAS_SHEET_ID}`);
  } else {
    log('⚠ Could not find SHEET_ID in Code.gs');
  }
}

function pushCode() {
  if (options.deployOnly) {
    log('Skipping code push (--deploy-only specified)');
    return;
  }
  
  log('Pushing code to Google Apps Script...');
  exec('clasp push --force', { dryRun: options.dryRun });
  
  if (!options.dryRun) {
    log('✓ Code pushed successfully');
  }
}

function deployVersion() {
  if (options.pushOnly) {
    log('Skipping deployment (--push-only specified)');
    return;
  }
  
  log('Creating new deployment...');
  const timestamp = new Date().toISOString();
  const description = `Automated deployment by AI agent at ${timestamp}`;
  
  const output = exec(`clasp deploy --description "${description}"`, { 
    dryRun: options.dryRun,
    silent: false
  });
  
  if (!options.dryRun) {
    log('✓ Deployment created successfully');
    
    // Parse deployment ID from output if available
    const deploymentMatch = output.match(/Created version (\d+)/);
    if (deploymentMatch) {
      log(`   Version: ${deploymentMatch[1]}`);
    }
  }
}

function cleanup() {
  log('Cleaning up temporary files...');
  
  // Remove sensitive credential files
  if (!options.dryRun) {
    if (fs.existsSync(CLASPRC_PATH)) {
      fs.unlinkSync(CLASPRC_PATH);
      log('✓ Removed .clasprc.json');
    }
  } else {
    log('[DRY RUN] Would remove .clasprc.json');
  }
}

function showSummary() {
  log('');
  log('=== Deployment Summary ===');
  log(`Script ID: ${process.env.CLASP_SCRIPT_ID}`);
  if (process.env.GAS_SHEET_ID) {
    log(`Sheet ID: ${process.env.GAS_SHEET_ID}`);
  }
  log(`Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
  log('');
  log('Next steps:');
  log('1. Verify the deployment in Google Apps Script console');
  log('2. Test the API endpoints');
  log('3. Update frontend config if deployment URL changed');
  log('');
}

// Main execution
function main() {
  try {
    log('Starting AI Agent GAS Deployment...');
    log('');
    
    checkPrerequisites();
    setupClaspConfig();
    updateSheetId();
    pushCode();
    deployVersion();
    cleanup();
    
    showSummary();
    
    log('✓ Deployment completed successfully!');
    process.exit(0);
  } catch (err) {
    error(`Deployment failed: ${err.message}`);
  }
}

// Run main
main();
