# Sudoku Logic Lab

A modern, feature-rich Sudoku game with campaign mode, real-time chat, leaderboards, and optional user authentication.

## Features

### Core Gameplay
- 🎮 **Multiple Difficulty Levels**: Easy, Medium, Hard, and Daily challenges
- 🗺️ **Campaign Saga**: Story-driven campaign with progressive difficulty
- ⏱️ **Timer & Mistake Tracking**: Track your performance
- ✏️ **Notes Mode**: Pencil in possible numbers
- ↩️ **Undo System**: Correct mistakes easily
- 🎨 **Dark Mode**: Easy on the eyes

### Social & Competitive
- 🏆 **Global Leaderboard**: Compete with players worldwide
- 💬 **Real-time Chat**: Communicate with other players
- 👥 **Optional Authentication**: Track stats across devices

### User Modes

The game supports three equal modes of play:

#### 🎮 Guest Mode (Default)
- Play immediately without signing up
- Progress saved locally in browser
- Full access to all game features
- Random username assigned (e.g., "Guest1234")

#### 🔑 Login
- Sign in to existing account
- Access stats from any device
- Track wins, losses, and completion time
- Progress synced to cloud

#### ✨ Register
- Create a new account
- Username and password protected
- Stats tracked across devices
- Keep your campaign progress

**All three options are presented with equal visual weight - users are never forced to create an account!**

## Quick Start

### For Players

1. **Visit the Game**: Go to the deployed GitHub Pages URL
2. **Choose Your Mode**:
   - Click "Continue as Guest" to play immediately
   - Or sign up/login for cloud sync
3. **Start Playing**: Choose Quick Play or Campaign Saga

### For Developers

See [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions.

**Quick Deploy:**
1. Deploy Google Apps Script backend
2. Configure `config/config.local.js` with your GAS URL
3. Push to GitHub with Pages enabled
4. Done!

## Architecture

- **Frontend**: React 18 (in-browser Babel compilation), hosted on GitHub Pages
- **Backend**: Google Apps Script Web App (serverless)
- **Database**: Google Sheets (4 sheets: Leaderboard, Chat, Logs, Users)
- **Communication**: HTTP GET requests to GAS API endpoints

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## Authentication System

The authentication system is:
- ✅ **Optional**: Users can always play as guests
- ✅ **Non-forceful**: Equal weight given to all three options
- ✅ **Simple**: Username + password (hashed)
- ✅ **Cloud-synced**: Stats tracked across devices
- ⚠️ **Demo-grade security**: Not suitable for sensitive data

**Important Security Note**: The current authentication uses a simple hash for demonstration purposes. For production use with sensitive data, implement proper authentication (Firebase, Auth0, OAuth, etc.). See [docs/AUTHENTICATION_SETUP.md](docs/AUTHENTICATION_SETUP.md) for details.

## Documentation

- **[DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment guide
- **[AUTHENTICATION_SETUP.md](docs/AUTHENTICATION_SETUP.md)** - Authentication system guide
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture details
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## Technology Stack

- **Frontend**:
  - React 18 (production build from CDN)
  - Tailwind CSS (CDN)
  - Babel Standalone (in-browser JSX compilation)
  - LocalStorage for guest mode

- **Backend**:
  - Google Apps Script (serverless)
  - Google Sheets (database)
  - RESTful API over HTTP GET

- **Hosting**:
  - GitHub Pages (frontend)
  - Google Cloud (backend via GAS)

## Development

### Local Development

1. Clone the repository
2. Create `config/config.local.js` (copy from `config/config.example.js`)
3. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open http://localhost:8000

**Note**: Without a configured GAS backend, the app will:
- Generate puzzles locally (offline mode)
- Store scores in LocalStorage only
- Disable chat and authentication features

### Project Structure

```
Sudoku-Labs/
├── apps_script/Code.gs      # Backend API
├── src/app.jsx              # React application
├── index.html               # HTML shell
├── config/                  # Configuration (gitignored)
├── docs/                    # Documentation
└── diagnostic.sh            # Health check script
```

## API Endpoints

### Core Endpoints
- `generateSudoku` - Generate a new puzzle
- `getLeaderboard` - Fetch top scores
- `saveScore` - Submit a score
- `getChat` - Get chat messages
- `postChat` - Send a message
- `logError` - Log client errors

### Authentication Endpoints (Optional)
- `register` - Create new account
- `login` - Authenticate user
- `getUserProfile` - Get user stats
- `updateUserProfile` - Update user data

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full API documentation.

## Security & Privacy

### Current Implementation
- Guest mode: No data leaves the browser
- Chat & Leaderboard: Public, anyone can see
- Authentication: Simple hash (demonstration purposes)

### Recommendations for Production
- Use proper authentication provider (Firebase, Auth0, etc.)
- Implement bcrypt or similar for password hashing
- Add rate limiting and CSRF protection
- Create a privacy policy
- Allow users to delete their data
- Comply with GDPR/CCPA as applicable

## Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to:
- Open issues for bugs or feature requests
- Fork and experiment
- Share your improvements

## License

This project is open source and available for personal and educational use.

## Credits

Created by Edmund Alexander
- GitHub: [@edmund-alexander](https://github.com/edmund-alexander)
- Support: [Buy me a green tea](https://www.paypal.com/paypalme/edmundalexanders)

## Acknowledgments

- Sound effects: Web Audio API (procedurally generated)
- Icons: Heroicons
- Styling: Tailwind CSS
- Backend: Google Apps Script

---

**Version**: 2.1 - Added Optional Authentication System

**Last Updated**: December 2025
