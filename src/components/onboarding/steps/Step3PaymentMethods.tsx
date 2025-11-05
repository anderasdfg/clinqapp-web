// src/components/onboarding/steps/Step3PaymentMethods.tsx
'use client';

import * as React from 'react';
import { StepWrapper } from '../StepWrapper';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { type PaymentMethod } from '@/lib/validations/onboarding';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CreditCard, Banknote, Building2, Smartphone, Wallet, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PAYMENT_METHOD_OPTIONS = [
  { type: 'CASH', label: 'Efectivo', icon: Banknote, color: 'text-green-500' },
  { type: 'CREDIT_CARD', label: 'Tarjeta de crédito', icon: CreditCard, color: 'text-blue-500' },
  { type: 'DEBIT_CARD', label: 'Tarjeta de débito', icon: CreditCard, color: 'text-purple-500' },
  { type: 'BANK_TRANSFER', label: 'Transferencia bancaria', icon: Building2, color: 'text-cyan-500' },
  { type: 'MOBILE_PAYMENT', label: 'Pago móvil (Yape, Plin)', icon: Smartphone, color: 'text-pink-500' },
  { type: 'BANK_DEPOSIT', label: 'Depósito bancario', icon: Wallet, color: 'text-yellow-500' },
  { type: 'OTHER', label: 'Otro', icon: DollarSign, color: 'text-gray-500' },
] as const;

export function Step3PaymentMethods() {
  const { paymentMethods, setPaymentMethods } = useOnboardingStore();

  const [selectedMethods, setSelectedMethods] = React.useState<PaymentMethod[]>(
    paymentMethods?.methods || [{ type: 'CASH', otherName: null }]
  );

  const [otherName, setOtherName] = React.useState('');

  const isMethodSelected = (type: string) => {
    return selectedMethods.some((m) => m.type === type);
  };

  const handleToggleMethod = (type: string) => {
    if (isMethodSelected(type)) {
      setSelectedMethods(selectedMethods.filter((m) => m.type !== type));
    } else {
      setSelectedMethods([...selectedMethods, { type: type as PaymentMethod['type'], otherName: null }]);
    }
  };

  const handleOtherNameChange = (value: string) => {
    setOtherName(value);
    const updated = selectedMethods.map((m) =>
      m.type === 'OTHER' ? { ...m, otherName: value } : m
    );
    setSelectedMethods(updated);
  };

  const onNext = () => {
    if (selectedMethods.length === 0) {
      toast.error('Debe seleccionar al menos un método de pago');
      return false;
    }

    const hasOther = selectedMethods.some((m) => m.type === 'OTHER');
    if (hasOther && !otherName.trim()) {
      toast.error('Debe especificar el nombre del método de pago personalizado');
      return false;
    }

    setPaymentMethods({ methods: selectedMethods });
    return true;
  };

  React.useEffect(() => {
    const otherMethod = selectedMethods.find((m) => m.type === 'OTHER');
    if (otherMethod?.otherName) {
      setOtherName(otherMethod.otherName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StepWrapper onNext={onNext}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Métodos de pago
          </h3>
          <p className="text-white/60 text-sm">
            Selecciona los métodos de pago que aceptas en tu consultorio
          </p>
          <p className="text-white/40 text-xs mt-2 italic">
            Estos métodos son para registro y reportes. La integración de pagos
            online estará disponible próximamente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {PAYMENT_METHOD_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = isMethodSelected(option.type);

            return (
              <div key={option.type}>
                <label
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    isSelected
                      ? 'border-clinq-cyan-500 bg-clinq-cyan-500/10'
                      : 'border-clinq-cyan-500/20 bg-clinq-purple-800/30 hover:border-clinq-cyan-500/40'
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleMethod(option.type)}
                  />
                  <Icon className={cn('h-5 w-5', option.color)} />
                  <span className="text-white font-medium flex-1">
                    {option.label}
                  </span>
                </label>

                {/* Show input for "OTHER" */}
                {option.type === 'OTHER' && isSelected && (
                  <div className="mt-2 ml-11">
                    <Input
                      placeholder="Especifica el método de pago"
                      value={otherName}
                      onChange={(e) => handleOtherNameChange(e.target.value)}
                      className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedMethods.length > 0 && (
          <div className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-4">
            <p className="text-sm text-white/60 mb-2">Métodos seleccionados:</p>
            <div className="flex flex-wrap gap-2">
              {selectedMethods.map((method, index) => {
                const option = PAYMENT_METHOD_OPTIONS.find(
                  (o) => o.type === method.type
                );
                return (
                  <div
                    key={index}
                    className="px-3 py-1 bg-clinq-gradient rounded-full text-white text-sm"
                  >
                    {method.type === 'OTHER' && method.otherName
                      ? method.otherName
                      : option?.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </StepWrapper>
  );
}
