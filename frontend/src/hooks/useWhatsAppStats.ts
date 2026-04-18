import { useState, useEffect } from 'react';
import { WhatsAppStats, Organization } from '../types/whatsapp';
import { adminApi } from './useAdminAuth';

export const useWhatsAppStats = () => {
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWhatsAppData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load dashboard stats
      const dashboardResponse = await adminApi.getDashboard();
      setStats({
        totalOrganizations: dashboardResponse.data.totalOrganizations,
        whatsappEnabled: dashboardResponse.data.whatsappEnabled,
        recentReminders: dashboardResponse.data.recentReminders,
        successRate: 95.2 // Mock data - could be calculated from actual data
      });

      // Load organizations with WhatsApp details
      const orgsResponse = await adminApi.getOrganizations({ limit: 100 });
      setOrganizations(orgsResponse.data.organizations);

    } catch (err: any) {
      setError(err.message || 'Error cargando datos de WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const toggleWhatsApp = async (orgId: string, enabled: boolean) => {
    try {
      await adminApi.updateOrganization(orgId, {
        notificationWhatsapp: enabled,
        sendReminders: enabled
      });
      
      // Refresh data
      await loadWhatsAppData();
    } catch (err: any) {
      setError(err.message || 'Error actualizando configuración de WhatsApp');
      throw err;
    }
  };

  useEffect(() => {
    loadWhatsAppData();
  }, []);

  return {
    stats,
    organizations,
    loading,
    error,
    loadWhatsAppData,
    toggleWhatsApp,
    clearError: () => setError('')
  };
};
