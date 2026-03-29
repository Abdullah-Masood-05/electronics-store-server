import express from "express";
import { authCheck } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  create,
  listActive,
  listAll,
  update,
  remove,
} from "../controllers/deal.controller.js";

const router = express.Router();

// Public — active deals only
router.get("/", listActive);

// Admin
router.get("/all", authCheck, authorizeRoles("admin"), listAll);
router.post("/", authCheck, authorizeRoles("admin"), create);
router.put("/:id", authCheck, authorizeRoles("admin"), update);
router.delete("/:id", authCheck, authorizeRoles("admin"), remove);

export default router;
