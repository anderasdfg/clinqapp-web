import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";

// Validation schemas
const createAppointmentSchema = z.object({
  patientId: z.string().uuid("ID de paciente inválido"),
  professionalId: z.string().uuid("ID de profesional inválido"),
  serviceId: z.string().uuid("ID de servicio inválido").optional(),
  startTime: z.string().datetime("Fecha y hora de inicio inválida"),
  endTime: z.string().datetime("Fecha y hora de fin inválida"),
  notes: z.string().optional(),
});

const updateAppointmentSchema = createAppointmentSchema.partial();

const updateStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
    "RESCHEDULED",
  ]),
  cancellationReason: z.string().optional(),
});

const registerPaymentSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "YAPE", "PLIN", "OTHER"]),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/appointments - List appointments with filters
export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const patientId = req.query.patientId as string;
    const professionalId = req.query.professionalId as string;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organizationId: dbUser.organizationId,
      deletedAt: null,
    };

    // Date range filter
    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.startTime = {
        gte: new Date(startDate),
      };
    }

    // Patient filter
    if (patientId) {
      where.patientId = patientId;
    }

    // Professional filter
    if (professionalId) {
      where.professionalId = professionalId;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Get appointments with pagination
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
          professional: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              basePrice: true,
            },
          },
          payment: true,
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Error al obtener citas" });
  }
};

// GET /api/appointments/:id - Get appointment by ID
export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            dateOfBirth: true,
          },
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            specialty: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            basePrice: true,
          },
        },
        payment: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Error al obtener cita" });
  }
};

// Helper function to check for overlapping appointments
const checkAvailability = async (
  organizationId: string,
  professionalId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
) => {
  const where: any = {
    organizationId,
    professionalId,
    deletedAt: null,
    status: {
      notIn: ["CANCELLED", "NO_SHOW"],
    },
    OR: [
      {
        // New appointment starts during existing appointment
        AND: [
          { startTime: { lte: startTime } },
          { endTime: { gt: startTime } },
        ],
      },
      {
        // New appointment ends during existing appointment
        AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
      },
      {
        // New appointment completely contains existing appointment
        AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
      },
    ],
  };

  if (excludeAppointmentId) {
    where.id = { not: excludeAppointmentId };
  }

  const overlapping = await prisma.appointment.findFirst({ where });

  return overlapping === null;
};

// POST /api/appointments - Create new appointment
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validate data
    const validation = createAppointmentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.issues,
      });
    }

    const data = validation.data;
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    // Validate time range
    if (endTime <= startTime) {
      return res.status(400).json({
        error: "La hora de fin debe ser posterior a la hora de inicio",
      });
    }

    // Check availability
    const isAvailable = await checkAvailability(
      dbUser.organizationId,
      data.professionalId,
      startTime,
      endTime
    );

    if (!isAvailable) {
      return res.status(409).json({
        error: "El profesional ya tiene una cita en ese horario",
      });
    }

    // Verify patient exists and belongs to organization
    const patient = await prisma.patient.findFirst({
      where: {
        id: data.patientId,
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
    });

    if (!patient) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    // Verify professional exists and belongs to organization
    const professional = await prisma.user.findFirst({
      where: {
        id: data.professionalId,
        organizationId: dbUser.organizationId,
      },
    });

    if (!professional) {
      return res.status(404).json({ error: "Profesional no encontrado" });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        organizationId: dbUser.organizationId,
        patientId: data.patientId,
        professionalId: data.professionalId,
        serviceId: data.serviceId,
        startTime,
        endTime,
        notes: data.notes,
        status: "PENDING",
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Cita creada exitosamente",
      data: appointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Error al crear cita" });
  }
};

// PUT /api/appointments/:id - Update appointment
export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    // Validate data
    const validation = updateAppointmentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.issues,
      });
    }

    const data = validation.data;

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    // If updating time, check availability
    if (data.startTime || data.endTime) {
      const startTime = data.startTime
        ? new Date(data.startTime)
        : existingAppointment.startTime;
      const endTime = data.endTime
        ? new Date(data.endTime)
        : existingAppointment.endTime;
      const professionalId =
        data.professionalId || existingAppointment.professionalId;

      if (endTime <= startTime) {
        return res.status(400).json({
          error: "La hora de fin debe ser posterior a la hora de inicio",
        });
      }

      const isAvailable = await checkAvailability(
        dbUser.organizationId,
        professionalId,
        startTime,
        endTime,
        id
      );

      if (!isAvailable) {
        return res.status(409).json({
          error: "El profesional ya tiene una cita en ese horario",
        });
      }
    }

    // Update appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Cita actualizada exitosamente",
      data: appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Error al actualizar cita" });
  }
};

// PATCH /api/appointments/:id/status - Update appointment status
export const updateAppointmentStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    // Validate data
    const validation = updateStatusSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.issues,
      });
    }

    const { status, cancellationReason } = validation.data;

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    // Update status
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        cancellationReason: status === "CANCELLED" ? cancellationReason : null,
      },
    });

    res.json({
      success: true,
      message: "Estado de cita actualizado exitosamente",
      data: appointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ error: "Error al actualizar estado de cita" });
  }
};

// DELETE /api/appointments/:id - Soft delete appointment
export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    // Soft delete
    await prisma.appointment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({
      success: true,
      message: "Cita eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Error al eliminar cita" });
  }
};

// GET /api/appointments/availability - Check availability for a time slot
export const checkAppointmentAvailability = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const { professionalId, startTime, endTime, excludeId } = req.query;

    if (!professionalId || !startTime || !endTime) {
      return res.status(400).json({
        error: "Se requieren professionalId, startTime y endTime",
      });
    }

    const isAvailable = await checkAvailability(
      dbUser.organizationId,
      professionalId as string,
      new Date(startTime as string),
      new Date(endTime as string),
      excludeId as string | undefined
    );

    res.json({
      success: true,
      available: isAvailable,
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ error: "Error al verificar disponibilidad" });
  }
};

// POST /api/appointments/:id/payment - Register payment for appointment
export const registerPayment = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    // Validate data
    const validation = registerPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.issues,
      });
    }

    const { amount, method, receiptNumber, notes } = validation.data;

    // Check if appointment exists
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
      include: {
        payment: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    // Check if payment already exists
    if (appointment.payment) {
      return res
        .status(400)
        .json({ error: "Esta cita ya tiene un pago registrado" });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        organizationId: dbUser.organizationId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        amount,
        method,
        status: "COMPLETED",
        receiptNumber,
        notes,
        collectedById: dbUser.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Pago registrado exitosamente",
      data: payment,
    });
  } catch (error) {
    console.error("Error registering payment:", error);
    res.status(500).json({ error: "Error al registrar pago" });
  }
};
