'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';
import { Routes } from '@/lib/constants/routes';
import Link from 'next/link';

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Login page error', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-clinq-purple-900">
      <div className="text-center space-y-6 px-4 max-w-md">
        <h2 className="text-2xl font-bold text-white">Error en Inicio de Sesión</h2>
        <p className="text-white/70">
          Hubo un problema al cargar la página de inicio de sesión. Por favor, intenta nuevamente.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} className="btn-clinq">
            Reintentar
          </Button>
          <Link href={Routes.PUBLIC.HOME}>
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
