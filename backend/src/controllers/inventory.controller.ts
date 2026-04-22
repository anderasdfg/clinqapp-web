import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const updateCategorySchema = createCategorySchema.partial();

const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  costPrice: z.number().min(0, 'El precio de compra debe ser mayor o igual a 0'),
  salePrice: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
  currentStock: z.number().int().min(0, 'El stock debe ser mayor o igual a 0').default(0),
  minStock: z.number().int().min(0, 'El stock mínimo debe ser mayor o igual a 0').default(5),
  unit: z.string().default('unidad'),
  isActive: z.boolean().default(true),
});

const updateProductSchema = createProductSchema.partial();

const stockAdjustmentSchema = z.object({
  quantity: z.number().int(),
  notes: z.string().min(1, 'La razón es requerida'),
  type: z.enum(['PURCHASE', 'ADJUSTMENT', 'RETURN']),
});

// ============================================
// PRODUCT CATEGORIES
// ============================================

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const categories = await prisma.productCategory.findMany({
      where: {
        organizationId,
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                deletedAt: null,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const validatedData = createCategorySchema.parse(req.body);

    const category = await prisma.productCategory.create({
      data: {
        ...validatedData,
        organizationId,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const validatedData = updateCategorySchema.parse(req.body);

    const category = await prisma.productCategory.update({
      where: {
        id,
        organizationId,
      },
      data: validatedData,
    });

    res.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Check if category has products
    const productsCount = await prisma.product.count({
      where: {
        categoryId: id,
        deletedAt: null,
      },
    });

    if (productsCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la categoría porque tiene productos asociados' 
      });
    }

    await prisma.productCategory.delete({
      where: {
        id,
        organizationId,
      },
    });

    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// PRODUCTS
// ============================================

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { categoryId, lowStock, search, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
        { barcode: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Note: lowStock filter is handled after fetching due to Prisma limitations
    // We filter in-memory instead of at database level

    let [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          name: 'asc',
        },
        skip: offset,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    // Apply lowStock filter in-memory if needed
    if (lowStock === 'true') {
      products = products.filter(p => p.currentStock <= p.minStock);
    }

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;
    if (!organizationId || !userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const validatedData = createProductSchema.parse(req.body);

    // Create product and initial stock movement in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...validatedData,
          organizationId,
        },
        include: {
          category: true,
        },
      });

      // Create initial stock movement if currentStock > 0
      if (validatedData.currentStock > 0) {
        await tx.inventoryMovement.create({
          data: {
            organizationId,
            productId: product.id,
            performedBy: userId,
            type: 'PURCHASE',
            quantity: validatedData.currentStock,
            previousStock: 0,
            newStock: validatedData.currentStock,
            notes: 'Stock inicial',
          },
        });
      }

      return product;
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const validatedData = updateProductSchema.parse(req.body);

    const product = await prisma.product.update({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: validatedData,
      include: {
        category: true,
      },
    });

    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const product = await prisma.product.update({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// STOCK MANAGEMENT
// ============================================

export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;
    if (!organizationId || !userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const validatedData = stockAdjustmentSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      // Get current product
      const product = await tx.product.findFirst({
        where: {
          id,
          organizationId,
          deletedAt: null,
        },
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const previousStock = product.currentStock;
      const newStock = previousStock + validatedData.quantity;

      if (newStock < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          currentStock: newStock,
        },
        include: {
          category: true,
        },
      });

      // Create movement record
      await tx.inventoryMovement.create({
        data: {
          organizationId,
          productId: id,
          performedBy: userId,
          type: validatedData.type,
          quantity: Math.abs(validatedData.quantity),
          previousStock,
          newStock,
          notes: validatedData.notes,
        },
      });

      return updatedProduct;
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    console.error('Error adjusting stock:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno del servidor' });
  }
};

export const getProductMovements = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const [movements, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where: {
          productId: id,
          organizationId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limitNum,
      }),
      prisma.inventoryMovement.count({
        where: {
          productId: id,
          organizationId,
        },
      }),
    ]);

    res.json({
      movements,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching product movements:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getLowStockProducts = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const products = await prisma.product.findMany({
      where: {
        organizationId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        currentStock: 'asc',
      },
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
