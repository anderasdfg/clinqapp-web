/**
 * Schedules Service
 *
 * Service for fetching organization schedules and business hours
 */

import api from "@/lib/api/axios-instance";
import type { Schedule, SchedulesResponse } from "@/types/schedule.types";

/**
 * Fetch organization schedules
 */
const getOrganizationSchedules = async (): Promise<Schedule[]> => {
  const response = await api.get<SchedulesResponse>("/schedules");
  return response.data.data;
};

export const schedulesService = {
  getOrganizationSchedules,
};
