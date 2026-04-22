import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getOrganization, updateOrganization, getEnabledModules } from '../controllers/organization.controller';

const router = Router();

// Rutas específicas primero
router.get('/current/modules', authenticate, getEnabledModules);

// Rutas genéricas después
router.get('/', authenticate, getOrganization);
router.put('/', authenticate, updateOrganization);

export default router;
