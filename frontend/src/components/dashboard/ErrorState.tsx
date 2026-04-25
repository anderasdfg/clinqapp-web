import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertCircle className="w-12 h-12 text-destructive/50" />
      <p className="text-[rgb(var(--text-secondary))]">{message}</p>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCcw className="w-4 h-4" /> Reintentar
      </Button>
    </div>
  );
}
