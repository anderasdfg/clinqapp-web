/**
 * Time-related constants for appointment scheduling
 */

/**
 * Time format patterns
 */
export const TIME_FORMAT = {
  HOUR_24: "HH:mm", // 24-hour format: "14:30"
  HOUR_12: "h:mm a", // 12-hour format: "2:30 PM"
  HOUR_12_UPPER: "h:mm A", // 12-hour format: "2:30 PM"
  DATE_ISO: "yyyy-MM-dd", // ISO date: "2026-01-30"
  DATETIME_ISO: "yyyy-MM-dd'T'HH:mm", // ISO datetime: "2026-01-30T14:30"
  DISPLAY_DATE: "PPP", // Display date: "January 30, 2026"
  DISPLAY_DATETIME: "PPP 'a las' HH:mm", // Display datetime: "January 30, 2026 a las 14:30"
} as const;

/**
 * Time slot interval in minutes
 */
export const TIME_SLOT_INTERVAL_MINUTES = 30;

/**
 * Default appointment duration in minutes
 */
export const DEFAULT_APPOINTMENT_DURATION_MINUTES = 60;

/**
 * Time picker range (in hours, 24-hour format)
 */
export const TIME_PICKER_RANGE = {
  START_HOUR: 7, // 7:00 AM
  END_HOUR: 23, // 11:00 PM
} as const;

/**
 * CSS classes for time slot status styling
 */
export const TIME_SLOT_STYLES = {
  AVAILABLE_BUSINESS_HOURS:
    "bg-primary/5 hover:bg-primary/15 text-primary font-bold border-primary/20",
  AVAILABLE_OUTSIDE_HOURS:
    "bg-muted/30 hover:bg-muted/50 text-muted-foreground border-border/50",
  BOOKED: "bg-muted/10 text-muted-foreground/40 cursor-not-allowed opacity-40",
  SELECTED: "bg-primary text-primary-foreground border-primary shadow-sm",
} as const;

/**
 * Day of week mapping for display
 */
export const DAY_OF_WEEK_DISPLAY = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
} as const;

/**
 * AM/PM period labels
 */
export const TIME_PERIOD = {
  AM: "AM",
  PM: "PM",
} as const;
