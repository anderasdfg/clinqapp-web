import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, type AppointmentFormData } from '@/lib/validations/appointment.validation';
import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import { usePatientsStore } from '@/stores/usePatientsStore';
import type { Appointment } from '@/types/appointment.types';
import { format } from 'date-fns';

interface AppointmentModalProps {
    appointment?: Appointment;
    isOpen: boolean;
    onClose: () => void;
    defaultDate?: Date;
}

const AppointmentModal = ({ appointment, isOpen, onClose, defaultDate }: AppointmentModalProps) => {
    const { createAppointment, updateAppointment, isCreating, isUpdating } = useAppointmentsStore();
    const { patients, fetchPatients } = usePatientsStore();

    const [professionals, setProfessionals] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: appointment
            ? {
                patientId: appointment.patientId,
                professionalId: appointment.professionalId,
                serviceId: appointment.serviceId || '',
                startTime: appointment.startTime.slice(0, 16), // Format for datetime-local
                endTime: appointment.endTime.slice(0, 16),
                notes: appointment.notes || '',
            }
            : defaultDate
                ? {
                    startTime: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
                    endTime: format(new Date(defaultDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
                }
                : undefined,
    });

    const selectedServiceId = watch('serviceId');

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    // Auto-calculate end time based on service duration
    useEffect(() => {
        if (selectedServiceId && services.length > 0) {
            const service = services.find(s => s.id === selectedServiceId);
            if (service && service.duration) {
                const startTime = watch('startTime');
                if (startTime) {
                    const start = new Date(startTime);
                    const end = new Date(start.getTime() + service.duration * 60 * 1000);
                    const endTimeValue = format(end, "yyyy-MM-dd'T'HH:mm");
                    // Update endTime field
                    reset({
                        ...watch(),
                        endTime: endTimeValue,
                    });
                }
            }
        }
    }, [selectedServiceId, services, watch('startTime')]);

    const loadInitialData = async () => {
        setLoadingData(true);
        try {
            // Fetch patients
            await fetchPatients({ limit: 100 });

            // Fetch professionals from API
            const { staffService } = await import('@/services/staff.service');
            const staffResponse = await staffService.getStaff({ limit: 100 });
            setProfessionals(staffResponse.data.map(staff => ({
                id: staff.id,
                firstName: staff.firstName,
                lastName: staff.lastName,
                specialty: staff.specialty || undefined,
            })));

            // Fetch services from API
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.access_token) {
                const servicesResponse = await fetch(`${import.meta.env.VITE_API_URL}/services?limit=100`, {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                });

                if (servicesResponse.ok) {
                    const servicesData = await servicesResponse.json();
                    setServices(servicesData.data.map((service: any) => ({
                        id: service.id,
                        name: service.name,
                        duration: service.duration,
                        basePrice: service.basePrice,
                    })));
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const onSubmit = async (data: AppointmentFormData) => {
        try {
            const appointmentData = {
                ...data,
                startTime: new Date(data.startTime).toISOString(),
                endTime: new Date(data.endTime).toISOString(),
            };

            if (appointment) {
                await updateAppointment(appointment.id, appointmentData);
            } else {
                await createAppointment(appointmentData);
            }

            reset();
            onClose();
        } catch (error) {
            console.error('Error saving appointment:', error);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    const isSubmitting = isCreating || isUpdating;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black/50" onClick={handleClose}></div>

                <div className="inline-block align-bottom bg-[rgb(var(--bg-card))] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="px-6 pt-5 pb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
                                    {appointment ? 'Editar Cita' : 'Nueva Cita'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {loadingData ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Patient Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                            Paciente <span className="text-error">*</span>
                                        </label>
                                        <select
                                            {...register('patientId')}
                                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                                        >
                                            <option value="">Seleccionar paciente...</option>
                                            {patients.map((patient) => (
                                                <option key={patient.id} value={patient.id}>
                                                    {patient.firstName} {patient.lastName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.patientId && (
                                            <p className="mt-1 text-sm text-error">{errors.patientId.message}</p>
                                        )}
                                    </div>

                                    {/* Professional Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                            Profesional <span className="text-error">*</span>
                                        </label>
                                        <select
                                            {...register('professionalId')}
                                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                                        >
                                            <option value="">Seleccionar profesional...</option>
                                            {professionals.map((prof) => (
                                                <option key={prof.id} value={prof.id}>
                                                    {prof.firstName} {prof.lastName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.professionalId && (
                                            <p className="mt-1 text-sm text-error">{errors.professionalId.message}</p>
                                        )}
                                    </div>

                                    {/* Service Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                            Servicio
                                        </label>
                                        <select
                                            {...register('serviceId')}
                                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                                        >
                                            <option value="">Seleccionar servicio...</option>
                                            {services.map((service) => (
                                                <option key={service.id} value={service.id}>
                                                    {service.name} ({service.duration} min)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date and Time */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                                Fecha y Hora de Inicio <span className="text-error">*</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                {...register('startTime')}
                                                className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                                            />
                                            {errors.startTime && (
                                                <p className="mt-1 text-sm text-error">{errors.startTime.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                                Fecha y Hora de Fin <span className="text-error">*</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                {...register('endTime')}
                                                className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                                            />
                                            {errors.endTime && (
                                                <p className="mt-1 text-sm text-error">{errors.endTime.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                            Notas
                                        </label>
                                        <textarea
                                            {...register('notes')}
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                                            placeholder="Notas adicionales..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-3 bg-[rgb(var(--bg-secondary))] sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting || loadingData}
                                style={{
                                    background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                                }}
                                className="w-full inline-flex justify-center items-center gap-2 rounded-lg shadow-sm px-4 py-2 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm font-medium transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                )}
                                {appointment ? 'Actualizar' : 'Crear'} Cita
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="mt-3 w-full inline-flex justify-center rounded-lg border border-[rgb(var(--border-primary))] shadow-sm px-4 py-2 bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-secondary))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm font-medium transition-colors duration-200"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AppointmentModal;
