import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { CreateCategoryData, CreateProductData, UpdateProductData, StockAdjustmentData, Product } from '@/services/inventory.service';

// Validation schemas
const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  costPrice: z.number().min(0, 'El precio de compra debe ser mayor o igual a 0'),
  salePrice: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
  currentStock: z.number().int().min(0, 'La cantidad debe ser mayor o igual a 0').default(0),
  minStock: z.number().int().min(0, 'La alerta de stock mínimo debe ser mayor o igual a 0').default(5),
  isActive: z.boolean().default(true),
});

const stockAdjustmentSchema = z.object({
  quantity: z.number().int(),
  reason: z.string().min(1, 'La razón es requerida'),
  type: z.enum(['PURCHASE', 'ADJUSTMENT', 'RETURN']),
});

export function useInventoryHandlers() {
  const {
    createCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    setSelectedProduct,
  } = useInventoryStore();

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categoryForm = useForm<CreateCategoryData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  const productForm = useForm<CreateProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: undefined,
      sku: '',
      barcode: '',
      costPrice: 0,
      salePrice: 0,
      currentStock: 0,
      minStock: 5,
      isActive: true,
    },
  });

  const stockForm = useForm<StockAdjustmentData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      quantity: 0,
      reason: '',
      type: 'ADJUSTMENT',
    },
  });

  const handleCreateCategory = async (data: CreateCategoryData) => {
    try {
      await createCategory(data);
      toast.success('Categoría creada exitosamente');
      setShowCategoryDialog(false);
      categoryForm.reset();
    } catch (error) {
      toast.error('Error al crear categoría');
    }
  };

  const handleSaveProduct = async (data: CreateProductData | UpdateProductData) => {
    try {
      // Limpiar categoryId si es string vacío
      const cleanData = {
        ...data,
        categoryId: data.categoryId && data.categoryId !== '' ? data.categoryId : undefined,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, cleanData);
        toast.success('Producto actualizado exitosamente');
      } else {
        await createProduct(cleanData as CreateProductData);
        toast.success('Producto creado exitosamente');
      }
      setShowProductDialog(false);
      setEditingProduct(null);
      productForm.reset();
    } catch (error: any) {
      // Mostrar errores en español
      if (error.response?.data?.details) {
        const details = error.response.data.details;
        const errorMessages = details.map((detail: any) => {
          const field = detail.path?.[0] || 'campo';
          return `${field}: ${detail.message}`;
        }).join(', ');
        toast.error(`Error de validación: ${errorMessages}`);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(editingProduct ? 'Error al actualizar producto' : 'Error al crear producto');
      }
    }
  };

  const handleStockAdjustment = async (data: StockAdjustmentData, product: Product) => {
    try {
      await adjustStock(product.id, data);
      toast.success('Stock ajustado exitosamente');
      setShowStockDialog(false);
      setSelectedProduct(null);
      stockForm.reset();
    } catch (error) {
      toast.error('Error al ajustar stock');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    try {
      await deleteProduct(productId);
      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId || undefined,
      sku: product.sku || '',
      barcode: product.barcode || '',
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      currentStock: product.currentStock,
      minStock: product.minStock,
      isActive: product.isActive,
    });
    setShowProductDialog(true);
  };

  const openStockDialog = (product: Product) => {
    setSelectedProduct(product);
    stockForm.reset({
      quantity: 0,
      reason: '',
      type: 'ADJUSTMENT',
    });
    setShowStockDialog(true);
  };

  return {
    // Dialogs state
    showCategoryDialog,
    setShowCategoryDialog,
    showProductDialog,
    setShowProductDialog,
    showStockDialog,
    setShowStockDialog,
    editingProduct,
    
    // Forms
    categoryForm,
    productForm,
    stockForm,
    
    // Handlers
    handleCreateCategory,
    handleSaveProduct,
    handleStockAdjustment,
    handleDeleteProduct,
    openEditDialog,
    openStockDialog,
  };
}
