# Sudoku Logic Lab 🧩

A modern, browser-based Sudoku game with leaderboard, chat, and campaign features. Built with React and Firebase App Hosting.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

- 🎮 **Multiple Difficulty Levels**: Easy, Medium, Hard, and Daily challenges
- 🏆 **Global Leaderboard**: Track your best times and compete with others
- 💬 **Chat System**: Discuss strategies and connect with other players
- 📊 **Campaign Mode**: Progress through increasingly challenging puzzles
- ⏱️ **Timer & Move Counter**: Track your solving efficiency
- 🎨 **Modern UI**: Clean, responsive design with dark mode support
- 🚀 **Cloud Architecture**: Hosted on Firebase App Hosting (Cloud Run)
- 🔒 **Privacy-First**: Optional authentication, play as guest by default

## 🚀 Quick Start

### For Players

Just visit the live game URL (once deployed).

### For Developers

1. **Clone the repository**

   ```bash
   git clone https://github.com/edmund-alexander/Sudoku-Labs.git
   cd Sudoku-Labs
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

   **Note:** The backend API runs separately. For full local development, you need to run the backend server or point to a deployed backend.
   To run the backend locally:
   ```bash
   npm start
   # Server runs on http://localhost:8080
   ```

4. **Build for Production**

   ```bash
   npm run build
   # Creates a self-contained dist/ folder with server and static assets
   ```

## 🏗️ Architecture

The application has migrated from a legacy Google Apps Script backend to a modern Node.js/Express server hosted on Firebase App Hosting.

**Tech Stack:**

- **Frontend**: React 18, Tailwind CSS, Vite
- **Backend**: Node.js (Express), Firebase Admin SDK
- **Database**: Firestore (NoSQL)
- **Hosting**: Firebase App Hosting (Cloud Run)

### Project Structure

```
Sudoku-Labs/
├── src/                    # Frontend Source code
│   ├── components/         # React Components
│   ├── lib/                # Utilities and Logic
│   ├── App.jsx             # Main Application Component
│   └── main.jsx            # Entry Point
├── server/                 # Backend Source code
│   ├── controllers/        # API Route Handlers
│   ├── lib/                # Backend Utilities
│   └── index.js            # Express Server Entry Point
├── public/                 # Static Assets (Images, Favicons)
├── apphosting.yaml         # Firebase App Hosting Configuration
└── vite.config.js          # Vite Build Configuration
```

## 📝 Configuration

Configuration is managed via Environment Variables (in `apphosting.yaml` for production or `.env` for local).

| Variable | Description |
| :--- | :--- |
| `FIREBASE_WEB_API_KEY` | Required for client-side Auth operations (Sign-in) |
| `ADMIN_PASSWORD_HASH` | SHA-256 hash of the admin password |
| `ADMIN_TOKEN_SECRET` | Secret key for signing admin session tokens |

_Local development note:_ The Firestore emulator listens on port **8081** to avoid clashing with the Express server on **8080** (update `firebase.json` if you need a different port).

## 🚢 Deployment

Deployment is automated via Firebase App Hosting.

1. Push changes to the `main` branch.
2. Firebase App Hosting detects the commit and triggers a build.
3. The `npm run build` script compiles the frontend and prepares the server.
4. The application is deployed to Cloud Run.

## 🔒 Security

- **Admin Access**: Protected by SHA-256 password hash and server-side token verification.
- **Input Sanitization**: All user inputs (chat, scores) are sanitized on the server to prevent XSS.
- **Environment Variables**: Sensitive credentials are stored in the environment, not hardcoded.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
