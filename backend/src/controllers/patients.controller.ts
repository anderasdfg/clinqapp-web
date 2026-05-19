import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";
import { generateTemporaryDni } from "../utils/dni";

// Validation schemas
const createPatientSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  dni: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  phone: z.string().min(9, "El teléfono debe tener al menos 9 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  referralSource: z
    .enum([
      "WEBSITE",
      "INSTAGRAM",
      "TIKTOK",
      "FACEBOOK",
      "GOOGLE",
      "WORD_OF_MOUTH",
      "OTHER",
    ])
    .optional(),
  assignedProfessionalId: z.string().uuid().optional(),
  medicalHistory: z.any().optional(),
});

const updatePatientSchema = createPatientSchema.partial();

// Simple in-memory cache for patients
const patientsCache = new Map<string, { data: any; timestamp: number }>();
const patientCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 2; // 2 minutes cache for patient data

// GET /api/patients - List all patients
export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const assignedProfessionalId = req.query.assignedProfessionalId as string;
    const referralSource = req.query.referralSource as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organizationId: dbUser.organizationId,
      deletedAt: null,
    };

    // For accent-insensitive search, we'll use a different approach
    // Store search term for later use with raw SQL
    let useRawSearch = false;
    if (search) {
      useRawSearch = true;
    }

    // Assigned professional filter
    if (assignedProfessionalId) {
      where.assignedProfessionalId = assignedProfessionalId;
    }

    // Referral source filter
    if (referralSource) {
      where.referralSource = referralSource;
    }

    // Generate cache key
    const cacheKey = `${dbUser.organizationId}:${search}:${assignedProfessionalId}:${referralSource}:${page}:${limit}`;
    const cachedEntry = patientsCache.get(cacheKey);

    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log(`🚀 Patients: Cache HIT for org ${dbUser.organizationId}`);
      return res.json(cachedEntry.data);
    }

    console.log(`🔍 Patients: Cache MISS for org ${dbUser.organizationId}`);

    let patients: any[];
    let total: number;

    // Use raw SQL with unaccent for accent-insensitive search
    if (useRawSearch && search) {
      const searchPattern = `%${search}%`;
      const orgId = dbUser.organizationId;

      // Build query parameters array
      const queryParams: any[] = [orgId, searchPattern, searchPattern, searchPattern];
      let paramIndex = 5;

      // Build additional filters for raw query
      let additionalFilters = "";
      
      if (assignedProfessionalId) {
        additionalFilters += ` AND p.assigned_professional_id = $${paramIndex}::uuid`;
        queryParams.push(assignedProfessionalId);
        paramIndex++;
      }

      if (referralSource) {
        additionalFilters += ` AND p.referral_source = $${paramIndex}`;
        queryParams.push(referralSource);
        paramIndex++;
      }

      // Add limit and offset at the end
      const limitIndex = paramIndex;
      const offsetIndex = paramIndex + 1;
      queryParams.push(limit, skip);

      // Query with unaccent for accent-insensitive search
      patients = await prisma.$queryRawUnsafe(`
        SELECT 
          p.id,
          p.first_name as "firstName",
          p.last_name as "lastName",
          p.dni,
          p.phone,
          p.email,
          p.date_of_birth as "dateOfBirth",
          p.gender,
          p.referral_source as "referralSource",
          p.created_at as "createdAt",
          p.medical_history as "medicalHistory",
          json_build_object(
            'id', u.id,
            'firstName', u.first_name,
            'lastName', u.last_name
          ) as "assignedProfessional"
        FROM patients p
        LEFT JOIN users u ON p.assigned_professional_id = u.id
        WHERE p.organization_id = $1::uuid
          AND p.deleted_at IS NULL
          AND (
            unaccent(p.first_name) ILIKE unaccent($2)
            OR unaccent(p.last_name) ILIKE unaccent($3)
            OR unaccent(p.first_name || ' ' || p.last_name) ILIKE unaccent($4)
            OR p.dni ILIKE $4
          )
          ${additionalFilters}
        ORDER BY p.created_at DESC
        LIMIT $${limitIndex} OFFSET $${offsetIndex}
      `, ...queryParams);

      // Get total count with same filters
      const countParams: any[] = [orgId, searchPattern, searchPattern, searchPattern];
      if (assignedProfessionalId) {
        countParams.push(assignedProfessionalId);
      }
      if (referralSource) {
        countParams.push(referralSource);
      }

      const countResult: any = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*)::int as count
        FROM patients p
        WHERE p.organization_id = $1::uuid
          AND p.deleted_at IS NULL
          AND (
            unaccent(p.first_name) ILIKE unaccent($2)
            OR unaccent(p.last_name) ILIKE unaccent($3)
            OR unaccent(p.first_name || ' ' || p.last_name) ILIKE unaccent($4)
            OR p.dni ILIKE $4
          )
          ${additionalFilters}
      `, ...countParams);

      total = countResult[0]?.count || 0;
    } else {
      // No search term, use regular Prisma query
      [patients, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
            phone: true,
            email: true,
            dateOfBirth: true,
            gender: true,
            referralSource: true,
            createdAt: true,
            medicalHistory: true,
            assignedProfessional: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.patient.count({ where }),
      ]);
    }

    const result = {
      success: true,
      data: patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Update cache
    patientsCache.set(cacheKey, { data: result, timestamp: Date.now() });

    res.json(result);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Error al obtener pacientes" });
  }
};

// GET /api/patients/:id - Get patient by ID
export const getPatientById = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    // Check cache first
    const cacheKey = `${dbUser.organizationId}:${id}`;
    const cachedEntry = patientCache.get(cacheKey);

    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log(`🚀 Patient: Cache HIT for patient ${id}`);
      return res.json(cachedEntry.data);
    }

    console.log(`🔍 Patient: Cache MISS for patient ${id}`);

    const patient = await prisma.patient.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dni: true,
        phone: true,
        email: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        occupation: true,
        emergencyContact: true,
        emergencyPhone: true,
        referralSource: true,
        medicalHistory: true,
        createdAt: true,
        updatedAt: true,
        assignedProfessional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            specialty: true,
          },
        },
        appointments: {
          take: 5,
          orderBy: { startTime: "desc" },
          where: { deletedAt: null },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            notes: true,
            services: {
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                    duration: true,
                  },
                },
              },
            },
            professional: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    const result = {
      success: true,
      data: patient,
    };

    // Update cache
    patientCache.set(cacheKey, { data: result, timestamp: Date.now() });

    res.json(result);
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({ error: "Error al obtener paciente" });
  }
};

// POST /api/patients - Create new patient
export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validate data
    const validation = createPatientSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.issues,
      });
    }

    const data = validation.data;

    // Generate temporary DNI if not provided
    let finalDni = data.dni;
    if (!finalDni) {
      finalDni = await generateTemporaryDni();
      console.log(`📝 Generated temporary DNI: ${finalDni}`);
    } else {
      // Check if DNI already exists (if provided)
      const existingPatient = await prisma.patient.findFirst({
        where: {
          dni: finalDni,
          deletedAt: null,
        },
      });

      if (existingPatient) {
        return res.status(400).json({
          error: "Ya existe un paciente con este DNI",
        });
      }
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        ...data,
        dni: finalDni,
        organizationId: dbUser.organizationId,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        email: data.email || null,
        referralSource: data.referralSource || undefined,
        deletedAt: null,
      },
      include: {
        assignedProfessional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Invalidate cache
    patientsCache.clear();

    res.status(201).json({
      success: true,
      message: "Paciente creado exitosamente",
      data: patient,
    });
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ error: "Error al crear paciente" });
  }
};

// PUT /api/patients/:id - Update patient
export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    // Validate data
    const validation = updatePatientSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.issues,
      });
    }

    const data = validation.data;

    // Check if patient exists and belongs to organization
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
    });

    if (!existingPatient) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    // Check if DNI already exists (if being updated)
    if (data.dni && data.dni !== existingPatient.dni) {
      const dniExists = await prisma.patient.findFirst({
        where: {
          dni: data.dni,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (dniExists) {
        return res.status(400).json({
          error: "Ya existe un paciente con este DNI",
        });
      }
    }

    // Update patient
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        email: data.email || null,
      },
      include: {
        assignedProfessional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Invalidate cache
    patientsCache.clear();
    patientCache.delete(`${dbUser.organizationId}:${id}`);

    res.json({
      success: true,
      message: "Paciente actualizado exitosamente",
      data: patient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({ error: "Error al actualizar paciente" });
  }
};

// DELETE /api/patients/:id - Soft delete patient
export const deletePatient = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    // Check if patient exists and belongs to organization
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
    });

    if (!existingPatient) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    // Soft delete
    await prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Invalidate cache
    patientsCache.clear();
    patientCache.delete(`${dbUser.organizationId}:${id}`);

    res.json({
      success: true,
      message: "Paciente eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ error: "Error al eliminar paciente" });
  }
};
