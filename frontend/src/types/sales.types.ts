// Sales Types
export interface Sale {
  id: string;
  date: string;
  appointmentId: string | null;
  patientName: string;
  serviceName: string;
  amount: number;
  paymentMethod: string;
  status: string;
}

export interface SalesListResponse {
  data: Sale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalAmount: number;
    count: number;
  };
}

export interface SalesFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  serviceId?: string;
  search?: string;
}
