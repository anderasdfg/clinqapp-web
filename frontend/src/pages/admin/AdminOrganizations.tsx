import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  MessageSquare, 
  Users, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react';
import { adminApi } from '../../hooks/useAdminAuth';

interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  sendReminders: boolean;
  notificationWhatsapp: boolean;
  reminderHoursBefore: number;
  createdAt: string;
  _count: {
    users: number;
    patients: number;
    appointments: number;
  };
}

interface OrganizationsResponse {
  organizations: Organization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminOrganizations() {
  const [data, setData] = useState<OrganizationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, [currentPage, search]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getOrganizations({
        page: currentPage,
        limit: 20,
        search: search || undefined
      });
      setData(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadOrganizations();
  };

  const handleEditOrganization = (org: Organization) => {
    setSelectedOrg(org);
    setShowEditModal(true);
  };

  const planColors: Record<string, string> = {
    FREE_TRIAL: 'bg-gray-100 text-gray-800',
    BASIC: 'bg-blue-100 text-blue-800',
    PROFESSIONAL: 'bg-green-100 text-green-800',
    ENTERPRISE: 'bg-purple-100 text-purple-800'
  };

  const planNames: Record<string, string> = {
    FREE_TRIAL: 'Prueba',
    BASIC: 'Básico',
    PROFESSIONAL: 'Profesional',
    ENTERPRISE: 'Empresarial'
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    TRIALING: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800',
    PAST_DUE: 'bg-orange-100 text-orange-800'
  };

  const statusNames: Record<string, string> = {
    ACTIVE: 'Activo',
    TRIALING: 'Prueba',
    CANCELLED: 'Cancelado',
    PAST_DUE: 'Vencido'
  };

  if (loading && !data) {
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
          <h1 className="text-3xl font-bold text-gray-900">Organizaciones</h1>
          <p className="text-gray-600 mt-2">
            Gestiona todas las organizaciones del sistema
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WhatsApp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuarios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pacientes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.organizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">{org.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${planColors[org.subscriptionPlan]}`}>
                        {planNames[org.subscriptionPlan]}
                      </span>
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[org.subscriptionStatus]}`}>
                          {statusNames[org.subscriptionStatus]}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {org.sendReminders && org.notificationWhatsapp ? (
                        <div className="flex items-center text-green-600">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          <span className="text-sm">Activo</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          <span className="text-sm">Inactivo</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {org._count.users}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {org._count.patients}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditOrganization(org)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        title="Configurar"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(data.pagination.pages, currentPage + 1))}
                disabled={currentPage === data.pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{(currentPage - 1) * 20 + 1}</span>
                  {' '}a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 20, data.pagination.total)}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{data.pagination.total}</span>
                  {' '}resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage} de {data.pagination.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(data.pagination.pages, currentPage + 1))}
                    disabled={currentPage === data.pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Organization Modal */}
      {showEditModal && selectedOrg && (
        <EditOrganizationModal
          organization={selectedOrg}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOrg(null);
          }}
          onSave={() => {
            loadOrganizations();
            setShowEditModal(false);
            setSelectedOrg(null);
          }}
        />
      )}
    </div>
  );
}

// Edit Organization Modal Component
interface EditOrganizationModalProps {
  organization: Organization;
  onClose: () => void;
  onSave: () => void;
}

function EditOrganizationModal({ organization, onClose, onSave }: EditOrganizationModalProps) {
  const [formData, setFormData] = useState({
    sendReminders: organization.sendReminders,
    notificationWhatsapp: organization.notificationWhatsapp,
    reminderHoursBefore: organization.reminderHoursBefore,
    subscriptionPlan: organization.subscriptionPlan,
    subscriptionStatus: organization.subscriptionStatus
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminApi.updateOrganization(organization.id, formData);
      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Configurar: {organization.name}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* WhatsApp Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Configuración WhatsApp</h4>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendReminders"
                  checked={formData.sendReminders}
                  onChange={(e) => setFormData(prev => ({ ...prev, sendReminders: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="sendReminders" className="ml-2 text-sm text-gray-700">
                  Habilitar recordatorios
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notificationWhatsapp"
                  checked={formData.notificationWhatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, notificationWhatsapp: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="notificationWhatsapp" className="ml-2 text-sm text-gray-700">
                  Habilitar WhatsApp
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas antes del recordatorio
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={formData.reminderHoursBefore}
                  onChange={(e) => setFormData(prev => ({ ...prev, reminderHoursBefore: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>
            </div>

            {/* Subscription Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Suscripción</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan
                </label>
                <select
                  value={formData.subscriptionPlan}
                  onChange={(e) => setFormData(prev => ({ ...prev, subscriptionPlan: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="FREE_TRIAL">Prueba Gratuita</option>
                  <option value="BASIC">Básico</option>
                  <option value="PROFESSIONAL">Profesional</option>
                  <option value="ENTERPRISE">Empresarial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.subscriptionStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, subscriptionStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="TRIALING">En Prueba</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="PAST_DUE">Vencido</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
