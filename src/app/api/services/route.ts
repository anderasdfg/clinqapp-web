// src/app/api/services/route.ts
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

// GET - List all services
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

    const services = await prisma.service.findMany({
      where: {
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Error al obtener servicios' }, { status: 500 });
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = serviceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        ...validation.data,
        organizationId: dbUser.organizationId,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Error al crear servicio' }, { status: 500 });
  }
}
