import { Router } from 'express';
import { ReminderController } from '../controllers/reminderController';

const router = Router();

// Send manual reminder for specific appointment
router.post('/send-manual', ReminderController.sendManualReminder);

// Force process all pending reminders (for testing/manual execution)
router.post('/process-now', ReminderController.processRemindersNow);

// Endpoint para GCP Cloud Scheduler (envío diario de recordatorios)
router.post('/send-daily', ReminderController.sendDailyReminders);

// Get reminder statistics for an organization
router.get('/stats', ReminderController.getReminderStats);

// Scheduler status (solo lectura - GCP Cloud Scheduler)
router.get('/scheduler/status', ReminderController.getSchedulerStatus);

export default router;
