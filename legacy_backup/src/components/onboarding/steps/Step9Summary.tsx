// src/components/onboarding/steps/Step9Summary.tsx
'use client';

import * as React from 'react';
import { StepWrapper } from '../StepWrapper';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { CheckCircle2, Edit, Building2, Clock, CreditCard, Stethoscope, Calendar, Bell, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Step9SummaryProps {
  onComplete?: () => Promise<boolean>;
}

export function Step9Summary({ onComplete }: Step9SummaryProps) {
  const store = useOnboardingStore();
  const {
    basicData,
    businessHours,
    paymentMethods,
    consultationTypes,
    services,
    scheduleConfig,
    notifications,
    invitations,
    setCurrentStep,
  } = store;

  const sections = [
    {
      step: 0,
      icon: Building2,
      title: 'Datos del consultorio',
      items: [
        basicData?.name && `Nombre: ${basicData.name}`,
        basicData?.ruc && `RUC: ${basicData.ruc}`,
        basicData?.address && `Dirección: ${basicData.address}`,
        basicData?.phone && `Teléfono: ${basicData.phone}`,
        basicData?.email && `Email: ${basicData.email}`,
        basicData?.website && `Website: ${basicData.website}`,
        basicData?.instagramUrl && 'Instagram configurado',
        basicData?.facebookUrl && 'Facebook configurado',
        basicData?.tiktokUrl && 'TikTok configurado',
        basicData?.linkedinUrl && 'LinkedIn configurado',
      ].filter(Boolean),
    },
    {
      step: 1,
      icon: Clock,
      title: 'Horarios de atención',
      items: [
        `${businessHours?.schedules?.filter((s) => s.enabled).length || 0} días configurados`,
      ],
    },
    {
      step: 2,
      icon: CreditCard,
      title: 'Métodos de pago',
      items: [
        `${paymentMethods?.methods?.length || 0} métodos habilitados`,
      ],
    },
    {
      step: 3,
      icon: Stethoscope,
      title: 'Tipos de consulta',
      items: [
        `${consultationTypes?.types?.length || 0} modalidades configuradas`,
      ],
    },
    {
      step: 4,
      icon: Calendar,
      title: 'Servicios',
      items: [
        `${services?.services?.length || 0} servicios agregados`,
      ],
    },
    {
      step: 5,
      icon: Calendar,
      title: 'Configuración de agenda',
      items: [
        scheduleConfig?.defaultAppointmentDuration &&
          `Duración de citas: ${scheduleConfig.defaultAppointmentDuration} min`,
        scheduleConfig?.appointmentInterval !== undefined &&
          `Intervalo entre citas: ${scheduleConfig.appointmentInterval} min`,
      ].filter(Boolean),
    },
    {
      step: 6,
      icon: Bell,
      title: 'Notificaciones',
      items: [
        notifications?.notificationEmail && 'Email activado',
        notifications?.notificationWhatsapp && 'WhatsApp activado',
        notifications?.sendReminders &&
          `Recordatorios: ${notifications.reminderHoursBefore}h antes`,
      ].filter(Boolean),
    },
    {
      step: 7,
      icon: Users,
      title: 'Invitaciones de equipo',
      items: [
        invitations?.invitations?.length
          ? `${invitations.invitations.length} invitaciones pendientes`
          : 'Sin invitaciones',
      ],
    },
  ];

  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <StepWrapper isLastStep nextLabel="Comenzar a usar ClinqApp" onNext={onComplete}>
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-clinq-gradient rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            ¡Todo listo!
          </h3>
          <p className="text-white/60">
            Revisa tu configuración antes de finalizar
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const hasData = section.items && section.items.length > 0;

            return (
              <div
                key={section.step}
                className={cn(
                  'glass-dark border rounded-lg p-4',
                  hasData
                    ? 'border-clinq-cyan-500/30'
                    : 'border-red-500/30'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      'p-2 rounded-lg',
                      hasData ? 'bg-clinq-gradient' : 'bg-red-500/20'
                    )}>
                      <Icon className={cn(
                        'h-5 w-5',
                        hasData ? 'text-white' : 'text-red-500'
                      )} />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">
                        {section.title}
                      </h4>

                      {hasData ? (
                        <ul className="space-y-1">
                          {section.items.map((item, index) => (
                            <li
                              key={index}
                              className="text-sm text-white/70 flex items-center gap-2"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-clinq-cyan-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-red-400">
                          No configurado
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(section.step)}
                    className="text-clinq-cyan-500 hover:bg-clinq-cyan-500/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final message */}
        <div className="glass-dark border border-clinq-magenta-500/30 rounded-lg p-6 text-center">
          <p className="text-white mb-2">
            Tu consultorio está configurado y listo para recibir pacientes
          </p>
          <p className="text-white/60 text-sm">
            Puedes modificar estos ajustes en cualquier momento desde la configuración
          </p>
        </div>
      </div>
    </StepWrapper>
  );
}
