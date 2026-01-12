import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";

// Validation schemas
const createServiceSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  description: z.string().optional(),
  duration: z.number().int().positive("Duración debe ser mayor a 0"),
  basePrice: z.number().positive("Precio debe ser mayor a 0"),
  category: z.enum(["DIAGNOSTIC", "TREATMENT", "FOLLOWUP", "OTHER"]).optional(),
  isActive: z.boolean().default(true),
});

const updateServiceSchema = createServiceSchema.partial();

// GET /api/services - List all services
export const getServices = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const isActive = req.query.isActive as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organizationId: dbUser.organizationId,
      deletedAt: null,
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Active filter
    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    // Get services with pagination
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          duration: true,
          basePrice: true,
          category: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.service.count({ where }),
    ]);

    res.json({
      success: true,
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Error al obtener servicios" });
  }
};

// GET /api/services/:id - Get service by ID
export const getServiceById = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    const service = await prisma.service.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ error: "Error al obtener servicio" });
  }
};

// POST /api/services - Create new service
export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validate data
    const validation = createServiceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.issues,
      });
    }

    const data = validation.data;

    // Create service
    const service = await prisma.service.create({
      data: {
        organizationId: dbUser.organizationId,
        name: data.name,
        description: data.description,
        duration: data.duration,
        basePrice: data.basePrice,
        category: data.category,
        isActive: data.isActive,
      },
    });

    res.status(201).json({
      success: true,
      message: "Servicio creado exitosamente",
      data: service,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Error al crear servicio" });
  }
};

// PUT /api/services/:id - Update service
export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    // Validate data
    const validation = updateServiceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.issues,
      });
    }

    const data = validation.data;

    // Check if service exists
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
    });

    if (!existingService) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    // Update service
    const service = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        basePrice: data.basePrice,
        category: data.category,
        isActive: data.isActive,
      },
    });

    res.json({
      success: true,
      message: "Servicio actualizado exitosamente",
      data: service,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Error al actualizar servicio" });
  }
};

// DELETE /api/services/:id - Soft delete service
export const deleteService = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id = req.params.id as string;

    // Check if service exists
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId: dbUser.organizationId,
        deletedAt: null,
      },
    });

    if (!existingService) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    // Soft delete
    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({
      success: true,
      message: "Servicio eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Error al eliminar servicio" });
  }
};
