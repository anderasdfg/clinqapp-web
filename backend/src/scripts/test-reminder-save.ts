import { prisma } from '../lib/prisma';
import { TwilioService, ReminderData } from '../lib/twilio';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testReminderSave() {
  try {
    console.log('🧪 Testing reminder save functionality...');
    
    // Buscar un paciente existente
    const patient = await prisma.patient.findFirst({
      where: {
        phone: {
          contains: '946719657'
        }
      },
      include: {
        organization: true
      }
    });
    
    if (!patient) {
      console.error('❌ No patient found');
      return;
    }
    
    console.log(`👤 Found patient: ${patient.firstName} ${patient.lastName}`);
    
    // Preparar datos del recordatorio
    const reminderData: ReminderData = {
      patientName: `${patient.firstName} ${patient.lastName}`,
      appointmentDate: '21/04/2026',
      appointmentTime: '09:00',
      clinicName: patient.organization.name
    };
    
    // Enviar recordatorio
    const result = await TwilioService.sendAppointmentReminder(
      patient.phone,
      reminderData
    );
    
    if (result.success) {
      console.log(`✅ Reminder sent successfully. SID: ${result.messageSid}`);
      
      // Guardar en la base de datos
      const formattedPhone = TwilioService.formatPhoneNumber(patient.phone);
      const reminderContent = `¡Hola ${reminderData.patientName}! 👋\n\nTe recordamos que tienes una cita mañana ${reminderData.appointmentDate} a las ${reminderData.appointmentTime}\n📍 ${reminderData.clinicName}\n\n¡Te esperamos!`;
      
      const savedMessage = await prisma.whatsAppMessage.create({
        data: {
          phoneNumber: formattedPhone,
          direction: 'OUTGOING',
          content: reminderContent,
          messageSid: result.messageSid,
          organizationId: patient.organizationId,
          patientId: patient.id,
          status: 'SENT',
          isAutoResponse: false
        }
      });
      
      console.log(`💾 Message saved to database with ID: ${savedMessage.id}`);
      console.log(`📱 Phone: ${formattedPhone}`);
      console.log(`📝 Content: ${reminderContent.substring(0, 50)}...`);
      
    } else {
      console.error(`❌ Failed to send reminder: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el test
testReminderSave();
