import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import { saveCart, getCart, emptyCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", authCheck, getCart);
router.post("/", authCheck, saveCart);
router.delete("/", authCheck, emptyCart);

export default router;
