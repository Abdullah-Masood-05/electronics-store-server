import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import {
  getCurrentUser,
  createOrUpdateUser,
  createSession,
  logoutSession,
  revokeSession,
  getSessions,
} from "../controllers/auth.controller.js";

import { authLimiter, sessionCreationLimiter } from "../middlewares/rateLimiter.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = express.Router();

// --- Session Management ---
router.post("/session", sessionCreationLimiter, authCheck, createSession);
router.post("/logout", authLimiter, authCheck, logoutSession);
router.get("/sessions", authCheck, getSessions);
router.post("/revoke-session", authLimiter, authCheck, authorizeRoles("admin"), revokeSession);

// --- User Profile ---
router.get("/me", authCheck, getCurrentUser);
router.post("/create-or-update", authLimiter, authCheck, createOrUpdateUser);

export default router;
