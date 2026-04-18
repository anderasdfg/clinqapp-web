import { Request, Response } from "express";
import { TwilioService } from "../lib/twilio";
import { prisma } from "../lib/prisma";

export class WebhookController {
  // Webhook para recibir mensajes de WhatsApp
  static async receiveWhatsAppMessage(req: Request, res: Response) {
    try {
      console.log("📱 Webhook recibido:", req.body);
      
      const {
        From: from,
        To: to,
        Body: body,
        MessageSid: messageSid,
        AccountSid: accountSid,
        ProfileName: profileName
      } = req.body;

      // Extraer número de teléfono (remover prefijo whatsapp:)
      const phoneNumber = from?.replace("whatsapp:", "");
      const toNumber = to?.replace("whatsapp:", "");

      console.log(`📞 Mensaje de ${phoneNumber} (${profileName}): ${body}`);

      // Buscar paciente por número de teléfono
      const patient = await prisma.patient.findFirst({
        where: {
          phone: {
            contains: phoneNumber.replace("+51", "").replace("+", "")
          }
        },
        include: {
          organization: true
        }
      });

      // Guardar mensaje entrante en la base de datos
      const incomingMessage = await prisma.whatsAppMessage.create({
        data: {
          phoneNumber: phoneNumber,
          direction: 'INCOMING',
          content: body,
          messageSid: messageSid,
          accountSid: accountSid,
          profileName: profileName,
          organizationId: patient?.organizationId || null,
          patientId: patient?.id || null,
          status: 'DELIVERED'
        }
      });

      console.log(`💾 Mensaje guardado con ID: ${incomingMessage.id}`);

      let responseMessage: string;
      let isAutoResponse = true;

      if (patient) {
        console.log(`👤 Paciente encontrado: ${patient.firstName} ${patient.lastName}`);
        
        // Respuesta automática personalizada
        responseMessage = `Hola ${patient.firstName}! 👋\n\nGracias por contactarnos. Tu mensaje ha sido recibido en ${patient.organization.name}.\n\nEn breve nos comunicaremos contigo. Si es una emergencia, por favor llama directamente a la clínica.\n\n¡Que tengas un buen día! 😊`;
      } else {
        console.log("❓ Paciente no encontrado en la base de datos");
        
        // Respuesta para números no registrados
        responseMessage = `Hola! 👋\n\nGracias por contactarnos. No encontramos tu número en nuestro sistema.\n\nPor favor, contacta directamente con la clínica para más información.\n\n¡Gracias! 😊`;
      }

      // Enviar respuesta automática
      const sentMessage = await TwilioService.sendMessage(phoneNumber, responseMessage);
      
      if (sentMessage.success) {
        // Guardar respuesta automática en la base de datos
        await prisma.whatsAppMessage.create({
          data: {
            phoneNumber: phoneNumber,
            direction: 'OUTGOING',
            content: responseMessage,
            messageSid: sentMessage.messageSid,
            organizationId: patient?.organizationId || null,
            patientId: patient?.id || null,
            status: 'SENT',
            isAutoResponse: true,
            respondedAt: new Date()
          }
        });

        console.log("✅ Respuesta automática enviada y guardada");
      } else {
        console.error("❌ Error enviando respuesta automática:", sentMessage.error);
      }

      // Responder a Twilio con TwiML vacío (requerido)
      res.set('Content-Type', 'text/xml');
      res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
      
    } catch (error) {
      console.error("❌ Error procesando webhook:", error);
      res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
  }

  // Webhook para estado de mensajes (entregado, leído, etc.)
  static async messageStatus(req: Request, res: Response) {
    try {
      console.log("📊 Estado de mensaje:", req.body);
      
      const {
        MessageSid: messageSid,
        MessageStatus: status,
        To: to,
        ErrorCode: errorCode,
        ErrorMessage: errorMessage
      } = req.body;

      console.log(`📱 Mensaje ${messageSid} - Estado: ${status}`);
      
      if (errorCode) {
        console.error(`❌ Error en mensaje ${messageSid}: ${errorCode} - ${errorMessage}`);
      }

      // Aquí podrías actualizar el estado del mensaje en tu base de datos
      // si tienes una tabla de mensajes

      res.status(200).send('OK');
      
    } catch (error) {
      console.error("❌ Error procesando estado de mensaje:", error);
      res.status(500).send('Error');
    }
  }

  // Endpoint para enviar mensajes manuales (para admin)
  static async sendMessage(req: Request, res: Response) {
    try {
      const { phoneNumber, message, organizationId } = req.body;

      if (!phoneNumber || !message) {
        return res.status(400).json({
          error: "phoneNumber y message son requeridos"
        });
      }

      // Formatear número de teléfono
      let formattedPhone = phoneNumber;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+51' + formattedPhone;
      }

      // Buscar paciente para asociar el mensaje
      const patient = await prisma.patient.findFirst({
        where: {
          phone: {
            contains: formattedPhone.replace("+51", "").replace("+", "")
          }
        }
      });

      const result = await TwilioService.sendMessage(formattedPhone, message);
      
      if (result.success) {
        // Guardar mensaje manual en la base de datos
        await prisma.whatsAppMessage.create({
          data: {
            phoneNumber: formattedPhone,
            direction: 'OUTGOING',
            content: message,
            messageSid: result.messageSid,
            organizationId: organizationId || patient?.organizationId || null,
            patientId: patient?.id || null,
            status: 'SENT',
            isAutoResponse: false
          }
        });

        console.log(`📤 Mensaje manual enviado y guardado: ${formattedPhone}`);
        
        res.json({
          success: true,
          messageSid: result.messageSid,
          to: formattedPhone,
          message: message,
          patientFound: !!patient
        });
      } else {
        res.status(500).json({
          error: "Error enviando mensaje",
          details: result.error
        });
      }
      
    } catch (error) {
      console.error("❌ Error enviando mensaje manual:", error);
      res.status(500).json({
        error: "Error enviando mensaje",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  }

  // Endpoint para obtener conversaciones
  static async getConversations(req: Request, res: Response) {
    try {
      const { organizationId, limit = 50, offset = 0 } = req.query;

      // Obtener conversaciones agrupadas por número de teléfono
      const conversations = await prisma.$queryRaw`
        SELECT 
          phone_number,
          profile_name,
          patient_id,
          organization_id,
          COUNT(*) as message_count,
          MAX(created_at) as last_message_at,
          (
            SELECT content 
            FROM whatsapp_messages wm2 
            WHERE wm2.phone_number = wm.phone_number 
            ORDER BY created_at DESC 
            LIMIT 1
          ) as last_message,
          (
            SELECT direction 
            FROM whatsapp_messages wm2 
            WHERE wm2.phone_number = wm.phone_number 
            ORDER BY created_at DESC 
            LIMIT 1
          ) as last_message_direction
        FROM whatsapp_messages wm
        ${organizationId ? `WHERE organization_id = ${organizationId}` : ''}
        GROUP BY phone_number, profile_name, patient_id, organization_id
        ORDER BY MAX(created_at) DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      // Obtener información de pacientes para las conversaciones
      const conversationsWithPatients = await Promise.all(
        (conversations as any[]).map(async (conv) => {
          let patient = null;
          if (conv.patient_id) {
            patient = await prisma.patient.findUnique({
              where: { id: conv.patient_id },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                organization: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            });
          }

          return {
            phoneNumber: conv.phone_number,
            profileName: conv.profile_name,
            messageCount: parseInt(conv.message_count),
            lastMessageAt: conv.last_message_at,
            lastMessage: conv.last_message,
            lastMessageDirection: conv.last_message_direction,
            patient: patient,
            organizationId: conv.organization_id
          };
        })
      );

      res.json({
        conversations: conversationsWithPatients,
        total: conversationsWithPatients.length
      });
      
    } catch (error) {
      console.error("❌ Error obteniendo conversaciones:", error);
      res.status(500).json({
        error: "Error obteniendo conversaciones",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  }

  // Endpoint para obtener mensajes de una conversación específica
  static async getConversationMessages(req: Request, res: Response) {
    try {
      const { phoneNumber } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      if (!phoneNumber) {
        return res.status(400).json({
          error: "phoneNumber es requerido"
        });
      }

      const messages = await prisma.whatsAppMessage.findMany({
        where: {
          phoneNumber: phoneNumber as string
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          organization: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      res.json({
        messages: messages,
        phoneNumber: phoneNumber,
        total: messages.length
      });
      
    } catch (error) {
      console.error("❌ Error obteniendo mensajes de conversación:", error);
      res.status(500).json({
        error: "Error obteniendo mensajes",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  }
}
