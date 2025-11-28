// src/app/api/organization/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const notificationsSchema = z.object({
  notificationEmail: z.boolean(),
  notificationWhatsapp: z.boolean(),
  whatsappNumber: z.string().optional().nullable(),
  sendReminders: z.boolean(),
  reminderHoursBefore: z.number().min(1).max(72),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: dbUser.organizationId },
      select: {
        notificationEmail: true,
        notificationWhatsapp: true,
        whatsappNumber: true,
        sendReminders: true,
        reminderHoursBefore: true,
      },
    });

    return NextResponse.json(org);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración de notificaciones' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (dbUser.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Solo el propietario puede actualizar las notificaciones' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = notificationsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error },
        { status: 400 }
      );
    }

    await prisma.organization.update({
      where: { id: dbUser.organizationId },
      data: validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Error al actualizar configuración de notificaciones' },
      { status: 500 }
    );
  }
}
