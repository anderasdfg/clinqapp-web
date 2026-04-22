import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  // Categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Products
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  // Stock management
  adjustStock,
  getProductMovements,
  getLowStockProducts,
} from '../controllers/inventory.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// ============================================
// PRODUCT CATEGORIES ROUTES
// ============================================
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ============================================
// PRODUCTS ROUTES
// ============================================
router.get('/products', getProducts);
router.get('/products/low-stock', getLowStockProducts);
router.get('/products/:id', getProduct);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ============================================
// STOCK MANAGEMENT ROUTES
// ============================================
router.post('/products/:id/stock', adjustStock);
router.get('/products/:id/movements', getProductMovements);

export default router;
