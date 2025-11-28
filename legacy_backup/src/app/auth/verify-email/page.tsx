// src/app/auth/verify-email/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/services/auth.service';
import { toast } from 'sonner';

/**
 * Email Verification Page Component
 * Shows instructions to verify email after registration
 */
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email || isResending || resendCooldown > 0) return;

    setIsResending(true);

    try {
      const result = await AuthService.resendVerificationEmail(email);

      if (result.success) {
        toast.success('Correo reenviado', {
          description: 'Por favor, revisa tu bandeja de entrada.',
        });
        setResendCooldown(60); // 60 seconds cooldown
      } else {
        toast.error(result.error || 'Error al reenviar el correo');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Ocurrió un error al reenviar el correo');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

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
          {/* Success Badge */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full glass-dark mb-4">
              <div className="absolute inset-0 -z-10 rounded-full bg-clinq-gradient opacity-20 blur-xl animate-pulse-glow"></div>
              <Mail className="h-8 w-8 text-clinq-cyan-500" />
            </div>
          </div>

          {/* Card */}
          <Card className="glass-dark border-clinq-cyan-500/30 shadow-2xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white text-center">
                Verifica tu correo electrónico
              </CardTitle>
              <CardDescription className="text-white/70 text-center">
                Hemos enviado un enlace de verificación a
              </CardDescription>
              <p className="text-clinq-cyan-500 font-medium text-center break-all">
                {email}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions */}
              <div className="space-y-4 text-white/80 text-sm">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-clinq-cyan-500 flex-shrink-0 mt-0.5" />
                  <p>
                    Abre el correo y haz clic en el enlace de verificación
                  </p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-clinq-cyan-500 flex-shrink-0 mt-0.5" />
                  <p>
                    Una vez verificado, podrás iniciar sesión en tu cuenta
                  </p>
                </div>
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-clinq-magenta-500 flex-shrink-0 mt-0.5" />
                  <p>
                    Revisa también tu carpeta de spam o correo no deseado
                  </p>
                </div>
              </div>

              {/* Resend Button */}
              <div className="space-y-3">
                <p className="text-white/70 text-sm text-center">
                  ¿No recibiste el correo?
                </p>
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCooldown > 0}
                  variant="outline"
                  className="w-full border-clinq-cyan-500 text-clinq-cyan-500 hover:bg-clinq-gradient hover:text-white hover:animate-glow"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Reenviando...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Espera ${resendCooldown}s para reenviar`
                  ) : (
                    'Reenviar correo'
                  )}
                </Button>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-white/70 hover:text-clinq-cyan-500 transition-colors"
                >
                  Volver al inicio de sesión
                </Link>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-clinq-purple-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-clinq-cyan-500" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
