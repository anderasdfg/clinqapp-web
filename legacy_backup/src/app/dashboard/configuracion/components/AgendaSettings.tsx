// src/app/dashboard/configuracion/components/AgendaSettings.tsx
'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AgendaSettingsData {
  defaultAppointmentDuration: number;
  appointmentInterval: number;
  allowOnlineBooking: boolean;
}

export function AgendaSettings() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [data, setData] = React.useState<AgendaSettingsData>({
    defaultAppointmentDuration: 30,
    appointmentInterval: 0,
    allowOnlineBooking: false,
  });

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/organization/settings');
        if (!response.ok) throw new Error('Error al cargar configuración');

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error loading agenda settings:', error);
        toast.error('Error al cargar la configuración de agenda');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/organization/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar');
      }

      toast.success('Configuración de agenda guardada exitosamente');
    } catch (error) {
      console.error('Error saving agenda settings:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar la configuración'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-clinq-cyan-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Configuración de agenda</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ajusta las preferencias de tu agenda y citas
        </p>
      </div>

      <div className="space-y-6">
        {/* Default Appointment Duration */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Duración predeterminada de citas</Label>
          <p className="text-sm text-gray-500 mb-2">
            Tiempo por defecto que durará cada cita
          </p>
          <Select
            value={data.defaultAppointmentDuration.toString()}
            onValueChange={(value) =>
              setData((prev) => ({
                ...prev,
                defaultAppointmentDuration: parseInt(value),
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutos</SelectItem>
              <SelectItem value="20">20 minutos</SelectItem>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="45">45 minutos</SelectItem>
              <SelectItem value="60">1 hora</SelectItem>
              <SelectItem value="90">1 hora 30 minutos</SelectItem>
              <SelectItem value="120">2 horas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Appointment Interval */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Intervalo entre citas</Label>
          <p className="text-sm text-gray-500 mb-2">
            Tiempo de descanso entre una cita y la siguiente
          </p>
          <Select
            value={data.appointmentInterval.toString()}
            onValueChange={(value) =>
              setData((prev) => ({
                ...prev,
                appointmentInterval: parseInt(value),
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Sin intervalo</SelectItem>
              <SelectItem value="5">5 minutos</SelectItem>
              <SelectItem value="10">10 minutos</SelectItem>
              <SelectItem value="15">15 minutos</SelectItem>
              <SelectItem value="20">20 minutos</SelectItem>
              <SelectItem value="30">30 minutos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Online Booking */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
          <div className="space-y-1">
            <Label className="text-base font-medium">Reserva online</Label>
            <p className="text-sm text-gray-500">
              Permite que los pacientes agenden citas desde tu sitio web
            </p>
          </div>
          <Switch
            checked={data.allowOnlineBooking}
            onCheckedChange={(checked) =>
              setData((prev) => ({ ...prev, allowOnlineBooking: checked }))
            }
          />
        </div>

        {data.allowOnlineBooking && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Para habilitar las reservas online, necesitarás configurar
              un widget o enlace de reserva en tu sitio web. Esta funcionalidad estará
              disponible próximamente.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          className="bg-clinq-cyan-500 hover:bg-clinq-cyan-600"
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar configuración
        </Button>
      </div>
    </div>
  );
}
