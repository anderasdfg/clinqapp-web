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
  type: z.enum(["SERVICE", "PRODUCT", "ALL"]).optional().default("ALL"), // Filter by sale type
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
      type,
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

    // Fetch service sales (payments with appointments)
    let serviceSales: any[] = [];
    let serviceSummary = { totalAmount: 0, count: 0 };
    
    if (type === "SERVICE" || type === "ALL") {
      const serviceWhere = { ...where, appointmentId: { not: null } };
      
      const [payments, summary] = await Promise.all([
        prisma.payment.findMany({
          where: serviceWhere,
          include: {
            patient: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            appointment: {
              select: {
                id: true,
                services: {
                  include: {
                    service: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
                notes: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.payment.aggregate({
          where: serviceWhere,
          _sum: {
            amount: true,
          },
          _count: true,
        }),
      ]);

      serviceSales = payments.map((payment) => ({
        id: payment.id,
        type: "SERVICE" as const,
        date: payment.createdAt.toISOString(),
        patientName: `${payment.patient.firstName} ${payment.patient.lastName}`,
        description: payment.appointment?.services?.map(s => s.service.name).join(", ") || "N/A",
        items: payment.appointment?.services?.map(s => ({
          name: s.service.name,
          quantity: 1,
          unitPrice: parseFloat(s.price.toString()),
          subtotal: parseFloat(s.price.toString()),
        })) || [],
        amount: parseFloat(payment.amount.toString()),
        paymentMethod: payment.method,
        status: payment.status,
        notes: payment.notes || payment.appointment?.notes,
        receiptNumber: payment.receiptNumber,
      }));

      serviceSummary = {
        totalAmount: parseFloat(summary._sum.amount?.toString() || "0"),
        count: summary._count,
      };
    }

    // Fetch product sales
    let productSales: any[] = [];
    let productSummary = { totalAmount: 0, count: 0 };
    
    if (type === "PRODUCT" || type === "ALL") {
      const productWhere: any = {
        organizationId,
      };

      // Date filters
      if (startDate || endDate) {
        productWhere.createdAt = {};
        if (startDate) {
          productWhere.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          productWhere.createdAt.lte = endDateTime;
        }
      }

      // Payment method filter
      if (paymentMethod) {
        productWhere.paymentMethod = paymentMethod;
      }

      // Patient search
      if (search) {
        productWhere.patient = {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        };
      }

      const [sales, summary] = await Promise.all([
        prisma.productSale.findMany({
          where: productWhere,
          include: {
            patient: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    unit: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.productSale.aggregate({
          where: productWhere,
          _sum: {
            total: true,
          },
          _count: true,
        }),
      ]);

      productSales = sales.map((sale) => ({
        id: sale.id,
        type: "PRODUCT" as const,
        date: sale.createdAt.toISOString(),
        patientName: sale.patient ? `${sale.patient.firstName} ${sale.patient.lastName}` : "Venta directa",
        description: sale.items.map(i => `${i.product.name} (${i.quantity})`).join(", "),
        items: sale.items.map(i => ({
          name: i.product.name,
          quantity: i.quantity,
          unitPrice: parseFloat(i.unitPrice.toString()),
          subtotal: parseFloat(i.subtotal.toString()),
          unit: i.product.unit,
        })),
        amount: parseFloat(sale.total.toString()),
        subtotal: parseFloat(sale.subtotal.toString()),
        discount: parseFloat(sale.discount.toString()),
        paymentMethod: sale.paymentMethod,
        status: "COMPLETED",
        notes: sale.notes,
      }));

      productSummary = {
        totalAmount: parseFloat(summary._sum.total?.toString() || "0"),
        count: summary._count,
      };
    }

    // Combine and sort all sales by date
    const allSales = [...serviceSales, ...productSales].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Paginate combined results
    const total = allSales.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = allSales.slice(startIndex, endIndex);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalAmount: serviceSummary.totalAmount + productSummary.totalAmount,
        count: serviceSummary.count + productSummary.count,
        serviceAmount: serviceSummary.totalAmount,
        serviceCount: serviceSummary.count,
        productAmount: productSummary.totalAmount,
        productCount: productSummary.count,
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
            services: {
              include: {
                service: {
                  select: {
                    name: true,
                  },
                },
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
        const serviceName = payment.appointment?.services?.[0]?.service?.name || "N/A";
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
