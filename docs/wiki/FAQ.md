# Frequently Asked Questions (FAQ)

Common questions about Sudoku Logic Lab, answered.

## General Questions

### What is Sudoku Logic Lab?

Sudoku Logic Lab is a free, browser-based Sudoku game with multiplayer features like a global leaderboard and chat system. It's built with modern web technologies and hosted entirely for free using GitHub Pages and Google Apps Script.

### Do I need to create an account?

No! You can play completely anonymously. Just enter a name when you want to save your score to the leaderboard.

### Is it really free?

Yes, completely free with no ads, no subscriptions, and no in-app purchases.

### Can I play offline?

Partially. The puzzle generator works offline, but the leaderboard and chat require an internet connection.

### What browsers are supported?

All modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Mobile browsers are also supported!

## Gameplay Questions

### How do I play?

See the complete [How to Play](How-to-Play) guide. Quick version:
1. Select a difficulty
2. Click a cell and type a number (1-9)
3. Fill the entire grid correctly
4. Submit your time to the leaderboard

### What are the difficulty levels?

- **Easy**: 40-45 clues, good for beginners
- **Medium**: 30-35 clues, moderate challenge  
- **Hard**: 25-28 clues, requires advanced techniques
- **Daily**: Changes every day, same for all players

### Can I pause the timer?

No. The timer runs continuously to ensure fair competition on the leaderboard.

### What if I make a mistake?

Just click the cell and press backspace to clear it. There's no penalty except the time spent.

### Can I get hints?

Not yet, but hints are on the roadmap!

### How do I undo a move?

Click the cell with the number you want to remove and press backspace or delete.

### Can I save my progress?

Not currently. Once you start a puzzle, you should complete it in one session.

## Leaderboard Questions

### How does the leaderboard work?

The leaderboard tracks the fastest completion times for each difficulty level. Lower time = higher rank. Scores are stored in Google Sheets and displayed to all players sorted by time.

### Are there separate leaderboards for each difficulty?

Yes! There are four separate leaderboards:
- Easy
- Medium  
- Hard
- Daily Challenge

### Can I see my ranking?

Yes, your saved scores appear on the leaderboard. Look for your name!

### How long do scores stay on the leaderboard?

Indefinitely, unless the database is reset (very rare).

### Can I delete my score?

Not currently through the UI. Contact the maintainers if needed.

### Why isn't my score showing up?

Possible reasons:
- Backend not configured (check `config.local.js`)
- Network error (check console)
- Invalid name (1-50 characters only)
- Server issue (try again later)

## Chat Questions

### How do I use the chat?

1. Enter your username
2. Type your message
3. Click Send or press Enter

Messages appear for all players in real-time.

### Is chat moderated?

Not automatically. Please be respectful. Inappropriate messages may be removed.

### Can I use emojis?

Yes! Most emojis are supported. 😊🎮🧩

### Why can't I see chat messages?

Possible causes:
- Backend not configured
- Network connection lost
- Chat disabled in settings
- Browser blocking requests

### Is chat persistent?

Yes, the last 50 messages are stored and displayed to all players.

## Technical Questions

### What technology is this built with?

- **Frontend**: React 18, Tailwind CSS, in-browser Babel
- **Backend**: Google Apps Script  
- **Database**: Google Sheets
- **Hosting**: GitHub Pages

See [Architecture](Architecture) for details.

### Why Google Apps Script?

It's free, serverless, and handles the backend without needing a VPS or paid hosting.

### Can I run this locally?

Yes! See the [Quick Start Guide](Quick-Start-Guide). The frontend works completely locally.

### Can I deploy my own instance?

Absolutely! See the [Deployment Guide](Deployment-Guide) for complete instructions.

### Where is the code?

The repository is public: [github.com/edmund-alexander/Sudoku-Labs](https://github.com/edmund-alexander/Sudoku-Labs)

### Is the code open source?

Yes, licensed under MIT. You're free to use, modify, and distribute it.

## Setup Questions

### How do I set up the backend?

Follow the [Backend Setup](Backend-Setup) guide. Quick summary:
1. Create Google Sheet
2. Create Apps Script project
3. Deploy as Web App
4. Update frontend config

### What is `config.local.js`?

It's a local configuration file containing your Google Apps Script deployment URL. It's gitignored for security.

See [Configuration Guide](Configuration-Guide).

### Why do I see a "config not found" warning?

The frontend is trying to load `config/config.local.js` but can't find it. This is normal if you haven't set up the backend. Copy `config/config.example.js` to `config/config.local.js` to remove the warning.

### How do I update the backend?

1. Edit `apps_script/Code.gs`
2. Copy the code
3. Paste into Apps Script editor
4. Deploy → Manage Deployments → Update

See [Deployment Guide](Deployment-Guide).

## Troubleshooting

### The game won't load

**Try:**
- Clear browser cache
- Try a different browser
- Check browser console for errors
- Ensure JavaScript is enabled

### Puzzle won't generate

**Check:**
- Internet connection (for backend puzzles)
- Browser console for errors
- Try a different difficulty
- Refresh the page

### "404 Not Found" errors

**Causes:**
- Incorrect GAS URL in `config.local.js`
- Backend not deployed correctly
- Deployment access not set to "Anyone"

See [Troubleshooting](Troubleshooting).

### CORS errors

**Solutions:**
- Ensure GAS deployment has "Anyone" access
- Check deployment URL is correct
- Try re-deploying backend

### Performance issues

**Try:**
- Close other browser tabs
- Disable browser extensions
- Use a different browser
- Clear browser cache

See [Troubleshooting](Troubleshooting) for more solutions.

## Contributing Questions

### Can I contribute?

Yes! We welcome all contributions. See [Contributing](Contributing) for how to get started.

### I found a bug. What should I do?

[Open an issue](https://github.com/edmund-alexander/Sudoku-Labs/issues/new) with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS info

### I have a feature idea. How do I suggest it?

[Open an issue](https://github.com/edmund-alexander/Sudoku-Labs/issues/new) tagged "enhancement" describing your idea.

### How do I submit code changes?

Follow the [Contributing](Contributing) guide. Quick version:
1. Fork the repo
2. Create a branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### I don't know how to code. Can I still help?

Yes! You can:
- Report bugs
- Suggest features
- Improve documentation
- Test and provide feedback
- Share the game with others

## Privacy & Security

### What data do you collect?

Minimal data:
- **Leaderboard**: Name (you provide), time, difficulty, date
- **Chat**: Username (you provide), message, timestamp
- **Logs**: Error messages, browser info (for debugging)

No personal information, email, or tracking.

### Is my data secure?

- No passwords or sensitive info collected
- HTTPS-only communication
- Input is sanitized to prevent XSS
- Google Sheets has standard Google security

### Can I delete my data?

Contact the repository maintainers to request data deletion.

### Do you use cookies?

No cookies are set by the application. GitHub Pages may set minimal cookies.

### Do you share data with third parties?

No. All data stays in the Google Sheet controlled by the instance owner.

## Mobile Questions

### Does it work on mobile?

Yes! The interface is responsive and works on phones and tablets.

### Is there a mobile app?

Not yet, but it's on the roadmap! For now, use the web version in your mobile browser.

### Can I add it to my home screen?

Yes! On mobile browsers, you can "Add to Home Screen" for a native-like experience.

### Are there touch controls?

Yes, the interface is optimized for touch:
- Tap cells to select
- Tap number pad to enter numbers
- Swipe navigation (coming soon)

## Advanced Questions

### Can I modify the puzzle generation algorithm?

Yes! It's in `src/app.jsx`. The algorithm is open source and can be customized.

### Can I add new difficulty levels?

Yes! Modify the difficulty settings in `src/app.jsx` and backend API.

### Can I white-label this for my organization?

Yes! It's MIT licensed. You can rebrand and deploy your own instance.

### Can I integrate this into my website?

Yes! You can embed it in an iframe or integrate the code directly.

### How do I add authentication?

You'd need to:
1. Add authentication to Google Apps Script
2. Update frontend to handle auth
3. Protect API endpoints

This is not built-in but can be added.

### Can I use a different database?

Yes, but you'd need to replace the Google Sheets integration with your preferred database and create a new backend API.

## Roadmap Questions

### What features are planned?

See the repository README or check open issues tagged "enhancement". Some planned features:
- Hint system
- User accounts
- Multiplayer competitive mode
- Mobile app
- Puzzle import/export
- More difficulty options

### When will [feature] be added?

There's no fixed timeline. This is maintained by volunteers. Want to help? See [Contributing](Contributing)!

### Can I request a feature?

Yes! [Open an issue](https://github.com/edmund-alexander/Sudoku-Labs/issues/new) with your request.

## Getting Help

### Where can I get more help?

- **Documentation**: [Wiki Home](Home)
- **Troubleshooting**: [Troubleshooting Guide](Troubleshooting)
- **Issues**: [GitHub Issues](https://github.com/edmund-alexander/Sudoku-Labs/issues)
- **Chat**: Use in-game chat to ask other players

### How do I report a security issue?

Email the repository maintainers directly or open a private security advisory on GitHub. Don't post security issues publicly.

### Can I contact the developers?

Yes! Use GitHub issues, discussions, or check the repository for contact information.

## Still Have Questions?

- Check the [Wiki](Home) for more documentation
- Search [existing issues](https://github.com/edmund-alexander/Sudoku-Labs/issues)
- Ask in [GitHub Discussions](https://github.com/edmund-alexander/Sudoku-Labs/discussions)
- Use the in-game chat

---

**Can't find your answer? [Ask a question](https://github.com/edmund-alexander/Sudoku-Labs/issues/new)!**
