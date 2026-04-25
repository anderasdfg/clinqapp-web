import axios from 'axios';
import { AppConfig } from '../config/app.config';
import { supabase } from '../supabase/client';

/**
 * Centralized axios instance with authentication interceptor
 * All services should use this instance instead of creating their own
 */
const api = axios.create({
  baseURL: AppConfig.apiUrl,
});

/**
 * Request interceptor: Add auth token to all requests
 */
api.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle common errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - could redirect to login if needed
    if (error.response?.status === 401) {
      console.error('Unauthorized request - session may have expired');
      // Optional: redirect to login or refresh token
    }
    
    return Promise.reject(error);
  }
);

export default api;
