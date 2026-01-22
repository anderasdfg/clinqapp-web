import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const organizationId = dbUser.organizationId;
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

        // 4. Próximas Citas (Hoy)
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
          include: {
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

    res.json({
      success: true,
      data: {
        ingresosMes,
        citasHoy,
        pacientesNuevosMes,
        proximasCitas,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res
      .status(500)
      .json({ error: "Error al obtener estadísticas del dashboard" });
  }
};
