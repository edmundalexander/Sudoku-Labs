#!/bin/bash
# Quick setup script for production deployment with subdirectory BASE_PATH

echo "==================================="
echo "Sudoku Labs - Production Setup"
echo "==================================="
echo ""
echo "This script will help you configure the app for subdirectory deployment"
echo "(e.g., GitHub Pages at username.github.io/Sudoku-Labs)"
echo ""

# Check if config.local.js already exists
if [ -f "config/config.local.js" ]; then
    echo "⚠️  Warning: config/config.local.js already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted. Your existing config.local.js was not modified."
        exit 0
    fi
fi

# Get GAS_URL
echo "Enter your Google Apps Script deployment URL:"
echo "(e.g., https://script.google.com/macros/s/YOUR_ID/exec)"
read -p "GAS_URL: " gas_url

# Get BASE_PATH
echo ""
echo "Enter your base path (subdirectory where the app is deployed):"
echo "Examples:"
echo "  - For GitHub Pages (username.github.io/Sudoku-Labs): /Sudoku-Labs"
echo "  - For root domain (example.com): leave empty (press Enter)"
read -p "BASE_PATH: " base_path

# Validate BASE_PATH format
if [ -n "$base_path" ] && [[ ! "$base_path" =~ ^/ ]]; then
    base_path="/$base_path"
    echo "ℹ️  Auto-corrected BASE_PATH to: $base_path"
fi

# Create config.local.js
cat > config/config.local.js << EOF
// Production configuration
const CONFIG = {
  GAS_URL: '$gas_url',
  BASE_PATH: '$base_path',
};

window.CONFIG = CONFIG;
EOF

echo ""
echo "✅ Configuration created successfully!"
echo ""
echo "📄 File: config/config.local.js"
echo "   GAS_URL: $gas_url"
echo "   BASE_PATH: $base_path"
echo ""
echo "Next steps:"
echo "1. Deploy this directory to your web server"
echo "2. Open the app in your browser"
echo "3. Background images and themes should now work correctly!"
echo ""
