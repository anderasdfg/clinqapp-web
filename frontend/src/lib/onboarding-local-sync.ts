import type { ServiceTemplate } from '@/lib/constants/service-templates';
import { DAYS_OF_WEEK } from '@/lib/constants/onboarding';

export type PersistedService = {
  name: string;
  description?: string | null;
  category: ServiceTemplate['category'];
  basePrice?: number | null;
  currency: ServiceTemplate['currency'];
  duration: number;
};

export type DaySchedule = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
};

/** Default Mon–Sat 09:00–18:00; Sunday off. */
export function defaultSchedules(): DaySchedule[] {
  return DAYS_OF_WEEK.map((day) => ({
    dayOfWeek: day.value,
    startTime: '09:00',
    endTime: '18:00',
    enabled: day.value !== 'SUNDAY',
  }));
}

/** Map persisted store services into ServiceTemplate shape for the wizard UI. */
export function servicesFromPersisted(
  services: { services?: PersistedService[] } | null | undefined
): ServiceTemplate[] {
  const list = services?.services;
  if (!list?.length) return [];
  return list.map((s, i) => ({
    id: `persisted-${i}-${s.name}`,
    name: s.name,
    description: s.description || '',
    category: s.category,
    basePrice: s.basePrice ?? 0,
    currency: s.currency,
    duration: s.duration,
  }));
}

export function schedulesFromPersisted(
  businessHours: { schedules?: DaySchedule[] } | null | undefined
): DaySchedule[] {
  return businessHours?.schedules?.length
    ? businessHours.schedules
    : defaultSchedules();
}
