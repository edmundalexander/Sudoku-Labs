#!/bin/bash

# Diagnostic checks for GAS API integration

echo "=========================================="
echo "SUDOKU-LABS GAS API DIAGNOSTICS"
echo "=========================================="
echo ""

GAS_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"

echo "1. Testing GAS Endpoint Connection"
echo "   URL: $GAS_URL"
echo ""

echo "2. GET Request to generateSudoku endpoint:"
echo "   Command: curl -I '$GAS_URL?action=ping'"
echo "   Response:"
curl -I "$GAS_URL?action=ping" 2>&1 | head -20
echo ""
echo ""

echo "3. Checking for CORS headers:"
echo "   Command: curl -H 'Origin: http://localhost:8000' -H 'Access-Control-Request-Method: GET' '$GAS_URL?action=ping'"
echo "   Response headers:"
curl -I -H "Origin: http://localhost:8000" "$GAS_URL?action=ping" 2>&1 | grep -i "access-control\|content-type\|status"
echo ""
echo ""

echo "4. Testing actual response (first 200 chars):"
curl -s "$GAS_URL?action=ping" 2>&1 | head -c 200
echo ""
echo ""

echo "=========================================="
echo "ANALYSIS:"
echo "=========================================="
echo ""
echo "If you see:"
echo "  ✓ 'Moved Temporarily' or '307' → GAS app needs redeployment"
echo "  ✓ JSON response → GAS app is working"
echo "  ✓ 403 Forbidden → Access permissions not set correctly"
echo "  ✓ 404 Not Found → Deployment ID may be incorrect"
echo ""
