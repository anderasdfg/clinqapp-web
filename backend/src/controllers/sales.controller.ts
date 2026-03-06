import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";

// Validation schemas
const getSalesSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  serviceId: z.string().optional(),
  search: z.string().optional(), // Search by patient name
});

// GET /api/sales - List sales with filters
export const getSales = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser?.organizationId) {
      return res.status(401).json({ error: "Organization ID not found" });
    }

    const organizationId = dbUser.organizationId;

    const validatedQuery = getSalesSchema.parse(req.query);
    const {
      page,
      limit,
      startDate,
      endDate,
      paymentMethod,
      serviceId,
      search,
    } = validatedQuery;

    // Build where clause
    const where: any = {
      organizationId,
      status: "COMPLETED", // Only completed payments
    };

    // Date filters
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateTime;
      }
    }

    // Payment method filter
    if (paymentMethod) {
      where.method = paymentMethod;
    }

    // Service filter (through appointment)
    if (serviceId) {
      where.appointment = {
        serviceId,
      };
    }

    // Patient search
    if (search) {
      where.patient = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // Get total count
    const total = await prisma.payment.count({ where });

    // Get paginated data
    const payments = await prisma.payment.findMany({
      where,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        appointment: {
          select: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate summary
    const summary = await prisma.payment.aggregate({
      where,
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Format response
    const data = payments.map((payment) => ({
      id: payment.id,
      date: payment.createdAt.toISOString(),
      appointmentId: payment.appointmentId,
      patientName: `${payment.patient.firstName} ${payment.patient.lastName}`,
      serviceName: payment.appointment?.service?.name || "N/A",
      amount: parseFloat(payment.amount.toString()),
      paymentMethod: payment.method,
      status: payment.status,
    }));

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalAmount: parseFloat(summary._sum.amount?.toString() || "0"),
        count: summary._count,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error("Error fetching sales:", error);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
};

// GET /api/sales/export - Export sales to CSV
export const exportSales = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser?.organizationId) {
      return res.status(401).json({ error: "Organization ID not found" });
    }

    const organizationId = dbUser.organizationId;

    const { startDate, endDate, paymentMethod, serviceId } = req.query;

    // Build where clause (same as getSales)
    const where: any = {
      organizationId,
      status: "COMPLETED",
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        const endDateTime = new Date(endDate as string);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateTime;
      }
    }

    if (paymentMethod) {
      where.method = paymentMethod;
    }

    if (serviceId) {
      where.appointment = {
        serviceId,
      };
    }

    // Get all matching payments
    const payments = await prisma.payment.findMany({
      where,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        appointment: {
          select: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Generate CSV
    const csvHeaders = "Fecha,Paciente,Servicio,Monto,Método de Pago,Estado\n";
    const csvRows = payments
      .map((payment) => {
        const date = new Date(payment.createdAt).toLocaleDateString("es-PE");
        const patientName = `${payment.patient.firstName} ${payment.patient.lastName}`;
        const serviceName = payment.appointment?.service?.name || "N/A";
        const amount = parseFloat(payment.amount.toString()).toFixed(2);
        const method = payment.method;
        const status = payment.status;

        return `${date},"${patientName}","${serviceName}",${amount},${method},${status}`;
      })
      .join("\n");

    const csv = csvHeaders + csvRows;

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ventas_${new Date().toISOString().split("T")[0]}.csv`,
    );

    res.send("\uFEFF" + csv); // Add BOM for Excel compatibility
  } catch (error) {
    console.error("Error exporting sales:", error);
    res.status(500).json({ error: "Error al exportar ventas" });
  }
};
