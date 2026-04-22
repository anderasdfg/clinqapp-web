import axios from 'axios';
import { AppConfig } from '../lib/config/app.config';
import { Product } from './inventory.service';

const API_URL = AppConfig.apiUrl;

// ============================================
// TYPES
// ============================================

export interface ProductSaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    unit: string;
    category?: {
      name: string;
    };
  };
}

export interface ProductSale {
  id: string;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  soldBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  items: ProductSaleItem[];
  payment?: {
    id: string;
    method: string;
    status: string;
    receiptNumber?: string;
  };
}

export interface CreateProductSaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateProductSaleData {
  patientId?: string;
  items: CreateProductSaleItem[];
  discount?: number;
  notes?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'YAPE' | 'PLIN' | 'OTHER';
  createPayment?: boolean;
}

export interface ProductSalesResponse {
  sales: ProductSale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  topProducts: Array<{
    productId: string;
    _sum: {
      quantity: number;
      subtotal: number;
    };
    product?: Product;
  }>;
}

// ============================================
// PRODUCT SALES SERVICES
// ============================================

export const productSalesService = {
  async getAll(params?: {
    patientId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductSalesResponse> {
    const response = await axios.get(`${API_URL}/product-sales`, { params });
    return response.data;
  },

  async getById(id: string): Promise<ProductSale> {
    const response = await axios.get(`${API_URL}/product-sales/${id}`);
    return response.data;
  },

  async create(data: CreateProductSaleData): Promise<ProductSale> {
    const response = await axios.post(`${API_URL}/product-sales`, data);
    return response.data;
  },

  async getStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<SalesStats> {
    const response = await axios.get(`${API_URL}/product-sales/stats`, { params });
    return response.data;
  },

  async exportSales(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(`${API_URL}/product-sales/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Helper function to download exported sales
  downloadExport(blob: Blob, filename: string = 'ventas-productos.csv'): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
