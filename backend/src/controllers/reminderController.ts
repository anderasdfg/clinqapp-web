import { Request, Response } from 'express';
import { AppointmentReminderService } from '../lib/appointmentReminder';
import { ReminderScheduler } from '../lib/scheduler';
import { z } from 'zod';

// Validation schemas
const sendManualReminderSchema = z.object({
  appointmentId: z.string().uuid()
});

const getReminderStatsSchema = z.object({
  organizationId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
});

export class ReminderController {
  /**
   * Send a manual reminder for a specific appointment
   * POST /api/reminders/send-manual
   */
  static async sendManualReminder(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = sendManualReminderSchema.parse(req.body);

      const result = await AppointmentReminderService.sendManualReminder(appointmentId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Reminder sent successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: 'Failed to send reminder'
        });
      }
    } catch (error) {
      console.error('Error in sendManualReminder:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.issues
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Force process all pending reminders (for testing/manual execution)
   * POST /api/reminders/process-now
   */
  static async processRemindersNow(req: Request, res: Response): Promise<void> {
    try {
      const results = await ReminderScheduler.forceProcessReminders();

      res.status(200).json({
        success: true,
        message: 'Reminders processed successfully',
        data: results
      });
    } catch (error) {
      console.error('Error in processRemindersNow:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to process reminders'
      });
    }
  }

  /**
   * Get reminder statistics for an organization
   * GET /api/reminders/stats?organizationId=...&startDate=...&endDate=...
   */
  static async getReminderStats(req: Request, res: Response): Promise<void> {
    try {
      const { organizationId, startDate, endDate } = getReminderStatsSchema.parse(req.query);

      const stats = await AppointmentReminderService.getReminderStats(
        organizationId,
        new Date(startDate),
        new Date(endDate)
      );

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getReminderStats:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.issues
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get scheduler status
   * GET /api/reminders/scheduler/status
   */
  static async getSchedulerStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = ReminderScheduler.getStatus();

      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error in getSchedulerStatus:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Start the reminder scheduler
   * POST /api/reminders/scheduler/start
   */
  static async startScheduler(req: Request, res: Response): Promise<void> {
    try {
      ReminderScheduler.start();

      res.status(200).json({
        success: true,
        message: 'Reminder scheduler started successfully'
      });
    } catch (error) {
      console.error('Error in startScheduler:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to start scheduler'
      });
    }
  }

  /**
   * Stop the reminder scheduler
   * POST /api/reminders/scheduler/stop
   */
  static async stopScheduler(req: Request, res: Response): Promise<void> {
    try {
      ReminderScheduler.stop();

      res.status(200).json({
        success: true,
        message: 'Reminder scheduler stopped successfully'
      });
    } catch (error) {
      console.error('Error in stopScheduler:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to stop scheduler'
      });
    }
  }

  /**
   * Send daily reminders - Endpoint para GCP Cloud Scheduler
   * POST /api/reminders/send-daily
   */
  static async sendDailyReminders(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔔 Iniciando envío diario de recordatorios desde GCP Cloud Scheduler');
      
      // Verificar que la request viene de GCP (opcional - puedes agregar autenticación)
      const userAgent = req.headers['user-agent'];
      console.log(`📡 Request desde: ${userAgent}`);
      
      // Ejecutar el proceso de recordatorios diarios
      const result = await AppointmentReminderService.processReminders();
      
      console.log(`✅ Proceso completado: ${result.successful} recordatorios enviados, ${result.failed} fallos`);
      
      res.status(200).json({
        success: true,
        message: 'Daily reminders processed successfully',
        data: {
          processed: result.processed,
          remindersSent: result.successful,
          remindersFailed: result.failed,
          errors: result.errors,
          processedAt: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('❌ Error en sendDailyReminders:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to process daily reminders',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
