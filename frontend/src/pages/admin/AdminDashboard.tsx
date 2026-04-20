import { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { adminApi } from '../../hooks/useAdminAuth';

interface DashboardStats {
  totalOrganizations: number;
  whatsappEnabled: number;
  recentReminders: number;
  totalUsers: number;
  organizationsByPlan: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboard();
      setStats(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Clientes Activos',
      value: stats?.totalOrganizations || 0,
      icon: Building2,
      color: 'bg-blue-500',
      description: 'Organizaciones registradas'
    },
    {
      name: 'Automatización Activa',
      value: stats?.whatsappEnabled || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      description: 'Con recordatorios automáticos'
    },
    {
      name: 'Mensajes Enviados',
      value: stats?.recentReminders || 0,
      icon: BarChart3,
      color: 'bg-indigo-500',
      description: 'Últimos 7 días'
    },
    {
      name: 'Usuarios Totales',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-purple-500',
      description: 'Personal médico activo'
    }
  ];

  const planColors: Record<string, string> = {
    FREE_TRIAL: 'bg-gray-500',
    BASIC: 'bg-blue-500',
    PROFESSIONAL: 'bg-green-500',
    ENTERPRISE: 'bg-purple-500'
  };

  const planNames: Record<string, string> = {
    FREE_TRIAL: 'Prueba Gratuita',
    BASIC: 'Básico',
    PROFESSIONAL: 'Profesional',
    ENTERPRISE: 'Empresarial'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resumen Ejecutivo</h1>
        <p className="text-gray-600 mt-2">
          Métricas principales de ClinqApp
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizations by Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Organizaciones por Plan
          </h3>
          <div className="space-y-4">
            {Object.entries(stats?.organizationsByPlan || {}).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${planColors[plan]} mr-3`}></div>
                  <span className="text-sm font-medium text-gray-900">
                    {planNames[plan] || plan}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-900 mr-2">{count}</span>
                  <span className="text-xs text-gray-500">
                    ({((count / (stats?.totalOrganizations || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estado WhatsApp
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">Habilitado</p>
                  <p className="text-xs text-green-600">Organizaciones activas</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-900">
                {stats?.whatsappEnabled || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Deshabilitado</p>
                  <p className="text-xs text-gray-600">Organizaciones inactivas</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {(stats?.totalOrganizations || 0) - (stats?.whatsappEnabled || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Actividad Reciente
          </h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                {stats?.recentReminders || 0} recordatorios WhatsApp enviados
              </p>
              <p className="text-xs text-blue-600">En los últimos 7 días</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900">
                Centro de comunicaciones activo
              </p>
              <p className="text-xs text-purple-600">Monitoreo de conversaciones disponible</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <Building2 className="w-5 h-5 text-green-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Sistema funcionando correctamente
              </p>
              <p className="text-xs text-green-600">Todas las organizaciones operativas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
