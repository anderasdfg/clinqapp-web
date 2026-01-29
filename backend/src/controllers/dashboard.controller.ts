import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

// Simple in-memory cache for dashboard stats
const dashboardCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60; // 1 minute cache for dashboard (frequently accessed, but changes often)

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const organizationId = dbUser.organizationId;

    // Check cache first
    const cacheKey = `${organizationId}`;
    const cachedEntry = dashboardCache.get(cacheKey);

    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log(`🚀 Dashboard: Cache HIT for org ${organizationId}`);
      return res.json(cachedEntry.data);
    }

    console.log(`🔍 Dashboard: Cache MISS for org ${organizationId}`);

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [ingresosMesData, citasHoy, pacientesNuevosMes, proximasCitas] =
      await Promise.all([
        // 1. Ingresos del Mes
        prisma.payment.aggregate({
          where: {
            organizationId,
            status: "COMPLETED",
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        }),

        // 2. Citas para Hoy
        prisma.appointment.count({
          where: {
            organizationId,
            status: {
              not: "CANCELLED",
            },
            startTime: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        }),

        // 3. Pacientes Nuevos este Mes
        prisma.patient.count({
          where: {
            organizationId,
            deletedAt: null,
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),

        // 4. Próximas Citas (Hoy) - optimized with select
        prisma.appointment.findMany({
          where: {
            organizationId,
            status: {
              notIn: ["CANCELLED", "COMPLETED", "NO_SHOW"],
            },
            startTime: {
              gte: now,
              lte: todayEnd,
            },
          },
          orderBy: {
            startTime: "asc",
          },
          take: 5,
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            patient: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            professional: {
              select: {
                firstName: true,
              },
            },
          },
        }),
      ]);

    const ingresosMes = Number(ingresosMesData._sum.amount || 0);

    const result = {
      success: true,
      data: {
        ingresosMes,
        citasHoy,
        pacientesNuevosMes,
        proximasCitas,
      },
    };

    // Update cache
    dashboardCache.set(cacheKey, { data: result, timestamp: Date.now() });

    res.json(result);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res
      .status(500)
      .json({ error: "Error al obtener estadísticas del dashboard" });
  }
};
