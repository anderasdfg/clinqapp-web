// src/components/onboarding/steps/Step4ConsultationTypes.tsx
'use client';

import * as React from 'react';
import { StepWrapper } from '../StepWrapper';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Building, Video, Home } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CONSULTATION_TYPE_OPTIONS = [
  {
    type: 'IN_PERSON',
    label: 'Presencial',
    description: 'Consultas en el consultorio',
    icon: Building,
    color: 'text-clinq-cyan-500',
  },
  {
    type: 'TELEMEDICINE',
    label: 'Telemedicina',
    description: 'Consultas virtuales por videollamada',
    icon: Video,
    color: 'text-clinq-magenta-500',
  },
  {
    type: 'HOME_VISIT',
    label: 'Domicilio',
    description: 'Visitas al hogar del paciente',
    icon: Home,
    color: 'text-green-500',
  },
] as const;

export function Step4ConsultationTypes() {
  const { consultationTypes, setConsultationTypes } = useOnboardingStore();

  const [selectedTypes, setSelectedTypes] = React.useState<string[]>(
    consultationTypes?.types || ['IN_PERSON']
  );

  const isTypeSelected = (type: string) => {
    return selectedTypes.includes(type);
  };

  const handleToggleType = (type: string) => {
    if (isTypeSelected(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const onNext = () => {
    if (selectedTypes.length === 0) {
      toast.error('Debe seleccionar al menos un tipo de consulta');
      return false;
    }

    setConsultationTypes({ types: selectedTypes as ('IN_PERSON' | 'TELEMEDICINE' | 'HOME_VISIT')[] });
    return true;
  };

  return (
    <StepWrapper onNext={onNext}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Modalidades de atención
          </h3>
          <p className="text-white/60 text-sm">
            Selecciona las modalidades en que atiendes a tus pacientes
          </p>
        </div>

        <div className="grid gap-4">
          {CONSULTATION_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = isTypeSelected(option.type);

            return (
              <label
                key={option.type}
                className={cn(
                  'flex items-start gap-4 p-6 rounded-lg border-2 cursor-pointer transition-all',
                  isSelected
                    ? 'border-clinq-cyan-500 bg-clinq-cyan-500/10'
                    : 'border-clinq-cyan-500/20 bg-clinq-purple-800/30 hover:border-clinq-cyan-500/40'
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleToggleType(option.type)}
                  className="mt-1"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={cn('h-6 w-6', option.color)} />
                    <span className="text-white font-semibold text-lg">
                      {option.label}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">{option.description}</p>
                </div>
              </label>
            );
          })}
        </div>

        {selectedTypes.length > 0 && (
          <div className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-4">
            <p className="text-sm text-white/60 mb-2">
              Modalidades seleccionadas:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTypes.map((type) => {
                const option = CONSULTATION_TYPE_OPTIONS.find(
                  (o) => o.type === type
                );
                return (
                  <div
                    key={type}
                    className="px-3 py-1 bg-clinq-gradient rounded-full text-white text-sm"
                  >
                    {option?.label}
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
