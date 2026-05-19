import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, clearUserCache } from "../middleware/auth.middleware";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const createStaffSchema = z.object({
  email: z.string().email("Email inválido"),
  firstName: z.string().min(1, "Nombre es requerido"),
  lastName: z.string().min(1, "Apellido es requerido"),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  licenseNumber: z.string().optional(),
  role: z
    .enum(["PROFESSIONAL", "OWNER", "RECEPTIONIST"])
    .default("PROFESSIONAL"),
});

const updateStaffSchema = createStaffSchema.partial();

// Simple in-memory cache for staff
const staffCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 3; // 3 minutes cache for staff (rarely change)

// GET /api/staff - List all staff members
export const getStaff = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organizationId: dbUser.organizationId,
      role: {
        in: ["PROFESSIONAL", "OWNER"],
      },
      deletedAt: null,
    };

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Role filter
    if (
      role &&
      (role === "PROFESSIONAL" || role === "OWNER" || role === "RECEPTIONIST")
    ) {
      where.role = role;
    }

    // Generate cache key
    const cacheKey = `${dbUser.organizationId}:${search}:${role}:${page}:${limit}`;
    const cachedEntry = staffCache.get(cacheKey);

    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log(`🚀 Staff: Cache HIT for org ${dbUser.organizationId}`);
      return res.json(cachedEntry.data);
    }

    console.log(`🔍 Staff: Cache MISS for org ${dbUser.organizationId}`);

    // Get staff with pagination
    const [staff, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          authId: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          documentType: true,
          documentNumber: true,
          specialty: true,
          licenseNumber: true,
          role: true,
          organizationId: true,
          avatarUrl: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const result = {
      success: true,
      data: staff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Update cache
    staffCache.set(cacheKey, { data: result, timestamp: Date.now() });

    res.json(result);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ error: "Error al obtener personal" });
  }
};

// GET /api/staff/:id - Get staff member by ID
export const getStaffById = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    const staff = await prisma.user.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        role: {
          in: ["PROFESSIONAL", "OWNER"],
        },
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialty: true,
        licenseNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!staff) {
      return res.status(404).json({ error: "Personal no encontrado" });
    }

    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Error fetching staff member:", error);
    res.status(500).json({ error: "Error al obtener personal" });
  }
};

// POST /api/staff/create-with-auth - Create new staff member with auth
export const createStaffWithAuth = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validate data
    const createWithAuthSchema = z.object({
      authId: z.string().uuid("Auth ID inválido"),
      email: z.string().email("Email inválido"),
      firstName: z.string().min(1, "Nombre es requerido"),
      lastName: z.string().min(1, "Apellido es requerido"),
      phone: z.string().optional(),
      specialty: z.string().optional(),
      licenseNumber: z.string().optional(),
      role: z
        .enum(["PROFESSIONAL", "OWNER", "RECEPTIONIST"])
        .default("PROFESSIONAL"),
    });

    const validation = createWithAuthSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.issues,
      });
    }

    const data = validation.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // Check if authId already exists
    const existingAuthUser = await prisma.user.findUnique({
      where: { authId: data.authId },
    });

    if (existingAuthUser) {
      return res
        .status(409)
        .json({ error: "El usuario de autenticación ya existe" });
    }

    // Create staff member
    const staff = await prisma.user.create({
      data: {
        authId: data.authId,
        organizationId: dbUser.organizationId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        specialty: data.specialty,
        licenseNumber: data.licenseNumber,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialty: true,
        licenseNumber: true,
        role: true,
        createdAt: true,
      },
    });

    // Invalidate cache
    staffCache.clear();
    clearUserCache(data.authId); // Clear cache for the newly created user

    res.status(201).json({
      success: true,
      message: "Personal creado exitosamente",
      data: staff,
    });
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ error: "Error al crear personal" });
  }
};

// POST /api/staff - Create new staff member (creates in DB first, then Auth)
export const createStaff = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validate data
    const createStaffWithPasswordSchema = z.object({
      email: z.string().email("Email inválido"),
      firstName: z.string().min(1, "Nombre es requerido"),
      lastName: z.string().min(1, "Apellido es requerido"),
      password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
      phone: z.string().optional(),
      specialty: z.string().optional(),
      licenseNumber: z.string().optional(),
      role: z
        .enum(["PROFESSIONAL", "OWNER", "RECEPTIONIST"])
        .default("PROFESSIONAL"),
    });

    const validation = createStaffWithPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.issues,
      });
    }

    const data = validation.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // 1. Create user in Supabase Auth FIRST
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: data.firstName,
        last_name: data.lastName,
      },
    });

    if (authError || !authData.user) {
      console.error("Error creating auth user:", authError);
      return res.status(500).json({ 
        error: "Error al crear usuario de autenticación",
        details: authError?.message 
      });
    }

    // 2. Check if trigger already created the user
    let staff = await prisma.user.findUnique({
      where: { authId: authData.user.id },
    });

    if (staff) {
      // Store the temporary organization ID to delete it later
      const tempOrgId = staff.organizationId;

      // Trigger created the user, update it with correct organizationId and role
      staff = await prisma.user.update({
        where: { authId: authData.user.id },
        data: {
          organizationId: dbUser.organizationId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          specialty: data.specialty,
          licenseNumber: data.licenseNumber,
          role: data.role,
          emailVerified: true,
        },
        select: {
          id: true,
          authId: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          documentType: true,
          documentNumber: true,
          specialty: true,
          licenseNumber: true,
          role: true,
          organizationId: true,
          avatarUrl: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });

      // Delete the temporary organization created by the trigger
      if (tempOrgId && tempOrgId !== dbUser.organizationId) {
        try {
          await prisma.organization.delete({
            where: { id: tempOrgId },
          });
          console.log(`🗑️ Deleted temporary organization ${tempOrgId}`);
        } catch (error) {
          console.error(`Failed to delete temporary organization ${tempOrgId}:`, error);
          // Don't fail the request if we can't delete the temp org
        }
      }
    } else {
      // Trigger didn't create user (shouldn't happen), create it manually
      staff = await prisma.user.create({
        data: {
          authId: authData.user.id,
          organizationId: dbUser.organizationId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          specialty: data.specialty,
          licenseNumber: data.licenseNumber,
          role: data.role,
          emailVerified: true,
        },
        select: {
          id: true,
          authId: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          documentType: true,
          documentNumber: true,
          specialty: true,
          licenseNumber: true,
          role: true,
          organizationId: true,
          avatarUrl: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });
    }

    // Invalidate cache
    staffCache.clear();
    clearUserCache(authData.user.id);

    res.status(201).json({
      success: true,
      message: "Personal creado exitosamente",
      data: staff,
    });
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ error: "Error al crear personal" });
  }
};

// PUT /api/staff/:id - Update staff member
export const updateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    // Validate data
    const validation = updateStaffSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.issues,
      });
    }

    const data = validation.data;

    // Check if staff exists
    const existingStaff = await prisma.user.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        role: {
          in: ["PROFESSIONAL", "OWNER"],
        },
        deletedAt: null,
      },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: "Personal no encontrado" });
    }

    // If updating email, check if it's already taken
    if (data.email && data.email !== existingStaff.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        return res.status(409).json({ error: "El email ya está registrado" });
      }
    }

    // Update staff
    const staff = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        specialty: data.specialty,
        licenseNumber: data.licenseNumber,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialty: true,
        licenseNumber: true,
        role: true,
        updatedAt: true,
      },
    });

    // Invalidate cache
    staffCache.clear();
    if (existingStaff.authId) {
      clearUserCache(existingStaff.authId); // Clear cache for the updated user
    }

    res.json({
      success: true,
      message: "Personal actualizado exitosamente",
      data: staff,
    });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ error: "Error al actualizar personal" });
  }
};

// DELETE /api/staff/:id - Deactivate staff member
export const deleteStaff = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    // Check if staff exists
    const existingStaff = await prisma.user.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        role: {
          in: ["PROFESSIONAL", "OWNER"],
        },
      },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: "Personal no encontrado" });
    }

    // Soft delete instead of deactivate
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Invalidate cache
    staffCache.clear();
    if (existingStaff.authId) {
      clearUserCache(existingStaff.authId); // Clear cache for the deleted user
    }

    res.json({
      success: true,
      message: "Personal desactivado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ error: "Error al desactivar personal" });
  }
};
