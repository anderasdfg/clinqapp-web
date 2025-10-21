import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/ui/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-clinq-purple-900 flex flex-col">


      {/* Main Content - Login Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">

        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/*  <div className="flex justify-center w-full">
            <Logo size="lg" variant="white" />
          </div> */}
          {/* Decorative Gradient Badge */}
          <div className="text-center">
            <div className="relative inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 text-sm text-clinq-cyan-500 mb-6">
              <div className="absolute inset-0 -z-10 rounded-full bg-clinq-gradient opacity-20 blur-xl animate-pulse-glow"></div>
              <Logo size="lg" variant="white" />
            </div>
          </div>

          {/* Login Card */}
          <Card className="glass-dark border-clinq-cyan-500/30 shadow-2xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white text-center">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-white/70 text-center">
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>

          {/* Additional Links */}
          <div className="text-center space-y-4">
            <p className="text-white/70 text-sm">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/register"
                className="text-clinq-cyan-500 hover:text-clinq-cyan-400 font-medium transition-colors underline-offset-4 hover:underline"
              >
                Regístrate gratis
              </Link>
            </p>
            <p className="text-white/60 text-sm">
              <Link
                href="/forgot-password"
                className="hover:text-clinq-cyan-500 transition-colors underline-offset-4 hover:underline"
              >
                ¿Olvidaste tu contraseña?
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
