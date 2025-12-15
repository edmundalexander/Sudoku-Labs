#!/bin/bash

###############################################################################
# AI Agent Setup Script for Google Apps Script Deployment
###############################################################################
# This script helps AI agents set up the clasp environment for automated
# GAS deployment. It can be run in CI/CD environments like GitHub Actions.
#
# Prerequisites:
# - Node.js and npm installed
# - Environment variables set (see docs/AI_AGENT_DEPLOYMENT.md)
#
# Usage:
#   ./scripts/setup-clasp.sh
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if running in CI environment
is_ci() {
    [ -n "$CI" ] || [ -n "$GITHUB_ACTIONS" ]
}

# Main setup function
main() {
    log_info "Starting clasp setup for AI agent deployment..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
    fi
    log_info "Node.js version: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
    fi
    log_info "npm version: $(npm --version)"
    
    # Install clasp globally (for CI environments)
    if is_ci; then
        log_info "CI environment detected, installing clasp globally..."
        npm install -g @google/clasp
    else
        log_info "Installing clasp locally..."
        npm install
    fi
    
    # Verify clasp installation
    if ! command -v clasp &> /dev/null; then
        log_error "clasp installation failed"
    fi
    log_info "clasp version: $(clasp --version)"
    
    # Check required environment variables
    log_info "Checking environment variables..."
    
    REQUIRED_VARS=(
        "CLASP_SCRIPT_ID"
        "CLASP_ACCESS_TOKEN"
        "CLASP_REFRESH_TOKEN"
        "CLASP_ID_TOKEN"
        "CLASP_CLIENT_ID"
        "CLASP_CLIENT_SECRET"
    )
    
    MISSING_VARS=()
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        else
            log_info "✓ $var is set"
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        log_error "Missing required environment variables: ${MISSING_VARS[*]}"
    fi
    
    # Optional: GAS_SHEET_ID
    if [ -z "$GAS_SHEET_ID" ]; then
        log_warn "GAS_SHEET_ID not set - SHEET_ID in Code.gs will not be updated"
    else
        log_info "✓ GAS_SHEET_ID is set"
    fi
    
    # Create .clasp.json
    log_info "Creating .clasp.json..."
    cat > .clasp.json <<EOF
{
  "scriptId": "$CLASP_SCRIPT_ID",
  "rootDir": "apps_script"
}
EOF
    log_info "✓ Created .clasp.json"
    
    # Create .clasprc.json (OAuth credentials)
    log_info "Creating .clasprc.json..."
    cat > .clasprc.json <<EOF
{
  "token": {
    "access_token": "$CLASP_ACCESS_TOKEN",
    "refresh_token": "$CLASP_REFRESH_TOKEN",
    "scope": "https://www.googleapis.com/auth/script.projects https://www.googleapis.com/auth/script.webapp.deploy https://www.googleapis.com/auth/drive.file",
    "token_type": "Bearer",
    "id_token": "$CLASP_ID_TOKEN",
    "expiry_date": $(( $(date +%s) * 1000 + 3600000 ))
  },
  "oauth2ClientSettings": {
    "clientId": "$CLASP_CLIENT_ID",
    "clientSecret": "$CLASP_CLIENT_SECRET",
    "redirectUri": "http://localhost"
  },
  "isLocalCreds": false
}
EOF
    log_info "✓ Created .clasprc.json"
    
    # Verify we can access the project
    log_info "Verifying access to GAS project..."
    if ! clasp status &> /dev/null; then
        log_warn "Could not verify project access (this may be normal)"
    else
        log_info "✓ Successfully accessed GAS project"
    fi
    
    log_info ""
    log_info "Setup complete! You can now:"
    log_info "  - Push code: clasp push --force"
    log_info "  - Deploy: clasp deploy"
    log_info "  - Or run: npm run deploy:gas"
    log_info ""
}

# Run main function
main "$@"
