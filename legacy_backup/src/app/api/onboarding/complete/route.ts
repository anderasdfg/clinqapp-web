// src/app/api/onboarding/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { completeOnboardingSchema } from '@/lib/validations/onboarding';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: { organization: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Only OWNER can complete onboarding
    if (dbUser.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Solo el propietario puede completar el onboarding' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate data
    const validation = completeOnboardingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
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

    return NextResponse.json(
      {
        success: true,
        message: 'Onboarding completado exitosamente',
        organization: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Error al completar el onboarding' },
      { status: 500 }
    );
  }
}
