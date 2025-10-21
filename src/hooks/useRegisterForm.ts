// src/hooks/useRegisterForm.ts
'use client';

import { useState, useCallback } from 'react';
import type {
  RegisterFormData,
  RegisterFormErrors,
  RegisterFormState,
  RegisterResult,
} from '@/types/auth.types';
import { registerSchema } from '@/lib/validations/auth';
import { AuthService } from '@/services/auth.service';
import { ZodError } from 'zod';

/**
 * Custom hook for registration form management
 * Uses Zod for validation
 *
 * @returns Form state, handlers, and validation functions
 */
export function useRegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dni: '',
  });

  const [formState, setFormState] = useState<RegisterFormState>({
    isLoading: false,
    errors: {},
  });

  /**
   * Validates a single field using Zod
   */
  const validateField = useCallback(
    (fieldName: keyof RegisterFormData, value: string): string | undefined => {
      try {
        // For confirmPassword, we need to validate against the full form
        if (fieldName === 'confirmPassword') {
          registerSchema.parse({
            ...formData,
            confirmPassword: value,
          });
          return undefined;
        }

        // Validate just this field
        const fieldSchema = registerSchema.shape[fieldName];
        if (fieldSchema) {
          fieldSchema.parse(value);
        }
        return undefined;
      } catch (error) {
        if (error instanceof ZodError) {
          // Find error for this specific field
          const fieldError = error.issues.find(
            (issue) => issue.path[0] === fieldName
          );
          return fieldError?.message;
        }
        return undefined;
      }
    },
    [formData]
  );

  /**
   * Handles input changes with real-time error clearing
   */
  const handleInputChange = useCallback(
    (fieldName: keyof RegisterFormData, value: string) => {
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
    (fieldName: keyof RegisterFormData) => {
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
      registerSchema.parse(formData);
      setFormState((prev) => ({
        ...prev,
        errors: {},
      }));
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: RegisterFormErrors = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof RegisterFormData;
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
      onSuccess?: (data: RegisterFormData) => void | Promise<void>
    ): Promise<RegisterResult> => {
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
        const validatedData = registerSchema.parse(formData);

        // Call auth service
        const result = await AuthService.register(validatedData);

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
