import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import type { DashboardStats } from '@/types/dashboard.types';

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.getStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError('No se pudieron cargar las estadísticas.');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
