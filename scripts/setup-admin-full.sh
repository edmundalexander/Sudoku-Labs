#!/bin/bash
# ============================================================================
# Sudoku Labs - Automated Admin Console Setup with Google Apps Script
# ============================================================================
#
# This script automates the ENTIRE admin console setup including:
# 1. Frontend configuration (admin.local.js)
# 2. Google Apps Script authentication
# 3. Code deployment to GAS
# 4. Script Properties configuration
# 5. Running setupSheets_() function
# 6. Web app deployment
#
# Requirements:
# - Node.js and npm installed
# - Google account with access to your GAS project
# - GAS project already created with a Google Sheet
#
# Usage: bash scripts/setup-admin-full.sh
#
# Troubleshooting:
# - If authentication fails: clasp logout && clasp login
# - If push fails: Check Script ID and project access
# - For manual setup: bash scripts/setup-admin.sh
# ============================================================================

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║     Sudoku Labs - Automated Admin Console Setup (Full)              ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  If you encounter authentication issues, you can always fall back to:"
echo "   bash scripts/setup-admin.sh (manual setup)"
echo ""
echo "This script will automate the ENTIRE admin setup process including"
echo "Google Apps Script deployment and configuration."
echo ""

# ============================================================================
# Step 1: Check for clasp (Google Apps Script CLI)
# ============================================================================

echo "📦 Checking for Google Apps Script CLI (clasp)..."
if ! command -v clasp &> /dev/null; then
    echo ""
    echo "⚠️  clasp (Google Apps Script CLI) is not installed."
    echo ""
    read -p "Would you like to install it now? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Installing clasp globally..."
        npm install -g @google/clasp
        echo "✅ clasp installed successfully!"
    else
        echo ""
        echo "❌ Cannot proceed without clasp. Please install it manually:"
        echo "   npm install -g @google/clasp"
        echo ""
        echo "Or run the basic setup script instead:"
        echo "   bash scripts/setup-admin.sh"
        exit 1
    fi
else
    echo "✅ clasp is installed"
fi

echo ""

# ============================================================================
# Step 2: Check clasp login status
# ============================================================================

echo "🔐 Checking Google authentication..."

# Always try to check status more thoroughly
CLASP_STATUS_OUTPUT=$(clasp login --status 2>&1)

if echo "$CLASP_STATUS_OUTPUT" | grep -qi "not.*logged.*in\|no.*credentials"; then
    echo ""
    echo "You need to authenticate with Google to manage Apps Script."
    echo "This is a one-time setup that will open a browser window."
    echo ""
    read -p "Press Enter to authenticate with Google..."
    
    clasp login
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Authentication failed. Please try again or use manual setup."
        exit 1
    fi
    
    echo "✅ Successfully authenticated!"
else
    echo "✅ Already authenticated with Google"
    echo "   If you encounter issues, try: clasp logout && clasp login"
fi

echo ""

# ============================================================================
# Step 3: Get or Clone GAS Project
# ============================================================================

echo "📋 Google Apps Script Project Setup"
echo ""
echo "You need a GAS project ID. You can:"
echo "  1. Use an existing project (recommended if you have one)"
echo "  2. Clone an existing project by ID"
echo "  3. Create a new project"
echo ""

read -p "Do you have a GAS project ID? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your GAS Script ID: " SCRIPT_ID
    
    # Create .clasp.json
    cat > "$PROJECT_ROOT/.clasp.json" << EOF
{
  "scriptId": "$SCRIPT_ID",
  "rootDir": "$PROJECT_ROOT/backend/gas"
}
EOF
    
    echo "✅ Project configured"
else
    echo ""
    echo "To get your Script ID:"
    echo "  1. Open your Google Apps Script project"
    echo "  2. Click Project Settings (gear icon)"
    echo "  3. Copy the Script ID"
    echo ""
    echo "Then run this script again with the Script ID."
    echo ""
    echo "Alternatively, you can use the manual setup:"
    echo "  bash scripts/setup-admin.sh"
    exit 0
fi

echo ""

# ============================================================================
# Step 4: Frontend Configuration (admin.local.js)
# ============================================================================

echo "🔧 Frontend Configuration"
echo ""

# Check if admin.local.js already exists
if [ -f "$PROJECT_ROOT/config/admin.local.js" ]; then
    echo "⚠️  config/admin.local.js already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping frontend configuration..."
        SKIP_FRONTEND=true
    fi
fi

if [ "$SKIP_FRONTEND" != "true" ]; then
    # Get admin credentials
    read -p "Enter admin username: " admin_username
    if [ -z "$admin_username" ]; then
        echo "❌ Username cannot be empty"
        exit 1
    fi

    echo ""
    echo "Enter admin password (min 8 characters recommended):"
    read -s admin_password
    echo ""

    if [ -z "$admin_password" ]; then
        echo "❌ Password cannot be empty"
        exit 1
    fi

    echo "Confirm admin password:"
    read -s admin_password_confirm
    echo ""

    if [ "$admin_password" != "$admin_password_confirm" ]; then
        echo "❌ Passwords do not match"
        exit 1
    fi

    # Generate SHA-256 hash
    echo "🔐 Generating password hash..."
    password_hash=$(echo -n "$admin_password" | shasum -a 256 | awk '{print $1}')

    # Create admin.local.js
    cat > "$PROJECT_ROOT/config/admin.local.js" << EOF
/**
 * Admin Configuration (Local)
 * 
 * ⚠️  NEVER commit this file to version control!
 * 
 * Generated: $(date)
 */

window.ADMIN_CONFIG = {
  // Admin username
  ADMIN_USERNAME: '$admin_username',
  
  // Admin password hash (SHA-256)
  ADMIN_PASSWORD_HASH: '$password_hash',
  
  // Session timeout in milliseconds (default 30 minutes)
  SESSION_TIMEOUT: 30 * 60 * 1000
};
EOF

    echo "✅ Frontend configuration created"
else
    # Read existing config for backend setup
    if [ -f "$PROJECT_ROOT/config/admin.local.js" ]; then
        admin_username=$(grep "ADMIN_USERNAME:" "$PROJECT_ROOT/config/admin.local.js" | sed "s/.*ADMIN_USERNAME: '\(.*\)'.*/\1/")
        password_hash=$(grep "ADMIN_PASSWORD_HASH:" "$PROJECT_ROOT/config/admin.local.js" | sed "s/.*ADMIN_PASSWORD_HASH: '\(.*\)'.*/\1/")
        echo "✅ Using existing frontend configuration"
    fi
fi

echo ""

# ============================================================================
# Step 5: Push Code to Google Apps Script
# ============================================================================

echo "📤 Deploying code to Google Apps Script..."
cd "$PROJECT_ROOT"

# Verify .clasp.json exists
if [ ! -f ".clasp.json" ]; then
    echo "❌ .clasp.json not found. Please check project configuration."
    exit 1
fi

echo "Using project configuration:"
cat .clasp.json
echo ""

# Try to get project info first (this validates auth and project access)
echo "Verifying project access..."
if ! clasp open --cwd; then
    echo ""
    echo "⚠️  Could not verify project access."
    echo ""
    echo "Please ensure:"
    echo "  1. You're logged in: clasp login --status"
    echo "  2. Script ID is correct"
    echo "  3. You have access to the project"
    echo ""
    read -p "Do you want to re-authenticate? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        clasp logout
        clasp login
        if [ $? -ne 0 ]; then
            echo "❌ Authentication failed"
            exit 1
        fi
    else
        echo "Please check your setup and try again."
        exit 1
    fi
fi

# Push the code
echo "Pushing code to Google Apps Script..."
if clasp push --force; then
    echo "✅ Code deployed successfully!"
else
    echo "❌ Failed to deploy code"
    echo ""
    echo "Troubleshooting steps:"
    echo "  1. Verify authentication: clasp logout && clasp login"
    echo "  2. Check Script ID is correct in .clasp.json"
    echo "  3. Ensure Apps Script API is enabled:"
    echo "     https://script.google.com/home/usersettings"
    echo "  4. Try opening project manually: clasp open"
    echo ""
    exit 1
fi

echo ""

# ============================================================================
# Step 6: Set Script Properties
# ============================================================================

echo "🔑 Setting Script Properties..."

# Note: clasp doesn't have a direct command for script properties,
# so we'll create a temporary function to set them

TEMP_SETTER="$PROJECT_ROOT/backend/gas/TempPropertySetter.gs"
cat > "$TEMP_SETTER" << EOF
function setAdminProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('ADMIN_USERNAME', '$admin_username');
  scriptProperties.setProperty('ADMIN_PASSWORD_HASH', '$password_hash');
  Logger.log('Admin properties set successfully');
  return { success: true };
}
EOF

# Push the temporary file
clasp push --force

# Run the function
echo "Running setAdminProperties()..."
if clasp run setAdminProperties; then
    echo "✅ Script Properties configured!"
else
    echo "⚠️  Could not set properties automatically."
    echo "Please set them manually in Google Apps Script:"
    echo ""
    echo "  Key: ADMIN_USERNAME"
    echo "  Value: $admin_username"
    echo ""
    echo "  Key: ADMIN_PASSWORD_HASH"
    echo "  Value: $password_hash"
    echo ""
fi

# Clean up temporary file
rm -f "$TEMP_SETTER"

echo ""

# ============================================================================
# Step 7: Run setupSheets_() Function
# ============================================================================

echo "🗄️  Initializing database structure..."
echo "Running setupSheets_() function..."

if clasp run setupSheets_; then
    echo "✅ Database initialized with admin support!"
else
    echo "⚠️  Could not run setupSheets_() automatically."
    echo "Please run it manually in Google Apps Script:"
    echo "  1. Open your GAS project"
    echo "  2. Select function: setupSheets_"
    echo "  3. Click Run"
    echo ""
fi

echo ""

# ============================================================================
# Step 8: Deploy Web App
# ============================================================================

echo "🚀 Deploying Web App..."

# Get deployment info
DEPLOYMENT_INFO=$(clasp deployments)

if echo "$DEPLOYMENT_INFO" | grep -q "@HEAD"; then
    echo "✅ Web App already deployed"
    echo ""
    echo "To update the deployment:"
    echo "  1. Go to your GAS project"
    echo "  2. Click Deploy → Manage Deployments"
    echo "  3. Click Edit (pencil icon)"
    echo "  4. Click Deploy"
else
    echo ""
    echo "Creating new deployment..."
    echo ""
    echo "⚠️  Automated deployment creation is limited by Google's API."
    echo "Please complete deployment manually:"
    echo ""
    echo "  1. Open your GAS project in browser"
    echo "  2. Click Deploy → New Deployment"
    echo "  3. Select type: Web App"
    echo "  4. Execute as: Your email"
    echo "  5. Who has access: Anyone"
    echo "  6. Click Deploy"
    echo "  7. Copy the deployment URL"
    echo ""
fi

# ============================================================================
# Step 9: Summary
# ============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                        Setup Complete! 🎉                            ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ What was completed:"
echo "  • Frontend configuration (config/admin.local.js)"
echo "  • Code deployed to Google Apps Script"
echo "  • Script Properties configured"
echo "  • Database structure initialized"
echo ""
echo "📋 Manual steps (if needed):"
echo ""
echo "1. Verify Script Properties in GAS:"
echo "   File → Project Properties → Script Properties"
echo "   Should have: ADMIN_USERNAME and ADMIN_PASSWORD_HASH"
echo ""
echo "2. Ensure Web App is deployed:"
echo "   Deploy → Manage Deployments"
echo "   Should show active deployment"
echo ""
echo "3. Update your config/config.local.js with deployment URL"
echo ""
echo "🧪 Test the admin console:"
echo "  1. Open your Sudoku Labs site"
echo "  2. Open browser console (F12)"
echo "  3. Type: sudokuAdmin.login()"
echo "  4. Enter credentials when prompted"
echo "  5. Type: sudokuAdmin.open()"
echo ""
echo "📚 Documentation:"
echo "  • Quick Start: docs/ADMIN_QUICKSTART.md"
echo "  • Full Guide: docs/ADMIN_CONSOLE.md"
echo ""
echo "🔒 Security reminder:"
echo "  • config/admin.local.js is gitignored"
echo "  • .clasp.json is gitignored"
echo "  • Never share your credentials"
echo "  • Always logout: sudokuAdmin.logout()"
echo ""
