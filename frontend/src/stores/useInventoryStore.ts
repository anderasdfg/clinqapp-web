import { create } from "zustand";
import {
  ProductCategory,
  Product,
  InventoryMovement,
  CreateCategoryData,
  UpdateCategoryData,
  CreateProductData,
  UpdateProductData,
  StockAdjustmentData,
  ProductsResponse,
  MovementsResponse,
  categoryService,
  productService,
} from "@/services/inventory.service";

// Cache TTL: 2 minutes
const CACHE_TTL = 2 * 60 * 1000;

interface InventoryState {
  // Categories
  categories: ProductCategory[];
  categoriesLastFetchedAt: number | null;

  // Products
  products: Product[];
  selectedProduct: Product | null;
  productsLastFetchedAt: number | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  hasMore: boolean;

  // Filters
  searchQuery: string;
  categoryFilter: string | null;
  lowStockFilter: boolean;

  // Movements
  movements: InventoryMovement[];
  movementsLastFetchedAt: number | null;
  movementsPage: number;
  movementsTotalPages: number;

  // Loading states
  isLoadingCategories: boolean;
  isLoadingProducts: boolean;
  isLoadingMovements: boolean;
  isCreatingCategory: boolean;
  isUpdatingCategory: boolean;
  isDeletingCategory: boolean;
  isCreatingProduct: boolean;
  isUpdatingProduct: boolean;
  isDeletingProduct: boolean;
  isAdjustingStock: boolean;

  // Error states
  categoriesError: string | null;
  productsError: string | null;
  movementsError: string | null;

  // Actions
  fetchCategories: (force?: boolean) => Promise<void>;
  createCategory: (data: CreateCategoryData) => Promise<ProductCategory>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<ProductCategory>;
  deleteCategory: (id: string) => Promise<void>;

  fetchProducts: (params?: {
    categoryId?: string;
    lowStock?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }, force?: boolean) => Promise<void>;
  fetchProduct: (id: string) => Promise<Product>;
  createProduct: (data: CreateProductData) => Promise<Product>;
  updateProduct: (id: string, data: UpdateProductData) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (id: string, data: StockAdjustmentData) => Promise<Product>;

  fetchMovements: (productId: string, params?: {
    page?: number;
    limit?: number;
  }, force?: boolean) => Promise<void>;

  getLowStockProducts: () => Promise<Product[]>;

  // Utility actions
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (categoryId: string | null) => void;
  setLowStockFilter: (enabled: boolean) => void;
  setSelectedProduct: (product: Product | null) => void;
  clearErrors: () => void;
  resetFilters: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial state
  categories: [],
  categoriesLastFetchedAt: null,
  products: [],
  selectedProduct: null,
  productsLastFetchedAt: null,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  limit: 20,
  hasMore: false,
  searchQuery: "",
  categoryFilter: null,
  lowStockFilter: false,
  movements: [],
  movementsLastFetchedAt: null,
  movementsPage: 1,
  movementsTotalPages: 1,
  isLoadingCategories: false,
  isLoadingProducts: false,
  isLoadingMovements: false,
  isCreatingCategory: false,
  isUpdatingCategory: false,
  isDeletingCategory: false,
  isCreatingProduct: false,
  isUpdatingProduct: false,
  isDeletingProduct: false,
  isAdjustingStock: false,
  categoriesError: null,
  productsError: null,
  movementsError: null,

  // Categories actions
  fetchCategories: async (force = false) => {
    const state = get();
    const now = Date.now();
    
    if (!force && state.categoriesLastFetchedAt && (now - state.categoriesLastFetchedAt) < CACHE_TTL) {
      return;
    }

    set({ isLoadingCategories: true, categoriesError: null });
    
    try {
      const categories = await categoryService.getAll();
      set({
        categories,
        categoriesLastFetchedAt: now,
        isLoadingCategories: false,
      });
    } catch (error) {
      set({
        categoriesError: error instanceof Error ? error.message : 'Error al cargar categorías',
        isLoadingCategories: false,
      });
    }
  },

  createCategory: async (data: CreateCategoryData) => {
    set({ isCreatingCategory: true, categoriesError: null });
    
    try {
      const category = await categoryService.create(data);
      const state = get();
      set({
        categories: [...state.categories, category],
        isCreatingCategory: false,
      });
      return category;
    } catch (error) {
      set({
        categoriesError: error instanceof Error ? error.message : 'Error al crear categoría',
        isCreatingCategory: false,
      });
      throw error;
    }
  },

  updateCategory: async (id: string, data: UpdateCategoryData) => {
    set({ isUpdatingCategory: true, categoriesError: null });
    
    try {
      const updatedCategory = await categoryService.update(id, data);
      const state = get();
      set({
        categories: state.categories.map(cat => 
          cat.id === id ? updatedCategory : cat
        ),
        isUpdatingCategory: false,
      });
      return updatedCategory;
    } catch (error) {
      set({
        categoriesError: error instanceof Error ? error.message : 'Error al actualizar categoría',
        isUpdatingCategory: false,
      });
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    set({ isDeletingCategory: true, categoriesError: null });
    
    try {
      await categoryService.delete(id);
      const state = get();
      set({
        categories: state.categories.filter(cat => cat.id !== id),
        isDeletingCategory: false,
      });
    } catch (error) {
      set({
        categoriesError: error instanceof Error ? error.message : 'Error al eliminar categoría',
        isDeletingCategory: false,
      });
      throw error;
    }
  },

  // Products actions
  fetchProducts: async (params = {}, force = false) => {
    const state = get();
    const now = Date.now();
    
    if (!force && state.productsLastFetchedAt && (now - state.productsLastFetchedAt) < CACHE_TTL) {
      return;
    }

    set({ isLoadingProducts: true, productsError: null });
    
    try {
      const response: ProductsResponse = await productService.getAll({
        categoryId: state.categoryFilter || params.categoryId,
        lowStock: state.lowStockFilter || params.lowStock,
        search: state.searchQuery || params.search,
        page: params.page || state.currentPage,
        limit: params.limit || state.limit,
      });

      set({
        products: response.products,
        currentPage: response.pagination.page,
        totalPages: response.pagination.pages,
        totalProducts: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.pages,
        productsLastFetchedAt: now,
        isLoadingProducts: false,
      });
    } catch (error) {
      set({
        productsError: error instanceof Error ? error.message : 'Error al cargar productos',
        isLoadingProducts: false,
      });
    }
  },

  fetchProduct: async (id: string) => {
    try {
      const product = await productService.getById(id);
      set({ selectedProduct: product });
      return product;
    } catch (error) {
      set({
        productsError: error instanceof Error ? error.message : 'Error al cargar producto',
      });
      throw error;
    }
  },

  createProduct: async (data: CreateProductData) => {
    set({ isCreatingProduct: true, productsError: null });
    
    try {
      const product = await productService.create(data);
      const state = get();
      set({
        products: [product, ...state.products],
        totalProducts: state.totalProducts + 1,
        isCreatingProduct: false,
      });
      return product;
    } catch (error) {
      set({
        productsError: error instanceof Error ? error.message : 'Error al crear producto',
        isCreatingProduct: false,
      });
      throw error;
    }
  },

  updateProduct: async (id: string, data: UpdateProductData) => {
    set({ isUpdatingProduct: true, productsError: null });
    
    try {
      const updatedProduct = await productService.update(id, data);
      const state = get();
      set({
        products: state.products.map(product => 
          product.id === id ? updatedProduct : product
        ),
        selectedProduct: state.selectedProduct?.id === id ? updatedProduct : state.selectedProduct,
        isUpdatingProduct: false,
      });
      return updatedProduct;
    } catch (error) {
      set({
        productsError: error instanceof Error ? error.message : 'Error al actualizar producto',
        isUpdatingProduct: false,
      });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isDeletingProduct: true, productsError: null });
    
    try {
      await productService.delete(id);
      const state = get();
      set({
        products: state.products.filter(product => product.id !== id),
        selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
        totalProducts: state.totalProducts - 1,
        isDeletingProduct: false,
      });
    } catch (error) {
      set({
        productsError: error instanceof Error ? error.message : 'Error al eliminar producto',
        isDeletingProduct: false,
      });
      throw error;
    }
  },

  adjustStock: async (id: string, data: StockAdjustmentData) => {
    set({ isAdjustingStock: true, productsError: null });
    
    try {
      const updatedProduct = await productService.adjustStock(id, data);
      const state = get();
      set({
        products: state.products.map(product => 
          product.id === id ? updatedProduct : product
        ),
        selectedProduct: state.selectedProduct?.id === id ? updatedProduct : state.selectedProduct,
        isAdjustingStock: false,
      });
      return updatedProduct;
    } catch (error) {
      set({
        productsError: error instanceof Error ? error.message : 'Error al ajustar stock',
        isAdjustingStock: false,
      });
      throw error;
    }
  },

  // Movements actions
  fetchMovements: async (productId: string, params = {}, force = false) => {
    const state = get();
    const now = Date.now();
    
    if (!force && state.movementsLastFetchedAt && (now - state.movementsLastFetchedAt) < CACHE_TTL) {
      return;
    }

    set({ isLoadingMovements: true, movementsError: null });
    
    try {
      const response: MovementsResponse = await productService.getMovements(productId, {
        page: params.page || state.movementsPage,
        limit: params.limit || 10,
      });

      set({
        movements: response.movements,
        movementsPage: response.pagination.page,
        movementsTotalPages: response.pagination.pages,
        movementsLastFetchedAt: now,
        isLoadingMovements: false,
      });
    } catch (error) {
      set({
        movementsError: error instanceof Error ? error.message : 'Error al cargar movimientos',
        isLoadingMovements: false,
      });
    }
  },

  getLowStockProducts: async () => {
    try {
      return await productService.getLowStock();
    } catch (error) {
      set({
        productsError: error instanceof Error ? error.message : 'Error al cargar productos con stock bajo',
      });
      throw error;
    }
  },

  // Utility actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
  },

  setCategoryFilter: (categoryId: string | null) => {
    set({ categoryFilter: categoryId, currentPage: 1 });
  },

  setLowStockFilter: (enabled: boolean) => {
    set({ lowStockFilter: enabled, currentPage: 1 });
  },

  setSelectedProduct: (product: Product | null) => {
    set({ selectedProduct: product });
  },

  clearErrors: () => {
    set({
      categoriesError: null,
      productsError: null,
      movementsError: null,
    });
  },

  resetFilters: () => {
    set({
      searchQuery: "",
      categoryFilter: null,
      lowStockFilter: false,
      currentPage: 1,
    });
  },
}));
