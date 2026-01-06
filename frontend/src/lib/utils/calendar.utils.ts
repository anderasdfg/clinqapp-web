import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment, AppointmentStatus } from "@/types/appointment.types";

/**
 * Generate time slots for a day (hourly intervals)
 */
export const generateTimeSlots = (
  startHour: number = 8,
  endHour: number = 20
): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
};

/**
 * Get days for week view
 */
export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

/**
 * Get days for month view
 */
export const getMonthDays = (date: Date): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  // Include days from previous/next month to fill the grid
  const startDay = startOfWeek(start, { weekStartsOn: 1 });
  const endDay = endOfWeek(end, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: startDay, end: endDay });
};

/**
 * Check if a time slot is available (no overlapping appointments)
 */
export const isTimeSlotAvailable = (
  appointments: Appointment[],
  slotStart: Date,
  slotEnd: Date,
  excludeId?: string
): boolean => {
  return !appointments.some((apt) => {
    if (excludeId && apt.id === excludeId) return false;
    if (apt.status === "CANCELLED" || apt.status === "NO_SHOW") return false;

    const aptStart = parseISO(apt.startTime);
    const aptEnd = parseISO(apt.endTime);

    // Check for overlap
    return (
      (slotStart >= aptStart && slotStart < aptEnd) ||
      (slotEnd > aptStart && slotEnd <= aptEnd) ||
      (slotStart <= aptStart && slotEnd >= aptEnd)
    );
  });
};

/**
 * Format time range for display
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  const start = parseISO(startTime);
  const end = parseISO(endTime);

  return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
};

/**
 * Format date for display
 */
export const formatAppointmentDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, "d 'de' MMMM, yyyy", { locale: es });
};

/**
 * Get appointments for a specific day
 */
export const getAppointmentsForDay = (
  appointments: Appointment[],
  date: Date
): Appointment[] => {
  return appointments.filter((apt) => {
    const aptDate = parseISO(apt.startTime);
    return isSameDay(aptDate, date);
  });
};

/**
 * Get appointments for a specific time slot
 */
export const getAppointmentsForTimeSlot = (
  appointments: Appointment[],
  date: Date,
  hour: number
): Appointment[] => {
  return appointments.filter((apt) => {
    const aptStart = parseISO(apt.startTime);
    return isSameDay(aptStart, date) && aptStart.getHours() === hour;
  });
};

/**
 * Calculate duration in minutes
 */
export const calculateDuration = (
  startTime: string,
  endTime: string
): number => {
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};

/**
 * Get color class for appointment status
 */
export const getStatusColor = (status: AppointmentStatus): string => {
  const colors: Record<AppointmentStatus, string> = {
    PENDING: "bg-yellow-500",
    CONFIRMED: "bg-blue-500",
    COMPLETED: "bg-green-500",
    CANCELLED: "bg-red-500",
    NO_SHOW: "bg-gray-500",
    RESCHEDULED: "bg-purple-500",
  };
  return colors[status] || "bg-gray-500";
};

/**
 * Get next available time slot
 */
export const getNextAvailableSlot = (
  appointments: Appointment[],
  date: Date,
  duration: number = 60
): { start: Date; end: Date } | null => {
  const slots = generateTimeSlots();

  for (const slot of slots) {
    const [hour, minute] = slot.split(":").map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + duration);

    if (isTimeSlotAvailable(appointments, slotStart, slotEnd)) {
      return { start: slotStart, end: slotEnd };
    }
  }

  return null;
};

/**
 * Group appointments by day
 */
export const groupAppointmentsByDay = (
  appointments: Appointment[]
): Map<string, Appointment[]> => {
  const grouped = new Map<string, Appointment[]>();

  appointments.forEach((apt) => {
    const date = format(parseISO(apt.startTime), "yyyy-MM-dd");
    const existing = grouped.get(date) || [];
    grouped.set(date, [...existing, apt]);
  });

  return grouped;
};
