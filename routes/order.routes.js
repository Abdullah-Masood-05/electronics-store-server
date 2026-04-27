import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  createCodOrder,
  createStripeIntent,
  confirmStripeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

// User
router.get("/mine", authCheck, getUserOrders);
router.post("/cod", authCheck, createCodOrder);
router.post("/stripe/intent", authCheck, createStripeIntent);
router.post("/stripe/confirm", authCheck, confirmStripeOrder);

// Admin
router.get("/all", authCheck, authorizeRoles("admin"), getAllOrders);
router.put("/:id/status", authCheck, authorizeRoles("admin"), updateOrderStatus);

export default router;
