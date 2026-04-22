import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getProductSales,
  getProductSale,
  createProductSale,
  getSalesStats,
  exportSales,
} from '../controllers/product-sales.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// ============================================
// PRODUCT SALES ROUTES
// ============================================
router.get('/', getProductSales);
router.get('/stats', getSalesStats);
router.get('/export', exportSales);
router.get('/:id', getProductSale);
router.post('/', createProductSale);

export default router;
