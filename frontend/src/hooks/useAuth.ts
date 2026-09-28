/**
 * useAuth Hook
 * Centralized authentication logic for login and registration
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/auth.service";
import { resetAllStores } from "@/lib/utils/store-utils";
import { setAccessToken } from "@/lib/auth/access-token";
import type { LoginFormData, RegisterFormData } from "@/types/auth.types";

interface UseAuthReturn {
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearError = () => setError(null);

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await AuthService.login(data);

      if (!result.success) {
        setError(result.error || "Error al iniciar sesión");
        return;
      }

      // Check if user needs onboarding
      const needsOnboarding = await AuthService.needsOnboarding();
      navigate(needsOnboarding ? "/app/onboarding" : "/app/dashboard");
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await AuthService.register(data);

      if (!result.success) {
        setError(result.error || "Error al registrarse");
        return;
      }

      setSuccessMessage(result.message || "Cuenta creada exitosamente");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/app/login");
      }, 3000);
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setAccessToken(null);
      resetAllStores();
      navigate("/app/login", { replace: true });
      await AuthService.logout();
    } catch (err) {
      setError("Error al cerrar sesión");
      navigate("/app/login", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    isLoading,
    error,
    successMessage,
    clearError,
  };
};
