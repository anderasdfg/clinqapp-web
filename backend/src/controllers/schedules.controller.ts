import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * GET /api/schedules - Get organization schedules
 * Returns the business hours configuration for the authenticated user's organization
 */
export const getOrganizationSchedules = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        organizationId: dbUser.organizationId,
      },
      select: {
        id: true,
        organizationId: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return res.status(500).json({ error: "Error al obtener horarios" });
  }
};
