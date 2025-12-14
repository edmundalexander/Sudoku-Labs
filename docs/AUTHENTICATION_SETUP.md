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

The frontend code has already been updated in this repository. No additional configuration is needed - the authentication UI will automatically appear on the main menu.

### How It Works

1. **On First Visit**: Users see a "Sign In" button in the top-left corner of the menu
2. **Clicking Sign In**: Opens a modal with three equal options:
   - 🎮 Continue as Guest
   - 🔑 Login  
   - ✨ Register
3. **After Authentication**: Username appears in top-left with a "Logout" button

### Guest Mode (Default)

- No changes to existing behavior
- Progress saved locally in browser (localStorage)
- Random username assigned (e.g., "Guest1234")
- Works offline

### Authenticated Mode

When a user logs in or registers:
- Username appears in the top-left corner
- Stats tracked in Google Sheets Users table
- Progress synced across devices
- Campaign progress still local (by design)

## Testing the Authentication System

### 1. Test Registration

1. Open your deployed game
2. Click "Sign In" button
3. Click "✨ Register"
4. Enter a username (min 3 characters) and password (min 6 characters)
5. Click "Create Account"
6. You should see your username in the top-left corner

### 2. Verify in Google Sheets

1. Open your Google Sheet
2. Navigate to the "Users" tab
3. You should see your new user with:
   - A unique UserID
   - Your username
   - A password hash
   - Creation timestamp
   - 0 total games and wins initially

### 3. Test Login

1. Click "Logout" in the top-left corner
2. Click "Sign In" button again
3. Click "🔑 Login"
4. Enter the same username and password
5. Click "Login"
6. You should be logged back in

### 4. Test Guest Mode

1. Open the game (or logout)
2. Click "Sign In" button
3. Click "🎮 Continue as Guest"
4. Modal closes and you can play as guest

### 5. Test Stats Tracking

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
