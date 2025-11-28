// src/app/onboarding/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { UserProfile } from '@/components/layout/UserProfile';

/**
 * Onboarding Page
 * Users choose how they want to start using ClinqApp
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<'create' | 'join' | null>(null);

  const handleCreateConsultorio = () => {
    router.push('/onboarding/create');
  };

  const handleJoinConsultorio = () => {
    // TODO: Implementar en Fase 3 (Invitaciones)
    // Por ahora, muestra un mensaje
    toast('Esta funcionalidad estará disponible pronto. Por ahora, crea tu consultorio.');
  };

  return (
    <div className="min-h-screen bg-clinq-purple-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-clinq-cyan-500/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="lg" variant="white" />
          <UserProfile />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8 animate-fade-in">
          {/* Welcome Message */}
          <div className="text-center space-y-4">
            <div className="relative inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 text-sm text-clinq-cyan-500 mb-4">
              <div className="absolute inset-0 -z-10 rounded-full bg-clinq-gradient opacity-20 blur-xl animate-pulse-glow"></div>
              <span>¡Cuenta creada exitosamente!</span>
            </div>

            <h1 className="text-4xl font-bold text-white">
              ¡Bienvenido a ClinqApp! 🎉
            </h1>
            <p className="text-xl text-white/70">
              ¿Cómo quieres empezar?
            </p>
          </div>

          {/* Options */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Option 1: Create Consultorio */}
            <Card
              className={cn(
                'glass-dark border-clinq-cyan-500/30 cursor-pointer transition-all hover:scale-105 hover:border-clinq-cyan-500',
                selectedOption === 'create' && 'ring-2 ring-clinq-cyan-500 scale-105'
              )}
              onClick={() => setSelectedOption('create')}
            >
              <CardHeader className="text-center space-y-4 pb-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-clinq-gradient flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">
                  Crear mi primer consultorio
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-white/70 text-base">
                  Configura tu propio consultorio o clínica desde cero
                </CardDescription>

                <ul className="mt-6 space-y-2 text-sm text-white/60 text-left">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-clinq-cyan-500"></div>
                    Gestiona tu agenda
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-clinq-cyan-500"></div>
                    Organiza tus pacientes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-clinq-cyan-500"></div>
                    Invita a tu equipo más adelante
                  </li>
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateConsultorio();
                  }}
                  className={cn(
                    'w-full mt-6 px-6 py-3 rounded-lg font-medium transition-all',
                    'bg-clinq-gradient hover:opacity-90',
                    'text-white'
                  )}
                >
                  Comenzar
                </button>
              </CardContent>
            </Card>

            {/* Option 2: Join Consultorio */}
            <Card
              className={cn(
                'glass-dark border-clinq-cyan-500/30 cursor-pointer transition-all hover:scale-105 hover:border-clinq-cyan-500',
                selectedOption === 'join' && 'ring-2 ring-clinq-cyan-500 scale-105'
              )}
              onClick={() => setSelectedOption('join')}
            >
              <CardHeader className="text-center space-y-4 pb-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-clinq-gradient flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">
                  Unirme a un consultorio
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-white/70 text-base">
                  Tengo un código de invitación de mi equipo
                </CardDescription>

                <ul className="mt-6 space-y-2 text-sm text-white/60 text-left">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-clinq-magenta-500"></div>
                    Únete al consultorio de tu equipo
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-clinq-magenta-500"></div>
                    Accede a pacientes compartidos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-clinq-magenta-500"></div>
                    Colabora con tu equipo
                  </li>
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinConsultorio();
                  }}
                  className={cn(
                    'w-full mt-6 px-6 py-3 rounded-lg font-medium transition-all',
                    'border-2 border-clinq-magenta-500 text-clinq-magenta-500',
                    'hover:bg-clinq-magenta-500 hover:text-white'
                  )}
                >
                  Ingresar código
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Footer Note */}
          <p className="text-center text-sm text-white/50">
            Puedes cambiar esta configuración más adelante desde tu panel de control
          </p>
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
