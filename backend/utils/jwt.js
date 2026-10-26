const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'pos_jwt_access_super_secret_key_2026_change_in_production';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'pos_jwt_refresh_super_secret_key_2026_change_in_production';
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS) || 7;

/**
 * Generate short-lived access JWT
 * Payload contains only non-sensitive identity & authorization fields
 */
function generateAccessToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role
  };

  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
    algorithm: 'HS256',
    issuer: 'pos-kasir-api',
    audience: 'pos-kasir-client'
  });
}

/**
 * Generate long-lived refresh JWT
 */
function generateRefreshToken(user, sessionId) {
  const payload = {
    id: user.id,
    sessionId: sessionId
  };

  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: `${REFRESH_EXPIRES_IN_DAYS}d`,
    algorithm: 'HS256',
    issuer: 'pos-kasir-api',
    audience: 'pos-kasir-client'
  });
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET, {
    algorithms: ['HS256'],
    issuer: 'pos-kasir-api',
    audience: 'pos-kasir-client'
  });
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET, {
    algorithms: ['HS256'],
    issuer: 'pos-kasir-api',
    audience: 'pos-kasir-client'
  });
}

/**
 * Deterministic hash of token for storage in DB
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Set secure HttpOnly cookie for refresh token
 */
function setRefreshTokenCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieSecure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProduction;
  const sameSite = process.env.COOKIE_SAME_SITE || (cookieSecure ? 'none' : 'lax');
  const maxAge = REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: sameSite,
    path: '/api/auth',
    maxAge: maxAge
  });
}

/**
 * Clear refresh token cookie on logout
 */
function clearRefreshTokenCookie(res) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieSecure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProduction;
  const sameSite = process.env.COOKIE_SAME_SITE || (cookieSecure ? 'none' : 'lax');

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: sameSite,
    path: '/api/auth'
  });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_EXPIRES_IN_DAYS
};
