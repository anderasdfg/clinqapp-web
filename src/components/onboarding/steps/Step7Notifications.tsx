// src/components/onboarding/steps/Step7Notifications.tsx
'use client';

import * as React from 'react';
import { StepWrapper } from '../StepWrapper';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { type Notifications } from '@/lib/validations/onboarding';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, MessageCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';

const REMINDER_HOURS_OPTIONS = [
  { value: 1, label: '1 hora antes' },
  { value: 2, label: '2 horas antes' },
  { value: 4, label: '4 horas antes' },
  { value: 12, label: '12 horas antes' },
  { value: 24, label: '24 horas antes' },
  { value: 48, label: '48 horas antes' },
  { value: 72, label: '3 días antes' },
];

export function Step7Notifications() {
  const { notifications, setNotifications } = useOnboardingStore();

  const [config, setConfig] = React.useState<Notifications>({
    notificationEmail: notifications?.notificationEmail ?? true,
    notificationWhatsapp: notifications?.notificationWhatsapp ?? false,
    whatsappNumber: notifications?.whatsappNumber || null,
    sendReminders: notifications?.sendReminders ?? true,
    reminderHoursBefore: notifications?.reminderHoursBefore || 24,
  });

  const handleChange = (field: keyof Notifications, value: Notifications[keyof Notifications]) => {
    setConfig({ ...config, [field]: value });
  };

  const onNext = () => {
    // Validate WhatsApp if enabled
    if (config.notificationWhatsapp) {
      if (!config.whatsappNumber || config.whatsappNumber.trim().length < 9) {
        toast.error('Debes ingresar un número de WhatsApp válido');
        return false;
      }
    }

    setNotifications(config);
    return true;
  };

  return (
    <StepWrapper onNext={onNext}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Notificaciones
          </h3>
          <p className="text-white/60 text-sm">
            Configura cómo te comunicarás con tus pacientes
          </p>
        </div>

        <div className="space-y-4">
          {/* Email notifications */}
          <div className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-clinq-gradient rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white text-base font-semibold">
                    Notificaciones por Email
                  </Label>
                  <Switch
                    checked={config.notificationEmail}
                    onCheckedChange={(value) =>
                      handleChange('notificationEmail', value)
                    }
                  />
                </div>
                <p className="text-white/60 text-sm">
                  Envía recordatorios y confirmaciones de citas por correo electrónico
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp notifications */}
          <div className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white text-base font-semibold">
                    Notificaciones por WhatsApp
                  </Label>
                  <Switch
                    checked={config.notificationWhatsapp}
                    onCheckedChange={(value) =>
                      handleChange('notificationWhatsapp', value)
                    }
                  />
                </div>
                <p className="text-white/60 text-sm">
                  Envía recordatorios por WhatsApp Business
                </p>

                {config.notificationWhatsapp && (
                  <div className="pt-2">
                    <Label className="text-white text-sm">
                      Número de WhatsApp Business
                    </Label>
                    <Input
                      value={config.whatsappNumber || ''}
                      onChange={(e) =>
                        handleChange('whatsappNumber', e.target.value)
                      }
                      placeholder="+51 999 999 999"
                      className="mt-2 bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
                    />
                    <p className="text-xs text-white/50 mt-1">
                      Debe ser un número de WhatsApp Business verificado
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SMS notifications (disabled) */}
          <div className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-6 opacity-50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-500 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white text-base font-semibold">
                    Notificaciones por SMS
                  </Label>
                  <div className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-500 text-xs">
                    Próximamente
                  </div>
                </div>
                <p className="text-white/60 text-sm">
                  Envía mensajes de texto a tus pacientes
                </p>
              </div>
            </div>
          </div>

          {/* Reminder settings */}
          <div className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-clinq-gradient rounded-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white text-base font-semibold">
                      Recordatorios de citas
                    </Label>
                    <p className="text-white/60 text-sm mt-1">
                      Envía recordatorios automáticos antes de las citas
                    </p>
                  </div>
                  <Switch
                    checked={config.sendReminders}
                    onCheckedChange={(value) =>
                      handleChange('sendReminders', value)
                    }
                  />
                </div>

                {config.sendReminders && (
                  <div className="pt-2">
                    <Label className="text-white text-sm">
                      ¿Cuánto tiempo antes enviar el recordatorio?
                    </Label>
                    <Select
                      value={config.reminderHoursBefore.toString()}
                      onValueChange={(value) =>
                        handleChange('reminderHoursBefore', parseInt(value))
                      }
                    >
                      <SelectTrigger className="mt-2 bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-clinq-purple-900 border-clinq-cyan-500/30">
                        {REMINDER_HOURS_OPTIONS.map((option) => (
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
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {(config.notificationEmail || config.notificationWhatsapp) && (
          <div className="glass-dark border border-clinq-magenta-500/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">
              Configuración activa
            </h4>
            <div className="space-y-1 text-sm text-white/70">
              {config.notificationEmail && (
                <p>• Notificaciones por email activadas</p>
              )}
              {config.notificationWhatsapp && (
                <p>• Notificaciones por WhatsApp activadas</p>
              )}
              {config.sendReminders && (
                <p>
                  • Se enviarán recordatorios{' '}
                  {
                    REMINDER_HOURS_OPTIONS.find(
                      (o) => o.value === config.reminderHoursBefore
                    )?.label
                  }
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </StepWrapper>
  );
}
