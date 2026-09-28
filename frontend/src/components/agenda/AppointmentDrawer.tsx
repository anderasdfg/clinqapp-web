import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, type AppointmentFormData } from '@/lib/validations/appointment.validation';
import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { useServicesStore } from '@/stores/useServicesStore';
import { useStaffStore } from '@/stores/useStaffStore';
import type { Appointment } from '@/types/appointment.types';
import type { TimeSlot } from '@/types/schedule.types';
import { format } from 'date-fns';
import { appointmentsService } from '@/services/appointments.service';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { ServiceSelector } from './ServiceSelector';
import { Label } from '@/components/ui/label';
import QuickPatientModal from '@/components/patients/QuickPatientModal';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AppointmentDrawerProps {
  appointment?: Appointment;
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
  defaultPatientId?: string;
}

export default function AppointmentDrawer({
  appointment,
  isOpen,
  onClose,
  defaultDate,
  defaultPatientId,
}: AppointmentDrawerProps) {
  const {
    createAppointment,
    updateAppointment,
    isCreating,
    isUpdating,
    fetchAppointments,
  } = useAppointmentsStore();

  const { patients, fetchPatients } = usePatientsStore();
  const { services, fetchServices } = useServicesStore();
  const staff = useStaffStore((s) => s.staff);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);
  const staffLoading = useStaffStore((s) => s.isLoading);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate || new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showQuickPatient, setShowQuickPatient] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: '',
      professionalId: '',
      serviceIds: [],
      startTime: '',
      endTime: '',
      notes: '',
      sessionNumber: 1,
    },
  });

  // Reset nested QuickPatient when drawer closes (avoids orphan portal overlay)
  useEffect(() => {
    if (!isOpen) setShowQuickPatient(false);
  }, [isOpen]);

  // Prefetched on AgendaPage; refresh here if store empty or stale
  useEffect(() => {
    if (!isOpen) return;
    void fetchStaff({ limit: 100 });
  }, [isOpen, fetchStaff]);

  const professionals = staff;
  const loadingProfessionals = staffLoading && staff.length === 0;

  // Load services from store
  useEffect(() => {
    if (isOpen) {
      fetchServices({ limit: 1000 });
    }
  }, [isOpen, fetchServices]);

  // Load patients
  useEffect(() => {
    if (isOpen) {
      fetchPatients({ limit: 1000 });
    }
  }, [isOpen, fetchPatients]);

  // Calculate duration when services change (max 60 minutes)
  useEffect(() => {
    if (selectedServiceIds.length > 0) {
      const totalDuration = services
        .filter((s) => selectedServiceIds.includes(s.id))
        .reduce((sum, s) => sum + s.duration, 0);
      // Cap at 60 minutes max
      setDuration(Math.min(totalDuration, 60));
    } else {
      setDuration(60);
    }
  }, [selectedServiceIds, services]);

  // Fetch available slots when professional, date, or duration changes
  useEffect(() => {
    const professionalId = watch('professionalId');
    if (professionalId && selectedDate && duration) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const response = await appointmentsService.getAvailableSlots({
            professionalId,
            date: format(selectedDate, 'yyyy-MM-dd'),
            duration,
          });
          setAvailableSlots(response.data.availableSlots);
        } catch (error) {
          console.error('Error fetching slots:', error);
          setAvailableSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [watch('professionalId'), selectedDate, duration]);


  // Calculate endTime when time is selected
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const start = new Date(selectedDate);
      start.setHours(hours, minutes, 0, 0);
      const end = new Date(start.getTime() + duration * 60000);

      setValue('startTime', format(start, "yyyy-MM-dd'T'HH:mm"));
      setValue('endTime', format(end, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [selectedDate, selectedTime, duration, setValue]);

  // Reset form when opening/closing
  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        const start = new Date(appointment.startTime);
        setSelectedDate(start);
        setSelectedTime(format(start, 'HH:mm'));
        setSelectedServiceIds(
          appointment.services?.map((s) => s.serviceId) || []
        );
        reset({
          patientId: appointment.patientId,
          professionalId: appointment.professionalId,
          serviceIds: appointment.services?.map((s) => s.serviceId) || [],
          startTime: format(start, "yyyy-MM-dd'T'HH:mm"),
          endTime: format(new Date(appointment.endTime), "yyyy-MM-dd'T'HH:mm"),
          notes: appointment.notes || '',
          sessionNumber: appointment.sessionNumber || 1,
        });
      } else {
        // Create mode — do not depend on professionals (avoids wiping QuickPatient patientId)
        const initialDate = defaultDate || new Date();
        setSelectedDate(initialDate);
        setSelectedTime('');
        setSelectedServiceIds([]);
        reset({
          patientId: defaultPatientId || '',
          professionalId: '',
          serviceIds: [],
          startTime: '',
          endTime: '',
          notes: '',
          sessionNumber: 1,
        });
      }
    }
  }, [isOpen, appointment, reset, defaultDate, defaultPatientId]);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const payload = {
        ...data,
        // omit empty UUIDs — backend zod rejects ""
        professionalId: data.professionalId || undefined,
        patientId: data.patientId || undefined,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      };

      if (appointment) {
        await updateAppointment(appointment.id, payload as any);
        toast.success('Cita actualizada');
      } else {
        await createAppointment(payload as any);
        toast.success('Cita creada');
      }

      onClose();
      // Agenda already updated in store; soft refresh in background
      void fetchAppointments({}, true);
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        'No se pudo guardar la cita. Intenta de nuevo.';
      toast.error(msg);
    }
  };

  const isLoading = isCreating || isUpdating;

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName}`,
  }));

  const handleSheetOpenChange = (open: boolean) => {
    if (!open && showQuickPatient) return;
    if (!open) onClose();
  };

  return (
    <>
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        className="sm:max-w-4xl lg:max-w-5xl overscroll-contain flex flex-col"
        aria-describedby="appointment-description"
        aria-busy={isLoading || loadingSlots}
        onInteractOutside={(e) => {
          if (isLoading) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (isLoading) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (showQuickPatient) {
            e.preventDefault();
            setShowQuickPatient(false);
          } else if (isLoading) {
            e.preventDefault();
          }
        }}
      >
        {/* Inner relative wrapper — never put `relative` on SheetContent itself;
            it overrides Tailwind `fixed` and parks the panel below the viewport. */}
        <div className="relative flex min-h-0 flex-1 flex-col">
        {(isLoading || loadingSlots) && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-[2px] transition-opacity duration-200"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
              {isLoading ? 'Guardando cita…' : 'Cargando horarios…'}
            </p>
          </div>
        )}

        <SheetHeader>
          <SheetTitle>
            {appointment ? 'Editar Cita' : 'Nueva Cita'}
          </SheetTitle>
          <SheetDescription id="appointment-description">
            {appointment
              ? 'Modifica los detalles de la cita'
              : 'Completa el formulario para crear una nueva cita'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="relative flex min-h-0 flex-1 flex-col">
          <fieldset disabled={isLoading} className="min-w-0 min-h-0 flex-1 border-0 p-0 m-0">
          <ScrollArea className="h-[calc(100vh-200px)] pr-4">
            <div className="space-y-6 py-6">
              {/* Patient */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="patientId">
                    Paciente <span className="text-destructive">*</span>
                  </Label>
                  {!appointment && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 min-h-11"
                      onClick={() => setShowQuickPatient(true)}
                    >
                      <UserPlus className="w-4 h-4" aria-hidden="true" />
                      Nuevo paciente
                    </Button>
                  )}
                </div>
                <Controller
                  name="patientId"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={patientOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecciona un paciente"
                      searchPlaceholder="Buscar paciente…"
                    />
                  )}
                />
                {errors.patientId && (
                  <p className="text-sm text-destructive">
                    {errors.patientId.message}
                  </p>
                )}
              </div>

              {/* Professional */}
              <div className="space-y-2">
                <Label htmlFor="professionalId">
                  Profesional <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="professionalId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={loadingProfessionals}
                    >
                      <SelectTrigger id="professionalId" className="min-h-11">
                        <SelectValue
                          placeholder={
                            loadingProfessionals
                              ? 'Cargando profesionales…'
                              : 'Selecciona un profesional'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id}>
                            {prof.firstName} {prof.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.professionalId && (
                  <p className="text-sm text-destructive">
                    {errors.professionalId.message}
                  </p>
                )}
              </div>

              {/* Services */}
              <ServiceSelector
                services={services}
                selectedServiceIds={selectedServiceIds}
                onSelectionChange={(ids) => {
                  setSelectedServiceIds(ids);
                  setValue('serviceIds', ids);
                }}
                error={errors.serviceIds?.message}
              />

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Fecha <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker
                    date={selectedDate}
                    onDateChange={(date) => {
                      if (date) setSelectedDate(date);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">
                    Hora <span className="text-destructive">*</span>
                  </Label>
                  <TimePicker
                    value={selectedTime}
                    slots={availableSlots}
                    loading={loadingSlots}
                    onChange={setSelectedTime}
                  />
                </div>
              </div>
              {errors.startTime && (
                <p className="text-sm text-destructive">
                  {errors.startTime.message}
                </p>
              )}

              {/* Session Number */}
              <div className="space-y-2">
                <Label htmlFor="sessionNumber">Número de Sesión (Opcional)</Label>
                <input
                  id="sessionNumber"
                  type="number"
                  min="1"
                  step="1"
                  {...register('sessionNumber', { valueAsNumber: true })}
                  placeholder="Ej: 2 para SEGUNDA SESIÓN"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Para paquetes de múltiples sesiones (ej: ozono y láser)
                </p>
                {errors.sessionNumber && (
                  <p className="text-sm text-destructive">
                    {errors.sessionNumber.message}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Notas adicionales sobre la cita..."
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
          </fieldset>

          <SheetFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {appointment ? 'Actualizar Cita' : 'Crear Cita'}
            </Button>
          </SheetFooter>
        </form>
        </div>
      </SheetContent>
    </Sheet>

    <QuickPatientModal
      isOpen={isOpen && showQuickPatient}
      onClose={() => setShowQuickPatient(false)}
      onSuccess={async (patientId) => {
        await fetchPatients({ limit: 1000 }, true);
        setValue('patientId', patientId, { shouldValidate: true });
        setShowQuickPatient(false);
        toast.success('Paciente creado');
      }}
    />
    </>
  );
}
