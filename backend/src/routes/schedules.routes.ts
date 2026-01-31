import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getOrganizationSchedules } from "../controllers/schedules.controller";

const router = Router();

/**
 * @route   GET /api/schedules
 * @desc    Get organization schedules
 * @access  Private (requires authentication)
 */
router.get("/", authenticate, getOrganizationSchedules);

export default router;
