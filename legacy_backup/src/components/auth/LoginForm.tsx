// src/components/auth/LoginForm.tsx
'use client';

import { FormEvent } from 'react';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoginForm } from '@/hooks/useLoginForm';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';

/**
 * Props for LoginForm component
 * Following Interface Segregation Principle - minimal interface
 */
export interface LoginFormProps {
  onSuccess?: (data: { email: string; password: string }) => void | Promise<void>;
  className?: string;
}

/**
 * LoginForm Component
 * Handles user authentication with validation and accessibility
 *
 * Features:
 * - Real-time validation
 * - Password visibility toggle
 * - Loading states
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Toast notifications
 *
 * @param props - Component properties
 * @returns Rendered login form
 */
export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const router = useRouter();
  const {
    formData,
    isLoading,
    errors,
    handleInputChange,
    handleInputBlur,
    handleSubmit,
  } = useLoginForm();

  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handles form submission
   * Prevents default browser behavior and delegates to hook
   */
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await handleSubmit(async (data) => {
      if (onSuccess) {
        await onSuccess(data);
      }
    });

    if (result.success) {
      toast.success(result.message || 'Inicio de sesión exitoso');

      // Check if user needs onboarding
      const needsOnboarding = await AuthService.needsOnboarding();

      if (needsOnboarding) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } else {
      toast.error(result.error || 'Error en el login');
    }
  };

  /**
   * Toggles password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-6', className)}
      noValidate
      aria-label="Formulario de inicio de sesión"
    >
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
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
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
            onClick={togglePasswordVisibility}
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
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
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
            Iniciando sesión...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Iniciar Sesión
          </>
        )}
      </Button>
    </form>
  );
}
