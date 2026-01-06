import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import { REFERRAL_SOURCE_LABELS } from '@/types/patient.types';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/types/appointment.types';
import type { Appointment } from '@/types/appointment.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PatientDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedPatient, isLoading, fetchPatientById } = usePatientsStore();
    const { appointments, fetchAppointments } = useAppointmentsStore();
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPatientById(id);
            fetchAppointments({ patientId: id });
        }
    }, [id, fetchPatientById, fetchAppointments]);

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
        } catch {
            return '-';
        }
    };

    const formatDateTime = (dateString?: string | null) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), "dd/MM/yyyy 'a las' HH:mm", { locale: es });
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

    // Filter appointments for this patient
    const patientAppointments = appointments.filter(apt => apt.patientId === id);
    const completedAppointments = patientAppointments.filter(apt => apt.status === 'COMPLETED');
    const lastAppointment = patientAppointments.length > 0 
        ? patientAppointments.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0]
        : null;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!selectedPatient) {
        return (
            <Card className="p-8 text-center">
                <p className="text-[rgb(var(--text-secondary))] mb-4">
                    Paciente no encontrado
                </p>
                <button
                    onClick={() => navigate('/dashboard/patients')}
                    className="text-primary hover:text-primary-hover font-medium"
                >
                    Volver a la lista
                </button>
            </Card>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
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
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">
                                {selectedPatient.firstName} {selectedPatient.lastName}
                            </h1>
                            <Badge variant="outline" className="text-sm">
                                {REFERRAL_SOURCE_LABELS[selectedPatient.referralSource]}
                            </Badge>
                        </div>
                        <p className="text-[rgb(var(--text-secondary))] mt-1">
                            DNI: {selectedPatient.dni || 'No registrado'}
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
                    Editar Paciente
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Información Personal
                            </CardTitle>
                            <CardDescription>
                                Datos personales y demográficos del paciente
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem 
                                    label="Fecha de Nacimiento" 
                                    value={formatDate(selectedPatient.dateOfBirth)}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />
                                <InfoItem 
                                    label="Edad" 
                                    value={calculateAge(selectedPatient.dateOfBirth)}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                                <InfoItem 
                                    label="Género" 
                                    value={selectedPatient.gender || '-'}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    }
                                />
                                <InfoItem 
                                    label="Ocupación" 
                                    value={selectedPatient.occupation || '-'}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Información de Contacto
                            </CardTitle>
                            <CardDescription>
                                Datos de contacto y ubicación del paciente
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <InfoItem 
                                    label="Teléfono" 
                                    value={selectedPatient.phone}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    }
                                />
                                <InfoItem 
                                    label="Email" 
                                    value={selectedPatient.email || '-'}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    }
                                />
                                <Separator />
                                <InfoItem 
                                    label="Dirección" 
                                    value={selectedPatient.address || '-'}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    }
                                    fullWidth
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Contacto de Emergencia
                            </CardTitle>
                            <CardDescription>
                                Persona a contactar en caso de emergencia
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem 
                                    label="Nombre" 
                                    value={selectedPatient.emergencyContact || '-'}
                                />
                                <InfoItem 
                                    label="Teléfono" 
                                    value={selectedPatient.emergencyPhone || '-'}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appointment History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Historial de Citas
                            </CardTitle>
                            <CardDescription>
                                Registro completo de todas las citas del paciente
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {patientAppointments.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 mx-auto text-[rgb(var(--text-tertiary))] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-[rgb(var(--text-secondary))]">No hay citas registradas</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {patientAppointments
                                        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                                        .map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                className="p-4 border border-[rgb(var(--border-primary))] rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-colors cursor-pointer"
                                                onClick={() => {
                                                    setSelectedAppointment(appointment);
                                                    setShowDetailModal(true);
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-medium text-[rgb(var(--text-primary))]">
                                                                {appointment.service?.name || 'Consulta General'}
                                                            </h4>
                                                            <Badge className={APPOINTMENT_STATUS_COLORS[appointment.status]}>
                                                                {APPOINTMENT_STATUS_LABELS[appointment.status]}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                                                            {formatDateTime(appointment.startTime)}
                                                        </p>
                                                        <p className="text-sm text-[rgb(var(--text-tertiary))] mt-1">
                                                            Dr. {appointment.professional?.firstName} {appointment.professional?.lastName}
                                                        </p>
                                                    </div>
                                                    <svg className="w-5 h-5 text-[rgb(var(--text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Summary Cards */}
                <div className="space-y-6">
                    {/* Patient Avatar Card */}
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <div
                                style={{
                                    background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                                }}
                                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg"
                            >
                                {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                            </div>
                            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                                {selectedPatient.firstName} {selectedPatient.lastName}
                            </h3>
                            <Badge variant="secondary" className="mt-2">
                                Paciente Activo
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Professional Assigned */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Profesional Asignado
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[rgb(var(--text-primary))] font-medium">
                                {selectedPatient.assignedProfessional
                                    ? `${selectedPatient.assignedProfessional.firstName} ${selectedPatient.assignedProfessional.lastName}`
                                    : 'Sin asignar'}
                            </p>
                            {selectedPatient.assignedProfessional && (
                                <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                                    {selectedPatient.assignedProfessional.specialty || 'Especialidad no especificada'}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Estadísticas Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[rgb(var(--text-secondary))]">Citas Totales</span>
                                <Badge variant="outline">{patientAppointments.length}</Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[rgb(var(--text-secondary))]">Completadas</span>
                                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
                                    {completedAppointments.length}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[rgb(var(--text-secondary))]">Última Visita</span>
                                <span className="text-sm font-medium">
                                    {lastAppointment ? formatDate(lastAppointment.startTime) : '-'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Registration Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Información del Sistema
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-xs text-[rgb(var(--text-tertiary))]">Fecha de Registro</label>
                                <p className="text-sm text-[rgb(var(--text-primary))] font-medium">
                                    {formatDate(selectedPatient.createdAt)}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <label className="text-xs text-[rgb(var(--text-tertiary))]">Última Actualización</label>
                                <p className="text-sm text-[rgb(var(--text-primary))] font-medium">
                                    {formatDate(selectedPatient.updatedAt)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Appointment Detail Modal */}
            {showDetailModal && selectedAppointment && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-black/50" onClick={() => setShowDetailModal(false)}></div>

                        <div className="inline-block align-bottom bg-[rgb(var(--bg-card))] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="px-6 pt-5 pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
                                        Detalle de Cita
                                    </h3>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Status Badge */}
                                    <div className="flex items-center gap-2">
                                        <Badge className={APPOINTMENT_STATUS_COLORS[selectedAppointment.status]}>
                                            {APPOINTMENT_STATUS_LABELS[selectedAppointment.status]}
                                        </Badge>
                                    </div>

                                    <Separator />

                                    {/* Appointment Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-[rgb(var(--text-secondary))]">Servicio</label>
                                            <p className="font-medium text-[rgb(var(--text-primary))]">
                                                {selectedAppointment.service?.name || 'Consulta General'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-[rgb(var(--text-secondary))]">Profesional</label>
                                            <p className="font-medium text-[rgb(var(--text-primary))]">
                                                Dr. {selectedAppointment.professional?.firstName} {selectedAppointment.professional?.lastName}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-[rgb(var(--text-secondary))]">Fecha y Hora</label>
                                            <p className="font-medium text-[rgb(var(--text-primary))]">
                                                {formatDateTime(selectedAppointment.startTime)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-[rgb(var(--text-secondary))]">Duración</label>
                                            <p className="font-medium text-[rgb(var(--text-primary))]">
                                                {selectedAppointment.service?.duration || 60} minutos
                                            </p>
                                        </div>
                                    </div>

                                    {selectedAppointment.notes && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm text-[rgb(var(--text-secondary))]">Notas</label>
                                                <p className="text-[rgb(var(--text-primary))] mt-1">
                                                    {selectedAppointment.notes}
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    <Separator />

                                    {/* Image Upload Section (Placeholder) */}
                                    <div>
                                        <label className="text-sm font-medium text-[rgb(var(--text-primary))] mb-2 block">
                                            Imágenes de la Consulta
                                        </label>
                                        <div className="border-2 border-dashed border-[rgb(var(--border-primary))] rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                                            <svg className="w-12 h-12 mx-auto text-[rgb(var(--text-tertiary))] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-sm text-[rgb(var(--text-secondary))]">
                                                Haz clic para subir imágenes
                                            </p>
                                            <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
                                                (Funcionalidad próximamente)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-3 bg-[rgb(var(--bg-secondary))] sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="w-full inline-flex justify-center rounded-lg border border-[rgb(var(--border-primary))] shadow-sm px-4 py-2 bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-secondary))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:w-auto sm:text-sm font-medium transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component for info items
const InfoItem = ({ 
    label, 
    value, 
    icon, 
    fullWidth = false 
}: { 
    label: string; 
    value: string; 
    icon?: React.ReactNode;
    fullWidth?: boolean;
}) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
        <div className="flex items-center gap-2 mb-1">
            {icon && <span className="text-[rgb(var(--text-tertiary))]">{icon}</span>}
            <label className="text-sm text-[rgb(var(--text-secondary))]">{label}</label>
        </div>
        <p className="text-[rgb(var(--text-primary))] font-medium">
            {value}
        </p>
    </div>
);

export default PatientDetailPage;
