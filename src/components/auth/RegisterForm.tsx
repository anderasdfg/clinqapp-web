// src/components/auth/RegisterForm.tsx
'use client';

import { FormEvent, useState } from 'react';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Props for RegisterForm component
 */
export interface RegisterFormProps {
  onSuccess?: (data: { email: string }) => void | Promise<void>;
  className?: string;
}

/**
 * RegisterForm Component
 * Handles user registration with validation and accessibility
 *
 * Features:
 * - Real-time validation
 * - Password visibility toggle
 * - Loading states
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Toast notifications
 * - Duplicate email/DNI detection
 *
 * @param props - Component properties
 * @returns Rendered registration form
 */
export function RegisterForm({ onSuccess, className }: RegisterFormProps) {
  const router = useRouter();
  const {
    formData,
    isLoading,
    errors,
    handleInputChange,
    handleInputBlur,
    handleSubmit,
  } = useRegisterForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Handles form submission
   */
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await handleSubmit(async (data) => {
      if (onSuccess) {
        await onSuccess({ email: data.email });
      }
    });

    if (result.success) {
      toast.success(result.message || 'Registro exitoso', {
        /* description: 'Por favor, verifica tu correo electrónico para activar tu cuenta.', */
        duration: 6000,
      });

      // Redirect to verification page
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
    } else {
      toast.error(result.error || 'Error en el registro', {
        duration: 5000,
      });
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-5', className)}
      noValidate
      aria-label="Formulario de registro"
    >
      {/* Full Name Field */}
      <div className="space-y-2">
        <Label
          htmlFor="fullName"
          className={cn(
            'text-sm font-medium text-white',
            errors.fullName && 'text-destructive'
          )}
        >
          Nombre Completo
        </Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Juan Pérez García"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          onBlur={() => handleInputBlur('fullName')}
          disabled={isLoading}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          className={cn(
            'transition-all text-white bg-white/5',
            errors.fullName && 'border-destructive focus-visible:ring-destructive/20'
          )}
        />
        {errors.fullName && (
          <p
            id="fullName-error"
            className="text-sm text-destructive animate-fade-in"
            role="alert"
          >
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className={cn(
            'text-sm font-medium text-white',
            errors.email && 'text-destructive'
          )}
        >
          Correo Electrónico
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          onBlur={() => handleInputBlur('email')}
          disabled={isLoading}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={cn(
            'transition-all text-white bg-white/5',
            errors.email && 'border-destructive focus-visible:ring-destructive/20'
          )}
        />
        {errors.email && (
          <p
            id="email-error"
            className="text-sm text-destructive animate-fade-in"
            role="alert"
          >
            {errors.email}
          </p>
        )}
      </div>

      {/* DNI Field */}
      <div className="space-y-2">
        <Label
          htmlFor="dni"
          className={cn(
            'text-sm font-medium text-white',
            errors.dni && 'text-destructive'
          )}
        >
          DNI
        </Label>
        <Input
          id="dni"
          name="dni"
          type="text"
          autoComplete="off"
          placeholder="12345678"
          maxLength={8}
          value={formData.dni}
          onChange={(e) => {
            // Only allow numbers
            const value = e.target.value.replace(/\D/g, '');
            handleInputChange('dni', value);
          }}
          onBlur={() => handleInputBlur('dni')}
          disabled={isLoading}
          aria-invalid={!!errors.dni}
          aria-describedby={errors.dni ? 'dni-error' : undefined}
          className={cn(
            'transition-all text-white bg-white/5',
            errors.dni && 'border-destructive focus-visible:ring-destructive/20'
          )}
        />
        {errors.dni && (
          <p
            id="dni-error"
            className="text-sm text-destructive animate-fade-in"
            role="alert"
          >
            {errors.dni}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className={cn(
            'text-sm font-medium text-white',
            errors.password && 'text-destructive'
          )}
        >
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleInputBlur('password')}
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={cn(
              'pr-10 transition-all text-white bg-white/5',
              errors.password && 'border-destructive focus-visible:ring-destructive/20'
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={isLoading}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'text-white/60 hover:text-white',
              'transition-colors focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring rounded p-1',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p
            id="password-error"
            className="text-sm text-destructive animate-fade-in"
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label
          htmlFor="confirmPassword"
          className={cn(
            'text-sm font-medium text-white',
            errors.confirmPassword && 'text-destructive'
          )}
        >
          Confirmar Contraseña
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            onBlur={() => handleInputBlur('confirmPassword')}
            disabled={isLoading}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            className={cn(
              'pr-10 transition-all text-white bg-white/5',
              errors.confirmPassword && 'border-destructive focus-visible:ring-destructive/20'
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            disabled={isLoading}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'text-white/60 hover:text-white',
              'transition-colors focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring rounded p-1',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p
            id="confirmPassword-error"
            className="text-sm text-destructive animate-fade-in"
            role="alert"
          >
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full btn-clinq"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Crear Cuenta
          </>
        )}
      </Button>

      {/* Terms and Privacy */}
      <p className="text-xs text-white/60 text-center">
        Al registrarte, aceptas nuestros{' '}
        <a href="/terms" className="text-clinq-cyan-500 hover:underline">
          Términos de Servicio
        </a>{' '}
        y{' '}
        <a href="/privacy" className="text-clinq-cyan-500 hover:underline">
          Política de Privacidad
        </a>
      </p>
    </form>
  );
}
