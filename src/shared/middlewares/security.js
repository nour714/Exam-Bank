const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Enterprise Security Hardening Middleware.
 */
const securityMiddleware = [
  // 1. Helmet sets various HTTP headers for security (HSTS, CSP, X-Frame-Options, etc.)
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.socket.io"], // unsafe-inline for SPA mounting, unpkg for Lucide icons, cdn.socket.io for WebSockets
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        manifestSrc: ["'self'", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://unpkg.com", "https://*.supabase.co", "https://*.supabase.com"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Prevents issues with third party images/iframes
  }),

  // 2. Global Rate Limiting to prevent DDoS and Brute Force
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { success: false, message: 'Too many requests, please try again later.' },
  }),
];

/**
 * Stricter Rate Limiting specifically for Authentication endpoints.
 */
const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 failed login/register attempts per hour
  skipSuccessfulRequests: true, // Don't count successful logins against the quota
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

module.exports = {
  securityMiddleware,
  authRateLimiter,
};
