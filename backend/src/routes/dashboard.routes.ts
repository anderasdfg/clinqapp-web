import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getStats } from "../controllers/dashboard.controller";

const router = Router();

// GET /api/dashboard/stats
router.get("/stats", authenticate, getStats);

export default router;
