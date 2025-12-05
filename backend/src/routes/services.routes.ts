import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
} from '../controllers/services.controller';

const router = Router();

// All routes require authentication
router.get('/', authenticate, getServices);
router.get('/:id', authenticate, getServiceById);
router.post('/', authenticate, createService);
router.put('/:id', authenticate, updateService);
router.delete('/:id', authenticate, deleteService);

export default router;
