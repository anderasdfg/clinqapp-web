import { 
  MessageSquare, 
  Settings, 
  Activity, 
  Clock, 
  BarChart3,
  Calendar,
  MessageCircle,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWhatsAppStats } from '../../hooks/useWhatsAppStats';
import { StatsCard } from '../../components/whatsapp/StatsCard';
import { OrganizationToggle } from '../../components/whatsapp/OrganizationToggle';
import { MessageForm } from '../../components/whatsapp/MessageForm';

export default function AdminWhatsApp() {
  const { stats, organizations, loading, error, toggleWhatsApp, clearError } = useWhatsAppStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recordatorios WhatsApp</h1>
          <p className="text-gray-600 mt-2">
            Gestiona la configuración de recordatorios WhatsApp para todas las organizaciones
          </p>
        </div>
        <Link
          to="/admin/whatsapp/conversations"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Ver Conversaciones
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="WhatsApp Activo"
          value={stats?.whatsappEnabled || 0}
          subtitle={`de ${stats?.totalOrganizations || 0} organizaciones`}
          icon={MessageSquare}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />

        <StatsCard
          title="Recordatorios (7d)"
          value={stats?.recentReminders || 0}
          trend={{ value: "+12%", isPositive: true }}
          icon={Calendar}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />

        <StatsCard
          title="Tasa de Éxito"
          value={`${stats?.successRate || 0}%`}
          subtitle="Mensajes entregados"
          icon={BarChart3}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />

        <StatsCard
          title="Horario Proceso"
          value="9:00"
          subtitle="AM Lima (diario)"
          icon={Clock}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Organizations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Configuración WhatsApp por Organización
          </h3>
          <span className="text-sm text-gray-500">
            {organizations.length} organizaciones
          </span>
        </div>
        
        <div className="space-y-4">
          {organizations.map((org) => (
            <OrganizationToggle
              key={org.id}
              organization={org}
              onToggle={toggleWhatsApp}
            />
          ))}
          
          {organizations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay organizaciones registradas</p>
            </div>
          )}
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Configuración del Sistema
          </h3>
          <Settings className="w-5 h-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">Horario de Envío</h4>
            </div>
            <p className="text-sm text-blue-700">
              Todos los días a las 9:00 AM (Lima)
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Recordatorios 24 horas antes de la cita
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">Template Twilio</h4>
            </div>
            <p className="text-sm text-green-700">
              Content SID: HX4277a2b...
            </p>
            <p className="text-xs text-green-600 mt-1">
              Variables: nombre, fecha, hora, clínica
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Activity className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-purple-900">Estado del Sistema</h4>
            </div>
            <p className="text-sm text-purple-700">
              Scheduler activo y funcionando
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Última verificación: hace 5 min
            </p>
          </div>
        </div>
      </div>

      {/* Send Message Section */}
      <MessageForm />

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm">{error}</p>
            <button
              onClick={clearError}
              className="ml-2 text-red-200 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
