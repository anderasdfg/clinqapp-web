import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Public admin routes (no auth required)
router.post('/login', AdminController.login);

// Protected admin routes (require admin auth)
router.use(adminAuth); // Apply admin auth to all routes below

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// Organizations management
router.get('/organizations', AdminController.getOrganizations);
router.get('/organizations/:id', AdminController.getOrganization);
router.put('/organizations/:id', AdminController.updateOrganization);
router.put('/organizations/:id/modules', AdminController.updateOrganizationModules);
router.get('/organizations/:id/reminder-stats', AdminController.getOrganizationReminderStats);

export default router;
