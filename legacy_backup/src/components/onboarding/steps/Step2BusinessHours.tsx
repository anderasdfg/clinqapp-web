// src/components/onboarding/steps/Step2BusinessHours.tsx
'use client';

import * as React from 'react';
import { StepWrapper } from '../StepWrapper';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { type BusinessHour } from '@/lib/validations/onboarding';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TimeInput } from '../TimeInput';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = [
  { key: 'MONDAY', label: 'Lunes' },
  { key: 'TUESDAY', label: 'Martes' },
  { key: 'WEDNESDAY', label: 'Miércoles' },
  { key: 'THURSDAY', label: 'Jueves' },
  { key: 'FRIDAY', label: 'Viernes' },
  { key: 'SATURDAY', label: 'Sábado' },
  { key: 'SUNDAY', label: 'Domingo' },
] as const;

export function Step2BusinessHours() {
  const { businessHours, setBusinessHours } = useOnboardingStore();

  const [schedules, setSchedules] = React.useState<BusinessHour[]>(
    businessHours?.schedules ||
    DAYS.map((day) => ({
      dayOfWeek: day.key,
      enabled: day.key !== 'SUNDAY',
      startTime: '08:00',
      endTime: '18:00',
      lunchStartTime: '13:00',
      lunchEndTime: '14:00',
    }))
  );

  const handleToggleDay = (index: number) => {
    const newSchedules = [...schedules];
    newSchedules[index].enabled = !newSchedules[index].enabled;
    setSchedules(newSchedules);
  };

  const handleTimeChange = (
    index: number,
    field: 'startTime' | 'endTime' | 'lunchStartTime' | 'lunchEndTime',
    value: string
  ) => {
    const newSchedules = [...schedules];
    newSchedules[index][field] = value;
    setSchedules(newSchedules);
  };

  const handleCopyToAll = (index: number) => {
    const sourceSchedule = schedules[index];
    const newSchedules = schedules.map((schedule) => ({
      ...schedule,
      startTime: sourceSchedule.startTime,
      endTime: sourceSchedule.endTime,
      lunchStartTime: sourceSchedule.lunchStartTime,
      lunchEndTime: sourceSchedule.lunchEndTime,
    }));
    setSchedules(newSchedules);
    toast.success('Horarios copiados a todos los días');
  };

  const onNext = () => {
    const enabledSchedules = schedules.filter((s) => s.enabled);

    if (enabledSchedules.length === 0) {
      toast.error('Debe habilitar al menos un día de atención');
      return false;
    }

    // Validate times
    for (const schedule of enabledSchedules) {
      const start = parseInt(schedule.startTime.replace(':', ''));
      const end = parseInt(schedule.endTime.replace(':', ''));

      if (start >= end) {
        toast.error(
          `El horario de ${DAYS.find((d) => d.key === schedule.dayOfWeek)?.label} es inválido`
        );
        return false;
      }
    }

    setBusinessHours({ schedules });
    return true;
  };

  return (
    <StepWrapper onNext={onNext}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Horarios de atención
          </h3>
          <p className="text-white/60 text-sm">
            Configura los horarios en que tu consultorio estará abierto
          </p>
        </div>

        <div className="space-y-3">
          {schedules.map((schedule, index) => {
            const day = DAYS[index];

            return (
              <div
                key={day.key}
                className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <Checkbox
                    checked={schedule.enabled}
                    onCheckedChange={() => handleToggleDay(index)}
                    className="mt-1"
                  />

                  <div className="flex-1 space-y-3">
                    {/* Day name */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">
                        {day.label}
                      </span>
                      {schedule.enabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToAll(index)}
                          className="text-clinq-cyan-500 hover:bg-clinq-cyan-500/10"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar a todos
                        </Button>
                      )}
                    </div>

                    {/* Time inputs */}
                    {schedule.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">
                            Inicio
                          </label>
                          <TimeInput
                            value={schedule.startTime}
                            onChange={(value) =>
                              handleTimeChange(index, 'startTime', value)
                            }
                            className="text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">
                            Fin
                          </label>
                          <TimeInput
                            value={schedule.endTime}
                            onChange={(value) =>
                              handleTimeChange(index, 'endTime', value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">
                            Almuerzo inicio (opcional)
                          </label>
                          <TimeInput
                            value={schedule.lunchStartTime || ''}
                            onChange={(value) =>
                              handleTimeChange(index, 'lunchStartTime', value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">
                            Almuerzo fin (opcional)
                          </label>
                          <TimeInput
                            value={schedule.lunchEndTime || ''}
                            onChange={(value) =>
                              handleTimeChange(index, 'lunchEndTime', value)
                            }
                          />
                        </div>
                      </div>
                    )}

                    {!schedule.enabled && (
                      <p className="text-sm text-white/40">Cerrado</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StepWrapper>
  );
}
