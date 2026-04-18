import express from "express";
import { WebhookController } from "../controllers/webhookController";

const router = express.Router();

// Middleware para parsear datos de Twilio (form-urlencoded)
router.use(express.urlencoded({ extended: true }));

// Webhook para recibir mensajes de WhatsApp
router.post("/whatsapp/incoming", WebhookController.receiveWhatsAppMessage);

// Webhook para estado de mensajes
router.post("/whatsapp/status", WebhookController.messageStatus);

// Endpoints para administración manual
router.post("/whatsapp/send", WebhookController.sendMessage);
router.get("/whatsapp/conversations", WebhookController.getConversations);
router.get("/whatsapp/conversations/:phoneNumber/messages", WebhookController.getConversationMessages);

// Endpoint de prueba
router.get("/test", (req, res) => {
  res.json({ 
    message: "Webhook endpoints funcionando correctamente",
    endpoints: {
      incoming: "/api/webhooks/whatsapp/incoming",
      status: "/api/webhooks/whatsapp/status",
      send: "/api/webhooks/whatsapp/send",
      conversations: "/api/webhooks/whatsapp/conversations"
    }
  });
});

export default router;
