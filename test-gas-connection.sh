#!/bin/bash

# Test GAS Connection by Deploying a Test Log
# This script tests the Google Apps Script backend connection
# by sending a test log entry to the Logs sheet in Google Sheets
#
# NOTE: This script requires internet access to script.google.com
# If running in a restricted environment, use test-gas-connection.html instead

set -e

echo "=========================================="
echo "SUDOKU-LABS GAS CONNECTION TEST"
echo "=========================================="
echo ""

# Check if we can resolve script.google.com
if ! ping -c 1 -W 2 script.google.com &> /dev/null && ! curl -s --max-time 2 https://script.google.com &> /dev/null; then
    echo "⚠️  WARNING: Cannot reach script.google.com"
    echo ""
    echo "This environment appears to have restricted internet access."
    echo "To test the GAS connection, please:"
    echo ""
    echo "  1. Open test-gas-connection.html in a web browser"
    echo "  2. Click the 'Test Connection' button"
    echo "  3. Check your Google Sheets 'Logs' tab for the test entry"
    echo ""
    echo "Alternative: Run this script from a machine with internet access."
    echo ""
    exit 0
fi

# Get the GAS URL from diagnostic.sh or use the default
GAS_URL="https://script.google.com/macros/s/AKfycbxrJHnw5xFDTPTYiaYPiQd-e0S0mQWF-6bYiHMBOOi3MxlvgVk_coN7Q2kDl_3IWL8M/exec"

echo "Testing GAS endpoint: $GAS_URL"
echo ""

# Test 1: Ping endpoint
echo "Test 1: Ping endpoint"
echo "====================="
echo "Sending ping request..."
PING_RESPONSE=$(curl -s --max-time 10 "$GAS_URL?action=ping" 2>&1)
echo "Response: $PING_RESPONSE"

if echo "$PING_RESPONSE" | grep -q '"ok".*true'; then
    echo "✓ Ping successful!"
else
    echo "✗ Ping failed!"
    echo "Response received: $PING_RESPONSE"
    exit 1
fi
echo ""

# Test 2: Send test log entry
echo "Test 2: Deploy test log entry"
echo "=============================="
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TEST_MESSAGE="GAS connection test - ${TIMESTAMP}"
USER_AGENT="test-gas-connection.sh/1.0"

echo "Sending test log entry..."
echo "  Type: test"
echo "  Message: $TEST_MESSAGE"
echo "  UserAgent: $USER_AGENT"
echo ""

# URL encode the parameters
TYPE_ENCODED="test"
MESSAGE_ENCODED=$(echo "$TEST_MESSAGE" | jq -sRr @uri)
AGENT_ENCODED=$(echo "$USER_AGENT" | jq -sRr @uri)

# Send the log request
LOG_URL="${GAS_URL}?action=logError&type=${TYPE_ENCODED}&message=${MESSAGE_ENCODED}&userAgent=${AGENT_ENCODED}&count=1"
echo "Request URL: $LOG_URL"
echo ""

LOG_RESPONSE=$(curl -s --max-time 10 "$LOG_URL" 2>&1)
echo "Response: $LOG_RESPONSE"

if echo "$LOG_RESPONSE" | grep -q '"logged".*true'; then
    echo "✓ Test log successfully deployed to Google Sheets!"
    echo ""
    echo "SUCCESS: GAS connection is working!"
    echo "Check the 'Logs' sheet in your Google Sheets database to verify the entry."
    exit 0
else
    echo "✗ Test log deployment failed!"
    echo "Response received: $LOG_RESPONSE"
    exit 1
fi
