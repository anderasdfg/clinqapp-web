// src/app/register/page.tsx
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Register Page Component
 * Provides the registration interface for the ClinqApp application
 *
 * Features:
 * - Centered layout with brand consistency
 * - Responsive design
 * - Link to login page
 * - Back to home navigation
 * - Email verification flow
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-clinq-purple-900 flex flex-col">
      {/* Header with Logo and Back Button */}
      {/*  <header className="border-b border-clinq-cyan-500/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="lg" variant="white" />
            <Button
              variant="ghost"
              className="text-white hover:bg-clinq-cyan-500/10 hover:text-clinq-cyan-500 transition-all"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </div>
      </header> */}

      {/* Main Content - Register Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Decorative Gradient Badge */}
          <div className="text-center">
            <div className="relative inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 text-sm text-clinq-cyan-500 mb-6">
              <div className="absolute inset-0 -z-10 rounded-full bg-clinq-gradient opacity-20 blur-xl animate-pulse-glow"></div>
              <span>Comienza gratis por 30 días</span>
            </div>
          </div>

          {/* Register Card */}
          <Card className="glass-dark border-clinq-cyan-500/30 shadow-2xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white text-center">
                Crear Cuenta
              </CardTitle>
              <CardDescription className="text-white/70 text-center">
                Completa tus datos para comenzar a usar ClinqApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />
            </CardContent>
          </Card>

          {/* Additional Links */}
          <div className="text-center space-y-4">
            <p className="text-white/70 text-sm">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/login"
                className="text-clinq-cyan-500 hover:text-clinq-cyan-400 font-medium transition-colors underline-offset-4 hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
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
