import { Response } from "express";
import { Prisma } from "@prisma/client";
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
  professionalId: z.string().optional(), // Filter by professional
});

const paymentInclude = {
  patient: {
    select: {
      firstName: true,
      lastName: true,
    },
  },
  appointment: {
    select: {
      id: true,
      professionalId: true,
      professional: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
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
} as const;

const productSaleInclude = {
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
} as const;

function mapServiceSale(payment: any) {
  return {
    id: payment.id,
    type: "SERVICE" as const,
    date: payment.createdAt.toISOString(),
    patientName: `${payment.patient.firstName} ${payment.patient.lastName}`,
    professionalId: payment.appointment?.professionalId,
    professionalName: payment.appointment?.professional
      ? `${payment.appointment.professional.firstName} ${payment.appointment.professional.lastName}`
      : undefined,
    description:
      payment.appointment?.services?.map((s: any) => s.service.name).join(", ") ||
      "N/A",
    items:
      payment.appointment?.services?.map((s: any) => ({
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
  };
}

function mapProductSale(sale: any) {
  return {
    id: sale.id,
    type: "PRODUCT" as const,
    date: sale.createdAt.toISOString(),
    patientName: sale.patient
      ? `${sale.patient.firstName} ${sale.patient.lastName}`
      : "Venta directa",
    description: sale.items
      .map((i: any) => `${i.product.name} (${i.quantity})`)
      .join(", "),
    items: sale.items.map((i: any) => ({
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
  };
}

function buildServiceWhere(params: {
  organizationId: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  serviceId?: string;
  search?: string;
  professionalId?: string;
}) {
  const {
    organizationId,
    startDate,
    endDate,
    paymentMethod,
    serviceId,
    search,
    professionalId,
  } = params;

  const where: any = {
    organizationId,
    status: "COMPLETED",
    appointmentId: { not: null },
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDateTime;
    }
  }

  if (paymentMethod) where.method = paymentMethod;

  if (search) {
    where.patient = {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const appointmentFilter: any = {};
  if (serviceId) {
    appointmentFilter.services = { some: { serviceId } };
  }
  if (professionalId === "UNASSIGNED") {
    appointmentFilter.professionalId = null;
  } else if (professionalId) {
    appointmentFilter.professionalId = professionalId;
  }
  if (Object.keys(appointmentFilter).length > 0) {
    where.appointment = { is: appointmentFilter };
  }

  return where;
}

function buildProductWhere(params: {
  organizationId: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  search?: string;
}) {
  const { organizationId, startDate, endDate, paymentMethod, search } = params;
  const where: any = { organizationId };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDateTime;
    }
  }

  if (paymentMethod) where.paymentMethod = paymentMethod;

  if (search) {
    where.patient = {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  return where;
}

/**
 * Paginated id list for combined SERVICE+PRODUCT feed (SQL LIMIT/OFFSET).
 * Hydration still happens via Prisma findMany by id.
 */
async function fetchCombinedSalePageIds(params: {
  organizationId: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  serviceId?: string;
  search?: string;
  skip: number;
  limit: number;
}): Promise<Array<{ id: string; sale_type: "SERVICE" | "PRODUCT" }>> {
  const {
    organizationId,
    startDate,
    endDate,
    paymentMethod,
    serviceId,
    search,
    skip,
    limit,
  } = params;

  const serviceConds: Prisma.Sql[] = [
    Prisma.sql`p.organization_id = ${organizationId}::uuid`,
    Prisma.sql`p.status = 'COMPLETED'`,
    Prisma.sql`p.appointment_id IS NOT NULL`,
  ];
  const productConds: Prisma.Sql[] = [
    Prisma.sql`ps.organization_id = ${organizationId}::uuid`,
  ];

  if (startDate) {
    const d = new Date(startDate);
    serviceConds.push(Prisma.sql`p.created_at >= ${d}`);
    productConds.push(Prisma.sql`ps.created_at >= ${d}`);
  }
  if (endDate) {
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);
    serviceConds.push(Prisma.sql`p.created_at <= ${endDateTime}`);
    productConds.push(Prisma.sql`ps.created_at <= ${endDateTime}`);
  }
  if (paymentMethod) {
    serviceConds.push(Prisma.sql`p.method = ${paymentMethod}::"PaymentMethod"`);
    productConds.push(
      Prisma.sql`ps.payment_method = ${paymentMethod}::"PaymentMethod"`,
    );
  }
  if (search) {
    const pattern = `%${search}%`;
    serviceConds.push(Prisma.sql`EXISTS (
      SELECT 1 FROM patients pt
      WHERE pt.id = p.patient_id
        AND (pt.first_name ILIKE ${pattern} OR pt.last_name ILIKE ${pattern})
    )`);
    productConds.push(Prisma.sql`(
      ps.patient_id IS NULL OR EXISTS (
        SELECT 1 FROM patients pt
        WHERE pt.id = ps.patient_id
          AND (pt.first_name ILIKE ${pattern} OR pt.last_name ILIKE ${pattern})
      )
    )`);
  }
  if (serviceId) {
    serviceConds.push(Prisma.sql`EXISTS (
      SELECT 1 FROM appointment_services aps
      WHERE aps.appointment_id = p.appointment_id
        AND aps.service_id = ${serviceId}::uuid
    )`);
  }

  return prisma.$queryRaw<Array<{ id: string; sale_type: "SERVICE" | "PRODUCT" }>>(
    Prisma.sql`
      SELECT id, sale_type FROM (
        SELECT p.id, 'SERVICE'::text AS sale_type, p.created_at
        FROM payments p
        WHERE ${Prisma.join(serviceConds, " AND ")}
        UNION ALL
        SELECT ps.id, 'PRODUCT'::text AS sale_type, ps.created_at
        FROM product_sales ps
        WHERE ${Prisma.join(productConds, " AND ")}
      ) sales
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${skip}
    `,
  );
}

// GET /api/sales - List sales with filters (SQL / Prisma skip+take pagination)
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
      professionalId,
    } = validatedQuery;

    const skip = (page - 1) * limit;
    // Products have no professional — professional filter forces SERVICE-only (same as before)
    const includeProducts =
      (type === "PRODUCT" || type === "ALL") && !professionalId;
    const includeServices = type === "SERVICE" || type === "ALL";

    const serviceWhere = buildServiceWhere({
      organizationId,
      startDate,
      endDate,
      paymentMethod,
      serviceId,
      search,
      professionalId,
    });
    const productWhere = buildProductWhere({
      organizationId,
      startDate,
      endDate,
      paymentMethod,
      search,
    });

    let serviceSummary = { totalAmount: 0, count: 0 };
    let productSummary = { totalAmount: 0, count: 0 };
    let data: any[] = [];

    const summaryPromises: Promise<void>[] = [];

    if (includeServices) {
      summaryPromises.push(
        prisma.payment
          .aggregate({
            where: serviceWhere,
            _sum: { amount: true },
            _count: true,
          })
          .then((summary) => {
            serviceSummary = {
              totalAmount: parseFloat(summary._sum.amount?.toString() || "0"),
              count: summary._count,
            };
          }),
      );
    }

    if (includeProducts) {
      summaryPromises.push(
        prisma.productSale
          .aggregate({
            where: productWhere,
            _sum: { total: true },
            _count: true,
          })
          .then((summary) => {
            productSummary = {
              totalAmount: parseFloat(summary._sum.total?.toString() || "0"),
              count: summary._count,
            };
          }),
      );
    }

    await Promise.all(summaryPromises);

    if (includeServices && !includeProducts) {
      const payments = await prisma.payment.findMany({
        where: serviceWhere,
        include: paymentInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });
      data = payments.map(mapServiceSale);
    } else if (includeProducts && !includeServices) {
      const sales = await prisma.productSale.findMany({
        where: productWhere,
        include: productSaleInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });
      data = sales.map(mapProductSale);
    } else if (includeServices && includeProducts) {
      const pageIds = await fetchCombinedSalePageIds({
        organizationId,
        startDate,
        endDate,
        paymentMethod,
        serviceId,
        search,
        skip,
        limit,
      });

      const serviceIds = pageIds
        .filter((r) => r.sale_type === "SERVICE")
        .map((r) => r.id);
      const productIds = pageIds
        .filter((r) => r.sale_type === "PRODUCT")
        .map((r) => r.id);

      const [payments, productSales] = await Promise.all([
        serviceIds.length
          ? prisma.payment.findMany({
              where: { id: { in: serviceIds } },
              include: paymentInclude,
            })
          : Promise.resolve([]),
        productIds.length
          ? prisma.productSale.findMany({
              where: { id: { in: productIds } },
              include: productSaleInclude,
            })
          : Promise.resolve([]),
      ]);

      const byId = new Map<string, any>();
      for (const p of payments) byId.set(p.id, mapServiceSale(p));
      for (const s of productSales) byId.set(s.id, mapProductSale(s));

      data = pageIds.map((row) => byId.get(row.id)).filter(Boolean);
    }

    const total = serviceSummary.count + productSummary.count;

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
        count: total,
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
