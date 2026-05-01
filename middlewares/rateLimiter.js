import rateLimit from "express-rate-limit";

// WARNING: Redis is not currently installed or configured in this project.
// We are falling back to the default MemoryStore. 
// For production deployments with multiple instances (e.g. cluster mode, Kubernetes),
// it is highly recommended to install `rate-limit-redis` and `redis` to share state.

/**
 * Global Limiter (All routes)
 * 200 requests per 15 minutes per IP
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    status: "fail",
    message: "Too many requests, please try again later",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: () => process.env.NODE_ENV === "test",
});

/**
 * Auth Route Limiter (/api/auth/*)
 * 10 requests per 15 minutes per IP
 * Protects against brute force and token verification spam
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    status: "fail",
    message: "Too many authentication requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

/**
 * Admin Route Limiter (/api/admin/*)
 * 50 requests per 15 minutes per IP
 * Protects admin endpoints from enumeration
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    status: "fail",
    message: "Too many admin requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

/**
 * Sensitive Action Limiter
 * 5 requests per hour per IP
 * Intended for password resets, email changes, etc.
 */
export const sensitiveActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    status: "fail",
    message: "Too many sensitive actions requested, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

/**
 * Session Creation Limiter (/api/auth/session)
 * 10 requests per hour per IP
 * Protects against excessive session generation
 */
export const sessionCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    status: "fail",
    message: "Too many session creations requested, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});
