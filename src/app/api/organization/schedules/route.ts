// src/app/api/organization/schedules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const scheduleSchema = z.object({
  schedules: z.array(
    z.object({
      dayOfWeek: z.enum([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY',
      ]),
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
    })
  ),
});

// GET - Get organization schedules
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
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const schedules = await prisma.schedule.findMany({
      where: { organizationId: dbUser.organizationId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Error al obtener horarios' },
      { status: 500 }
    );
  }
}

// PUT - Update organization schedules
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

    if (!dbUser || dbUser.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Solo el propietario puede actualizar los horarios' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = scheduleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error },
        { status: 400 }
      );
    }

    const { schedules } = validation.data;

    // Delete existing schedules and create new ones
    await prisma.$transaction(async (tx) => {
      await tx.schedule.deleteMany({
        where: { organizationId: dbUser.organizationId },
      });

      const schedulesToCreate = schedules
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
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating schedules:', error);
    return NextResponse.json(
      { error: 'Error al actualizar horarios' },
      { status: 500 }
    );
  }
}
