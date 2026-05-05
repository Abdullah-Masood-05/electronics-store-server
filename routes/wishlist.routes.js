import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";

const router = express.Router();

router.get("/", authCheck, getWishlist);
router.post("/:productId", authCheck, addToWishlist);
router.delete("/:productId", authCheck, removeFromWishlist);

export default router;
