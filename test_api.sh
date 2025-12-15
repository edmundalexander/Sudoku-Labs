#!/bin/bash

# Test script for Sudoku-Labs API debugging
# Run this to verify backend is responding

GAS_URL="${1:-https://script.google.com/macros/d/1YOUR_DEPLOYMENT_ID/useweb}"

echo "🔍 Testing Sudoku-Labs Backend API"
echo "=================================="
echo ""

# Test 1: Ping
echo "Test 1: Backend Ping"
echo "---"
curl -s "$GAS_URL?action=ping" | jq . 2>/dev/null || echo "Could not parse JSON - check GAS_URL"
echo ""

# Test 2: Generate Sudoku
echo "Test 2: Generate Easy Sudoku"
echo "---"
SUDOKU=$(curl -s "$GAS_URL?action=generateSudoku&difficulty=Easy" | jq '.[] | select(.isFixed==true) | .value' | wc -l)
echo "Generated sudoku with $SUDOKU given cells"
echo ""

# Test 3: Get Leaderboard
echo "Test 3: Get Leaderboard"
echo "---"
curl -s "$GAS_URL?action=getLeaderboard" | jq 'length' && echo "leaderboard entries"
echo ""

echo "✅ Basic API tests complete!"
echo ""
echo "📝 Frontend Debug: Open browser console and run:"
echo "   window.runDebugTests()"
