import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useProductSalesStore } from '@/stores/useProductSalesStore';
import { CreateProductSaleData } from '@/services/product-sales.service';
import { Product } from '@/services/inventory.service';

const saleSchema = z.object({
  patientId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Selecciona un producto'),
    quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
    unitPrice: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  })).min(1, 'Debe incluir al menos un producto'),
  discount: z.number().min(0, 'El descuento debe ser mayor o igual a 0').default(0),
  notes: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'YAPE', 'PLIN', 'OTHER']).optional(),
  createPayment: z.boolean().default(false),
});

export function useProductSalesHandlers() {
  const { createSale, fetchStats } = useProductSalesStore();
  const [showSaleDrawer, setShowSaleDrawer] = useState(false);
  const [showSaleDetailDialog, setShowSaleDetailDialog] = useState(false);

  const saleForm = useForm<CreateProductSaleData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      patientId: undefined,
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
      discount: 0,
      notes: '',
      paymentMethod: 'CASH',
      createPayment: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: saleForm.control,
    name: 'items',
  });

  const handleCreateSale = async (data: CreateProductSaleData) => {
    try {
      // Limpiar patientId si está vacío
      const cleanData = {
        ...data,
        patientId: data.patientId && data.patientId !== '' ? data.patientId : undefined,
      };

      await createSale(cleanData);
      toast.success('Venta creada exitosamente');
      setShowSaleDrawer(false);
      saleForm.reset();
      fetchStats({}, true);
    } catch (error: any) {
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
        toast.error('Error al crear venta');
      }
    }
  };

  const handleProductSelect = (index: number, productId: string, products: Product[]) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      saleForm.setValue(`items.${index}.productId`, productId);
      saleForm.setValue(`items.${index}.unitPrice`, product.salePrice);
    }
  };

  const addItem = () => {
    append({ productId: '', quantity: 1, unitPrice: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const calculateTotals = () => {
    const items = saleForm.watch('items');
    const discount = saleForm.watch('discount') || 0;
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const total = Math.max(0, subtotal - discount);
    return { subtotal, total };
  };

  return {
    saleForm,
    fields,
    showSaleDrawer,
    showSaleDetailDialog,
    setShowSaleDrawer,
    setShowSaleDetailDialog,
    handleCreateSale,
    handleProductSelect,
    addItem,
    removeItem,
    calculateTotals,
  };
}
