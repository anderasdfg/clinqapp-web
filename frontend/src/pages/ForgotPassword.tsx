import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthService } from '@/services/auth.service';
import { ValidationMessages } from '@/lib/constants/messages';
import logoIcon from '@/assets/images/logos/logo-icon.png';

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, ValidationMessages.EMAIL_REQUIRED)
    .email(ValidationMessages.EMAIL_INVALID),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

const ForgotPassword = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await AuthService.requestPasswordReset(data.email);
      if (result.success) {
        setSuccessMessage(
          result.message ||
            'Si el correo existe, te enviamos un enlace para restablecer tu contraseña.',
        );
      } else {
        setError(result.error || 'No se pudo enviar el correo de recuperación');
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
            Recuperar contraseña
          </h1>
          <p className="text-sm text-[rgb(var(--text-secondary))] text-center mt-2">
            Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm" role="alert">
            {error}
          </div>
        )}
        {successMessage && (
          <div
            className="mb-4 p-3 rounded-lg bg-success/10 text-success text-sm"
            role="status"
            aria-live="polite"
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Correo Electrónico"
            type="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="tu@correo.com…"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Enviar enlace
          </Button>
        </form>

        <p className="text-center text-sm text-[rgb(var(--text-secondary))] mt-6">
          <Link to="/app/login" className="text-primary font-medium hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
