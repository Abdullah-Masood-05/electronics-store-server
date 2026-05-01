import AppError from "../utils/AppError.js";

// TO EXEMPT A WEBHOOK: add its path to the EXEMPT_PATHS array below
const EXEMPT_PATHS = [
  // e.g., "/api/webhooks/stripe"
];

/**
 * Defensive CSRF Guard.
 * Enforces that all state-changing requests originate from an allowed origin.
 * This is essential now that we use httpOnly cookies for session management.
 */
export const csrfGuard = (req, res, next) => {
  // 1. Skip GET, HEAD, OPTIONS (safe methods)
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // 2. Skip explicitly exempt paths (like external webhooks)
  if (EXEMPT_PATHS.some((path) => req.originalUrl.startsWith(path))) {
    return next();
  }

  // 3. Extract Origin or Referer
  const origin = req.headers.origin || req.headers.referer;

  if (!origin) {
    console.warn(`[CSRF GUARD] Blocked request without Origin/Referer header to ${req.originalUrl}`);
    return next(new AppError("Forbidden: Missing Origin or Referer header", 403));
  }

  // 4. Validate Origin matches allowed CLIENT_URL
  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";

  // Check if the origin starts with the allowed origin
  if (!origin.startsWith(allowedOrigin)) {
    console.warn(`[CSRF GUARD] Blocked request from unauthorized origin: ${origin} to ${req.originalUrl}`);
    return next(new AppError("Forbidden: Invalid Origin", 403));
  }

  next();
};
