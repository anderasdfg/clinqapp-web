/**
 * Schedule and Time Slot Type Definitions
 *
 * This file contains all type definitions related to organization schedules,
 * business hours, and time slot availability for appointment booking.
 */

/**
 * Days of the week enum matching backend Prisma schema
 */
export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

/**
 * Organization schedule for a specific day
 */
export interface Schedule {
  id: string;
  organizationId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // Format: "HH:MM" (24-hour)
  endTime: string; // Format: "HH:MM" (24-hour)
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Time slot availability status
 */
export enum TimeSlotStatus {
  AVAILABLE = "AVAILABLE",
  BOOKED = "BOOKED",
  OUTSIDE_HOURS = "OUTSIDE_HOURS",
}

/**
 * Individual time slot with availability information
 */
export interface TimeSlot {
  time: string; // Format: "HH:MM" (24-hour)
  displayTime: string; // Format: "h:mm A" (12-hour with AM/PM)
  status: TimeSlotStatus;
  isBusinessHours: boolean;
}

/**
 * Available slots response from backend
 */
export interface AvailableSlotsResponse {
  success: boolean;
  data: {
    date: string;
    professionalId: string;
    businessHours: {
      startTime: string;
      endTime: string;
    } | null;
    bookedSlots: string[]; // Array of "HH:MM" times
    availableSlots: TimeSlot[];
  };
}

/**
 * Query parameters for fetching available slots
 */
export interface AvailableSlotsParams {
  professionalId: string;
  date: string; // Format: "YYYY-MM-DD"
  duration: number; // Duration in minutes
}

/**
 * Organization schedules response
 */
export interface SchedulesResponse {
  success: boolean;
  data: Schedule[];
}
