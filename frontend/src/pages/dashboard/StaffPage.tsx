import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStaffStore } from '@/stores/useStaffStore';
import { USER_ROLE_LABELS } from '@/types/staff.types';

const StaffPage = () => {
    const {
        staff,
        isLoading,
        pagination,
        fetchStaff,
        deleteStaff,
    } = useStaffStore();

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStaff({ page: 1, limit: 50 });
    }, [fetchStaff]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStaff({ page: 1, limit: 50, search: searchTerm });
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
            await deleteStaff(id);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                        Personal
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))]">
                        Gestiona tu equipo de profesionales
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                    <div className="text-sm text-[rgb(var(--text-secondary))]">
                        <span className="font-semibold text-[rgb(var(--text-primary))]">{pagination.total}</span> profesionales
                    </div>
                    <Link
                        to="/dashboard/staff/new"
                        style={{
                            background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Personal
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
                            placeholder="Buscar por nombre, email..."
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
                                fetchStaff({ page: 1, limit: 50 });
                            }}
                            className="px-4 py-2 border border-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                        >
                            Limpiar
                        </button>
                    )}
                </form>
            </div>

            {/* Staff Table */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : staff.length === 0 ? (
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
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-[rgb(var(--text-primary))]">
                            No hay personal registrado
                        </h3>
                        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
                            Los profesionales se crean durante el proceso de onboarding
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[rgb(var(--border-primary))]">
                            <thead className="bg-[rgb(var(--bg-secondary))]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Profesional
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Teléfono
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Especialidad
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[rgb(var(--bg-card))] divide-y divide-[rgb(var(--border-primary))]">
                                {staff.map((member) => (
                                    <tr key={member.id} className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                                                    }}
                                                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                                                >
                                                    {member.firstName[0]}{member.lastName[0]}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                                        {member.firstName} {member.lastName}
                                                    </div>
                                                    {member.licenseNumber && (
                                                        <div className="text-sm text-[rgb(var(--text-secondary))]">
                                                            Lic. {member.licenseNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(var(--text-primary))]">{member.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(var(--text-primary))]">
                                                {member.phone || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(var(--text-primary))]">
                                                {member.specialty || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                                {USER_ROLE_LABELS[member.role]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/dashboard/staff/${member.id}/edit`}
                                                    className="text-primary hover:text-primary-hover"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(member.id, `${member.firstName} ${member.lastName}`)}
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
            {!isLoading && staff.length > 0 && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-[rgb(var(--text-secondary))]">
                        Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fetchStaff({ page: pagination.page - 1, limit: pagination.limit, search: searchTerm })}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 border border-[rgb(var(--border-primary))] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => fetchStaff({ page: pagination.page + 1, limit: pagination.limit, search: searchTerm })}
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

export default StaffPage;
