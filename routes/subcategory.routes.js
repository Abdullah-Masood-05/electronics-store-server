import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  create,
  list,
  read,
  update,
  remove,
} from "../controllers/subcategory.controller.js";

const router = express.Router();

// Public
router.get("/", list);
router.get("/:slug", read);

// Admin only
router.post("/", authCheck, authorizeRoles("admin"), create);
router.put("/:slug", authCheck, authorizeRoles("admin"), update);
router.delete("/:slug", authCheck, authorizeRoles("admin"), remove);

export default router;
