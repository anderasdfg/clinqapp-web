import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const productSaleItemSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  unitPrice: z.number().min(0, 'El precio unitario debe ser mayor o igual a 0'),
});

const createProductSaleSchema = z.object({
  patientId: z.string().uuid().optional(),
  items: z.array(productSaleItemSchema).min(1, 'Debe incluir al menos un producto'),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'YAPE', 'PLIN', 'OTHER']).optional(),
  createPayment: z.boolean().default(false),
});

// ============================================
// PRODUCT SALES
// ============================================

export const getProductSales = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { 
      patientId, 
      startDate, 
      endDate, 
      page = '1', 
      limit = '20' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {
      organizationId,
    };

    if (patientId) {
      where.patientId = patientId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [sales, total] = await Promise.all([
      prisma.productSale.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          soldBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                },
              },
            },
          },
          payment: {
            select: {
              id: true,
              method: true,
              status: true,
              receiptNumber: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limitNum,
      }),
      prisma.productSale.count({ where }),
    ]);

    res.json({
      sales,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching product sales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProductSale = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const sale = await prisma.productSale.findFirst({
      where: {
        id,
        organizationId,
      },
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
        soldBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Error fetching product sale:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createProductSale = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;
    if (!organizationId || !userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const validatedData = createProductSaleSchema.parse(req.body);

    // Validate products exist and have enough stock
    const productIds = validatedData.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        organizationId,
        deletedAt: null,
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Uno o más productos no existen o no están activos' });
    }

    // Check stock availability
    for (const item of validatedData.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ error: `Producto ${item.productId} no encontrado` });
      }
      if (product.currentStock < item.quantity) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${product.name}. Disponible: ${product.currentStock}, Solicitado: ${item.quantity}` 
        });
      }
    }

    // Calculate totals
    let subtotal = 0;
    const itemsWithSubtotal = validatedData.items.map(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;
      return {
        ...item,
        subtotal: itemSubtotal,
      };
    });

    const total = subtotal - validatedData.discount;

    if (total < 0) {
      return res.status(400).json({ error: 'El descuento no puede ser mayor al subtotal' });
    }

    // Create sale with stock updates in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the sale
      const sale = await tx.productSale.create({
        data: {
          organizationId,
          patientId: validatedData.patientId,
          soldById: userId,
          subtotal,
          discount: validatedData.discount,
          total,
          paymentMethod: validatedData.paymentMethod || 'CASH',
          notes: validatedData.notes,
        },
      });

      // Create sale items and update stock
      for (const item of itemsWithSubtotal) {
        // Create sale item
        await tx.productSaleItem.create({
          data: {
            saleId: sale.id,
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
            organizationId,
            productId: item.productId,
            performedBy: userId,
            type: 'SALE',
            quantity: item.quantity,
            previousStock,
            newStock,
            notes: `Venta #${sale.id}`,
          },
        });
      }

      // Create payment if requested
      let payment = null;
      if (validatedData.createPayment && validatedData.paymentMethod && validatedData.patientId) {
        payment = await tx.payment.create({
          data: {
            organizationId,
            patientId: validatedData.patientId,
            amount: total,
            method: validatedData.paymentMethod,
            status: 'COMPLETED',
            collectedById: userId,
            notes: `Pago por venta de productos #${sale.id}`,
          },
        });

        // Link payment to sale
        await tx.productSale.update({
          where: { id: sale.id },
          data: { paymentId: payment.id },
        });
      }

      // Return complete sale data
      return await tx.productSale.findUnique({
        where: { id: sale.id },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          soldBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                },
              },
            },
          },
          payment: true,
        },
      });
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    console.error('Error creating product sale:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    });
  }
};

export const getSalesStats = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { startDate, endDate } = req.query;

    const where: any = {
      organizationId,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [
      totalSales,
      totalRevenue,
      topProducts,
    ] = await Promise.all([
      // Total number of sales
      prisma.productSale.count({ where }),
      
      // Total revenue
      prisma.productSale.aggregate({
        where,
        _sum: {
          total: true,
        },
      }),
      
      // Top selling products
      prisma.productSaleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            organizationId,
            ...(startDate || endDate ? {
              createdAt: where.createdAt
            } : {}),
          },
        },
        _sum: {
          quantity: true,
          subtotal: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    // Get product details for top products
    const productIds = topProducts.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        unit: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const topProductsWithDetails = topProducts.map(item => ({
      ...item,
      product: products.find(p => p.id === item.productId),
    }));

    res.json({
      totalSales,
      totalRevenue: totalRevenue._sum.total || 0,
      topProducts: topProductsWithDetails,
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const exportSales = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { startDate, endDate } = req.query;

    const where: any = {
      organizationId,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const sales = await prisma.productSale.findMany({
      where,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        soldBy: {
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
        payment: {
          select: {
            method: true,
            status: true,
            receiptNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convert to CSV format
    const csvHeaders = [
      'Fecha',
      'Cliente',
      'Teléfono',
      'Productos',
      'Subtotal',
      'Descuento',
      'Total',
      'Método de Pago',
      'Vendedor',
      'Notas',
    ];

    const csvRows = sales.map(sale => [
      sale.createdAt.toISOString().split('T')[0],
      sale.patient ? `${sale.patient.firstName} ${sale.patient.lastName}` : 'Venta directa',
      sale.patient?.phone || '',
      sale.items.map(item => `${item.product.name} (${item.quantity} ${item.product.unit})`).join('; '),
      sale.subtotal.toString(),
      sale.discount.toString(),
      sale.total.toString(),
      sale.payment?.method || '',
      sale.soldBy ? `${sale.soldBy.firstName} ${sale.soldBy.lastName}` : '',
      sale.notes || '',
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ventas-productos.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting sales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
