import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../controllers/payment-methods.controller";

const router = Router();

// All routes require authentication
router.get("/", authenticate, getPaymentMethods);
router.post("/", authenticate, createPaymentMethod);
router.put("/:id", authenticate, updatePaymentMethod);
router.delete("/:id", authenticate, deletePaymentMethod);

export default router;
