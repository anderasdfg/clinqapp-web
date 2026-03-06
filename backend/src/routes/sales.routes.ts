import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getSales, exportSales } from "../controllers/sales.controller";

const router = Router();

// All routes require authentication
router.get("/", authenticate, getSales);
router.get("/export", authenticate, exportSales);

export default router;
