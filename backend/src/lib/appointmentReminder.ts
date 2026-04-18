import { prisma } from './prisma';
import { TwilioService, ReminderData } from './twilio';
import { addDays, startOfDay, endOfDay, subHours } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const LIMA_TIMEZONE = 'America/Lima';

export class AppointmentReminderService {
  /**
   * Process all appointment reminders for the next day
   * This should be called daily at 9 AM Lima time
   */
  static async processReminders(): Promise<{
    processed: number;
    successful: number;
    failed: number;
    errors: string[];
  }> {
    console.log('🔔 Starting appointment reminder processing...');
    
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    try {
      // Get tomorrow's date in Lima timezone
      const now = new Date();
      const limaTime = toZonedTime(now, LIMA_TIMEZONE);
      const tomorrow = addDays(limaTime, 1);
      
      // Get start and end of tomorrow in Lima timezone, then convert to UTC
      const tomorrowStartLima = startOfDay(tomorrow);
      const tomorrowEndLima = endOfDay(tomorrow);
      
      const tomorrowStartUTC = fromZonedTime(tomorrowStartLima, LIMA_TIMEZONE);
      const tomorrowEndUTC = fromZonedTime(tomorrowEndLima, LIMA_TIMEZONE);

      console.log(`📅 Processing reminders for ${tomorrow.toDateString()} (Lima time)`);
      console.log(`🕐 UTC range: ${tomorrowStartUTC.toISOString()} to ${tomorrowEndUTC.toISOString()}`);

      // Find all appointments for tomorrow that haven't had reminders sent yet
      const appointments = await prisma.appointment.findMany({
        where: {
          startTime: {
            gte: tomorrowStartUTC,
            lte: tomorrowEndUTC
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          reminderSentAt: null,
          deletedAt: null
        },
        include: {
          patient: true,
          organization: {
            select: {
              name: true,
              sendReminders: true,
              notificationWhatsapp: true
            }
          },
          professional: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      console.log(`📋 Found ${appointments.length} appointments requiring reminders`);

      for (const appointment of appointments) {
        results.processed++;

        try {
          // Check if organization has WhatsApp reminders enabled
          if (!appointment.organization.sendReminders || !appointment.organization.notificationWhatsapp) {
            console.log(`⏭️ Skipping appointment ${appointment.id} - reminders disabled for organization`);
            continue;
          }

          // Check if patient has a phone number
          if (!appointment.patient.phone) {
            console.log(`⏭️ Skipping appointment ${appointment.id} - patient has no phone number`);
            continue;
          }

          // Prepare reminder data
          const reminderData: ReminderData = {
            patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
            appointmentDate: TwilioService.formatDateForLima(appointment.startTime),
            appointmentTime: TwilioService.formatTimeForLima(appointment.startTime),
            clinicName: appointment.organization.name
          };

          // Send WhatsApp reminder
          const result = await TwilioService.sendAppointmentReminder(
            appointment.patient.phone,
            reminderData
          );

          if (result.success) {
            // Update appointment to mark reminder as sent
            await prisma.appointment.update({
              where: { id: appointment.id },
              data: { reminderSentAt: new Date() }
            });

            results.successful++;
            console.log(`✅ Reminder sent for appointment ${appointment.id} (${reminderData.patientName})`);
          } else {
            results.failed++;
            const errorMsg = `Failed to send reminder for appointment ${appointment.id}: ${result.error}`;
            results.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }

        } catch (error) {
          results.failed++;
          const errorMsg = `Error processing appointment ${appointment.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      console.log(`🎯 Reminder processing completed:`);
      console.log(`   📊 Processed: ${results.processed}`);
      console.log(`   ✅ Successful: ${results.successful}`);
      console.log(`   ❌ Failed: ${results.failed}`);

      return results;

    } catch (error) {
      const errorMsg = `Critical error in reminder processing: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`💥 ${errorMsg}`);
      results.errors.push(errorMsg);
      return results;
    }
  }

  /**
   * Send a manual reminder for a specific appointment
   */
  static async sendManualReminder(appointmentId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          organization: {
            select: {
              name: true,
              notificationWhatsapp: true
            }
          }
        }
      });

      if (!appointment) {
        return { success: false, error: 'Appointment not found' };
      }

      if (!appointment.organization.notificationWhatsapp) {
        return { success: false, error: 'WhatsApp notifications not enabled for this organization' };
      }

      if (!appointment.patient.phone) {
        return { success: false, error: 'Patient has no phone number' };
      }

      const reminderData: ReminderData = {
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        appointmentDate: TwilioService.formatDateForLima(appointment.startTime),
        appointmentTime: TwilioService.formatTimeForLima(appointment.startTime),
        clinicName: appointment.organization.name
      };

      const result = await TwilioService.sendAppointmentReminder(
        appointment.patient.phone,
        reminderData
      );

      if (result.success) {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: { reminderSentAt: new Date() }
        });
      }

      return result;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get reminder statistics for a date range
   */
  static async getReminderStats(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalAppointments: number;
    remindersEligible: number;
    remindersSent: number;
    remindersNotSent: number;
  }> {
    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId,
        startTime: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'COMPLETED']
        },
        deletedAt: null
      },
      include: {
        patient: true,
        organization: {
          select: {
            sendReminders: true,
            notificationWhatsapp: true
          }
        }
      }
    });

    const totalAppointments = appointments.length;
    
    const remindersEligible = appointments.filter(apt => 
      apt.organization.sendReminders && 
      apt.organization.notificationWhatsapp && 
      apt.patient.phone
    ).length;

    const remindersSent = appointments.filter(apt => 
      apt.reminderSentAt !== null
    ).length;

    const remindersNotSent = remindersEligible - remindersSent;

    return {
      totalAppointments,
      remindersEligible,
      remindersSent,
      remindersNotSent
    };
  }
}
