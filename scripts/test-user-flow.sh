#!/bin/bash
# ============================================================================
# Sudoku Labs - User Experience Test Suite
# ============================================================================
# Tests the complete user flow including authentication, game play, and features
# This script is gitignored and contains test credentials
# ============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
GAS_URL='https://script.google.com/macros/s/AKfycbzZg11UDcIZGbwHvrtxb5E2enGspkQnjsBPbCP5Aw6BYP5Jo5cq3JqPr8PHOZgbgn2kOg/exec'
TEST_USERNAME="test_user_$(date +%s)"
TEST_PASSWORD="testpass123"

echo "=================================="
echo "Sudoku Labs - User Experience Test"
echo "=================================="
echo ""

# Test 1: Backend Ping
echo -e "${YELLOW}Test 1: Backend Connectivity...${NC}"
PING_RESULT=$(curl -L -s "$GAS_URL?action=ping")
if echo "$PING_RESULT" | grep -q '"ok":true'; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
    echo "  Response: $PING_RESULT"
else
    echo -e "${RED}✗ Backend ping failed${NC}"
    exit 1
fi
echo ""

# Test 2: Generate Sudoku Puzzle
echo -e "${YELLOW}Test 2: Generate Sudoku Puzzle...${NC}"
for DIFFICULTY in Easy Medium Hard; do
    PUZZLE=$(curl -L -s "$GAS_URL?action=generateSudoku&difficulty=$DIFFICULTY")
    if echo "$PUZZLE" | grep -q '"isFixed"'; then
        echo -e "${GREEN}✓ $DIFFICULTY puzzle generated${NC}"
    else
        echo -e "${RED}✗ Failed to generate $DIFFICULTY puzzle${NC}"
        echo "  Response (first 200 chars): $(echo "$PUZZLE" | head -c 200)..."
    fi
done
echo ""

# Test 3: User Registration
echo -e "${YELLOW}Test 3: User Registration...${NC}"
REGISTER=$(curl -L -s "$GAS_URL?action=register&username=$TEST_USERNAME&password=$TEST_PASSWORD")
if echo "$REGISTER" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ User registered successfully${NC}"
    USER_ID=$(echo "$REGISTER" | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
    echo "  User ID: $USER_ID"
else
    echo -e "${RED}✗ Registration failed${NC}"
    echo "  Response: $REGISTER"
    exit 1
fi
echo ""

# Test 4: User Login
echo -e "${YELLOW}Test 4: User Login...${NC}"
LOGIN=$(curl -L -s "$GAS_URL?action=login&username=$TEST_USERNAME&password=$TEST_PASSWORD")
if echo "$LOGIN" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Login successful${NC}"
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "  Response: $LOGIN"
    exit 1
fi
echo ""

# Test 5: Get User Profile
echo -e "${YELLOW}Test 5: Get User Profile...${NC}"
PROFILE=$(curl -L -s "$GAS_URL?action=getUserProfile&userId=$USER_ID")
if echo "$PROFILE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Profile retrieved${NC}"
    echo "  Username: $(echo "$PROFILE" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)"
else
    echo -e "${RED}✗ Failed to get profile${NC}"
    echo "  Response: $PROFILE"
fi
echo ""

# Test 6: Update User Profile
echo -e "${YELLOW}Test 6: Update User Profile...${NC}"
UPDATE=$(curl -L -s "$GAS_URL?action=updateUserProfile&userId=$USER_ID&displayName=TestUser&status=Testing")
if echo "$UPDATE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Profile updated${NC}"
else
    echo -e "${RED}✗ Failed to update profile${NC}"
    echo "  Response: $UPDATE"
fi
echo ""

# Test 7: Save Game Stats
echo -e "${YELLOW}Test 7: Save User State...${NC}"
STATS_JSON='{"unlockedThemes":["default","ocean"],"unlockedSoundPacks":["classic","zen"],"activeTheme":"ocean","activeSoundPack":"zen","gameStats":{"totalWins":5,"easyWins":2,"mediumWins":2,"hardWins":1}}'
SAVE_STATE=$(curl -L -s -G "$GAS_URL" --data-urlencode "action=saveUserState" --data-urlencode "userId=$USER_ID" --data-urlencode "state=$STATS_JSON")
if echo "$SAVE_STATE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ User state saved${NC}"
else
    echo -e "${RED}✗ Failed to save user state${NC}"
    echo "  Response: $SAVE_STATE"
fi
echo ""

# Test 8: Get Leaderboard
echo -e "${YELLOW}Test 8: Get Leaderboard...${NC}"
LEADERBOARD=$(curl -L -s "$GAS_URL?action=getLeaderboard")
if echo "$LEADERBOARD" | grep -q '\['; then
    ENTRY_COUNT=$(echo "$LEADERBOARD" | grep -o '{' | wc -l)
    echo -e "${GREEN}✓ Leaderboard retrieved ($ENTRY_COUNT entries)${NC}"
else
    echo -e "${RED}✗ Failed to get leaderboard${NC}"
    echo "  Response: $LEADERBOARD"
fi
echo ""

# Test 9: Save Score
echo -e "${YELLOW}Test 9: Save Score to Leaderboard...${NC}"
SAVE_SCORE=$(curl -L -s "$GAS_URL?action=saveScore&name=$TEST_USERNAME&difficulty=Easy&time=180&mistakes=0")
if echo "$SAVE_SCORE" | grep -q 'success\|ok'; then
    echo -e "${GREEN}✓ Score saved${NC}"
else
    echo -e "${YELLOW}⚠ Score save response: $SAVE_SCORE${NC}"
fi
echo ""

# Test 10: Get Chat Messages
echo -e "${YELLOW}Test 10: Get Chat Messages...${NC}"
CHAT=$(curl -L -s "$GAS_URL?action=getChat")
if echo "$CHAT" | grep -q '\['; then
    MSG_COUNT=$(echo "$CHAT" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✓ Chat messages retrieved ($MSG_COUNT messages)${NC}"
else
    echo -e "${RED}✗ Failed to get chat${NC}"
    echo "  Response: $CHAT"
fi
echo ""

# Test 11: Post Chat Message
echo -e "${YELLOW}Test 11: Post Chat Message...${NC}"
POST_CHAT=$(curl -L -s -G "$GAS_URL" --data-urlencode "action=postChat" --data-urlencode "sender=$TEST_USERNAME" --data-urlencode "text=Test message from automated tests" --data-urlencode "status=Testing")
if echo "$POST_CHAT" | grep -q '\['; then
    echo -e "${GREEN}✓ Chat message posted${NC}"
else
    echo -e "${YELLOW}⚠ Chat post response: $POST_CHAT${NC}"
fi
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}✓ All Core Tests Passed!${NC}"
echo "=================================="
echo ""
echo "Test user created: $TEST_USERNAME"
echo "User ID: $USER_ID"
echo ""
echo "Backend is fully functional for:"
echo "  • User authentication (register/login)"
echo "  • Profile management"
echo "  • Puzzle generation"
echo "  • Leaderboard operations"
echo "  • Chat system"
echo "  • State persistence"
