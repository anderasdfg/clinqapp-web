import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

// Validation schemas
const createPatientSchema = z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    dni: z.string().optional(),
    phone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    occupation: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    referralSource: z.enum(['WEBSITE', 'INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'GOOGLE', 'WORD_OF_MOUTH', 'OTHER']).optional(),
    assignedProfessionalId: z.string().uuid().optional(),
});

const updatePatientSchema = createPatientSchema.partial();

// GET /api/patients - List all patients
export const getPatients = async (req: AuthRequest, res: Response) => {
    try {
        const dbUser = req.dbUser;

        if (!dbUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
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

        // Search filter
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { dni: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Assigned professional filter
        if (assignedProfessionalId) {
            where.assignedProfessionalId = assignedProfessionalId;
        }

        // Referral source filter
        if (referralSource) {
            where.referralSource = referralSource;
        }

        // Get patients with pagination
        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where,
                skip,
                take: limit,
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
                orderBy: { createdAt: 'desc' },
            }),
            prisma.patient.count({ where }),
        ]);

        res.json({
            success: true,
            data: patients,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Error al obtener pacientes' });
    }
};

// GET /api/patients/:id - Get patient by ID
export const getPatientById = async (req: AuthRequest, res: Response) => {
    try {
        const dbUser = req.dbUser;

        if (!dbUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const { id } = req.params;

        const patient = await prisma.patient.findFirst({
            where: {
                id,
                organizationId: dbUser.organizationId,
                deletedAt: null,
            },
            include: {
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
                    orderBy: { startTime: 'desc' },
                    include: {
                        service: true,
                        professional: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        res.json({
            success: true,
            data: patient,
        });
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ error: 'Error al obtener paciente' });
    }
};

// POST /api/patients - Create new patient
export const createPatient = async (req: AuthRequest, res: Response) => {
    try {
        const dbUser = req.dbUser;

        if (!dbUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Validate data
        const validation = createPatientSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Datos inválidos',
                details: validation.error.issues,
            });
        }

        const data = validation.data;

        // Check if DNI already exists (if provided)
        if (data.dni) {
            const existingPatient = await prisma.patient.findFirst({
                where: {
                    dni: data.dni,
                    deletedAt: null,
                },
            });

            if (existingPatient) {
                return res.status(400).json({
                    error: 'Ya existe un paciente con este DNI',
                });
            }
        }

        // Create patient
        const patient = await prisma.patient.create({
            data: {
                ...data,
                organizationId: dbUser.organizationId,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                email: data.email || null,
                referralSource: data.referralSource || 'OTHER',
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

        res.status(201).json({
            success: true,
            message: 'Paciente creado exitosamente',
            data: patient,
        });
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({ error: 'Error al crear paciente' });
    }
};

// PUT /api/patients/:id - Update patient
export const updatePatient = async (req: AuthRequest, res: Response) => {
    try {
        const dbUser = req.dbUser;

        if (!dbUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const { id } = req.params;

        // Validate data
        const validation = updatePatientSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Datos inválidos',
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
            return res.status(404).json({ error: 'Paciente no encontrado' });
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
                    error: 'Ya existe un paciente con este DNI',
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

        res.json({
            success: true,
            message: 'Paciente actualizado exitosamente',
            data: patient,
        });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ error: 'Error al actualizar paciente' });
    }
};

// DELETE /api/patients/:id - Soft delete patient
export const deletePatient = async (req: AuthRequest, res: Response) => {
    try {
        const dbUser = req.dbUser;

        if (!dbUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const { id } = req.params;

        // Check if patient exists and belongs to organization
        const existingPatient = await prisma.patient.findFirst({
            where: {
                id,
                organizationId: dbUser.organizationId,
                deletedAt: null,
            },
        });

        if (!existingPatient) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        // Soft delete
        await prisma.patient.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        res.json({
            success: true,
            message: 'Paciente eliminado exitosamente',
        });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ error: 'Error al eliminar paciente' });
    }
};
