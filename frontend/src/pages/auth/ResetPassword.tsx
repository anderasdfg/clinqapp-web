import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthService } from '@/services/auth.service';
import { ValidationMessages } from '@/lib/constants/messages';
import { supabase } from '@/lib/supabase/client';
import logoIcon from '@/assets/images/logos/logo-icon.png';
import { Loader2 } from 'lucide-react';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, ValidationMessages.PASSWORD_TOO_SHORT)
      .max(128, ValidationMessages.PASSWORD_TOO_LONG),
    confirmPassword: z.string().min(1, ValidationMessages.PASSWORD_REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ValidationMessages.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let settled = false;
    const markReady = () => {
      settled = true;
      setReady(true);
      setChecking(false);
      setError(null);
    };
    const markInvalid = () => {
      setReady(false);
      setChecking(false);
      setError('El enlace no es válido o expiró. Solicita uno nuevo.');
    };

    const checkSession = async () => {
      const session = await AuthService.getSession();
      if (session) {
        markReady();
        return;
      }
      // Give Supabase a short window to hydrate recovery session from the URL hash
      await new Promise((r) => setTimeout(r, 800));
      if (settled) return;
      const retry = await AuthService.getSession();
      if (retry) markReady();
      else markInvalid();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
        markReady();
      }
    });

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.updatePassword(data.password);
      if (result.success) {
        const needsOnboarding = await AuthService.needsOnboarding();
        navigate(needsOnboarding ? '/app/onboarding' : '/app/dashboard');
      } else {
        setError(result.error || 'No se pudo actualizar la contraseña');
      }
    } catch {
      setError('Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-primary))] px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md card p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <img src={logoIcon} alt="ClinqApp" className="w-14 h-14 mb-3" />
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))] text-pretty">
            Nueva contraseña
          </h1>
          <p className="text-sm text-[rgb(var(--text-secondary))] text-center mt-2">
            Elige una contraseña segura para tu cuenta.
          </p>
        </div>

        {checking && (
          <div className="flex flex-col items-center gap-3 py-6" role="status" aria-live="polite">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-[rgb(var(--text-secondary))]">Verificando enlace…</p>
          </div>
        )}

        {!checking && error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm" role="alert">
            {error}
          </div>
        )}

        {!checking && ready && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nueva Contraseña"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirmar Contraseña"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Guardar contraseña
            </Button>
          </form>
        )}

        {!checking && !ready && (
          <p className="text-center text-sm text-[rgb(var(--text-secondary))]">
            <Link to="/forgot-password" className="text-primary font-medium hover:underline min-h-11 inline-flex items-center">
              Solicitar un nuevo enlace
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
