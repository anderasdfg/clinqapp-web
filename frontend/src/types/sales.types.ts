// Sales Types
export interface SaleItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  unit?: string;
}

export interface Sale {
  id: string;
  type: 'SERVICE' | 'PRODUCT';
  date: string;
  patientName: string;
  description: string;
  items: SaleItem[];
  amount: number;
  subtotal?: number;
  discount?: number;
  paymentMethod: string;
  status: string;
  notes?: string;
  receiptNumber?: string;
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
    serviceAmount?: number;
    serviceCount?: number;
    productAmount?: number;
    productCount?: number;
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
  type?: 'SERVICE' | 'PRODUCT' | 'ALL';
}
