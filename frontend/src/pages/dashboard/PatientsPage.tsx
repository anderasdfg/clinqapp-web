import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { REFERRAL_SOURCE_LABELS } from '@/types/patient.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PatientsPage = () => {
    const {
        patients,
        isLoading,
        currentPage,
        totalPages,
        totalPatients,
        searchQuery,
        setSearchQuery,
        setCurrentPage,
        fetchPatients,
        deletePatient,
    } = usePatientsStore();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchPatients();
    };

    const handleDeleteClick = (id: string) => {
        setPatientToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (patientToDelete) {
            try {
                await deletePatient(patientToDelete);
                setShowDeleteModal(false);
                setPatientToDelete(null);
            } catch (error) {
                console.error('Error deleting patient:', error);
            }
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
        } catch {
            return '-';
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                        Pacientes
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))]">
                        Gestiona la información de tus pacientes
                    </p>
                </div>
                <Link
                    to="/dashboard/patients/new"
                    style={{
                        background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                    }}
                    className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Paciente
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="card p-4 mb-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nombre, DNI, teléfono o email..."
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors duration-200 font-medium"
                    >
                        Buscar
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[rgb(var(--border-primary))]">
                        <thead className="bg-[rgb(var(--bg-secondary))]">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                    Paciente
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                    DNI
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                    Profesional
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                    Registro
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-[rgb(var(--bg-card))] divide-y divide-[rgb(var(--border-primary))]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <svg className="w-12 h-12 text-[rgb(var(--text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <p className="text-[rgb(var(--text-secondary))]">
                                                No se encontraron pacientes
                                            </p>
                                            <Link
                                                to="/dashboard/patients/new"
                                                className="text-primary hover:text-primary-hover font-medium"
                                            >
                                                Crear primer paciente
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-[rgb(var(--bg-secondary))] transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div
                                                        style={{
                                                            background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                                                        }}
                                                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                                                    >
                                                        {patient.firstName[0]}{patient.lastName[0]}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                                        {patient.firstName} {patient.lastName}
                                                    </div>
                                                    <div className="text-sm text-[rgb(var(--text-secondary))]">
                                                        {REFERRAL_SOURCE_LABELS[patient.referralSource]}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(var(--text-primary))]">
                                                {patient.dni || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(var(--text-primary))]">
                                                {patient.phone}
                                            </div>
                                            <div className="text-sm text-[rgb(var(--text-secondary))]">
                                                {patient.email || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(var(--text-primary))]">
                                                {patient.assignedProfessional
                                                    ? `${patient.assignedProfessional.firstName} ${patient.assignedProfessional.lastName}`
                                                    : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(var(--text-secondary))]">
                                                {formatDate(patient.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/dashboard/patients/${patient.id}`}
                                                    className="text-primary hover:text-primary-hover"
                                                    title="Ver detalles"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    to={`/dashboard/patients/${patient.id}/edit`}
                                                    className="text-secondary hover:text-secondary-hover"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick(patient.id)}
                                                    className="text-error hover:text-error/80"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-[rgb(var(--border-primary))] flex items-center justify-between">
                        <div className="text-sm text-[rgb(var(--text-secondary))]">
                            Mostrando {patients.length} de {totalPatients} pacientes
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setCurrentPage(currentPage - 1);
                                    fetchPatients({ page: currentPage - 1 });
                                }}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-secondary))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Anterior
                            </button>
                            <span className="px-4 py-1.5 text-[rgb(var(--text-primary))]">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => {
                                    setCurrentPage(currentPage + 1);
                                    fetchPatients({ page: currentPage + 1 });
                                }}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-secondary))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-black/50" onClick={() => setShowDeleteModal(false)}></div>

                        <div className="inline-block align-bottom bg-[rgb(var(--bg-card))] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="px-6 pt-5 pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-error/10 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-[rgb(var(--text-primary))]">
                                            Eliminar paciente
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-[rgb(var(--text-secondary))]">
                                                ¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-[rgb(var(--bg-secondary))] sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-error text-white hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error sm:ml-3 sm:w-auto sm:text-sm font-medium transition-colors duration-200"
                                >
                                    Eliminar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-[rgb(var(--border-primary))] shadow-sm px-4 py-2 bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-secondary))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm font-medium transition-colors duration-200"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientsPage;
