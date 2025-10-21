// src/app/auth/error/page.tsx
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Auth Error Page
 * Displays authentication errors
 */
export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-clinq-purple-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-clinq-cyan-500/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Logo size="lg" variant="white" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Error Icon */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full glass-dark mb-4">
              <div className="absolute inset-0 -z-10 rounded-full bg-destructive/20 blur-xl"></div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          {/* Card */}
          <Card className="glass-dark border-clinq-cyan-500/30 shadow-2xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white text-center">
                Error de autenticación
              </CardTitle>
              <CardDescription className="text-white/70 text-center">
                Ocurrió un problema al verificar tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Message */}
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-sm text-white/80 text-center">
                  El enlace de verificación puede haber expirado o ser inválido.
                  Por favor, solicita un nuevo enlace de verificación.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  className="w-full btn-clinq"
                  asChild
                >
                  <Link href="/login">
                    Volver al inicio de sesión
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-clinq-cyan-500 text-clinq-cyan-500 hover:bg-clinq-cyan-500 hover:text-white"
                  asChild
                >
                  <Link href="/register">
                    Crear nueva cuenta
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-clinq-cyan-500/20 py-6">
        <div className="container mx-auto px-4">
          <p className="text-white/60 text-sm text-center">
            © 2025 ClinqApp. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
