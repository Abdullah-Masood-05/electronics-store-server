import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { create, list, remove, apply } from "../controllers/coupon.controller.js";

const router = express.Router();

// User
router.post("/apply", authCheck, apply);

// Admin
router.get("/", authCheck, authorizeRoles("admin"), list);
router.post("/", authCheck, authorizeRoles("admin"), create);
router.delete("/:id", authCheck, authorizeRoles("admin"), remove);

export default router;
