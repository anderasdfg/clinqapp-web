import api from '@/lib/api/axios-instance';
import { OrganizationModules } from '@/types/modules.types';

export interface CurrentOrganization {
  id: string;
  name: string;
  enabledModules?: OrganizationModules | null;
}

class OrganizationService {
  async getCurrentOrganization(): Promise<CurrentOrganization> {
    const response = await api.get('/organization');
    return response.data;
  }

  async getEnabledModules(): Promise<OrganizationModules | null> {
    try {
      const response = await api.get('/organization/current/modules');
      return response.data.enabledModules;
    } catch (error) {
      console.error('Error fetching enabled modules:', error);
      return null;
    }
  }
}

export const organizationService = new OrganizationService();
