// src/components/onboarding/steps/Step6ScheduleConfig.tsx
'use client';

import * as React from 'react';
import { StepWrapper } from '../StepWrapper';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { type ScheduleConfig } from '@/lib/validations/onboarding';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Clock, Calendar, Globe } from 'lucide-react';

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
];

const INTERVAL_OPTIONS = [
  { value: 0, label: 'Sin intervalo' },
  { value: 5, label: '5 minutos' },
  { value: 10, label: '10 minutos' },
  { value: 15, label: '15 minutos' },
];

export function Step6ScheduleConfig() {
  const { scheduleConfig, setScheduleConfig } = useOnboardingStore();

  const [config, setConfig] = React.useState<ScheduleConfig>({
    defaultAppointmentDuration: scheduleConfig?.defaultAppointmentDuration || 30,
    appointmentInterval: scheduleConfig?.appointmentInterval || 0,
    allowOnlineBooking: scheduleConfig?.allowOnlineBooking || false,
  });

  const handleChange = (field: keyof ScheduleConfig, value: ScheduleConfig[keyof ScheduleConfig]) => {
    setConfig({ ...config, [field]: value });
  };

  const onNext = () => {
    setScheduleConfig(config);
    return true;
  };

  return (
    <StepWrapper onNext={onNext}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Configuración de agenda
          </h3>
          <p className="text-white/60 text-sm">
            Define los ajustes predeterminados para tus citas
          </p>
        </div>

        <div className="space-y-6">
          {/* Default appointment duration */}
          <div className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-clinq-gradient rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <Label className="text-white text-base font-semibold">
                  Duración predeterminada de citas
                </Label>
                <p className="text-white/60 text-sm mt-1 mb-3">
                  Tiempo que se asignará automáticamente a las nuevas citas
                </p>
                <Select
                  value={config.defaultAppointmentDuration.toString()}
                  onValueChange={(value) =>
                    handleChange('defaultAppointmentDuration', parseInt(value))
                  }
                >
                  <SelectTrigger className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-clinq-purple-900 border-clinq-cyan-500/30">
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                        className="text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Appointment interval */}
          <div className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-clinq-gradient rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <Label className="text-white text-base font-semibold">
                  Intervalo entre citas
                </Label>
                <p className="text-white/60 text-sm mt-1 mb-3">
                  Tiempo de buffer entre una cita y la siguiente
                </p>
                <Select
                  value={config.appointmentInterval.toString()}
                  onValueChange={(value) =>
                    handleChange('appointmentInterval', parseInt(value))
                  }
                >
                  <SelectTrigger className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-clinq-purple-900 border-clinq-cyan-500/30">
                    {INTERVAL_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                        className="text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Allow online booking */}
          <div className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-6 opacity-50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-500 rounded-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-white text-base font-semibold">
                      Permitir reservas online
                    </Label>
                    <p className="text-white/60 text-sm mt-1">
                      Los pacientes podrán agendar citas desde internet
                    </p>
                    <p className="text-yellow-500 text-xs mt-2">
                      Próximamente disponible
                    </p>
                  </div>
                  <Switch
                    checked={config.allowOnlineBooking}
                    disabled
                    className="opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="glass-dark border border-clinq-magenta-500/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-2">
            Vista previa de configuración
          </h4>
          <div className="space-y-1 text-sm text-white/70">
            <p>
              • Las citas tendrán una duración de{' '}
              <span className="text-clinq-cyan-500 font-medium">
                {config.defaultAppointmentDuration} minutos
              </span>
            </p>
            <p>
              • Habrá{' '}
              <span className="text-clinq-cyan-500 font-medium">
                {config.appointmentInterval === 0
                  ? 'sin intervalo'
                  : `${config.appointmentInterval} minutos de intervalo`}
              </span>{' '}
              entre citas
            </p>
            <p>
              • Ejemplo: Si una cita empieza a las 10:00, terminará a las{' '}
              <span className="text-clinq-cyan-500 font-medium">
                {`10:${config.defaultAppointmentDuration}`}
              </span>{' '}
              y la siguiente podrá empezar a las{' '}
              <span className="text-clinq-cyan-500 font-medium">
                {`10:${config.defaultAppointmentDuration + config.appointmentInterval}`}
              </span>
            </p>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
