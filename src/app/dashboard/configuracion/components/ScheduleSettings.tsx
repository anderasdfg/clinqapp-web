// src/app/dashboard/configuracion/components/ScheduleSettings.tsx
'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TimeInput } from '@/components/onboarding/TimeInput';
import { Label } from '@/components/ui/label';

const daysOfWeek = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
] as const;

type DayOfWeek = typeof daysOfWeek[number]['value'];

interface ScheduleData {
  dayOfWeek: DayOfWeek;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export function ScheduleSettings() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [schedules, setSchedules] = React.useState<ScheduleData[]>(
    daysOfWeek.map((day) => ({
      dayOfWeek: day.value,
      enabled: false,
      startTime: '09:00',
      endTime: '18:00',
    }))
  );

  React.useEffect(() => {
    const loadSchedules = async () => {
      try {
        const response = await fetch('/api/organization/schedules');
        if (!response.ok) throw new Error('Error al cargar horarios');

        const data = await response.json();

        // Merge existing schedules with all days
        const mergedSchedules = daysOfWeek.map((day) => {
          const existing = data.schedules.find(
            (s: ScheduleData) => s.dayOfWeek === day.value
          );

          return existing
            ? existing
            : {
                dayOfWeek: day.value,
                enabled: false,
                startTime: '09:00',
                endTime: '18:00',
              };
        });

        setSchedules(mergedSchedules);
      } catch (error) {
        console.error('Error loading schedules:', error);
        toast.error('Error al cargar los horarios');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedules();
  }, []);

  const handleToggle = (dayOfWeek: DayOfWeek) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.dayOfWeek === dayOfWeek
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      )
    );
  };

  const handleTimeChange = (
    dayOfWeek: DayOfWeek,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.dayOfWeek === dayOfWeek
          ? { ...schedule, [field]: value }
          : schedule
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/organization/schedules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar');
      }

      toast.success('Horarios guardados exitosamente');
    } catch (error) {
      console.error('Error saving schedules:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar los horarios'
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
        <h2 className="text-xl font-semibold text-gray-900">Horarios de atención</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configura los días y horarios en que atiende tu consultorio
        </p>
      </div>

      <div className="space-y-4">
        {schedules.map((schedule, index) => {
          const day = daysOfWeek[index];

          return (
            <div
              key={schedule.dayOfWeek}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-clinq-cyan-300 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <Switch
                  checked={schedule.enabled}
                  onCheckedChange={() => handleToggle(schedule.dayOfWeek)}
                />
                <Label className="text-base font-medium text-gray-900 w-28">
                  {day.label}
                </Label>

                {schedule.enabled && (
                  <div className="flex items-center space-x-3">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Inicio</Label>
                      <TimeInput
                        value={schedule.startTime}
                        onChange={(value) =>
                          handleTimeChange(schedule.dayOfWeek, 'startTime', value)
                        }
                      />
                    </div>
                    <span className="text-gray-400 mt-5">-</span>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Fin</Label>
                      <TimeInput
                        value={schedule.endTime}
                        onChange={(value) =>
                          handleTimeChange(schedule.dayOfWeek, 'endTime', value)
                        }
                      />
                    </div>
                  </div>
                )}

                {!schedule.enabled && (
                  <span className="text-gray-400 text-sm italic">Cerrado</span>
                )}
              </div>
            </div>
          );
        })}
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
          Guardar horarios
        </Button>
      </div>
    </div>
  );
}
