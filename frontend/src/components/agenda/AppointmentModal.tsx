import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, type AppointmentFormData } from '@/lib/validations/appointment.validation';
import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import { usePatientsStore } from '@/stores/usePatientsStore';
import type { Appointment } from '@/types/appointment.types';
import type { Service } from '@/types/service.types';
import { format, isValid as isValidDate } from 'date-fns';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/combobox';

import { supabase } from '@/lib/supabase/client';
import { appointmentsService } from '@/services/appointments.service';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { TimeSlot } from '@/types/schedule.types';
import QuickPatientModal from '@/components/patients/QuickPatientModal';
import { cn } from '@/lib/utils/cn';

interface AppointmentModalProps {
    appointment?: Appointment;
    isOpen: boolean;
    onClose: () => void;
    defaultDate?: Date;
}

// Simplified types for dropdown data
interface ProfessionalOption {
    id: string;
    firstName: string;
    lastName: string;
    specialty?: string | null;
}

const AppointmentModal = ({ appointment, isOpen, onClose, defaultDate }: AppointmentModalProps) => {
    const { 
        createAppointment, 
        updateAppointment, 
        isCreating,
        isUpdating,
        fetchAppointments 
    } = useAppointmentsStore();
    
    const { patients, fetchPatients } = usePatientsStore();
    const [professionals, setProfessionals] = useState<ProfessionalOption[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loadingProfessionals, setLoadingProfessionals] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [duration, setDuration] = useState<number>(60); // Default 60 minutes
    const [showQuickPatientCreate, setShowQuickPatientCreate] = useState(false);
    const [isTimeSelected, setIsTimeSelected] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: appointment
            ? {
                patientId: appointment.patientId,
                professionalId: appointment.professionalId,
                serviceId: appointment.serviceId || undefined,
                startTime: format(new Date(appointment.startTime), "yyyy-MM-dd'T'HH:mm"),
                endTime: format(new Date(appointment.endTime), "yyyy-MM-dd'T'HH:mm"),
                notes: appointment.notes || '',
            }
            : {
                patientId: '',
                professionalId: '',
                serviceId: '',
                startTime: '',
                endTime: '',
                notes: '',
            },
    });

    const selectedServiceId = watch('serviceId');
    const selectedProfessionalId = watch('professionalId');
    const selectedStartTime = watch('startTime');
    const selectedEndTime = watch('endTime');
    const selectedPatientId = watch('patientId');

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        selectedStartTime ? new Date(selectedStartTime) : defaultDate || new Date()
    );

    // Form validity check for the submit button
    const isFormValid = useMemo(() => {
        return !!(
            selectedPatientId &&
            selectedProfessionalId &&
            selectedServiceId &&
            selectedStartTime &&
            isTimeSelected &&
            selectedDate &&
            isValidDate(new Date(selectedStartTime))
        );
    }, [selectedPatientId, selectedProfessionalId, selectedServiceId, selectedStartTime, isTimeSelected, selectedDate]);

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

    const loadProfessionals = async () => {
        if (professionals.length > 0 || loadingProfessionals) return;
        setLoadingProfessionals(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/staff`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setProfessionals(data.data);
            }
        } catch (error) {
            console.error('Error loading professionals:', error);
        } finally {
            setLoadingProfessionals(false);
        }
    };

    const loadServices = async () => {
        if (services.length > 0 || loadingServices) return;
        setLoadingServices(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setServices(data.data);
            }
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setLoadingServices(false);
        }
    };

    // Load available slots
    useEffect(() => {
        if (selectedProfessionalId && selectedDate) {
            const fetchSlots = async () => {
                setLoadingSlots(true);
                try {
                    const response = await appointmentsService.getAvailableSlots({
                        professionalId: selectedProfessionalId,
                        date: format(selectedDate, 'yyyy-MM-dd'),
                        duration: duration,
                    });
                    setAvailableSlots(response.data.availableSlots);
                } catch (error) {
                    console.error('Error fetching available slots:', error);
                } finally {
                    setLoadingSlots(false);
                }
            };
            fetchSlots();
        } else {
            setAvailableSlots([]); // Clear slots if professional or date is not selected
        }
    }, [selectedProfessionalId, selectedDate, duration]);

    // Update duration if service changes
    useEffect(() => {
        if (selectedServiceId) {
            const service = services.find(s => s.id === selectedServiceId);
            if (service) {
                setDuration(service.duration);
            }
        }
    }, [selectedServiceId, services]);

    // Update endTime when startTime or duration changes
    useEffect(() => {
        if (selectedStartTime && isValidDate(new Date(selectedStartTime))) {
            const start = new Date(selectedStartTime);
            const end = new Date(start.getTime() + duration * 60000);
            setValue('endTime', format(end, "yyyy-MM-dd'T'HH:mm"));
        }
    }, [selectedStartTime, duration, setValue]);

    // Load initial data if necessary and reset form
    useEffect(() => {
        if (isOpen) {
            loadProfessionals();
            loadServices();
            if (appointment) {
                const start = new Date(appointment.startTime);
                const end = new Date(appointment.endTime);
                const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
                setDuration(diffMinutes);
                setSelectedDate(start);
                setIsTimeSelected(true);
                reset({
                    patientId: appointment.patientId,
                    professionalId: appointment.professionalId,
                    serviceId: appointment.serviceId || undefined,
                    startTime: format(start, "yyyy-MM-dd'T'HH:mm"),
                    endTime: format(end, "yyyy-MM-dd'T'HH:mm"),
                    notes: appointment.notes || '',
                });
            } else {
                const initialDate = defaultDate || new Date();
                setSelectedDate(initialDate);
                setIsTimeSelected(false);
                reset({
                    patientId: '',
                    professionalId: '',
                    serviceId: '',
                    startTime: '',
                    endTime: '',
                    notes: '',
                });
            }
        }
    }, [isOpen, appointment, reset, defaultDate]);

    const handlePatientCreated = async (patientId: string) => {
        await loadPatients(true); // Force reload to get the newly created patient
        reset({
            ...watch(),
            patientId: patientId,
        });
        setShowQuickPatientCreate(false);
    };

    const onSubmit = async (data: AppointmentFormData) => {
        if (!isFormValid) return;
        try {
            // Transform dates to full ISO for backend validation (Zod .datetime())
            const payload = {
                ...data,
                startTime: new Date(data.startTime).toISOString(),
                endTime: new Date(data.endTime).toISOString(),
            };

            if (appointment) {
                await updateAppointment(appointment.id, payload as any);
            } else {
                await createAppointment(payload as any);
            }
            await fetchAppointments(); // Refresh agenda
            onClose();
        } catch (error) {
            console.error('Error saving appointment:', error);
        }
    };

    // Helper to format date safely
    const safeFormat = (dateStr: string | undefined, formatStr: string) => {
        if (!dateStr) return '--:--';
        const d = new Date(dateStr);
        if (!isValidDate(d)) return '--:--';
        return format(d, formatStr);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background border-border shadow-2xl">
                    <div className="flex flex-col h-full max-h-[90vh]">
                        {/* Header with Sidebar Gradient */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 gradient-primary text-white">
                            <h2 className="text-xl font-bold tracking-tight">
                                {appointment ? 'Editar cita' : 'Nueva cita'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>


                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="appointment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-4">
                                    {/* Patient Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
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
                                                className="shrink-0 border-dashed"
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
                                        <label className="block text-sm font-medium text-foreground mb-2">
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
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Servicio <span className="text-error">*</span>
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
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                        <div className="lg:col-span-12 xl:col-span-5 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">
                                                    Fecha de la Cita <span className="text-error">*</span>
                                                </label>
                                                <DatePicker
                                                    date={selectedDate}
                                                    onDateChange={(date) => {
                                                        setSelectedDate(date);
                                                        if (date && selectedStartTime && isValidDate(new Date(selectedStartTime))) {
                                                            const currentStartTime = new Date(selectedStartTime);
                                                            const newStartTime = new Date(date);
                                                            newStartTime.setHours(currentStartTime.getHours(), currentStartTime.getMinutes());
                                                            setValue('startTime', format(newStartTime, "yyyy-MM-dd'T'HH:mm"));
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">
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
                                                <div className="mt-2 p-3 bg-muted/30 rounded-md border border-dashed border-border flex items-center justify-between transition-colors">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase text-muted-foreground font-bold leading-tight">Finaliza</span>
                                                        <span className="text-sm font-semibold text-primary">
                                                            {isTimeSelected ? safeFormat(selectedEndTime, 'h:mm a') : '--:--'}
                                                        </span>
                                                    </div>
                                                    <Clock className="h-4 w-4 text-muted-foreground opacity-50" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-12 xl:col-span-7">
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Seleccionar Horario <span className="text-error">*</span>
                                            </label>
                                            <Controller
                                                name="startTime"
                                                control={control}
                                                render={({ field }) => (
                                                    <TimePicker
                                                        value={isTimeSelected ? safeFormat(field.value, 'HH:mm') : ''}
                                                        slots={availableSlots}
                                                        loading={loadingSlots}
                                                        onChange={(time) => {
                                                            if (selectedDate) {
                                                                const [hours, minutes] = time.split(':').map(Number);
                                                                const newStartTime = new Date(selectedDate);
                                                                newStartTime.setHours(hours, minutes, 0, 0);
                                                                field.onChange(format(newStartTime, "yyyy-MM-dd'T'HH:mm"));
                                                                setIsTimeSelected(true);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.startTime && (
                                                <p className="mt-1 text-sm text-error">{errors.startTime.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Notas
                                        </label>
                                        <Textarea
                                            {...register('notes')}
                                            rows={2}
                                            placeholder="Notas adicionales..."
                                            className="bg-background border-border text-foreground resize-none"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer with Sidebar Gradient */}
                        <div className="p-4 border-t border-white/10 gradient-primary flex justify-end gap-3 rounded-b-lg">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="text-white hover:bg-white/10 transition-colors"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="appointment-form"
                                disabled={isCreating || isUpdating || !isFormValid}
                                className={cn(
                                    "transition-all duration-300 shadow-lg px-8 font-bold",
                                    isFormValid 
                                        ? "bg-white text-primary hover:bg-white/90" 
                                        : "bg-white/20 text-white/50 cursor-not-allowed"
                                )}
                            >
                                {isCreating || isUpdating ? (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 animate-spin" />
                                        <span>Guardando...</span>
                                    </div>
                                ) : (
                                    appointment ? 'Actualizar cita' : 'Crear cita'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <QuickPatientModal
                isOpen={showQuickPatientCreate}
                onClose={() => setShowQuickPatientCreate(false)}
                onSuccess={handlePatientCreated}
            />
        </>
    );
};

export default AppointmentModal;
