'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';
import { Routes } from '@/lib/constants/routes';
import Link from 'next/link';

export default function RegisterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Register page error', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-clinq-purple-900">
      <div className="text-center space-y-6 px-4 max-w-md">
        <h2 className="text-2xl font-bold text-white">Error en Registro</h2>
        <p className="text-white/70">
          Hubo un problema al cargar la página de registro. Por favor, intenta nuevamente.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} className="btn-clinq">
            Reintentar
          </Button>
          <Link href={Routes.AUTH.LOGIN}>
            <Button variant="outline">Ir a Inicio de Sesión</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
