import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    checkAppointmentAvailability,
    registerPayment,
} from '../controllers/appointments.controller';

const router = Router();

// All routes require authentication
router.get('/', authenticate, getAppointments);
router.get('/availability', authenticate, checkAppointmentAvailability);
router.get('/:id', authenticate, getAppointmentById);
router.post('/', authenticate, createAppointment);
router.put('/:id', authenticate, updateAppointment);
router.patch('/:id/status', authenticate, updateAppointmentStatus);
router.post('/:id/payment', authenticate, registerPayment);
router.delete('/:id', authenticate, deleteAppointment);

export default router;
