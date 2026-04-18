import { AppointmentReminderService } from './appointmentReminder';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const LIMA_TIMEZONE = 'America/Lima';
const REMINDER_HOUR = 9; // 9 AM Lima time

export class ReminderScheduler {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunning = false;

  /**
   * Start the reminder scheduler
   * Checks every hour if it's time to send reminders (9 AM Lima time)
   */
  static start(): void {
    if (this.isRunning) {
      console.log('⚠️ Reminder scheduler is already running');
      return;
    }

    console.log('🚀 Starting reminder scheduler...');
    this.isRunning = true;

    // Check immediately on startup
    this.checkAndProcessReminders();

    // Then check every hour
    this.intervalId = setInterval(() => {
      this.checkAndProcessReminders();
    }, 60 * 60 * 1000); // 1 hour in milliseconds

    console.log('✅ Reminder scheduler started successfully');
  }

  /**
   * Stop the reminder scheduler
   */
  static stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ Reminder scheduler is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('🛑 Reminder scheduler stopped');
  }

  /**
   * Check if it's time to send reminders and process them
   */
  private static async checkAndProcessReminders(): Promise<void> {
    try {
      const now = new Date();
      const limaTime = toZonedTime(now, LIMA_TIMEZONE);
      const currentHour = limaTime.getHours();

      console.log(`🕐 Current Lima time: ${limaTime.toLocaleString('es-PE', { timeZone: LIMA_TIMEZONE })}`);

      // Only process reminders at 9 AM Lima time
      if (currentHour === REMINDER_HOUR) {
        console.log('⏰ It\'s reminder time! Processing appointments...');
        
        const results = await AppointmentReminderService.processReminders();
        
        // Log summary
        console.log('📊 Reminder processing summary:');
        console.log(`   ✅ Successful: ${results.successful}`);
        console.log(`   ❌ Failed: ${results.failed}`);
        
        if (results.errors.length > 0) {
          console.log('🚨 Errors encountered:');
          results.errors.forEach(error => console.log(`   - ${error}`));
        }
      } else {
        console.log(`⏳ Not reminder time yet (current: ${currentHour}:00, target: ${REMINDER_HOUR}:00 Lima time)`);
      }
    } catch (error) {
      console.error('💥 Error in reminder scheduler:', error);
    }
  }

  /**
   * Force process reminders (for testing or manual execution)
   */
  static async forceProcessReminders(): Promise<any> {
    console.log('🔧 Forcing reminder processing...');
    return await AppointmentReminderService.processReminders();
  }

  /**
   * Get scheduler status
   */
  static getStatus(): {
    isRunning: boolean;
    nextCheck: string;
    limaTime: string;
  } {
    const now = new Date();
    const limaTime = toZonedTime(now, LIMA_TIMEZONE);
    
    // Calculate next check time (next hour)
    const nextCheck = new Date(now.getTime() + (60 * 60 * 1000));
    
    return {
      isRunning: this.isRunning,
      nextCheck: nextCheck.toISOString(),
      limaTime: limaTime.toLocaleString('es-PE', { timeZone: LIMA_TIMEZONE })
    };
  }
}
