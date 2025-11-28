import { Button } from '@/components/ui/Button';

interface StepNavigationProps {
    onBack: () => void;
    onNext: () => void;
    nextLabel?: string;
    backLabel?: string;
}

export const StepNavigation = ({
    onBack,
    onNext,
    nextLabel = 'Continuar',
    backLabel = 'Atrás'
}: StepNavigationProps) => (
    <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
            {backLabel}
        </Button>
        <Button onClick={onNext} className="flex-1">
            {nextLabel}
        </Button>
    </div>
);
