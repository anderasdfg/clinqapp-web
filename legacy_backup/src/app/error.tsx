'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Application error', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-clinq-purple-900">
      <div className="text-center space-y-6 px-4">
        <h2 className="text-2xl font-bold text-white">Algo salió mal</h2>
        <p className="text-white/70 max-w-md">
          Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
        </p>
        <Button onClick={reset} className="btn-clinq">
          Intentar de nuevo
        </Button>
      </div>
    </div>
  );
}
