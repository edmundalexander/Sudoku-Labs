# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest (main branch) | :white_check_mark: |
| Older versions | :x: |

We recommend always using the latest version of Sudoku Logic Lab for the best security and features.

## Reporting a Vulnerability

We take the security of Sudoku Logic Lab seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please use one of these methods:

1. **Preferred**: Use GitHub's [Private Security Advisory](https://github.com/edmund-alexander/Sudoku-Labs/security/advisories/new) feature
2. **Alternative**: Email the repository maintainers directly through GitHub

### What to Include

When reporting a vulnerability, please include:

- **Description**: Clear description of the vulnerability
- **Impact**: Potential impact and severity
- **Reproduction Steps**: Detailed steps to reproduce the issue
- **Affected Components**: Which parts of the application are affected (frontend, backend, etc.)
- **Suggested Fix**: If you have ideas on how to fix it (optional)
- **Your Contact Info**: How we can reach you for follow-up questions

### Response Timeline

- **Initial Response**: Within 48 hours of report
- **Status Update**: Within 7 days with assessment and timeline
- **Resolution**: Varies based on severity and complexity

### Disclosure Policy

- We follow a coordinated disclosure process
- We will work with you to understand and resolve the issue
- Please allow us reasonable time to fix the vulnerability before public disclosure
- We will credit you in our security advisories (unless you prefer to remain anonymous)

## Security Considerations

### For Users

Sudoku Logic Lab is designed with privacy and security in mind:

- **No Account Required**: Play anonymously without registration
- **Minimal Data Collection**: Only leaderboard scores and optional chat messages are stored
- **Client-Side Processing**: Game logic runs in your browser
- **Open Source**: All code is publicly auditable

### For Developers

If you're contributing or deploying your own instance:

#### Backend Security (Firebase/Express)

1. **Input Sanitization**
   - All user inputs are sanitized using `sanitizeInput()` function
   - Maximum length limits enforced on all text fields
   - See `server/controllers/api.js` for implementation details

2. **Configuration Security**
   - Never commit configuration files with secrets - they're gitignored
   - Never hardcode API keys or credentials
   - Use environment variables for sensitive data in CI/CD

3. **Deployment Settings**
   - Firebase App Hosting uses Cloud Run with automatic HTTPS
   - Admin authentication uses Firebase Auth with Firestore role verification
   - Use a dedicated Firebase project for production deployments
   - Regularly review Cloud Run execution logs

4. **Data Access**
   - Firestore data is protected by security rules
   - Admin operations require Firebase Auth ID token verification
   - Rate limiting is handled by Cloud Run quotas

#### Frontend Security

1. **Content Security**
   - Modern browsers' built-in XSS protections are active
   - No eval() or unsafe innerHTML usage
   - External scripts loaded from trusted CDNs only

2. **Configuration**
   - Configuration files must never be committed
   - Use environment variables for production
   - See `config/README.md` for setup instructions

3. **Dependencies**
   - Keep dependencies up to date
   - Review security advisories for React and other dependencies
   - Use `npm audit` or `dependabot` for monitoring

#### Credential Management

1. **Firebase Credentials**
   - Service account credentials are gitignored
   - Use Firebase App Hosting secrets for production
   - Never store credentials in repository

2. **GitHub Secrets**
   - Use GitHub Secrets for CI/CD credentials
   - Rotate secrets regularly
   - Limit secret access to necessary workflows only

### Known Security Limitations

1. **Public API**: The backend API is publicly accessible
   - This is by design for anonymous gameplay
   - Rate limiting depends on Cloud Run quotas
   - Input validation prevents injection attacks

2. **Client-Side Validation**: Game logic runs in browser
   - Users can potentially modify local game state
   - Server validates all submissions
   - Leaderboard scores can be verified

3. **Anonymous Users**: No authentication system required for gameplay
   - Users can use any name for leaderboard
   - No user account security to manage
   - Chat is moderated by community standards

## Security Best Practices

### When Contributing

- Review code for potential security issues before submitting PRs
- Follow existing security patterns (input sanitization, etc.)
- Don't introduce new dependencies without security review
- Update documentation when adding security-relevant features

### When Deploying

- Use HTTPS for all deployments (Firebase App Hosting is HTTPS by default)
- Regularly update your deployment with latest security patches
- Monitor Cloud Run execution logs for suspicious activity
- Keep your Firebase project secure (IAM roles properly configured)
- Review Firestore security rules periodically

### Regular Maintenance

- Check for updates to dependencies
- Review GitHub security advisories
- Update documentation when security practices change
- Test security measures after major updates

## Resources

- [Firebase Security Documentation](https://firebase.google.com/docs/rules)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## Questions?

If you have questions about security that aren't covered here, please:
- Check our [FAQ](https://github.com/edmund-alexander/Sudoku-Labs/wiki/FAQ) 
- Review our [Contributing Guidelines](https://github.com/edmund-alexander/Sudoku-Labs/wiki/Contributing)
- Open a discussion on GitHub (for non-sensitive questions)

Thank you for helping keep Sudoku Logic Lab secure! 🔒
