// ============================================================================
// EXAMPLE: Secure Authentication Implementation for Google Apps Script
// ============================================================================
// This file provides example implementations of the security measures
// documented in AUTHENTICATION_SETUP.md and SECURITY_QUICK_REFERENCE.md
//
// TO USE THIS CODE:
// 1. Review the security documentation first
// 2. Copy the relevant functions to your Code.gs file
// 3. Update your Users sheet schema to include the Salt column
// 4. Test thoroughly before deploying to production
// 5. Consider using a professional auth provider for sensitive data
// ============================================================================

// ============================================================================
// 1. PASSWORD HASHING WITH SALT (PBKDF2)
// ============================================================================

/**
 * Generates a cryptographically secure random salt
 * @return {string} Base64-encoded salt
 */
function generateSalt_() {
  const bytes = Utilities.getRandomValues(16);
  return Utilities.base64Encode(bytes);
}

/**
 * Hashes a password using PBKDF2 with SHA-256
 * @param {string} password - The password to hash
 * @param {string} salt - Optional salt (generates new one if not provided)
 * @return {Object} Object with hash and salt properties
 */
function hashPassword_(password, salt) {
  if (!salt) {
    salt = generateSalt_();
  }
  
  // Use PBKDF2 with SHA-256 and 10,000 iterations
  // This is computationally expensive by design to slow down brute force attacks
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
  
  return {
    hash: hash,
    salt: salt
  };
}

/**
 * Verifies a password against a stored hash and salt
 * @param {string} password - The password to verify
 * @param {string} storedHash - The stored hash from database
 * @param {string} storedSalt - The stored salt from database
 * @return {boolean} True if password matches
 */
function verifyPassword_(password, storedHash, storedSalt) {
  const computed = hashPassword_(password, storedSalt);
  return computed.hash === storedHash;
}

// ============================================================================
// 2. RATE LIMITING
// ============================================================================

/**
 * Checks if a rate limit has been exceeded
 * @param {string} identifier - User identifier (username or IP)
 * @param {string} action - Action being rate limited (e.g., 'login', 'register')
 * @return {Object} Object with allowed status and retry info
 */
function checkRateLimit_(identifier, action) {
  const props = PropertiesService.getScriptProperties();
  const key = 'ratelimit_' + action + '_' + identifier;
  const now = new Date().getTime();
  
  const data = props.getProperty(key);
  let attempts = data ? JSON.parse(data) : { count: 0, firstAttempt: now, blocked: false };
  
  // Reset if more than 15 minutes have passed
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  if (now - attempts.firstAttempt > WINDOW_MS) {
    attempts = { count: 0, firstAttempt: now, blocked: false };
  }
  
  // Check if blocked
  if (attempts.blocked && (now - attempts.firstAttempt) < WINDOW_MS) {
    const remainingMs = WINDOW_MS - (now - attempts.firstAttempt);
    return { 
      allowed: false, 
      retryAfter: Math.ceil(remainingMs / 1000) 
    };
  }
  
  // Check if exceeded max attempts (5 attempts per 15 minutes)
  const MAX_ATTEMPTS = 5;
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.blocked = true;
    props.setProperty(key, JSON.stringify(attempts));
    return { allowed: false, retryAfter: 900 }; // 15 minutes
  }
  
  return { allowed: true, attempts: attempts };
}

/**
 * Records a failed authentication attempt
 * @param {string} identifier - User identifier
 * @param {string} action - Action being tracked
 */
function recordFailedAttempt_(identifier, action) {
  const props = PropertiesService.getScriptProperties();
  const key = 'ratelimit_' + action + '_' + identifier;
  const now = new Date().getTime();
  
  const data = props.getProperty(key);
  let attempts = data ? JSON.parse(data) : { count: 0, firstAttempt: now, blocked: false };
  
  attempts.count++;
  attempts.lastAttempt = now;
  
  props.setProperty(key, JSON.stringify(attempts));
}

/**
 * Clears rate limiting data on successful authentication
 * @param {string} identifier - User identifier
 * @param {string} action - Action being tracked
 */
function clearRateLimitOnSuccess_(identifier, action) {
  const props = PropertiesService.getScriptProperties();
  const key = 'ratelimit_' + action + '_' + identifier;
  props.deleteProperty(key);
}

// ============================================================================
// 3. CSRF PROTECTION
// ============================================================================

/**
 * Generates a cryptographically secure CSRF token
 * @return {string} Web-safe base64-encoded token
 */
function generateCSRFToken_() {
  const bytes = Utilities.getRandomValues(32);
  return Utilities.base64EncodeWebSafe(bytes);
}

/**
 * Creates a new session with CSRF token
 * @param {string} userId - User ID to associate with session
 * @return {Object} Session data including sessionId, csrfToken, and expiration
 */
function createSession_(userId) {
  const sessionId = generateCSRFToken_();
  const csrfToken = generateCSRFToken_();
  const expiresAt = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
  
  const props = PropertiesService.getScriptProperties();
  props.setProperty('session_' + sessionId, JSON.stringify({
    userId: userId,
    csrfToken: csrfToken,
    expiresAt: expiresAt,
    createdAt: new Date().getTime()
  }));
  
  return {
    sessionId: sessionId,
    csrfToken: csrfToken,
    expiresAt: expiresAt
  };
}

/**
 * Validates a session and CSRF token
 * @param {string} sessionId - Session identifier
 * @param {string} csrfToken - CSRF token to validate
 * @return {Object} Validation result with userId if valid
 */
function validateSession_(sessionId, csrfToken) {
  const props = PropertiesService.getScriptProperties();
  const sessionData = props.getProperty('session_' + sessionId);
  
  if (!sessionData) {
    return { valid: false, error: 'Invalid session' };
  }
  
  const session = JSON.parse(sessionData);
  
  // Check expiration
  if (new Date().getTime() > session.expiresAt) {
    props.deleteProperty('session_' + sessionId);
    return { valid: false, error: 'Session expired' };
  }
  
  // Validate CSRF token
  if (session.csrfToken !== csrfToken) {
    return { valid: false, error: 'Invalid CSRF token' };
  }
  
  return { valid: true, userId: session.userId };
}

/**
 * Invalidates a session (logout)
 * @param {string} sessionId - Session to invalidate
 */
function invalidateSession_(sessionId) {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty('session_' + sessionId);
}

/**
 * Refreshes a session with new CSRF token
 * @param {string} sessionId - Session to refresh
 * @param {string} currentCsrfToken - Current CSRF token for validation
 * @return {Object} New session data or error
 */
function refreshSession_(sessionId, currentCsrfToken) {
  const validation = validateSession_(sessionId, currentCsrfToken);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  // Generate new CSRF token and extend expiration
  const newCsrfToken = generateCSRFToken_();
  const newExpiresAt = new Date().getTime() + (24 * 60 * 60 * 1000);
  
  const props = PropertiesService.getScriptProperties();
  props.setProperty('session_' + sessionId, JSON.stringify({
    userId: validation.userId,
    csrfToken: newCsrfToken,
    expiresAt: newExpiresAt,
    createdAt: new Date().getTime()
  }));
  
  return {
    success: true,
    csrfToken: newCsrfToken,
    expiresAt: newExpiresAt
  };
}

// ============================================================================
// 4. SECURE AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Enhanced register function with security measures
 * SCHEMA: Users sheet must have: UserID | Username | PasswordHash | Salt | CreatedAt | DisplayName | TotalGames | TotalWins
 */
function registerUserSecure(data) {
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid request data' };
  }
  
  const username = sanitizeInput_(data.username || '', 20);
  const password = sanitizeInput_(data.password || '', 100);
  
  // Validate inputs
  if (username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters' };
  }
  
  // Enhanced password requirements
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }
  
  // Check password complexity
  if (!/[A-Z]/.test(password)) {
    return { success: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { success: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { success: false, error: 'Password must contain at least one number' };
  }
  
  // Check rate limit for registration
  const rateLimitCheck = checkRateLimit_(username, 'register');
  if (!rateLimitCheck.allowed) {
    return { 
      success: false, 
      error: 'Too many registration attempts. Please try again in ' + rateLimitCheck.retryAfter + ' seconds.'
    };
  }
  
  try {
    const sheet = getSpreadsheet_().getSheetByName('Users');
    if (!sheet) {
      return { success: false, error: 'Users sheet not found' };
    }
    
    // Check if username already exists
    const sheetData = sheet.getDataRange().getValues();
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][1] === username) {
        recordFailedAttempt_(username, 'register');
        return { success: false, error: 'Username already exists' };
      }
    }
    
    // Hash password with salt
    const passwordData = hashPassword_(password);
    const userId = 'user_' + new Date().getTime() + '_' + Math.floor(Math.random() * 10000);
    const createdAt = new Date().toISOString();
    
    // Save user: UserID | Username | PasswordHash | Salt | CreatedAt | DisplayName | TotalGames | TotalWins
    sheet.appendRow([
      userId, 
      username, 
      passwordData.hash, 
      passwordData.salt, 
      createdAt, 
      username, 
      0, 
      0
    ]);
    
    // Clear rate limit on success
    clearRateLimitOnSuccess_(username, 'register');
    
    // Create session
    const sessionData = createSession_(userId);
    
    // Log security event
    logSecurityEvent_('user_registered', { userId: userId, username: username });
    
    return {
      success: true,
      user: {
        userId: userId,
        username: username,
        displayName: username,
        totalGames: 0,
        totalWins: 0,
        createdAt: createdAt
      },
      session: {
        sessionId: sessionData.sessionId,
        csrfToken: sessionData.csrfToken,
        expiresAt: sessionData.expiresAt
      }
    };
  } catch (err) {
    Logger.log('registerUserSecure error: ' + err);
    return { success: false, error: 'Registration failed' };
  }
}

/**
 * Enhanced login function with security measures
 */
function loginUserSecure(data) {
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid request data' };
  }
  
  const username = sanitizeInput_(data.username || '', 20);
  const password = sanitizeInput_(data.password || '', 100);
  
  if (!username || !password) {
    return { success: false, error: 'Username and password required' };
  }
  
  // Check rate limit
  const rateLimitCheck = checkRateLimit_(username, 'login');
  if (!rateLimitCheck.allowed) {
    return { 
      success: false, 
      error: 'Too many failed attempts. Please try again in ' + rateLimitCheck.retryAfter + ' seconds.',
      rateLimited: true,
      retryAfter: rateLimitCheck.retryAfter
    };
  }
  
  try {
    const sheet = getSpreadsheet_().getSheetByName('Users');
    if (!sheet) {
      return { success: false, error: 'Users sheet not found' };
    }
    
    const sheetData = sheet.getDataRange().getValues();
    
    // Search for user
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][1] === username) {
        const storedHash = sheetData[i][2];
        const storedSalt = sheetData[i][3];
        
        // Verify password using salt
        if (verifyPassword_(password, storedHash, storedSalt)) {
          // Clear rate limit on successful login
          clearRateLimitOnSuccess_(username, 'login');
          
          const userId = sheetData[i][0];
          
          // Create session with CSRF token
          const sessionData = createSession_(userId);
          
          // Log successful login
          logSecurityEvent_('user_login_success', { userId: userId, username: username });
          
          return {
            success: true,
            user: {
              userId: userId,
              username: sheetData[i][1],
              displayName: sheetData[i][5] || sheetData[i][1],
              totalGames: Number(sheetData[i][6]) || 0,
              totalWins: Number(sheetData[i][7]) || 0,
              createdAt: sheetData[i][4]
            },
            session: {
              sessionId: sessionData.sessionId,
              csrfToken: sessionData.csrfToken,
              expiresAt: sessionData.expiresAt
            }
          };
        }
        
        // Record failed attempt
        recordFailedAttempt_(username, 'login');
        logSecurityEvent_('user_login_failed', { username: username, reason: 'invalid_password' });
        return { success: false, error: 'Invalid username or password' };
      }
    }
    
    // Record failed attempt even for non-existent users (prevent user enumeration)
    recordFailedAttempt_(username, 'login');
    logSecurityEvent_('user_login_failed', { username: username, reason: 'user_not_found' });
    return { success: false, error: 'Invalid username or password' };
  } catch (err) {
    Logger.log('loginUserSecure error: ' + err);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Protected update function that requires valid session
 */
function updateUserProfileSecure(data) {
  // Validate session and CSRF token
  const sessionId = data.sessionId;
  const csrfToken = data.csrfToken;
  
  const validation = validateSession_(sessionId, csrfToken);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  const userId = validation.userId;
  
  // Continue with profile update using validated userId
  // ... rest of update logic ...
  
  return { success: true };
}

// ============================================================================
// 5. SECURITY LOGGING
// ============================================================================

/**
 * Logs security-related events
 * @param {string} eventType - Type of security event
 * @param {Object} details - Event details
 */
function logSecurityEvent_(eventType, details) {
  try {
    const ss = getSpreadsheet_();
    let sheet = ss.getSheetByName('SecurityLog');
    
    if (!sheet) {
      // Create sheet if it doesn't exist
      sheet = ss.insertSheet('SecurityLog');
      sheet.appendRow(['Timestamp', 'EventType', 'Details', 'UserId', 'Username']);
    }
    
    sheet.appendRow([
      new Date().toISOString(),
      eventType,
      JSON.stringify(details),
      details.userId || '',
      details.username || ''
    ]);
  } catch (err) {
    Logger.log('Failed to log security event: ' + err);
  }
}

// ============================================================================
// 6. ENHANCED INPUT SANITIZATION
// ============================================================================

/**
 * Enhanced input sanitization function
 * @param {string} input - Input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @return {string} Sanitized input
 */
function sanitizeInput_(input, maxLength) {
  if (typeof input !== 'string') return '';
  
  // Remove dangerous characters
  let cleaned = input
    .replace(/[<>\"']/g, '')  // Prevent XSS
    .replace(/[\x00-\x1F\x7F]/g, '')  // Remove control characters
    .trim();
  
  // Enforce max length
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  
  return cleaned;
}

// ============================================================================
// HELPER: Get Spreadsheet
// ============================================================================

function getSpreadsheet_() {
  const SHEET_ID = 'YOUR_SHEET_ID_HERE';  // Replace with your sheet ID
  return SpreadsheetApp.openById(SHEET_ID);
}

// ============================================================================
// END OF EXAMPLE IMPLEMENTATIONS
// ============================================================================
// 
// IMPORTANT NOTES:
// 1. Test all functions thoroughly before production use
// 2. Update sheet schema to include Salt column
// 3. Update frontend to handle session and CSRF tokens
// 4. Consider using a professional auth provider for sensitive data
// 5. Regularly review and update security measures
// 
// See full documentation at:
// - docs/AUTHENTICATION_SETUP.md
// - docs/SECURITY_QUICK_REFERENCE.md
// ============================================================================
