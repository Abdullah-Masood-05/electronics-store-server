import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  createCodOrder,
  createStripeIntent,
  confirmStripeOrder,
  getUserOrders,
  getOrderById,
  generateInvoice,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

// User routes (specific paths MUST come before /:id wildcard)
router.get("/mine", authCheck, getUserOrders);
router.post("/cod", authCheck, createCodOrder);
router.post("/stripe/intent", authCheck, createStripeIntent);
router.post("/stripe/confirm", authCheck, confirmStripeOrder);

// Admin routes (also specific, must precede /:id)
router.get("/all", authCheck, authorizeRoles("admin"), getAllOrders);
router.put("/:id/status", authCheck, authorizeRoles("admin"), updateOrderStatus);

// Wildcard routes
router.get("/:id/invoice", authCheck, generateInvoice);
router.get("/:id", authCheck, getOrderById);

export default router;
