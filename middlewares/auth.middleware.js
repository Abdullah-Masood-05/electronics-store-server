import admin from "../config/firebase.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

/**
 * Authentication middleware.
 * Extracts Firebase ID token from Authorization header,
 * verifies it (including revocation check), looks up the
 * MongoDB user, and attaches it to req.user.
 *
 * If the user doesn't exist in MongoDB yet (first login),
 * a new user document is automatically created.
 */
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

    // 3. Find or create MongoDB user
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      // Auto-create user on first login
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
        role: "user",
      });
    }

    // 4. Attach MongoDB user to request
    req.user = user;
    next();
  } catch (error) {
    next(new AppError("Authentication failed.", 401));
  }
};
