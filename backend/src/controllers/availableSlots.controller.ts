import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { format, parse, startOfDay, endOfDay } from "date-fns";
import {
  getDayOfWeekEnum,
  generateTimeSlots,
  isTimeSlotBooked,
  isWithinBusinessHours,
} from "../utils/timeSlots";

const DEFAULT_START_TIME = "07:00";
const DEFAULT_END_TIME = "23:00";
const TIME_SLOT_INTERVAL_MINUTES = 30;

interface BookedAppointment {
  startTime: Date;
  endTime: Date;
}

/**
 * GET /api/appointments/available-slots
 * Get available time slots for a professional on a specific date
 *
 * Query params:
 * - professionalId: string (required)
 * - date: string (required, format: YYYY-MM-DD)
 * - duration: number (optional, default: 60 minutes)
 */
export const getAvailableSlots = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const { professionalId, date, duration } = req.query;

    // Validation
    if (!professionalId || typeof professionalId !== "string") {
      return res.status(400).json({
        error: "professionalId es requerido y debe ser un string",
      });
    }

    if (!date || typeof date !== "string") {
      return res.status(400).json({
        error: "date es requerido y debe estar en formato YYYY-MM-DD",
      });
    }

    const appointmentDuration = duration
      ? parseInt(duration as string, 10)
      : 60;

    if (isNaN(appointmentDuration) || appointmentDuration <= 0) {
      return res.status(400).json({
        error: "duration debe ser un número positivo",
      });
    }

    // Parse date
    const selectedDate = parse(date, "yyyy-MM-dd", new Date());
    const dayOfWeek = getDayOfWeekEnum(selectedDate.getDay());

    // Get organization's business hours for this day
    const schedule = await prisma.schedule.findFirst({
      where: {
        organizationId: dbUser.organizationId,
        dayOfWeek,
        enabled: true,
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const businessHours = schedule
      ? { startTime: schedule.startTime, endTime: schedule.endTime }
      : null;

    // Get all booked appointments for this professional on this date
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        organizationId: dbUser.organizationId,
        professionalId,
        deletedAt: null,
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
        startTime: {
          gte: startOfDay(selectedDate),
          lt: endOfDay(selectedDate),
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate all possible time slots for the day
    const allSlots = generateTimeSlots(
      DEFAULT_START_TIME,
      DEFAULT_END_TIME,
      TIME_SLOT_INTERVAL_MINUTES,
    );

    // Map slots to include availability status
    const timeSlots = allSlots.map((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const slotStartTime = new Date(selectedDate);
      slotStartTime.setHours(hours, minutes, 0, 0);

      const isBooked = isTimeSlotBooked(
        time,
        appointmentDuration,
        bookedAppointments as BookedAppointment[],
        selectedDate,
      );

      if (time === "11:30") {
        console.log(`[DEBUG] Slot 11:30 analysis:`);
        console.log(`- Duration: ${appointmentDuration}`);
        console.log(
          `- Business Hours: ${businessHours ? `${businessHours.startTime} - ${businessHours.endTime}` : "NONE"}`,
        );
        console.log(
          `- Booked appointments count: ${bookedAppointments.length}`,
        );
        bookedAppointments.forEach((apt, i) => {
          console.log(
            `  - Apt ${i}: ${format(apt.startTime, "HH:mm")} - ${format(apt.endTime, "HH:mm")}`,
          );
        });
        console.log(`- Result isBooked: ${isBooked}`);
        console.log(
          `- Result isInBusinessHours: ${isWithinBusinessHours(time, businessHours)}`,
        );
      }

      const isInBusinessHours = isWithinBusinessHours(time, businessHours);
      const displayTime = format(slotStartTime, "h:mm aa");

      let status: "AVAILABLE" | "BOOKED" | "OUTSIDE_HOURS";
      if (isBooked) {
        status = "BOOKED";
      } else if (isInBusinessHours) {
        status = "AVAILABLE";
      } else {
        status = "OUTSIDE_HOURS";
      }

      return {
        time,
        displayTime,
        status,
        isBusinessHours: isInBusinessHours,
      };
    });

    return res.json({
      success: true,
      data: {
        date,
        professionalId,
        businessHours,
        bookedSlots: bookedAppointments.map((apt) =>
          format(apt.startTime, "HH:mm"),
        ),
        availableSlots: timeSlots,
      },
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return res.status(500).json({
      error: "Error al obtener horarios disponibles",
    });
  }
};
