// src/components/onboarding/StepWrapper.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { cn } from '@/lib/utils';

interface StepWrapperProps {
  children: React.ReactNode;
  onNext?: () => Promise<boolean> | boolean;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  isLastStep?: boolean;
  className?: string;
}

export function StepWrapper({
  children,
  onNext,
  onBack,
  nextLabel = 'Continuar',
  backLabel = 'Atrás',
  showBack = true,
  showNext = true,
  isLastStep = false,
  className,
}: StepWrapperProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { currentStep, nextStep, prevStep } = useOnboardingStore();

  const handleNext = async () => {
    setIsLoading(true);
    try {
      if (onNext) {
        const canProceed = await onNext();
        if (canProceed && !isLastStep) {
          nextStep();
        }
        // If it's the last step, don't call nextStep - let the parent handle completion
      } else if (!isLastStep) {
        nextStep();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    prevStep();
  };

  return (
    <div className={cn('animate-fade-in', className)} data-step-wrapper>
      <Card className="glass-dark border-clinq-cyan-500/30 p-8">
        {children}
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        {showBack && currentStep > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
            className="border-clinq-cyan-500/50 bg-clinq-cyan-500 text-white hover:bg-clinq-cyan-500/10"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        ) : (
          <div />
        )}

        {showNext && (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="bg-clinq-gradient hover:opacity-90 text-white ml-auto"
          >
            {isLoading ? (
              'Procesando...'
            ) : isLastStep ? (
              'Finalizar'
            ) : (
              <>
                {nextLabel}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
