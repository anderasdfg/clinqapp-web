import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { completeOnboarding } from '../controllers/onboarding.controller';

const router = Router();

router.post('/complete', authenticate, completeOnboarding);

export default router;
