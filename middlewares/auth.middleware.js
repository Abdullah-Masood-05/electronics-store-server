import admin from "../config/firebase.js";
import User from "../models/User.js";
import Session from "../models/Session.js";
import AppError from "../utils/AppError.js";

/**
 * SAFEGUARD 1: NEVER ATTACH ROLES TO FIREBASE CUSTOM CLAIMS.
 * All role-based authorization must rely exclusively on the MongoDB `role` field.
 * Firebase custom claims are difficult to invalidate immediately without forcing 
 * token revocation on every role change.
 * 
 * Authentication middleware.
 * Extracts Firebase ID token from Authorization header,
 * verifies it (including revocation check), looks up the
 * MongoDB user, and attaches it to req.user.
 */

// SAFEGUARD 2: MongoDB query result cache (Strictly TTL of 0)
// As requested, we use a TTL of 0 so the MongoDB fetch is non-optional and never short-circuited.
const userCache = new Map();
const CACHE_TTL_MS = 0; // 0 seconds (always fetch fresh)

export const authCheck = async (req, res, next) => {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("No token provided. Please log in.", 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "undefined" || token === "null") {
      return next(new AppError("Invalid token format.", 401));
    }

    // 2. Verify token with Firebase Admin (checkRevoked = true)
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token, true);
    } catch (firebaseError) {
      if (firebaseError.code === "auth/id-token-expired") {
        return next(new AppError("Token has expired. Please log in again.", 401));
      }
      if (firebaseError.code === "auth/id-token-revoked") {
        return next(new AppError("Token has been revoked. Please log in again.", 401));
      }
      if (firebaseError.code === "auth/argument-error") {
        return next(new AppError("Invalid token.", 401));
      }
      return next(new AppError("Authentication failed.", 401));
    }

    // SAFEGUARD 3: Guard against token-based roles
    if (decodedToken.role || decodedToken.admin) {
      return next(new AppError("SECURITY VIOLATION: Role found in Firebase token. Roles must strictly originate from the MongoDB database.", 403));
    }

    // Check Cache first
    const now = Date.now();
    const cachedUser = userCache.get(decodedToken.uid);
    let user;

    if (cachedUser && (now - cachedUser.timestamp < CACHE_TTL_MS)) {
      user = cachedUser.data;
    } else {
      // 3. Find or create MongoDB user (never optional)
      user = await User.findOne({ firebaseUid: decodedToken.uid });

      if (!user) {
        // Auto-create user on first login
        user = await User.create({
          firebaseUid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
          role: "user",
        });
      }

      // Update cache
      userCache.set(decodedToken.uid, { data: user, timestamp: now });
    }

    // 4. Attach MongoDB user and decodedToken to request
    req.user = user;
    req.decodedToken = decodedToken;

    // 5. Session Management Layer
    const isSessionRegistration = req.originalUrl.includes("/auth/session") && req.method === "POST";
    
    if (!isSessionRegistration) {
      const sessionId = req.cookies?.sessionId;
      if (!sessionId) {
        return next(new AppError("No active session found. Please log in.", 401));
      }

      const session = await Session.findOne({ sessionId });
      if (!session) {
        return next(new AppError("Invalid session. Please log in again.", 401));
      }

      if (session.isRevoked) {
        return next(new AppError("Session revoked. Please log in again.", 401));
      }

      if (session.expiresAt < new Date()) {
        return next(new AppError("Session expired. Please log in again.", 401));
      }

      if (session.uid !== decodedToken.uid) {
        console.error(`[SECURITY] Session hijack attempt or mismatch! Expected UID: ${decodedToken.uid}, Found UID: ${session.uid}`);
        return next(new AppError("Session validation failed.", 401));
      }

      // Attach session
      req.session = session;

      // Asynchronously update lastSeenAt
      Session.updateOne(
        { _id: session._id },
        { $set: { lastSeenAt: new Date() } }
      ).catch(err => console.error("Failed to update lastSeenAt", err));
    }

    next();
  } catch (error) {
    next(new AppError("Authentication failed.", 401));
  }
};
