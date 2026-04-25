import api from '@/lib/api/axios-instance';

// ============================================
// TYPES
// ============================================

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  unit: string;
  isActive: boolean;
  categoryId?: string;
  category?: ProductCategory;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdAt: string;
  performedBy?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export interface CreateProductData {
  name: string;
  description?: string;
  categoryId?: string;
  sku?: string;
  barcode?: string;
  costPrice: number;
  salePrice: number;
  currentStock?: number;
  minStock?: number;
  isActive?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface StockAdjustmentData {
  quantity: number;
  reason: string;
  type: 'PURCHASE' | 'ADJUSTMENT' | 'RETURN';
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MovementsResponse {
  movements: InventoryMovement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================
// CATEGORY SERVICES
// ============================================

export const categoryService = {
  async getAll(): Promise<ProductCategory[]> {
    const response = await api.get('/inventory/categories');
    return response.data;
  },

  async create(data: CreateCategoryData): Promise<ProductCategory> {
    const response = await api.post('/inventory/categories', data);
    return response.data;
  },

  async update(id: string, data: UpdateCategoryData): Promise<ProductCategory> {
    const response = await api.put(`/inventory/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/inventory/categories/${id}`);
  },
};

// ============================================
// PRODUCT SERVICES
// ============================================

export const productService = {
  async getAll(params?: {
    categoryId?: string;
    lowStock?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductsResponse> {
    const response = await api.get('/inventory/products', { params });
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get(`/inventory/products/${id}`);
    return response.data;
  },

  async create(data: CreateProductData): Promise<Product> {
    const response = await api.post('/inventory/products', data);
    return response.data;
  },

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const response = await api.put(`/inventory/products/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/inventory/products/${id}`);
  },

  async getLowStock(): Promise<Product[]> {
    const response = await api.get('/inventory/products/low-stock');
    return response.data;
  },

  async adjustStock(id: string, data: StockAdjustmentData): Promise<Product> {
    const response = await api.post(`/inventory/products/${id}/stock`, data);
    return response.data;
  },

  async getMovements(id: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<MovementsResponse> {
    const response = await api.get(`/inventory/products/${id}/movements`, { params });
    return response.data;
  },
};
