// src/app/api/user/me/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// GET - Get current user data
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

    // Get user from database with organization
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            specialty: true,
          }
        }
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      dni: dbUser.dni,
      phone: dbUser.phone,
      avatarUrl: dbUser.avatarUrl,
      role: dbUser.role,
      licenseNumber: dbUser.licenseNumber,
      specialty: dbUser.specialty,
      organization: dbUser.organization,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos del usuario' },
      { status: 500 }
    );
  }
}
