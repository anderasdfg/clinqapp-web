export interface ProximaCita {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  patient: {
    firstName: string;
    lastName: string;
  };
  professional: {
    firstName: string;
  };
}

export interface DashboardStats {
  ingresosMes: number;
  citasHoy: number;
  pacientesNuevosMes: number;
  proximasCitas: ProximaCita[];
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}
