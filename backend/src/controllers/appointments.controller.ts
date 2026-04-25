import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Validation schemas
const createAppointmentSchema = z.object({
  patientId: z.string().uuid("ID de paciente inválido"),
  professionalId: z.string().uuid("ID de profesional inválido"),
  serviceIds: z.array(z.string().uuid("ID de servicio inválido")).min(1, "Debe seleccionar al menos un servicio"),
  startTime: z.string().datetime("Fecha y hora de inicio inválida"),
  endTime: z.string().datetime("Fecha y hora de fin inválida"),
  notes: z.string().optional(),
  clinicalNotes: z.string().optional(),
  images: z.array(z.string().url("URL de imagen inválida")).optional(),
  sessionNumber: z.number().int().positive("El número de sesión debe ser positivo").optional(),
});

const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
      "RESCHEDULED",
    ])
    .optional(),
});

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

const productItemSchema = z.object({
  productId: z.string().uuid("ID de producto inválido"),
  quantity: z.number().int().min(1, "La cantidad debe ser mayor a 0"),
  unitPrice: z.number().min(0, "El precio unitario debe ser mayor o igual a 0"),
});

const registerPaymentSchema = z.object({
  amount: z.number().min(0, "El monto no puede ser negativo"),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "YAPE", "PLIN", "OTHER"]),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
  products: z.array(productItemSchema).optional(),
});

// Simple in-memory cache for appointments
const appointmentsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 5; // 5 seconds cache for agenda data
const invalidateCache = (organizationId: string) => {
  const keysContext = Array.from(appointmentsCache.keys());
  for (const key of keysContext) {
    if (key.startsWith(`${organizationId}:`)) {
      appointmentsCache.delete(key);
    }
  }
};

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
    if (
      startDate &&
      endDate &&
      !isNaN(new Date(startDate).getTime()) &&
      !isNaN(new Date(endDate).getTime())
    ) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate && !isNaN(new Date(startDate).getTime())) {
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

    // Generate cache key
    const cacheKey = `${dbUser.organizationId}:${startDate}:${endDate}:${patientId}:${professionalId}:${status}:${page}:${limit}`;
    const cachedEntry = appointmentsCache.get(cacheKey);

    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log(
        `🚀 Appointments: Cache HIT for org ${dbUser.organizationId}`,
      );
      return res.json(cachedEntry.data);
    }

    console.log(`🔍 Appointments: Cache MISS for org ${dbUser.organizationId}`);

    // Get appointments with pagination
    // Optimization: Skip count if we're filtering by date range (agenda view)
    const isAgendaView = !!(startDate && endDate);

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,
          notes: true,
          clinicalNotes: true,
          images: true,
          sessionNumber: true,
          patientId: true,
          professionalId: true,
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
              specialty: true,
            },
          },
          services: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
          payment: {
            select: {
              id: true,
              status: true,
              amount: true,
            },
          },
        },
        orderBy: { startTime: "asc" },
      }),
      isAgendaView ? Promise.resolve(0) : prisma.appointment.count({ where }),
    ]);

    const result = {
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        total: isAgendaView ? appointments.length : total,
        totalPages: isAgendaView ? 1 : Math.ceil(total / limit),
      },
    };

    // Update cache
    appointmentsCache.set(cacheKey, { data: result, timestamp: Date.now() });

    res.json(result);
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
          include: {
            appointments: {
              take: 10,
              orderBy: { startTime: "desc" },
              include: {
                services: {
                  include: {
                    service: {
                      select: {
                        id: true,
                        name: true,
                        category: true,
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
                payment: true,
              },
            },
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
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
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
  excludeAppointmentId?: string,
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

  const overlapping = await prisma.appointment.findFirst({
    where,
    select: { id: true }, // Only need to know if it exists
  });

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
      endTime,
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
      console.error(`❌ Patient not found: ${data.patientId} for org: ${dbUser.organizationId}`);
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

    // Fetch services to get prices and durations
    const services = await prisma.service.findMany({
      where: {
        id: { in: data.serviceIds },
        organizationId: dbUser.organizationId,
        deletedAt: null,
        isActive: true,
      },
    });

    if (services.length !== data.serviceIds.length) {
      return res.status(404).json({ error: "Uno o más servicios no encontrados" });
    }

    // Create appointment with services
    const appointment = await prisma.appointment.create({
      data: {
        organizationId: dbUser.organizationId,
        patientId: data.patientId,
        professionalId: data.professionalId,
        startTime,
        endTime,
        notes: data.notes,
        sessionNumber: data.sessionNumber,
        status: "PENDING",
        services: {
          create: services.map(service => ({
            serviceId: service.id,
            price: service.basePrice,
            duration: service.duration,
          })),
        },
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
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    // Invalidate cache
    invalidateCache(dbUser.organizationId);

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
        id,
      );

      if (!isAvailable) {
        return res.status(409).json({
          error: "El profesional ya tiene una cita en ese horario",
        });
      }
    }

    // Update appointment
    console.log(`🔍 [PUT] Update ID: ${id} | Org: ${dbUser.organizationId}`);

    // Prepare update data - exclude serviceIds as it needs special handling
    const { serviceIds, ...restData } = data;
    
    const updateData: any = {
      ...restData,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
    };

    // Handle services update if provided
    if (serviceIds && serviceIds.length > 0) {
      // Fetch services to get prices and durations
      const services = await prisma.service.findMany({
        where: {
          id: { in: serviceIds },
          organizationId: dbUser.organizationId,
          deletedAt: null,
          isActive: true,
        },
      });

      if (services.length !== serviceIds.length) {
        return res.status(404).json({ error: "Uno o más servicios no encontrados" });
      }

      // Delete existing services and create new ones
      updateData.services = {
        deleteMany: {},
        create: services.map(service => ({
          serviceId: service.id,
          price: service.basePrice,
          duration: service.duration,
        })),
      };
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
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
            specialty: true,
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                duration: true,
                basePrice: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
      },
    });

    console.log(`✅ [PUT] DB Response Status: ${appointment.status}`);

    // Invalidate cache
    invalidateCache(dbUser.organizationId);

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
  res: Response,
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
    console.log(`🔍 [PATCH] Status update for ${id} to ${status}`);
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        cancellationReason: status === "CANCELLED" ? cancellationReason : null,
      },
      include: {
        // ... same includes as above
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
            specialty: true,
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                duration: true,
                basePrice: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
      },
    });

    console.log(
      `✅ [PATCH] Update success. Status in DB now: ${appointment.status}`,
    );

    // Invalidate cache
    invalidateCache(dbUser.organizationId);

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

    // Invalidate cache
    invalidateCache(dbUser.organizationId);

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
  res: Response,
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
      excludeId as string | undefined,
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

    const { amount, method, receiptNumber, notes, products } = validation.data;

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

    // If products are included, validate stock
    if (products && products.length > 0) {
      const productIds = products.map(p => p.productId);
      const dbProducts = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          organizationId: dbUser.organizationId,
          deletedAt: null,
          isActive: true,
        },
      });

      if (dbProducts.length !== productIds.length) {
        return res.status(400).json({ error: "Uno o más productos no existen o no están activos" });
      }

      // Check stock availability
      for (const item of products) {
        const product = dbProducts.find(p => p.id === item.productId);
        if (!product) {
          return res.status(400).json({ error: `Producto ${item.productId} no encontrado` });
        }
        if (product.currentStock < item.quantity) {
          return res.status(400).json({ 
            error: `Stock insuficiente para ${product.name}. Disponible: ${product.currentStock}, Solicitado: ${item.quantity}` 
          });
        }
      }
    }

    // Use transaction to create payment and optionally product sale
    const result = await prisma.$transaction(async (tx) => {
      // Create payment for appointment
      const payment = await tx.payment.create({
        data: {
          organizationId: dbUser.organizationId,
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          amount,
          method,
          status: "COMPLETED",
          receiptNumber: receiptNumber || null,
          notes,
          collectedById: dbUser.id,
        },
      });

      // If products are included, create product sale
      if (products && products.length > 0) {
        // Calculate product sale totals
        let productSubtotal = 0;
        const itemsWithSubtotal = products.map(item => {
          const itemSubtotal = item.quantity * item.unitPrice;
          productSubtotal += itemSubtotal;
          return {
            ...item,
            subtotal: itemSubtotal,
          };
        });

        // Create product sale
        const productSale = await tx.productSale.create({
          data: {
            organizationId: dbUser.organizationId,
            patientId: appointment.patientId,
            soldById: dbUser.id,
            subtotal: productSubtotal,
            discount: 0,
            total: productSubtotal,
            paymentMethod: method,
            notes: `Venta de productos en cita #${appointment.id}`,
            paymentId: payment.id,
          },
        });

        // Create sale items and update stock
        for (const item of itemsWithSubtotal) {
          // Create sale item
          await tx.productSaleItem.create({
            data: {
              saleId: productSale.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            },
          });

          // Get current product for stock update
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Producto ${item.productId} no encontrado`);
          }

          const previousStock = product.currentStock;
          const newStock = previousStock - item.quantity;

          // Update product stock
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: newStock },
          });

          // Create inventory movement
          await tx.inventoryMovement.create({
            data: {
              organizationId: dbUser.organizationId,
              productId: item.productId,
              performedBy: dbUser.id,
              type: 'SALE',
              quantity: item.quantity,
              previousStock,
              newStock,
              notes: `Venta en cita #${appointment.id}`,
            },
          });
        }
      }

      return payment;
    });

    // Invalidate cache
    invalidateCache(dbUser.organizationId);

    res.status(201).json({
      success: true,
      message: products && products.length > 0 
        ? `Pago registrado exitosamente con ${products.length} producto(s)` 
        : "Pago registrado exitosamente",
      data: result,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res
          .status(409)
          .json({ error: "El número de recibo ya existe en otro pago" });
      }
    }
    console.error("Error registering payment:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Error al registrar pago" 
    });
  }
};
