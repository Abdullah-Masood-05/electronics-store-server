import User from "../models/User.js";
import Session from "../models/Session.js";
import AppError from "../utils/AppError.js";
import { v4 as uuidv4 } from "uuid";
import admin from "../config/firebase.js";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile from MongoDB.
 */
export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-__v");

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                cart: user.cart,
                wishlist: user.wishlist,
                address: user.address,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/create-or-update
 * Creates a new user or updates an existing one based on Firebase UID.
 * Called by the client after Firebase registration.
 */
export const createOrUpdateUser = async (req, res, next) => {
    try {
        const { name, role } = req.body;

        // req.user is set by authCheck middleware (auto-created if new)
        const user = req.user;

        // Update name if provided
        if (name && name.trim()) {
            user.name = name.trim();
        }

        // Update role if provided and valid
        const allowedRoles = ["user", "admin"];
        if (role && allowedRoles.includes(role)) {
            user.role = role;
        }

        await user.save();

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                cart: user.cart,
                wishlist: user.wishlist,
                address: user.address,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/session
 * Creates a new server-side session and sets the httpOnly cookie.
 */
export const createSession = async (req, res, next) => {
  try {
    const sessionId = uuidv4();
    const uid = req.decodedToken.uid; // guaranteed by authCheck
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await Session.create({
      sessionId,
      uid,
      expiresAt,
      deviceInfo: {
        userAgent: req.headers["user-agent"] || "Unknown",
        ipAddress: req.ip || req.connection.remoteAddress || "Unknown",
        platform: req.headers["sec-ch-ua-platform"] || "Unknown",
      },
    });

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, message: "Session created successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Marks current session as revoked and clears cookie.
 */
export const logoutSession = async (req, res, next) => {
  try {
    if (req.session) {
      req.session.isRevoked = true;
      await req.session.save();
    }

    res.clearCookie("sessionId", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/sessions
 * Returns all active sessions for the current user.
 */
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      uid: req.decodedToken.uid,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).sort({ lastSeenAt: -1 });

    const activeSessions = sessions.map((s) => ({
      _id: s._id,
      deviceInfo: s.deviceInfo,
      createdAt: s.createdAt,
      lastSeenAt: s.lastSeenAt,
      isCurrent: s.sessionId === req.cookies?.sessionId,
    }));

    res.status(200).json({ success: true, sessions: activeSessions });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/revoke-session
 * Revokes specific or all sessions for a user, and calls Firebase revoke.
 * Admin only.
 */
export const revokeSession = async (req, res, next) => {
  try {
    const { uid, targetSessionId } = req.body;

    if (!uid && !targetSessionId) {
      return next(new AppError("Must provide uid or targetSessionId", 400));
    }

    let filter = {};
    if (targetSessionId) filter.sessionId = targetSessionId;
    if (uid) filter.uid = uid;

    // Set isRevoked to true
    const result = await Session.updateMany(filter, { $set: { isRevoked: true } });

    // Also revoke in Firebase if uid is provided, for full coverage
    if (uid) {
      try {
        await admin.auth().revokeRefreshTokens(uid);
      } catch (err) {
        console.error("Failed to revoke Firebase refresh tokens for", uid, err);
      }
    }

    // Audit log
    console.log(`[AUDIT] Revocation performed by Admin ${req.user.email} on filter ${JSON.stringify(filter)}. Sessions revoked: ${result.modifiedCount}`);

    res.status(200).json({ success: true, message: "Session(s) revoked successfully", count: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};
