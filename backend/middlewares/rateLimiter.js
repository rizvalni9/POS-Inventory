const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for login to prevent brute force & credential stuffing
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'TOO_MANY_REQUESTS',
    message: 'Terlalu banyak percobaan login gagal dari perangkat ini. Silakan coba kembali dalam 15 menit.'
  }
});

/**
 * General API rate limiter
 */
const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan ke server. Silakan perlambat navigasi Anda.'
  }
});

module.exports = {
  loginRateLimiter,
  generalApiLimiter
};
