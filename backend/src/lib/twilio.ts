import twilio from 'twilio';
import { format, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
const reminderContentSid = process.env.TWILIO_REMINDER_CONTENT_SID;

if (!accountSid || !authToken || !whatsappFrom || !reminderContentSid) {
  console.warn('⚠️ Missing Twilio environment variables - WhatsApp reminders will not work');
  // Temporarily disable for testing
  // throw new Error('Missing required Twilio environment variables');
}

const client = twilio(accountSid, authToken);

export interface ReminderData {
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicName: string;
}

export class TwilioService {
  /**
   * Send WhatsApp appointment reminder using Twilio Content Template
   */
  static async sendAppointmentReminder(
    patientPhone: string,
    reminderData: ReminderData
  ): Promise<{ success: boolean; messageSid?: string; error?: string }> {
    try {
      // Ensure phone number is in E.164 format
      const formattedPhone = this.formatPhoneNumber(patientPhone);
      
      const message = await client.messages.create({
        from: whatsappFrom,
        to: `whatsapp:${formattedPhone}`,
        contentSid: reminderContentSid,
        contentVariables: JSON.stringify({
          '1': reminderData.patientName,
          '2': reminderData.appointmentDate,
          '3': reminderData.appointmentTime,
          '4': reminderData.clinicName
        })
      });

      console.log(`WhatsApp reminder sent successfully. SID: ${message.sid}`);
      
      return {
        success: true,
        messageSid: message.sid
      };
    } catch (error) {
      console.error('Error sending WhatsApp reminder:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Format phone number to E.164 format
   * Assumes Peruvian phone numbers if no country code is provided
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // If it starts with 51 (Peru country code), use as is
    if (digitsOnly.startsWith('51') && digitsOnly.length === 11) {
      return `+${digitsOnly}`;
    }
    
    // If it's 9 digits, assume it's a Peruvian mobile number
    if (digitsOnly.length === 9) {
      return `+51${digitsOnly}`;
    }
    
    // If it already has a country code (starts with +)
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // Default: add Peru country code
    return `+51${digitsOnly}`;
  }

  /**
   * Format date for Lima timezone
   */
  static formatDateForLima(date: Date): string {
    const limaTime = toZonedTime(date, 'America/Lima');
    return format(limaTime, 'dd/MM/yyyy');
  }

  /**
   * Format time for Lima timezone
   */
  static formatTimeForLima(date: Date): string {
    const limaTime = toZonedTime(date, 'America/Lima');
    return format(limaTime, 'HH:mm');
  }

  /**
   * Send a free-form WhatsApp message (for responses and manual messages)
   */
  static async sendMessage(
    patientPhone: string,
    message: string
  ): Promise<{ success: boolean; messageSid?: string; error?: string; sid?: string }> {
    try {
      // Ensure phone number is in E.164 format
      const formattedPhone = this.formatPhoneNumber(patientPhone);
      
      const twilioMessage = await client.messages.create({
        from: whatsappFrom,
        to: `whatsapp:${formattedPhone}`,
        body: message
      });

      console.log(`WhatsApp message sent successfully. SID: ${twilioMessage.sid}`);
      
      return {
        success: true,
        messageSid: twilioMessage.sid,
        sid: twilioMessage.sid
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
