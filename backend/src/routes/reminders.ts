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

// Scheduler management endpoints
router.get('/scheduler/status', ReminderController.getSchedulerStatus);
router.post('/scheduler/start', ReminderController.startScheduler);
router.post('/scheduler/stop', ReminderController.stopScheduler);

export default router;
