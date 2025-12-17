# Authentication Setup Guide

This guide explains how to set up and deploy the optional authentication system for Sudoku Logic Lab.

## Overview

The authentication system is **completely optional** and designed to give equal weight to three modes:

1. **Guest Mode** - Play without signing up (default behavior, no changes from before)
2. **Register** - Create a new account to track stats across devices
3. **Login** - Sign in with existing account to access saved progress

**Key Features:**
- Non-forceful: Users can always choose to continue as guest
- Equal prominence: All three options are presented with equal visual weight
- Backwards compatible: Existing guest users can continue playing without interruption
- Cloud sync: Authenticated users get their progress synced across devices
- Stats tracking: Win/loss ratios, total games played, and more

## Prerequisites

Before setting up authentication, you must have already completed the basic deployment from [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md).

## Backend Setup (Google Apps Script)

### 1. Update Your Apps Script Code

If you've already deployed the backend, you need to update it with the new authentication endpoints:

1. Go to https://script.google.com/home
2. Open your existing "Sudoku Logic Lab API" project
3. Replace the entire `Code.gs` content with the updated version from `apps_script/Code.gs` in this repository
4. Save (Ctrl+S)

### 2. Initialize the Users Sheet

The authentication system requires a new sheet called "Users" in your Google Sheet:

1. In the Apps Script editor, select the function dropdown
2. Choose `setupSheets_` from the list
3. Click the **Run** button (▶️)
4. Check the execution log - you should see "Sheets initialized successfully"

This will create a new "Users" sheet with the following columns:
- UserID (unique identifier)
- Username (login name)
- PasswordHash (simple hash - see security note below)
- CreatedAt (timestamp)
- DisplayName (shown in UI)
- TotalGames (counter)
- TotalWins (counter)

### 3. Redeploy the Web App

After updating the code, you need to create a new deployment:

1. Click **Deploy** → **New Deployment**
2. Type: **Web App**
3. Description: "v2 - Added Authentication" (or similar)
4. Execute as: **Your email address**
5. Who has access: **"Anyone"** ⚠️ **CRITICAL - MUST BE "Anyone"**
6. Click **Deploy**

**Important:** If you create a new deployment, you'll get a new URL. Make sure to update your `config/config.local.js` with the new deployment URL.

Alternatively, you can update the existing deployment:
1. Click **Deploy** → **Manage Deployments**
2. Click the edit icon (✏️) on your existing Web App deployment
3. Create new version
4. Click **Deploy**
5. The URL stays the same

## Frontend Setup

The frontend code has already been updated in this repository. No additional configuration is needed - the authentication UI will automatically appear contextually when needed.

### How It Works - Natural Flow Authentication

The authentication system uses a **natural flow** approach - users are only prompted to sign in when they need a feature that benefits from authentication:

1. **Playing Games**: Users can immediately start playing without any authentication prompt
2. **Winning a Game**: After completing a puzzle, users see a contextual prompt suggesting they create an account to save their score to the cloud leaderboard
3. **Using Chat**: When trying to send a chat message, users are prompted to sign in to establish their identity
4. **Viewing Leaderboard**: When opening the leaderboard, users get a contextual prompt suggesting authentication to track their own progress

### Authentication Modal

When prompted, users see a modal with three equal options:
- 🎮 **Continue as Guest** - Proceed without signing in
- 🔑 **Login** - Sign in to existing account
- ✨ **Register** - Create a new account

Each context provides specific messaging explaining why authentication would be helpful:
- **Chat**: "💬 Chat with others and share strategies"
- **Leaderboard**: "🏆 Keep your scores and track your improvement"
- **Profile**: "📊 View your win rate and total games played"

### Guest Mode (Default)

- No authentication required to play
- Progress saved locally in browser (localStorage)
- Random username assigned (e.g., "Guest1234")
- Works offline
- Can send chat messages as guest (if backend is configured)

### Authenticated Mode

When a user logs in or registers:
- Username appears in the top-left corner of the main menu
- Stats tracked in Google Sheets Users table
- Progress synced across devices
- Campaign progress still local (by design)
- Identified in chat and leaderboard

## Testing the Authentication System

### 1. Test Natural Flow - Win a Game

1. Open your deployed game
2. Start a Quick Play game (any difficulty)
3. Complete the puzzle successfully
4. After winning, you should see an authentication prompt after ~1.5 seconds
5. The prompt will explain "Save Your Score" and suggest creating an account
6. You can choose to continue as guest or sign up

### 2. Test Natural Flow - Chat

1. Open the game
2. Click the chat button in the bottom-right
3. Try to send a message as a guest
4. You should see an authentication prompt explaining "Join the Conversation"
5. You can choose to sign in or continue as guest

### 3. Test Natural Flow - Leaderboard

1. Open the game
2. Click "View Leaderboard" button during gameplay
3. You should see an authentication prompt suggesting you track your progress
4. The leaderboard will still open regardless of your choice

### 4. Test Registration

1. When any auth prompt appears, click "✨ Register"
2. Enter a username (min 3 characters) and password (min 6 characters)
3. Click "Create Account"
4. You should see your username in the top-left corner of the main menu

### 5. Verify in Google Sheets

1. Open your Google Sheet
2. Navigate to the "Users" tab
3. You should see your new user with:
   - A unique UserID
   - Your username
   - A password hash
   - Creation timestamp
   - 0 total games and wins initially

### 6. Test Login

1. Click "Logout" in the top-left corner (on main menu)
2. Win another game or try to use chat to trigger an auth prompt
3. Click "🔑 Login"
4. Enter the same username and password
5. Click "Login"
6. You should be logged back in with your username showing

### 7. Test Guest Mode

1. Open the game (or logout)
2. Start playing without signing in
3. Win a game - you'll see the auth prompt but can choose "Continue as Guest"
4. Your score saves locally only
5. All features work, but progress isn't synced

### 8. Test Stats Tracking

1. Login with your account
2. Start a game (Quick Play - any difficulty)
3. Complete the puzzle successfully
4. Check the Users sheet - TotalGames and TotalWins should increment

## Security Considerations

### ⚠️ Important Security Notes

**This authentication system uses a simple hash function and is NOT suitable for protecting sensitive data.**

The current implementation:
- Uses a basic hash function for demonstration purposes
- Stores passwords hashed (not plain text)
- Transmits credentials over HTTPS (Google's security)
- Is appropriate for game scores and non-sensitive data

**For Production Use:**

If you plan to collect any sensitive information, you should:

1. **Use a proper authentication provider** like:
   - Firebase Authentication
   - Auth0
   - Google OAuth
   - Other established identity providers

2. **Or implement proper security:**
   - Use bcrypt or similar for password hashing
   - Add salt to passwords
   - Implement rate limiting
   - Add CSRF protection
   - Use proper session management

3. **Privacy considerations:**
   - Add a privacy policy
   - Comply with GDPR/CCPA if applicable
   - Allow users to delete their data
   - Don't collect more data than necessary

### Current Security Model

The current system is designed for:
- Casual game authentication
- Tracking game statistics
- Syncing progress across devices
- **Not** for protecting sensitive personal information

## Troubleshooting

### "Authentication requires GAS backend" Message

If you see this message when trying to login/register:
- Make sure your `config/config.local.js` has the correct `GAS_URL`
- Verify the GAS_URL points to a deployed Apps Script
- Check that the deployment is set to "Anyone" access

### Login/Register Fails

1. **Check Apps Script execution log:**
   - Go to Apps Script editor
   - View → Execution log
   - Look for errors in recent executions

2. **Verify setupSheets_ was run:**
   - Check your Google Sheet has a "Users" tab
   - Verify it has the correct column headers

3. **Test the backend directly:**
   ```bash
   # Test registration endpoint
   curl "YOUR_GAS_URL?action=register&username=testuser&password=testpass123"
   
   # Should return: {"success":true,"user":{...}}
   ```

### User Already Exists Error

- Usernames must be unique
- Try a different username
- Or delete the row from the Users sheet to start fresh

### Stats Not Updating

1. Verify you're logged in (see username in top-left)
2. Check that games are completing successfully
3. Look at the Users sheet after completing a game
4. Check browser console (F12) for any errors

## API Endpoints Reference

The authentication system adds these new endpoints to your GAS API:

| Endpoint | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `register` | `username`, `password` | `{success, user, error?}` | Create new account |
| `login` | `username`, `password` | `{success, user, error?}` | Authenticate user |
| `getUserProfile` | `userId` | `{success, user, error?}` | Get user data |
| `updateUserProfile` | `userId`, `displayName?`, `incrementGames?`, `incrementWins?` | `{success, error?}` | Update user stats |

All endpoints use GET requests to avoid POST redirect issues (same as other endpoints).

## Migration Notes

### For Existing Users

Existing users who have been playing as guests can:
- Continue playing as guests with no changes
- Create an account to start tracking stats going forward
- Their local campaign progress remains intact

### For Developers

If you've customized the code:
- The getUserId() function now checks for authenticated users first
- Campaign progress is still stored locally (not per-user)
- Leaderboard submissions use the authenticated username if available
- All authentication is optional - the app works without GAS backend

## Next Steps

After setting up authentication:

1. **Test thoroughly** - Try all three modes (guest, register, login)
2. **Monitor the Users sheet** - Watch for any issues with user creation
3. **Consider privacy** - Add a privacy policy if collecting user data
4. **Plan for scale** - The simple hash is fine for small user bases
5. **Get feedback** - See how users interact with the three-option modal

## Support

If you encounter issues:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
2. Review the Apps Script execution logs
3. Check browser console for frontend errors
4. Verify all deployment steps were followed

Remember: **Authentication is completely optional**. Users can always choose to play as guests!
