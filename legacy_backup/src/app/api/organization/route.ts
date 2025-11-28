// src/app/api/organization/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { basicClinicDataSchema } from '@/lib/validations/onboarding';

// GET - Get organization data
export async function GET() {
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

    if (!dbUser || !dbUser.organization) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(dbUser.organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de la organización' },
      { status: 500 }
    );
  }
}

// PUT - Update organization data
export async function PUT(request: NextRequest) {
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

    // Only OWNER can update organization
    if (dbUser.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Solo el propietario puede actualizar la organización' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate data
    const validation = basicClinicDataSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Update organization
    const updatedOrg = await prisma.organization.update({
      where: { id: dbUser.organizationId },
      data: {
        name: data.name,
        ruc: data.ruc,
        address: data.address,
        phone: data.phone,
        email: data.email,
        logoUrl: data.logoUrl,
        specialty: data.specialty,
        website: data.website || null,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        tiktokUrl: data.tiktokUrl || null,
        linkedinUrl: data.linkedinUrl || null,
      },
    });

    return NextResponse.json(updatedOrg);
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la organización' },
      { status: 500 }
    );
  }
}
