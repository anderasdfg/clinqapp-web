// src/components/onboarding/OnboardingStepper.tsx
'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { cn } from '@/lib/utils';

interface Step {
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { title: 'Datos del consultorio', description: 'Información básica' },
  { title: 'Horarios de atención', description: 'Define tu disponibilidad' },
  { title: 'Métodos de pago', description: 'Opciones de pago' },
  { title: 'Tipos de consulta', description: 'Modalidades de atención' },
  { title: 'Servicios', description: 'Catálogo de tratamientos' },
  { title: 'Configuración de agenda', description: 'Ajustes de citas' },
  { title: 'Notificaciones', description: 'Comunicación con pacientes' },
  { title: 'Invitar equipo', description: 'Opcional' },
  { title: 'Resumen', description: 'Revisa tu configuración' },
];

interface OnboardingStepperProps {
  children: React.ReactNode;
  onComplete: () => void;
}

export function OnboardingStepper({
  children,
}: OnboardingStepperProps) {
  const { currentStep } = useOnboardingStore();

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const currentStepInfo = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-clinq-purple-900 flex flex-col">
      {/* Header with progress */}
      <header className="border-b border-clinq-cyan-500/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/60">
                  Paso {currentStep + 1} de {STEPS.length}
                </p>
                <h2 className="text-2xl font-bold text-white">
                  {currentStepInfo.title}
                </h2>
                <p className="text-white/70">{currentStepInfo.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-clinq-cyan-500">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <Progress value={progress} className="h-2" />

            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {STEPS.map((step, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    index === currentStep
                      ? 'w-8 bg-clinq-gradient'
                      : index < currentStep
                        ? 'w-2 bg-clinq-cyan-500'
                        : 'w-2 bg-white/20'
                  )}
                  title={step.title}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
