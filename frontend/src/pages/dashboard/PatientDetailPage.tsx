import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { REFERRAL_SOURCE_LABELS } from '@/types/patient.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PatientDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedPatient, isLoading, fetchPatientById } = usePatientsStore();

    useEffect(() => {
        if (id) {
            fetchPatientById(id);
        }
    }, [id, fetchPatientById]);

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
        } catch {
            return '-';
        }
    };

    const calculateAge = (dateString?: string | null) => {
        if (!dateString) return '-';
        try {
            const birthDate = new Date(dateString);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return `${age} años`;
        } catch {
            return '-';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!selectedPatient) {
        return (
            <div className="card p-8 text-center">
                <p className="text-[rgb(var(--text-secondary))] mb-4">
                    Paciente no encontrado
                </p>
                <button
                    onClick={() => navigate('/dashboard/patients')}
                    className="text-primary hover:text-primary-hover font-medium"
                >
                    Volver a la lista
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/patients')}
                        className="p-2 hover:bg-[rgb(var(--bg-secondary))] rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">
                            {selectedPatient.firstName} {selectedPatient.lastName}
                        </h1>
                        <p className="text-[rgb(var(--text-secondary))] mt-1">
                            {REFERRAL_SOURCE_LABELS[selectedPatient.referralSource]}
                        </p>
                    </div>
                </div>
                <Link
                    to={`/dashboard/patients/${id}/edit`}
                    style={{
                        background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">
                            Información Personal
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-[rgb(var(--text-secondary))]">DNI</label>
                                <p className="text-[rgb(var(--text-primary))] font-medium">
                                    {selectedPatient.dni || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-[rgb(var(--text-secondary))]">Fecha de Nacimiento</label>
                                <p className="text-[rgb(var(--text-primary))] font-medium">
                                    {formatDate(selectedPatient.dateOfBirth)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-[rgb(var(--text-secondary))]">Edad</label>
                                <p className="text-[rgb(var(--text-primary))] font-medium">
                                    {calculateAge(selectedPatient.dateOfBirth)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-[rgb(var(--text-secondary))]">Género</label>
                                <p className="text-[rgb(var(--text-primary))] font-medium">
                                    {selectedPatient.gender || '-'}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-[rgb(var(--text-secondary))]">Ocupación</label>
                                <p className="text-[rgb(var(--text-primary))] font-medium">
                                    {selectedPatient.occupation || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">
                            Información de Contacto
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-[rgb(var(--text-secondary))]">Teléfono</label>
                                <p className="text-[rgb(var(--text-primary))] font-medium">
                                    {selectedPatient.phone}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-[rgb(var(--text-secondary))]">Email</label>
                                <p className="text-[rgb(var(--text-primary))] font-medium">
                                    {selectedPatient.email || '-'}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-[rgb(var(--text-secondary))]">Dirección</label>
                                <p className="text-[rgb(var(--text-primary))] font-medium">
                                    {selectedPatient.address || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">
                            Contacto de Emergencia
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-[rgb(var(--text-secondary))]">Nombre</label>
                                <p className="text-[rgb(var(--text-primary))] font-medium">
                                    {selectedPatient.emergencyContact || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-[rgb(var(--text-secondary))]">Teléfono</label>
                                <p className="text-[rgb(var(--text-primary))] font-medium">
                                    {selectedPatient.emergencyPhone || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Additional Info */}
                <div className="space-y-6">
                    {/* Avatar */}
                    <div className="card p-6 text-center">
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                            }}
                            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4"
                        >
                            {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                        </div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                            {selectedPatient.firstName} {selectedPatient.lastName}
                        </h3>
                        <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                            Paciente
                        </p>
                    </div>

                    {/* Professional Assigned */}
                    <div className="card p-6">
                        <h3 className="text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                            Profesional Asignado
                        </h3>
                        <p className="text-[rgb(var(--text-primary))] font-medium">
                            {selectedPatient.assignedProfessional
                                ? `${selectedPatient.assignedProfessional.firstName} ${selectedPatient.assignedProfessional.lastName}`
                                : 'Sin asignar'}
                        </p>
                    </div>

                    {/* Registration Info */}
                    <div className="card p-6">
                        <h3 className="text-sm font-medium text-[rgb(var(--text-secondary))] mb-3">
                            Información de Registro
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-[rgb(var(--text-tertiary))]">Fecha de Registro</label>
                                <p className="text-sm text-[rgb(var(--text-primary))] font-medium">
                                    {formatDate(selectedPatient.createdAt)}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-[rgb(var(--text-tertiary))]">Última Actualización</label>
                                <p className="text-sm text-[rgb(var(--text-primary))] font-medium">
                                    {formatDate(selectedPatient.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailPage;
