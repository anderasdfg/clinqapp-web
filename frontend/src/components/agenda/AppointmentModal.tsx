import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, type AppointmentFormData } from '@/lib/validations/appointment.validation';
import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import { usePatientsStore } from '@/stores/usePatientsStore';
import type { Appointment } from '@/types/appointment.types';
import { format } from 'date-fns';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { Combobox } from '@/components/ui/combobox';
import QuickPatientModal from '@/components/patients/QuickPatientModal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { supabase } from '@/lib/supabase/client';

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
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingProfessionals, setLoadingProfessionals] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);
    const [duration, setDuration] = useState<number>(60); // Default 60 minutes
    const [showQuickPatientCreate, setShowQuickPatientCreate] = useState(false);

    const {
        register,
        handleSubmit,
        control,
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

    // Lazy load patients
    const loadPatients = async (force = false) => {
        if (!force && (patients.length > 0 || loadingPatients)) return;
        setLoadingPatients(true);
        try {
            await fetchPatients({ limit: 100 });
        } catch (error) {
            console.error('Error loading patients:', error);
        } finally {
            setLoadingPatients(false);
        }
    };

    // Lazy load professionals
    const loadProfessionals = async (force = false) => {
        if (!force && (professionals.length > 0 || loadingProfessionals)) return;
        setLoadingProfessionals(true);
        try {
            const { staffService } = await import('@/services/staff.service');
            const staffResponse = await staffService.getStaff({ limit: 100 });
            setProfessionals(staffResponse.data.map(staff => ({
                id: staff.id,
                firstName: staff.firstName,
                lastName: staff.lastName,
                specialty: staff.specialty || undefined,
            })));
        } catch (error) {
            console.error('Error loading professionals:', error);
        } finally {
            setLoadingProfessionals(false);
        }
    };

    // Lazy load services
    const loadServices = async (force = false) => {
        if (!force && (services.length > 0 || loadingServices)) return;
        setLoadingServices(true);
        try {
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
            console.error('Error loading services:', error);
        } finally {
            setLoadingServices(false);
        }
    };

    // Load initial data if necessary
    useEffect(() => {
        if (isOpen) {
            loadPatients();
            loadProfessionals();
        }
    }, [isOpen]);

    // Auto-set duration based on service selection
    useEffect(() => {
        if (selectedServiceId && services.length > 0) {
            const service = services.find(s => s.id === selectedServiceId);
            if (service && service.duration) {
                setDuration(service.duration);
            }
        }
    }, [selectedServiceId, services]);

    // Auto-calculate end time based on start time and duration
    useEffect(() => {
        const startTime = watch('startTime');
        if (startTime && duration) {
            const start = new Date(startTime);
            const end = new Date(start.getTime() + duration * 60 * 1000);
            const endTimeValue = format(end, "yyyy-MM-dd'T'HH:mm");
            // Update endTime field
            reset({
                ...watch(),
                endTime: endTimeValue,
            });
        }
    }, [watch('startTime'), duration]);



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

    const handlePatientCreated = async (patientId: string) => {
        await fetchPatients({ limit: 100 });
        reset({
            ...watch(),
            patientId: patientId,
        });
        setShowQuickPatientCreate(false);
    };

    if (!isOpen) return null;

    const isSubmitting = isCreating || isUpdating;
    
    // Check if all required fields are filled
    const patientId = watch('patientId');
    const professionalId = watch('professionalId');
    const startTime = watch('startTime');
    const isFormValid = !!(patientId && professionalId && startTime);

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


                            <div className="space-y-4">
                                    {/* Patient Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                            Paciente <span className="text-error">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <Controller
                                                name="patientId"
                                                control={control}
                                                render={({ field }) => (
                                                    <Combobox
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        options={patients.map((patient) => ({
                                                            value: patient.id,
                                                            label: `${patient.firstName} ${patient.lastName}`,
                                                        }))}
                                                        placeholder="Seleccionar paciente..."
                                                        searchPlaceholder="Buscar paciente..."
                                                        emptyText="No se encontraron pacientes"
                                                        className="flex-1"
                                                        isLoading={loadingPatients}
                                                        onOpen={loadPatients}
                                                    />
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowQuickPatientCreate(true)}
                                                className="shrink-0"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {errors.patientId && (
                                            <p className="mt-1 text-sm text-error">{errors.patientId.message}</p>
                                        )}
                                    </div>

                                    {/* Professional Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                            Profesional <span className="text-error">*</span>
                                        </label>
                                        <Controller
                                            name="professionalId"
                                            control={control}
                                            render={({ field }) => (
                                                <Combobox
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    options={professionals.map((prof) => ({
                                                        value: prof.id,
                                                        label: `${prof.firstName} ${prof.lastName}`,
                                                    }))}
                                                    placeholder="Seleccionar profesional..."
                                                    searchPlaceholder="Buscar profesional..."
                                                    emptyText="No se encontraron profesionales"
                                                    isLoading={loadingProfessionals}
                                                    onOpen={loadProfessionals}
                                                />
                                            )}
                                        />
                                        {errors.professionalId && (
                                            <p className="mt-1 text-sm text-error">{errors.professionalId.message}</p>
                                        )}
                                    </div>

                                    {/* Service Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                            Servicio
                                        </label>
                                        <Controller
                                            name="serviceId"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value || ''}
                                                    onValueChange={field.onChange}
                                                    onOpenChange={(open) => {
                                                        if (open) loadServices();
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder={loadingServices ? "Cargando servicios..." : "Seleccionar servicio..."} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {services.map((service) => (
                                                            <SelectItem key={service.id} value={service.id}>
                                                                {service.name} ({service.duration} min)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    {/* Date, Time and Duration */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                                Fecha y Hora de Inicio <span className="text-error">*</span>
                                            </label>
                                            <Controller
                                                name="startTime"
                                                control={control}
                                                render={({ field }) => (
                                                    <DateTimePicker
                                                        date={field.value ? new Date(field.value) : undefined}
                                                        onDateTimeChange={(date) => {
                                                            field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm") : '');
                                                        }}
                                                        placeholder="Seleccionar fecha y hora de inicio"
                                                    />
                                                )}
                                            />
                                            {errors.startTime && (
                                                <p className="mt-1 text-sm text-error">{errors.startTime.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                                Duración <span className="text-error">*</span>
                                            </label>
                                            <Select
                                                value={duration.toString()}
                                                onValueChange={(value) => setDuration(parseInt(value))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Seleccionar duración" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="15">15 minutos</SelectItem>
                                                    <SelectItem value="30">30 minutos</SelectItem>
                                                    <SelectItem value="45">45 minutos</SelectItem>
                                                    <SelectItem value="60">1 hora</SelectItem>
                                                    <SelectItem value="90">1 hora 30 min</SelectItem>
                                                    <SelectItem value="120">2 horas</SelectItem>
                                                    <SelectItem value="150">2 horas 30 min</SelectItem>
                                                    <SelectItem value="180">3 horas</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="mt-1 text-xs text-[rgb(var(--text-tertiary))]">
                                                Hora de fin: {watch('endTime') ? format(new Date(watch('endTime')), 'HH:mm') : '--:--'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                            Notas
                                        </label>
                                        <Textarea
                                            {...register('notes')}
                                            rows={3}
                                            placeholder="Notas adicionales..."
                                        />
                                    </div>
                                </div>
                            
                        </div>

                        <div className="px-6 py-3 bg-[rgb(var(--bg-secondary))] sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting || !isFormValid}
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

            {/* Quick Patient Create Modal */}
            <QuickPatientModal
                isOpen={showQuickPatientCreate}
                onClose={() => setShowQuickPatientCreate(false)}
                onSuccess={handlePatientCreated}
            />
        </div>
    );
};

export default AppointmentModal;
