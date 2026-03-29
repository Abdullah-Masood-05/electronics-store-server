import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { getStats } from "../controllers/admin.controller.js";

const router = express.Router();

// Admin only
router.get("/stats", authCheck, authorizeRoles("admin"), getStats);

export default router;
