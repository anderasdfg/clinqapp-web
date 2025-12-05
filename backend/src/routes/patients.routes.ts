import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
} from '../controllers/patients.controller';

const router = Router();

// All routes require authentication
router.get('/', authenticate, getPatients);
router.get('/:id', authenticate, getPatientById);
router.post('/', authenticate, createPatient);
router.put('/:id', authenticate, updatePatient);
router.delete('/:id', authenticate, deletePatient);

export default router;
