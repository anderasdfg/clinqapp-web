// src/app/onboarding/create/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';
import { Step1BasicData } from '@/components/onboarding/steps/Step1BasicData';
import { Step2BusinessHours } from '@/components/onboarding/steps/Step2BusinessHours';
import { Step3PaymentMethods } from '@/components/onboarding/steps/Step3PaymentMethods';
import { Step4ConsultationTypes } from '@/components/onboarding/steps/Step4ConsultationTypes';
import { Step5Services } from '@/components/onboarding/steps/Step5Services';
import { Step6ScheduleConfig } from '@/components/onboarding/steps/Step6ScheduleConfig';
import { Step7Notifications } from '@/components/onboarding/steps/Step7Notifications';
import { Step8InviteTeam } from '@/components/onboarding/steps/Step8InviteTeam';
import { Step9Summary } from '@/components/onboarding/steps/Step9Summary';
import { toast } from 'sonner';

export default function CreateOnboardingPage() {
  const router = useRouter();
  const { currentStep, reset } = useOnboardingStore();
  const [isCompleting, setIsCompleting] = React.useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      const store = useOnboardingStore.getState();

      // Build complete data
      const completeData = {
        basicData: store.basicData,
        businessHours: store.businessHours,
        paymentMethods: store.paymentMethods,
        consultationTypes: store.consultationTypes,
        services: store.services,
        scheduleConfig: store.scheduleConfig,
        notifications: store.notifications,
        invitations: store.invitations,
      };

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al completar el onboarding');
      }

      toast.success('¡Onboarding completado exitosamente!');

      // Clear onboarding data
      reset();

      // Redirect to dashboard
      router.push('/dashboard');
      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al completar el onboarding'
      );
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1BasicData />;
      case 1:
        return <Step2BusinessHours />;
      case 2:
        return <Step3PaymentMethods />;
      case 3:
        return <Step4ConsultationTypes />;
      case 4:
        return <Step5Services />;
      case 5:
        return <Step6ScheduleConfig />;
      case 6:
        return <Step7Notifications />;
      case 7:
        return <Step8InviteTeam />;
      case 8:
        return <Step9Summary onComplete={handleComplete} />;
      default:
        return <Step1BasicData />;
    }
  };

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-clinq-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-clinq-cyan-500 border-t-transparent mb-4"></div>
          <p className="text-white text-lg">Configurando tu consultorio...</p>
        </div>
      </div>
    );
  }

  return <OnboardingStepper onComplete={handleComplete}>{renderStep()}</OnboardingStepper>;
}
