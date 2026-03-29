import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import {
  getCurrentUser,
  createOrUpdateUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

// GET /api/auth/me — Get current authenticated user profile
router.get("/me", authCheck, getCurrentUser);

// POST /api/auth/create-or-update — Create or update user after registration
router.post("/create-or-update", authCheck, createOrUpdateUser);

export default router;
