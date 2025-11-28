import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getOrganization, updateOrganization } from '../controllers/organization.controller';

const router = Router();

router.get('/', authenticate, getOrganization);
router.put('/', authenticate, updateOrganization);

export default router;
