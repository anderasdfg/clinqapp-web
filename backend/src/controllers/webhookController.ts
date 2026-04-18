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

      if (patient) {
        console.log(`👤 Paciente encontrado: ${patient.firstName} ${patient.lastName}`);
      } else {
        console.log("❓ Paciente no encontrado en la base de datos");
      }

      console.log("📝 Mensaje recibido y guardado - Sin respuesta automática");

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

      // Obtener todos los números únicos de teléfono
      const whereClause = organizationId ? { organizationId: organizationId as string } : {};
      
      const uniquePhones = await prisma.whatsAppMessage.groupBy({
        by: ['phoneNumber'],
        where: whereClause,
        _count: {
          id: true
        },
        _max: {
          createdAt: true
        },
        orderBy: {
          _max: {
            createdAt: 'desc'
          }
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      // Para cada número, obtener la información completa
      const conversations = await Promise.all(
        uniquePhones.map(async (phone: any) => {
          // Obtener el último mensaje
          const lastMessage = await prisma.whatsAppMessage.findFirst({
            where: {
              phoneNumber: phone.phoneNumber,
              ...whereClause
            },
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              patient: {
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
              }
            }
          });

          return {
            phoneNumber: phone.phoneNumber,
            profileName: lastMessage?.profileName || null,
            messageCount: phone._count.id,
            lastMessageAt: phone._max.createdAt,
            lastMessage: lastMessage?.content || null,
            lastMessageDirection: lastMessage?.direction || null,
            patient: lastMessage?.patient || null,
            organizationId: lastMessage?.organizationId || null
          };
        })
      );

      res.json({
        conversations: conversations,
        total: conversations.length
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
