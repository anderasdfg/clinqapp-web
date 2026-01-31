/**
 * Schedules Service
 *
 * Service for fetching organization schedules and business hours
 */

import { supabase } from "@/lib/supabase/client";
import type { Schedule, SchedulesResponse } from "@/types/schedule.types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch organization schedules
 */
const getOrganizationSchedules = async (): Promise<Schedule[]> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No hay sesión activa");
  }

  const response = await fetch(`${API_BASE_URL}/schedules`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al obtener horarios");
  }

  const result: SchedulesResponse = await response.json();
  return result.data;
};

export const schedulesService = {
  getOrganizationSchedules,
};
