import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { completeOnboardingSchema } from "../utils/validations";

export const completeOnboarding = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Only OWNER can complete onboarding
    if (dbUser.role !== "OWNER") {
      return res
        .status(403)
        .json({ error: "Solo el propietario puede completar el onboarding" });
    }

    const body = req.body;

    // Validate data
    const validation = completeOnboardingSchema.safeParse(body);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: "Datos inválidos", details: validation.error });
    }

    const data = validation.data;

    // Check if RUC is already in use by another organization
    const existingOrgWithRuc = await prisma.organization.findUnique({
      where: { ruc: data.basicData.ruc },
    });

    if (existingOrgWithRuc && existingOrgWithRuc.id !== dbUser.organizationId) {
      return res.status(409).json({
        error: "El RUC ingresado ya está registrado por otra organización",
      });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Update organization
      const updatedOrg = await tx.organization.update({
        where: { id: dbUser.organizationId },
        data: {
          name: data.basicData.name,
          ruc: data.basicData.ruc,
          address: data.basicData.address,
          phone: data.basicData.phone,
          email: data.basicData.email,
          logoUrl: data.basicData.logoUrl,
          specialty: data.basicData.specialty,
          // Social media and website
          website: data.basicData.website || null,
          instagramUrl: data.basicData.instagramUrl || null,
          facebookUrl: data.basicData.facebookUrl || null,
          tiktokUrl: data.basicData.tiktokUrl || null,
          linkedinUrl: data.basicData.linkedinUrl || null,
          onboardingCompleted: true,
          isTemporary: false,
          // Notification settings
          notificationEmail: data.notifications.notificationEmail,
          notificationWhatsapp: data.notifications.notificationWhatsapp,
          whatsappNumber: data.notifications.whatsappNumber,
          sendReminders: data.notifications.sendReminders,
          reminderHoursBefore: data.notifications.reminderHoursBefore,
          // Schedule settings
          defaultAppointmentDuration:
            data.scheduleConfig.defaultAppointmentDuration,
          appointmentInterval: data.scheduleConfig.appointmentInterval,
          allowOnlineBooking: data.scheduleConfig.allowOnlineBooking,
        },
      });

      // 2. Create schedules
      await tx.schedule.deleteMany({
        where: { organizationId: dbUser.organizationId },
      });

      const schedulesToCreate = data.businessHours.schedules
        .filter((s) => s.enabled)
        .map((schedule) => ({
          organizationId: dbUser.organizationId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          enabled: schedule.enabled,
        }));

      if (schedulesToCreate.length > 0) {
        await tx.schedule.createMany({
          data: schedulesToCreate,
        });
      }

      // 3. Create payment methods
      await tx.paymentMethodConfig.deleteMany({
        where: { organizationId: dbUser.organizationId },
      });

      const paymentMethodsToCreate = data.paymentMethods.methods.map(
        (method) => ({
          organizationId: dbUser.organizationId,
          type: method.type,
          otherName: method.otherName,
          isActive: true,
        })
      );

      await tx.paymentMethodConfig.createMany({
        data: paymentMethodsToCreate,
      });

      // 4. Create consultation types
      await tx.consultationTypeConfig.deleteMany({
        where: { organizationId: dbUser.organizationId },
      });

      const consultationTypesToCreate = data.consultationTypes.types.map(
        (type) => ({
          organizationId: dbUser.organizationId,
          type: type,
          isActive: true,
        })
      );

      await tx.consultationTypeConfig.createMany({
        data: consultationTypesToCreate,
      });

      // 5. Create services
      const servicesToCreate = data.services.services.map((service) => ({
        organizationId: dbUser.organizationId,
        name: service.name,
        description: service.description,
        category: service.category,
        basePrice: service.basePrice || 0,
        currency: service.currency,
        duration: service.duration,
        isActive: true,
      }));

      await tx.service.createMany({
        data: servicesToCreate,
      });

      // 6. Create invitations (if any)
      if (data.invitations && data.invitations.invitations.length > 0) {
        const invitationsToCreate = data.invitations.invitations.map(
          (invitation) => ({
            organizationId: dbUser.organizationId,
            email: invitation.email,
            role: invitation.role,
            invitedBy: dbUser.id,
            token: crypto.randomUUID(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          })
        );

        await tx.invitation.createMany({
          data: invitationsToCreate,
        });

        // TODO: Send invitation emails
      }

      return updatedOrg;
    });

    res.json({
      success: true,
      message: "Onboarding completado exitosamente",
      organization: result,
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    res.status(500).json({ error: "Error al completar el onboarding" });
  }
};
