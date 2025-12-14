# Development Setup Guide

Complete guide to setting up a local development environment for Sudoku Logic Lab.

## Overview

This guide covers:
- Local development setup
- Development tools
- Testing workflow
- Debugging techniques
- Best practices

**Time Required**: 15-20 minutes

## Prerequisites

### Required
- Git
- Modern web browser (Chrome/Firefox recommended)
- Text editor (VS Code recommended)

### Optional but Recommended
- Python 3 or Node.js (for local HTTP server)
- Browser developer tools knowledge
- Basic React familiarity

## Quick Setup

### 1. Clone Repository

```bash
# Clone the repo
git clone https://github.com/edmund-alexander/Sudoku-Labs.git
cd Sudoku-Labs

# Or fork first, then clone your fork
git clone https://github.com/YOUR_USERNAME/Sudoku-Labs.git
cd Sudoku-Labs
```

### 2. Configure Backend Connection

```bash
# Copy config template
cp config/config.example.js config/config.local.js

# Edit with your backend URL
# (or leave empty for client-only development)
vim config/config.local.js
```

### 3. Start Development Server

Choose your preferred method:

**Python:**
```bash
python -m http.server 8000
# Open http://localhost:8000
```

**Node.js (http-server):**
```bash
npm install -g http-server
http-server -p 8000
# Open http://localhost:8000
```

**VS Code Live Server:**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### 4. Open in Browser

Navigate to:
- `http://localhost:8000` (Python/http-server)
- Auto-opens with VS Code Live Server

## Development Tools

### Recommended VS Code Extensions

```bash
# Open VS Code
code .
```

Install these extensions:
- **Live Server** - Live reload during development
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Babel JavaScript** - Better JSX syntax highlighting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete

### Browser DevTools

**Chrome DevTools** (F12):
- Console - View logs and errors
- Network - Monitor API requests
- Application - Check local storage
- Sources - Debug JavaScript
- Elements - Inspect DOM

**Firefox Developer Tools** (F12):
- Similar features to Chrome
- Better CSS Grid tools
- Network throttling

## Project Structure

```
Sudoku-Labs/
├── index.html              # Entry point
├── src/
│   └── app.jsx            # React application
├── apps_script/
│   └── Code.gs            # Backend code
├── config/
│   ├── config.example.js  # Config template
│   └── config.local.js    # Your config (gitignored)
├── docs/                  # Documentation
├── wiki/                  # Wiki pages
├── diagnostic.sh          # API test script
└── favicon.svg            # Site icon
```

## Development Workflow

### 1. Create a Branch

```bash
# Feature branch
git checkout -b feature/my-feature

# Bug fix branch
git checkout -b fix/bug-description
```

### 2. Make Changes

Edit files in your editor:
- **Frontend UI**: `index.html`
- **React Components**: `src/app.jsx`
- **Backend API**: `apps_script/Code.gs`
- **Documentation**: `docs/` and `wiki/`

### 3. Test Locally

With Live Server, changes reload automatically. Otherwise:
1. Save your changes
2. Refresh browser (F5)
3. Check console for errors
4. Test affected features

### 4. Commit Changes

```bash
git add .
git commit -m "type: description"
git push origin feature/my-feature
```

See [Contributing](Contributing) for commit message format.

## Development Without Backend

You can develop the frontend without deploying the backend:

### What Works
- ✅ Sudoku puzzle generation (client-side)
- ✅ Game UI and interactions
- ✅ Timer and move counter
- ✅ Puzzle validation
- ✅ All visual features

### What Doesn't Work
- ❌ Leaderboard (needs backend)
- ❌ Chat (needs backend)
- ❌ Error logging to backend

### Mock Backend (Optional)

Create a mock backend for testing:

```javascript
// In config/config.local.js
const CONFIG = {
  GAS_URL: '', // Empty = use mock
  MOCK_MODE: true,
};

// In src/app.jsx, add mock responses:
const mockAPI = {
  getLeaderboard: () => Promise.resolve([
    { name: 'Test', time: 180, difficulty: 'Easy' }
  ]),
  saveScore: (data) => Promise.resolve({ success: true }),
  getChat: () => Promise.resolve([
    { id: '1', username: 'Bot', text: 'Hello!', timestamp: new Date() }
  ]),
};
```

## Debugging

### Console Logging

Add debug logs throughout the code:

```javascript
// Check variable values
console.log('Puzzle data:', puzzleData);

// Check function execution
console.log('generatePuzzle called with difficulty:', difficulty);

// Check API responses
console.log('API response:', response);

// Warn for important info
console.warn('Config not found, using defaults');

// Error for problems
console.error('Failed to load leaderboard:', error);
```

### React DevTools

Install React DevTools browser extension:
1. [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/)
2. [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

Features:
- Inspect React component tree
- View props and state
- Profile component performance
- Track renders

### Network Debugging

Monitor API calls:
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Trigger an API call
4. Click request to see:
   - Request URL
   - Request headers
   - Response data
   - Status code
   - Timing

### Debugging Tips

**Frontend Issues:**
```javascript
// Check if CONFIG is loaded
console.log('CONFIG:', typeof CONFIG !== 'undefined' ? CONFIG : 'not loaded');

// Test API connectivity
fetch(CONFIG.GAS_URL + '?action=ping')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Check React is loaded
console.log('React version:', React.version);
```

**Backend Issues:**
- Check Apps Script execution logs
- Test with `curl` (see [API Reference](API-Reference))
- Verify deployment settings
- Check Sheet permissions

## Testing

### Manual Testing Checklist

**Game Features:**
- [ ] Generate puzzle (all difficulties)
- [ ] Fill cells with numbers
- [ ] Clear cells
- [ ] Complete puzzle
- [ ] Validate solution
- [ ] Timer starts/stops
- [ ] Move counter increments

**UI Features:**
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Dark mode (if implemented)
- [ ] Animations smooth
- [ ] No layout shifts

**API Features (with backend):**
- [ ] Leaderboard loads
- [ ] Score saves
- [ ] Chat loads
- [ ] Chat posts
- [ ] Error logging works

### Browser Testing

Test in multiple browsers:
- ✅ Chrome (Windows/Mac/Linux)
- ✅ Firefox (Windows/Mac/Linux)
- ✅ Safari (Mac)
- ✅ Edge (Windows)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

### Performance Testing

Check performance:
1. Open DevTools → Performance tab
2. Record interaction
3. Analyze:
   - Load time < 2s
   - No janky animations
   - No memory leaks

### Automated Testing

Currently no automated tests. To add:

**Option 1: Jest + Testing Library**
```bash
npm install --save-dev jest @testing-library/react
```

**Option 2: Cypress**
```bash
npm install --save-dev cypress
```

**Option 3: Playwright**
```bash
npm install --save-dev @playwright/test
```

See [Testing Guide](Testing-Guide) for implementation details.

## Hot Reload Development

### VS Code Live Server

Automatically reloads on file changes:
1. Install Live Server extension
2. Right-click `index.html` → Open with Live Server
3. Edit files → Auto-reload!

### Browser Auto-Refresh

Enable auto-refresh in browser:
- Chrome: Use extension like "Auto Refresh"
- Firefox: Use extension like "Tab Reloader"

### Watch Scripts

Create a watch script for rebuilding:

```bash
# watch.sh
#!/bin/bash
while inotifywait -e modify src/app.jsx; do
  echo "Changes detected, reloading..."
  # Trigger rebuild or notification
done
```

## Code Style

### Formatting

Use Prettier for consistent formatting:

```bash
npm install --save-dev prettier

# Format all files
npx prettier --write "**/*.{js,jsx,html,css,md}"
```

### Linting

Use ESLint for code quality:

```bash
npm install --save-dev eslint eslint-plugin-react

# Lint files
npx eslint src/app.jsx
```

### EditorConfig

Create `.editorconfig`:
```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

## Git Workflow

### Branching Strategy

```
main (stable, deployed)
  ↓
feature/my-feature (your work)
```

### Before Committing

```bash
# Check what changed
git status
git diff

# Stage changes
git add specific-file.js
# or
git add .

# Commit with good message
git commit -m "feat: add hint button"

# Push to your branch
git push origin feature/my-feature
```

### Keeping Up to Date

```bash
# Fetch latest changes
git fetch upstream

# Merge into your branch
git checkout main
git merge upstream/main

# Rebase your feature branch
git checkout feature/my-feature
git rebase main
```

## Environment Setup

### Multiple Environments

**Development:**
```javascript
// config/config.dev.js
const CONFIG = {
  GAS_URL: 'https://script.google.com/.../exec', // Dev backend
  DEBUG: true,
};
```

**Production:**
```javascript
// config/config.prod.js
const CONFIG = {
  GAS_URL: 'https://script.google.com/.../exec', // Prod backend
  DEBUG: false,
};
```

Switch by changing which file `index.html` loads.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill it
kill -9 <PID>

# Or use different port
python -m http.server 8001
```

### Changes Not Appearing

1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Disable caching in DevTools (Network tab → Disable cache)
4. Check file is actually saved

### Module Not Found

If using build tools:
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### React Not Working

Check:
1. React CDN links in `index.html`
2. Browser console for errors
3. Babel script loading correctly
4. JSX syntax is valid

## Next Steps

- **[Contributing](Contributing)** - Contribution guidelines
- **[Code Structure](Code-Structure)** - Understanding the codebase
- **[Testing Guide](Testing-Guide)** - Writing tests
- **[API Reference](API-Reference)** - Backend API documentation

---

**Development environment ready! 🎉**

Start coding and building awesome features!
