import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    getStaff,
    getStaffById,
    createStaff,
    createStaffWithAuth,
    updateStaff,
    deleteStaff,
} from '../controllers/staff.controller';

const router = Router();

// All routes require authentication
router.post('/', authenticate, createStaff); // New endpoint - creates in DB first
router.get('/', authenticate, getStaff);
router.get('/:id', authenticate, getStaffById);
router.post('/create-with-auth', authenticate, createStaffWithAuth); // Legacy endpoint
router.put('/:id', authenticate, updateStaff);
router.delete('/:id', authenticate, deleteStaff);

export default router;
