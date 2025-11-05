// src/app/dashboard/configuracion/components/ConsultationTypesSettings.tsx
'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const CONSULTATION_TYPES = [
  { type: 'IN_PERSON', label: 'Presencial', description: 'Consultas en el consultorio' },
  {
    type: 'TELEMEDICINE',
    label: 'Telemedicina',
    description: 'Consultas virtuales por videollamada',
  },
  {
    type: 'HOME_VISIT',
    label: 'Visita a domicilio',
    description: 'Consultas en el domicilio del paciente',
  },
];

export function ConsultationTypesSettings() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [types, setTypes] = React.useState<Record<string, boolean>>({
    IN_PERSON: true,
    TELEMEDICINE: false,
    HOME_VISIT: false,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Tipos de consulta guardados');
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Tipos de consulta</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configura las modalidades de consulta que ofreces
        </p>
      </div>

      <div className="space-y-4">
        {CONSULTATION_TYPES.map((type) => (
          <div
            key={type.type}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
          >
            <div className="space-y-1">
              <Label className="text-base font-medium">{type.label}</Label>
              <p className="text-sm text-gray-500">{type.description}</p>
            </div>
            <Switch
              checked={types[type.type]}
              onCheckedChange={(checked) =>
                setTypes((prev) => ({ ...prev, [type.type]: checked }))
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
