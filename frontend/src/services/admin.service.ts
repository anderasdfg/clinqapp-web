import axios from 'axios';
import { AppConfig } from '../lib/config/app.config';
import { OrganizationModules } from '@/types/modules.types';

const API_URL = AppConfig.apiUrl;

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  sendReminders: boolean;
  notificationWhatsapp: boolean;
  enabledModules?: OrganizationModules | null;
  createdAt: string;
  _count?: {
    users: number;
    patients: number;
    appointments: number;
  };
}

export interface UpdateOrganizationData {
  sendReminders?: boolean;
  notificationWhatsapp?: boolean;
  subscriptionPlan?: 'FREE_TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
  subscriptionStatus?: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING';
}

class AdminService {
  private getAuthHeader() {
    const token = localStorage.getItem('admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getOrganizations(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const response = await axios.get(`${API_URL}/admin/organizations`, {
      params,
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async getOrganization(id: string) {
    const response = await axios.get(`${API_URL}/admin/organizations/${id}`, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async updateOrganization(id: string, data: UpdateOrganizationData) {
    const response = await axios.put(
      `${API_URL}/admin/organizations/${id}`,
      data,
      {
        headers: this.getAuthHeader(),
      }
    );
    return response.data;
  }

  async updateOrganizationModules(id: string, enabledModules: OrganizationModules) {
    const response = await axios.put(
      `${API_URL}/admin/organizations/${id}/modules`,
      { enabledModules },
      {
        headers: this.getAuthHeader(),
      }
    );
    return response.data;
  }

  async getOrganizationReminderStats(id: string, days: number = 30) {
    const response = await axios.get(
      `${API_URL}/admin/organizations/${id}/reminder-stats`,
      {
        params: { days },
        headers: this.getAuthHeader(),
      }
    );
    return response.data;
  }
}

export const adminService = new AdminService();
