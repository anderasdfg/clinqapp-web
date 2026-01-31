/**
 * Time slot utility functions
 *
 * Helper functions for calculating time slots, checking availability,
 * and managing appointment scheduling logic.
 */

import { DayOfWeek } from "@prisma/client";
import {
  format,
  parse,
  addMinutes,
  isWithinInterval,
  isSameDay,
} from "date-fns";

const MINUTES_PER_HOUR = 60;
const HOURS_IN_DAY = 24;

/**
 * Time slot interval in minutes
 */
const TIME_SLOT_INTERVAL = 30;

/**
 * Convert day of week number (0-6, Sunday=0) to DayOfWeek enum
 */
export const getDayOfWeekEnum = (dayNumber: number): DayOfWeek => {
  const dayMap: Record<number, DayOfWeek> = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY",
  };

  return dayMap[dayNumber];
};

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
};

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const mins = minutes % MINUTES_PER_HOUR;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

/**
 * Generate all possible time slots for a day
 */
export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  intervalMinutes: number = TIME_SLOT_INTERVAL,
): string[] => {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  for (
    let minutes = startMinutes;
    minutes < endMinutes;
    minutes += intervalMinutes
  ) {
    slots.push(minutesToTime(minutes));
  }

  return slots;
};

/**
 * Check if a time slot overlaps with any booked appointments
 */
export const isTimeSlotBooked = (
  slotTime: string,
  duration: number,
  bookedSlots: Array<{ startTime: Date; endTime: Date }>,
  baseDate: Date = new Date(),
): boolean => {
  const [hours, minutes] = slotTime.split(":").map(Number);

  const slotStart = new Date(baseDate);
  slotStart.setHours(hours, minutes, 0, 0);

  const slotEnd = addMinutes(slotStart, duration);

  // Check if slot overlaps with any booked appointment
  const s1 = Math.floor(slotStart.getTime() / 60000);
  const e1 = Math.floor(slotEnd.getTime() / 60000);

  return bookedSlots.some((booked) => {
    const s2 = Math.floor(new Date(booked.startTime).getTime() / 60000);
    const e2 = Math.floor(new Date(booked.endTime).getTime() / 60000);

    // Overlap: S1 < E2 AND E1 > S2
    // Strict < allows back-to-back appointments (E1 = S2 or S1 = E2)
    const overlaps = s1 < e2 && e1 > s2;

    if (overlaps && slotTime === "11:30") {
      console.log(
        `[DEBUG] Slot 11:30 overlap detected with: ${format(booked.startTime, "HH:mm")} - ${format(booked.endTime, "HH:mm")}`,
      );
    }

    return overlaps;
  });
};

/**
 * Check if a time is within business hours
 */
export const isWithinBusinessHours = (
  time: string,
  businessHours: { startTime: string; endTime: string } | null,
): boolean => {
  if (!businessHours) {
    return false;
  }

  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(businessHours.startTime);
  const endMinutes = timeToMinutes(businessHours.endTime);

  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
};
