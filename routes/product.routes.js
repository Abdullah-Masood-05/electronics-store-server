import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  create,
  list,
  read,
  update,
  remove,
  totalCount,
  listByCategory,
  listBySubCategory,
  submitRating,
  trackClick,
  trending,
} from "../controllers/product.controller.js";

const router = express.Router();

// Public
router.get("/count", totalCount);
router.get("/trending", trending);
router.get("/category/:slug", listByCategory);
router.get("/subcategory/:slug", listBySubCategory);
router.post("/:slug/click", trackClick);
router.get("/", list);
router.get("/:slug", read);

// Authenticated
router.put("/rating", authCheck, submitRating);

// Admin only
router.post("/", authCheck, authorizeRoles("admin"), create);
router.put("/:slug", authCheck, authorizeRoles("admin"), update);
router.delete("/:slug", authCheck, authorizeRoles("admin"), remove);

export default router;
