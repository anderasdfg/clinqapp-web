import axios from 'axios';
import { AppConfig } from '../lib/config/app.config';
import { OrganizationModules } from '@/types/modules.types';
import { supabase } from '@/lib/supabase/client';

const API_URL = AppConfig.apiUrl;

// Create axios instance with auth interceptor
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export interface CurrentOrganization {
  id: string;
  name: string;
  enabledModules?: OrganizationModules | null;
}

class OrganizationService {
  async getCurrentOrganization(): Promise<CurrentOrganization> {
    const response = await axiosInstance.get(`${API_URL}/organization`);
    return response.data;
  }

  async getEnabledModules(): Promise<OrganizationModules | null> {
    try {
      console.log('📡 getEnabledModules - Calling API...');
      const response = await axiosInstance.get(`${API_URL}/organization/current/modules`);
      console.log('📡 getEnabledModules - Response:', response.data);
      console.log('📡 getEnabledModules - enabledModules:', response.data.enabledModules);
      return response.data.enabledModules;
    } catch (error) {
      console.error('❌ Error fetching enabled modules:', error);
      return null;
    }
  }
}

export const organizationService = new OrganizationService();
