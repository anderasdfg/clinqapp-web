// src/app/dashboard/configuracion/components/PaymentMethodsSettings.tsx
'use client';

import * as React from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const PAYMENT_METHODS = [
  { type: 'CASH', label: 'Efectivo' },
  { type: 'CREDIT_CARD', label: 'Tarjeta de crédito' },
  { type: 'DEBIT_CARD', label: 'Tarjeta de débito' },
  { type: 'BANK_TRANSFER', label: 'Transferencia bancaria' },
  { type: 'MOBILE_PAYMENT', label: 'Yape / Plin' },
  { type: 'BANK_DEPOSIT', label: 'Depósito bancario' },
];

export function PaymentMethodsSettings() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [methods, setMethods] = React.useState<Record<string, boolean>>({
    CASH: true,
    CREDIT_CARD: false,
    DEBIT_CARD: false,
    BANK_TRANSFER: false,
    MOBILE_PAYMENT: false,
    BANK_DEPOSIT: false,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Métodos de pago guardados');
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Métodos de pago</h2>
        <p className="text-sm text-gray-500 mt-1">
          Selecciona los métodos de pago que aceptas
        </p>
      </div>

      <div className="space-y-4">
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method.type}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
          >
            <Label className="text-base font-medium">{method.label}</Label>
            <Switch
              checked={methods[method.type]}
              onCheckedChange={(checked) =>
                setMethods((prev) => ({ ...prev, [method.type]: checked }))
              }
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6 border-t mt-6">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-clinq-cyan-500 hover:bg-clinq-cyan-600"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar configuración
        </Button>
      </div>
    </div>
  );
}
