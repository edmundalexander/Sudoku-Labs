# Security Quick Reference Guide

Quick reference for implementing security measures in Sudoku Logic Lab authentication system.

## Overview

This is a condensed guide for implementing production-grade security. For detailed implementation instructions, see [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md#implementing-proper-security-measures).

## Security Requirements Checklist

### ✅ Critical Requirements

- [ ] **Password Hashing with Salt** - Replace `simpleHash_()` with PBKDF2/bcrypt
- [ ] **Rate Limiting** - Limit login attempts to 5 per 15 minutes per user
- [ ] **CSRF Protection** - Generate and validate CSRF tokens for state-changing operations
- [ ] **Session Management** - Use secure session tokens with expiration (24 hours)
- [ ] **Password Strength** - Enforce minimum 8 characters with complexity requirements

### ✅ Recommended Requirements

- [ ] **Audit Logging** - Log all authentication events to SecurityLog sheet
- [ ] **Password Reset** - Implement secure password reset with time-limited tokens
- [ ] **Input Validation** - Sanitize all inputs to prevent XSS and injection
- [ ] **Session Refresh** - Implement automatic session refresh mechanism
- [ ] **Privacy Policy** - Publish privacy policy for user data handling

## Implementation Summary

### 1. Password Hashing (PBKDF2 with Salt)

```javascript
// Add these functions to Code.gs
function generateSalt_() {
  const bytes = Utilities.getRandomValues(16);
  return Utilities.base64Encode(bytes);
}

function hashPassword_(password, salt) {
  if (!salt) salt = generateSalt_();
  const iterations = 10000;
  let hash = password + salt;
  for (let i = 0; i < iterations; i++) {
    const digest = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      hash,
      Utilities.Charset.UTF_8
    );
    hash = Utilities.base64Encode(digest);
  }
  return { hash: hash, salt: salt };
}

function verifyPassword_(password, storedHash, storedSalt) {
  const computed = hashPassword_(password, storedSalt);
  return computed.hash === storedHash;
}
```

**Schema Change Required:** Add "Salt" column to Users sheet after PasswordHash column.

### 2. Rate Limiting

```javascript
// Add to Code.gs
function checkRateLimit_(identifier, action) {
  const props = PropertiesService.getScriptProperties();
  const key = 'ratelimit_' + action + '_' + identifier;
  const now = new Date().getTime();
  const data = props.getProperty(key);
  let attempts = data ? JSON.parse(data) : { count: 0, firstAttempt: now, blocked: false };
  
  // Reset after 15 minutes
  if (now - attempts.firstAttempt > 15 * 60 * 1000) {
    attempts = { count: 0, firstAttempt: now, blocked: false };
  }
  
  // Block after 5 attempts
  if (attempts.count >= 5 || attempts.blocked) {
    return { allowed: false, retryAfter: 900 };
  }
  
  return { allowed: true, attempts: attempts };
}

// In loginUser(), add before password check:
const rateLimitCheck = checkRateLimit_(username, 'login');
if (!rateLimitCheck.allowed) {
  return { success: false, error: 'Too many attempts. Try again in 15 minutes.' };
}
```

### 3. CSRF Protection

```javascript
// Add to Code.gs
function generateCSRFToken_() {
  const bytes = Utilities.getRandomValues(32);
  return Utilities.base64EncodeWebSafe(bytes);
}

function createSession_(userId) {
  const sessionId = generateCSRFToken_();
  const csrfToken = generateCSRFToken_();
  const expiresAt = new Date().getTime() + (24 * 60 * 60 * 1000);
  
  PropertiesService.getScriptProperties().setProperty(
    'session_' + sessionId, 
    JSON.stringify({ userId, csrfToken, expiresAt })
  );
  
  return { sessionId, csrfToken, expiresAt };
}

function validateSession_(sessionId, csrfToken) {
  const session = JSON.parse(
    PropertiesService.getScriptProperties().getProperty('session_' + sessionId)
  );
  if (!session || session.csrfToken !== csrfToken || Date.now() > session.expiresAt) {
    return { valid: false };
  }
  return { valid: true, userId: session.userId };
}
```

### 4. Session Management

Frontend implementation in `src/app.jsx`:

```javascript
const SessionManager = {
  saveSession(sessionData) {
    localStorage.setItem('sudoku_session', JSON.stringify({
      ...sessionData,
      savedAt: Date.now()
    }));
  },
  
  getSession() {
    const data = localStorage.getItem('sudoku_session');
    if (!data) return null;
    const session = JSON.parse(data);
    if (Date.now() > session.expiresAt) {
      this.clearSession();
      return null;
    }
    return session;
  },
  
  clearSession() {
    localStorage.removeItem('sudoku_session');
    localStorage.removeItem('sudoku_v2_authUser');
  }
};
```

## Testing Commands

```bash
# Set your GAS URL
export GAS_URL="your-gas-deployment-url"

# Test rate limiting (should block after 5 attempts)
for i in {1..6}; do
  curl "$GAS_URL?action=login&username=test&password=wrong"
  echo "Attempt $i"
done

# Test password strength (should fail)
curl "$GAS_URL?action=register&username=test&password=weak"

# Test CSRF (should fail)
curl "$GAS_URL?action=updateUserProfile&userId=123&sessionId=fake&csrfToken=fake"
```

## Migration Steps

1. **Backup** your Users sheet
2. **Add "Salt" column** to Users sheet (between PasswordHash and CreatedAt)
3. **Update Code.gs** with new security functions
4. **Deploy new version** of Web App
5. **Test** with a new test user
6. **Mark existing users** for password reset (optional)

## Security Levels

### Level 1: Minimum Security (Current Implementation)
- ❌ Simple hash without salt
- ❌ No rate limiting
- ❌ No CSRF protection
- ⚠️ **NOT suitable for production**

### Level 2: Basic Security (Recommended Minimum)
- ✅ PBKDF2 with salt
- ✅ Rate limiting (5 attempts/15 min)
- ✅ Input validation
- ⚠️ Suitable for casual games, non-sensitive data

### Level 3: Production Security (Recommended)
- ✅ PBKDF2 with salt
- ✅ Rate limiting
- ✅ CSRF protection
- ✅ Secure session management
- ✅ Audit logging
- ✅ Password reset
- ✅ Suitable for production with sensitive data

### Level 4: Enterprise Security
- ✅ All Level 3 features
- ✅ OAuth/SSO integration (Firebase, Auth0)
- ✅ Multi-factor authentication (MFA)
- ✅ Regular security audits
- ✅ Compliance certifications (SOC2, ISO 27001)
- ✅ Suitable for enterprise applications

## Common Mistakes to Avoid

1. ❌ **Don't store passwords in plain text** - Always hash with salt
2. ❌ **Don't use simple hash functions** - Use PBKDF2, bcrypt, or Argon2
3. ❌ **Don't skip rate limiting** - Prevents brute force attacks
4. ❌ **Don't ignore CSRF tokens** - Prevents unauthorized actions
5. ❌ **Don't use weak passwords** - Enforce complexity requirements
6. ❌ **Don't forget session expiration** - Sessions should expire
7. ❌ **Don't log sensitive data** - Never log passwords or tokens
8. ❌ **Don't trust user input** - Always sanitize and validate

## Resources

- **Full Implementation Guide**: [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md#implementing-proper-security-measures)
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **OWASP Authentication Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **Google Apps Script Security**: https://developers.google.com/apps-script/guides/security

## Support

If you need help implementing these security measures:
1. Review the detailed guide in [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)
2. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
3. Consider using a managed authentication provider (Firebase, Auth0)

---

**Remember**: Security is not optional. Always implement proper security measures before deploying to production.
