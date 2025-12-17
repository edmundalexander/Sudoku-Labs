# Contributing to Sudoku Logic Lab

Thank you for your interest in contributing! This guide will help you get started.

## Ways to Contribute

### 🐛 Report Bugs
Found a bug? [Open an issue](https://github.com/edmund-alexander/Sudoku-Labs/issues/new) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

### 💡 Suggest Features
Have an idea? [Open an issue](https://github.com/edmund-alexander/Sudoku-Labs/issues/new) tagged "enhancement" with:
- Clear description of the feature
- Use cases and benefits
- Mockups or examples if applicable
- Implementation suggestions (optional)

### 📝 Improve Documentation
Documentation is always appreciated:
- Fix typos and grammar
- Clarify confusing sections
- Add missing information
- Update outdated content
- Add code examples

### 🎨 Contribute Code
Ready to code? See [Development Setup](Development-Setup) first, then follow the process below.

## Development Process

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/Sudoku-Labs.git
cd Sudoku-Labs
git remote add upstream https://github.com/edmund-alexander/Sudoku-Labs.git

# Configure Git to handle divergent branches
git config pull.rebase false  # merge (recommended)
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test additions

### 3. Make Changes

Follow these guidelines:
- Write clean, readable code
- Follow existing code style
- Keep changes focused and minimal
- Comment complex logic
- Update documentation

### 4. Test Your Changes

```bash
# Test locally in browser
python -m http.server 8000
# Open http://localhost:8000

# Test backend API (if modified)
./diagnostic.sh

# Check for errors in browser console
```

### 5. Commit Changes

```bash
git add .
git commit -m "type: description"
```

**Commit Message Format:**
```
type: brief description

Optional detailed explanation.

Fixes #123
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

**Examples:**
```
feat: add hint system for puzzles
fix: leaderboard sorting order
docs: update API reference
style: format code with prettier
refactor: simplify puzzle generation
test: add validation tests
chore: update dependencies
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then on GitHub:
1. Go to your fork
2. Click "Compare & pull request"
3. Fill out the PR template
4. Submit!

### 7. Branch Cleanup

After your PR is merged, clean up your local branch:

```bash
# Switch to main
git checkout main

# Delete local branch
git branch -d feature/your-feature-name

# Fetch latest changes
git fetch --all --prune
```

**Note**: Remote branches are cleaned up automatically after PRs are merged. See [BRANCH_CLEANUP.md](../BRANCH_CLEANUP.md) for more details.

## Pull Request Guidelines

### PR Title
Use the same format as commit messages:
```
feat: add puzzle hint system
fix: resolve leaderboard bug
```

### PR Description
Include:
- **What**: What does this PR do?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How did you test it?
- **Screenshots**: If UI changes

Template:
```markdown
## Description
Brief description of changes.

## Motivation
Why this change is needed.

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How to test these changes:
1. Step 1
2. Step 2
3. Expected result

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] Tested locally
- [ ] No console errors
- [ ] Backward compatible
```

### Before Submitting

✅ Checklist:
- [ ] Code works locally
- [ ] No console errors
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up-to-date with main
- [ ] Changes are minimal and focused
- [ ] Security considerations addressed

## Code Style

### JavaScript
```javascript
// Use modern ES6+ syntax
const myFunction = async (param) => {
  // Single quotes for strings
  const result = await fetch('url');
  
  // Descriptive variable names
  const puzzleData = await result.json();
  
  // Early returns
  if (!puzzleData) return null;
  
  return puzzleData;
};
```

### React Components
```javascript
// Functional components with hooks
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = React.useState(null);
  
  React.useEffect(() => {
    // Side effects here
  }, []);
  
  return (
    <div className="my-component">
      {/* JSX here */}
    </div>
  );
};
```

### HTML/JSX
```html
<!-- Semantic HTML -->
<section className="game-board">
  <h2>Sudoku Puzzle</h2>
  <div className="grid">
    {/* Grid cells */}
  </div>
</section>
```

### CSS (Tailwind)
```javascript
// Use Tailwind utility classes
<div className="flex items-center justify-center p-4 bg-gray-800 rounded-lg">
  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
    Click Me
  </button>
</div>
```

## Testing Guidelines

### Manual Testing

**For Frontend Changes:**
1. Test in multiple browsers (Chrome, Firefox, Safari)
2. Test responsive design (mobile, tablet, desktop)
3. Check browser console for errors
4. Test all affected features
5. Verify no regressions

**For Backend Changes:**
1. Test all API endpoints
2. Verify data persistence
3. Check error handling
4. Test edge cases
5. Run `diagnostic.sh`

### Test Checklist

- [ ] Works on Chrome
- [ ] Works on Firefox
- [ ] Works on Safari
- [ ] Works on mobile
- [ ] No console errors
- [ ] No broken features
- [ ] Backward compatible
- [ ] Performance acceptable

## Security Considerations

### Input Validation
Always sanitize user input:
```javascript
// Backend (Code.gs)
function sanitizeInput_(text) {
  return String(text)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // ... more sanitization
}
```

### No Sensitive Data
- Never commit API keys
- Don't expose credentials
- Keep `config.local.js` in `.gitignore`
- Use environment variables for secrets

### XSS Prevention
- Escape user-generated content
- Use React's built-in XSS protection
- Sanitize on both client and server

For more security information, see the backend code documentation in `apps_script/Code.gs`.

## Review Process

### What Happens After You Submit

1. **Automated Checks**: CI/CD runs (if configured)
2. **Code Review**: Maintainer reviews your code
3. **Feedback**: May request changes
4. **Approval**: Once approved, PR is merged
5. **Recognition**: You're added to contributors!

### Responding to Feedback

- Be open to suggestions
- Ask questions if unclear
- Make requested changes
- Be patient and respectful

### If Your PR is Rejected

Don't be discouraged! Common reasons:
- Out of scope for project
- Better approach exists
- Needs more work
- Timing not right

You can:
- Ask for clarification
- Revise and resubmit
- Contribute differently

## Community Guidelines

### Code of Conduct

- Be respectful and professional
- Welcome newcomers
- Give constructive feedback
- Assume good intentions
- No harassment or discrimination

### Communication

- Use clear, concise language
- Provide context and examples
- Be patient with responses
- Search before asking
- Share knowledge

### Getting Help

- **Documentation**: Check [Wiki](Home) first
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Chat**: Use in-game chat for game questions

## Licensing

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- In-game credits (coming soon)

## Resources

### Documentation
- [Quick Start Guide](Quick-Start-Guide)
- [Development Setup](Development-Setup)
- [Architecture](Architecture)
- [API Reference](API-Reference)

### Tools
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Google Apps Script](https://developers.google.com/apps-script)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

### Learning
- [MDN Web Docs](https://developer.mozilla.org)
- [JavaScript.info](https://javascript.info)
- [React Tutorial](https://react.dev/learn)

## Frequently Asked Questions

### Q: I'm new to open source. Can I contribute?
**A:** Absolutely! Start with documentation, bug reports, or small fixes. Everyone is welcome!

### Q: What should I work on?
**A:** Check issues labeled "good first issue" or "help wanted". Or propose your own ideas!

### Q: How long until my PR is reviewed?
**A:** Usually within a few days, but it depends on maintainer availability.

### Q: Can I work on multiple issues?
**A:** Yes, but finish one PR before starting another to avoid conflicts.

### Q: What if I can't finish my PR?
**A:** No problem! Let us know and someone else can continue your work.

### Q: How do I get commit access?
**A:** Active contributors may be invited as collaborators after consistent contributions.

## Next Steps

1. Read [Development Setup](Development-Setup)
2. Find an issue to work on
3. Follow the process above
4. Submit your first PR!

---

**Thank you for contributing! 🎉**

Every contribution, no matter how small, helps make Sudoku Logic Lab better for everyone.
