'use client';

import { useState, useCallback } from 'react';
import type {
  LoginFormData,
  LoginFormErrors,
  LoginFormState,
  LoginResult,
} from '@/types/auth.types';
import { loginSchema } from '@/lib/validations/auth';
import { AuthService } from '@/services/auth.service';
import { ZodError } from 'zod';

/**
 * Custom hook for login form management
 * Uses Zod for validation
 *
 * @returns Form state, handlers, and validation functions
 */
export function useLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [formState, setFormState] = useState<LoginFormState>({
    isLoading: false,
    errors: {},
  });

  /**
   * Validates a single field using Zod
   */
  const validateField = useCallback(
    (fieldName: keyof LoginFormData, value: string): string | undefined => {
      try {
        // Validate just this field
        const fieldSchema = loginSchema.shape[fieldName];
        fieldSchema.parse(value);
        return undefined;
      } catch (error) {
        if (error instanceof ZodError) {
          return error.issues[0]?.message;
        }
        return undefined;
      }
    },
    []
  );

  /**
   * Handles input changes with real-time error clearing
   */
  const handleInputChange = useCallback(
    (fieldName: keyof LoginFormData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      // Clear error for this field when user starts typing
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: undefined,
        },
      }));
    },
    []
  );

  /**
   * Handles input blur for field-level validation
   */
  const handleInputBlur = useCallback(
    (fieldName: keyof LoginFormData) => {
      const error = validateField(fieldName, formData[fieldName]);

      if (error) {
        setFormState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [fieldName]: error,
          },
        }));
      }
    },
    [formData, validateField]
  );

  /**
   * Validates the entire form using Zod
   */
  const validateForm = useCallback((): boolean => {
    try {
      loginSchema.parse(formData);
      setFormState((prev) => ({
        ...prev,
        errors: {},
      }));
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: LoginFormErrors = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof LoginFormData;
          errors[field] = issue.message;
        });
        setFormState((prev) => ({
          ...prev,
          errors,
        }));
      }
      return false;
    }
  }, [formData]);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(
    async (
      onSuccess?: (data: LoginFormData) => void | Promise<void>
    ): Promise<LoginResult> => {
      // Validate form
      if (!validateForm()) {
        return {
          success: false,
          error: 'Por favor, corrige los errores en el formulario',
        };
      }

      // Set loading state
      setFormState((prev) => ({
        ...prev,
        isLoading: true,
      }));

      try {
        // Parse and transform data with Zod
        const validatedData = loginSchema.parse(formData);

        // Call auth service
        const result = await AuthService.login(validatedData);

        // Handle success
        if (result.success && onSuccess) {
          await onSuccess(validatedData);
        }

        return result;
      } catch (error) {
        if (error instanceof ZodError) {
          return {
            success: false,
            error: 'Error de validación',
          };
        }
        return {
          success: false,
          error: 'Ocurrió un error inesperado',
        };
      } finally {
        setFormState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    },
    [formData, validateForm]
  );

  return {
    formData,
    isLoading: formState.isLoading,
    errors: formState.errors,
    handleInputChange,
    handleInputBlur,
    handleSubmit,
  };
}
