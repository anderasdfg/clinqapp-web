import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useServicesStore } from '@/stores/useServicesStore';
import { SERVICE_CATEGORY_LABELS } from '@/types/service.types';

const ServicesPage = () => {
    const {
        services,
        isLoading,
        pagination,
        fetchServices,
        deleteService,
    } = useServicesStore();

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchServices({ page: 1, limit: 50 });
    }, [fetchServices]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchServices({ page: 1, limit: 50, search: searchTerm });
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Estás seguro de que deseas eliminar el servicio "${name}"?`)) {
            await deleteService(id);
        }
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: currency || 'PEN',
        }).format(price);
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                        Servicios
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))]">
                        Gestiona los servicios que ofreces
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                    <div className="text-sm text-[rgb(var(--text-secondary))]">
                        <span className="font-semibold text-[rgb(var(--text-primary))]">{pagination.total}</span> servicios
                    </div>
                    <Link
                        to="/app/dashboard/services/new"
                        style={{
                            background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Servicio
                    </Link>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card p-4 mb-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre, descripción..."
                            className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                    >
                        Buscar
                    </button>
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                                fetchServices({ page: 1, limit: 50 });
                            }}
                            className="px-4 py-2 border border-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                        >
                            Limpiar
                        </button>
                    )}
                </form>
            </div>

            {/* Services Grid */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-20">
                        <svg
                            className="mx-auto h-12 w-12 text-[rgb(var(--text-tertiary))]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-[rgb(var(--text-primary))]">
                            No hay servicios registrados
                        </h3>
                        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
                            Comienza creando tu primer servicio
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/app/dashboard/services/new"
                                style={{
                                    background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nuevo Servicio
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[rgb(var(--border-primary))]">
                            <thead className="bg-[rgb(var(--bg-secondary))]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Servicio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Categoría
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Duración
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Precio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[rgb(var(--bg-card))] divide-y divide-[rgb(var(--border-primary))]">
                                {services.map((service) => (
                                    <tr key={service.id} className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                                {service.name}
                                            </div>
                                            {service.description && (
                                                <div className="text-sm text-[rgb(var(--text-secondary))] line-clamp-1">
                                                    {service.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                                {SERVICE_CATEGORY_LABELS[service.category]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(var(--text-primary))]">
                                                {service.duration} min
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                                {formatPrice(service.basePrice, service.currency)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {service.isActive ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/app/dashboard/services/${service.id}/edit`}
                                                    className="text-primary hover:text-primary-hover"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(service.id, service.name)}
                                                    className="text-error hover:text-red-700"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && services.length > 0 && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-[rgb(var(--text-secondary))]">
                        Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fetchServices({ page: pagination.page - 1, limit: pagination.limit, search: searchTerm })}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 border border-[rgb(var(--border-primary))] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => fetchServices({ page: pagination.page + 1, limit: pagination.limit, search: searchTerm })}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-4 py-2 border border-[rgb(var(--border-primary))] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesPage;
