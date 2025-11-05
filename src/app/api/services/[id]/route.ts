// src/app/api/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  category: z.enum(['DIAGNOSTIC', 'TREATMENT', 'FOLLOWUP', 'OTHER']),
  basePrice: z.number().min(0),
  currency: z.string().default('PEN'),
  duration: z.number().min(5).max(480),
  requiresSessions: z.boolean().default(false),
  defaultSessions: z.number().min(1).optional().nullable(),
  isActive: z.boolean().default(true),
});

// PUT - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const validation = serviceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error },
        { status: 400 }
      );
    }

    // Verify service belongs to user's organization
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService || existingService.organizationId !== dbUser.organizationId) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }

    const service = await prisma.service.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Error al actualizar servicio' }, { status: 500 });
  }
}

// DELETE - Soft delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Verify service belongs to user's organization
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService || existingService.organizationId !== dbUser.organizationId) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }

    // Soft delete
    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Error al eliminar servicio' }, { status: 500 });
  }
}
