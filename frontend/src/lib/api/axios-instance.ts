import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { AppConfig } from '../config/app.config';
import { supabase } from '../supabase/client';
import { resolveAccessToken } from '../auth/access-token';

export type ApiRequestConfig = InternalAxiosRequestConfig & {
  /** When true, response interceptor will not show an error toast */
  skipErrorToast?: boolean;
};

/**
 * Centralized axios instance with authentication interceptor
 * All services should use this instance instead of creating their own
 */
const api = axios.create({
  baseURL: AppConfig.apiUrl,
});

function getErrorMessage(error: AxiosError<any>): string {
  const data = error.response?.data;
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.message === 'string') return data.message;
  if (Array.isArray(data?.error)) return 'Solicitud inválida';
  if (error.message === 'Network Error') return 'No se pudo conectar con el servidor';
  return error.message || 'Ocurrió un error inesperado';
}

/**
 * Request interceptor: attach Bearer from memory cache.
 * Never await unbounded getSession() here — it deadlocks with auth locks.
 */
api.interceptors.request.use(
  async (config) => {
    const token = await resolveAccessToken(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token ?? null;
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: surface API errors with a visible toast
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const config = error.config as ApiRequestConfig | undefined;

    if (!axios.isCancel(error) && !config?.skipErrorToast) {
      toast.error(getErrorMessage(error));
    }

    if (error.response?.status === 401) {
      console.error('Unauthorized request - session may have expired');
    }

    return Promise.reject(error);
  }
);

export default api;
