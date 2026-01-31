import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { 
    Camera, 
    X,
    Loader2,
    Phone,
    Trash2,
    AlertTriangle,
    Calendar,
    User,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import { Appointment, AppointmentStatus, APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS, PAYMENT_STATUS } from '@/types/appointment.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase/client';

import PodiatryHistoryForm from '@/components/medical-records/PodiatryHistoryForm';

interface ClinicalWorkspaceSheetProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onShowPayment?: (appointment: Appointment, postPaymentStatus?: AppointmentStatus) => void;
}

const ClinicalWorkspaceSheet = ({ appointment, isOpen, onClose, onShowPayment }: ClinicalWorkspaceSheetProps) => { /* Refactored ClinicalWorkspaceSheet */
  const { updateAppointment, fetchAppointmentById, isUpdating, appointments } = useAppointmentsStore();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('attention');
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch full appointment details on mount/open to get medicalHistory
  useEffect(() => {
    if (isOpen && appointment) {
        setIsLoading(true);
        // Optimistic update from props first
         setClinicalNotes(appointment.clinicalNotes || '');
         setCurrentImages(appointment.images || []);

        const loadDetails = async () => {
            try {
                await fetchAppointmentById(appointment.id);
                const updated = useAppointmentsStore.getState().appointments.find(a => a.id === appointment.id);
                if (updated) {
                     setClinicalNotes(updated.clinicalNotes || '');
                     setCurrentImages(updated.images || []);
                }
            } catch (error) {
                console.error('Error loading detail:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadDetails();
    }
  }, [isOpen, appointment?.id, fetchAppointmentById]);

  if (!appointment) return null;

  // Find the most up-to-date appointment object from store or props
  const currentAppointmentRaw = appointments.find(a => a.id === appointment.id) || appointment;

  const isReadOnly = ([
    APPOINTMENT_STATUS.COMPLETED,
    APPOINTMENT_STATUS.CANCELLED,
    APPOINTMENT_STATUS.NO_SHOW
  ] as AppointmentStatus[]).includes(currentAppointmentRaw.status);

  // We need to ensure we have the medicalHistory which might come from the fetch
  const patient = currentAppointmentRaw.patient;
  const medicalHistory = patient?.medicalHistory;
  const hasMedicalHistory = !!medicalHistory && Object.keys(medicalHistory).length > 0;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const files = Array.from(e.target.files);
    const newDocUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${appointment.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('treatments')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from('treatments')
          .getPublicUrl(filePath);

        newDocUrls.push(data.publicUrl);
      }

      setCurrentImages(prev => [...prev, ...newDocUrls]);
    } catch (error) {
      console.error('Error in upload process:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (status?: AppointmentStatus) => {
      try {
          await updateAppointment(appointment.id, {
              clinicalNotes,
              images: currentImages,
              ...(status && { status })
          });
          
          if (status === APPOINTMENT_STATUS.COMPLETED) {
             const isPaid = currentAppointmentRaw.payment?.status === PAYMENT_STATUS.COMPLETED;
             if (isPaid) {
                onClose();
             } else if (onShowPayment) {
                onShowPayment(currentAppointmentRaw, APPOINTMENT_STATUS.COMPLETED);
             } else {
                onClose();
             }
          } else {
             onClose();
          }
      } catch (error) {
          console.error('Error saving appointment:', error);
      }
  };

  const removeImage = (indexToRemove: number) => {
      setCurrentImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 h-[100dvh] w-full sm:w-[85vw] lg:w-[800px] bg-background border-l shadow-2xl transform transition-transform duration-300 z-50 data-[state=open]:animate-out data-[state=closed]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right flex flex-col">
          
          {isLoading ? (
            <div className="flex-1 flex flex-col">
              {/* Skeleton Header */}
              <div className="p-6 border-b flex items-start justify-between bg-background animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="h-10 w-10 rounded-full bg-muted" />
                </div>
              </div>

              {/* Skeleton Tabs */}
              <div className="px-6 border-b flex gap-6">
                <div className="h-11 w-20 bg-muted/50 rounded-t" />
                <div className="h-11 w-20 bg-muted/50 rounded-t" />
                <div className="h-11 w-20 bg-muted/50 rounded-t" />
              </div>

              {/* Skeleton Content */}
              <div className="p-6 space-y-6 flex-1 bg-muted/5 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-48 w-full bg-muted/50 rounded-lg" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-40 bg-muted rounded" />
                  <div className="grid grid-cols-4 gap-3">
                    <div className="aspect-square bg-muted/50 rounded-lg" />
                    <div className="aspect-square bg-muted/50 rounded-lg" />
                    <div className="aspect-square bg-muted/50 rounded-lg" />
                  </div>
                </div>
              </div>
              
              {/* Skeleton Footer */}
              <div className="p-4 border-t bg-background flex gap-3 animate-pulse">
                <div className="flex-1 h-10 bg-muted rounded-md" />
                <div className="flex-1 h-10 bg-muted rounded-md" />
              </div>
            </div>
          ) : (
            <>
          {/* Header (Sticky Top) */}
          <div className="p-6 border-b flex items-start justify-between bg-background/95 backdrop-blur z-10 sticky top-0">
            <div className="flex items-center gap-4">
               {/* Avatar Placeholder */}
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                {patient?.firstName?.[0]}{patient?.lastName?.[0]}
              </div>
              <div>
                 <h2 className="text-xl font-bold text-foreground">
                    {patient?.firstName} {patient?.lastName}
                 </h2>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                        {patient?.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} años` : 'Edad N/A'}
                    </span>
                    <Badge variant={
                        appointment.status === APPOINTMENT_STATUS.CONFIRMED ? 'default' : 
                        appointment.status === APPOINTMENT_STATUS.COMPLETED ? 'success' : 'secondary'
                    }>
                        {APPOINTMENT_STATUS_LABELS[appointment.status]}
                    </Badge>
                 </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
                {patient?.phone && (
                    <Button size="icon" variant="ghost" className="rounded-full text-muted-foreground hover:text-primary"
                        onClick={() => window.open(`tel:${patient.phone}`)}
                    >
                        <Phone className="h-5 w-5" />
                    </Button>
                )}
                <Button size="icon" variant="ghost" className="rounded-full text-muted-foreground hover:text-destructive" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
          </div>

          {/* Body with Tabs */}
          <Tabs.Root 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="flex-1 flex flex-col overflow-hidden"
          >
             <div className="px-6 border-b">
                 <Tabs.List className="flex gap-6">
                     <Tabs.Trigger value="attention" className="py-3 text-sm font-medium text-muted-foreground border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary transition-colors">
                        ATENCIÓN
                     </Tabs.Trigger>
                     <Tabs.Trigger value="history" className="py-3 text-sm font-medium text-muted-foreground border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary transition-colors">
                        HISTORIAL
                     </Tabs.Trigger>
                     <Tabs.Trigger value="data" className="py-3 text-sm font-medium text-muted-foreground border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary transition-colors">
                        DATOS
                     </Tabs.Trigger>
                 </Tabs.List>
             </div>

             <div className="flex-1 overflow-y-auto bg-muted/5 p-6 pb-20">
                 {/* Tab 1: ATENCIÓN */}
                 <Tabs.Content value="attention" className="space-y-6 outline-none animate-in fade-in-50">
                    {!hasMedicalHistory && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                                 <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                                     Paciente sin Historia Clínica Base
                                 </p>
                             </div>
                             {!isReadOnly && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="bg-white dark:bg-transparent border-yellow-300 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100"
                                    onClick={() => setActiveTab('data')}
                                >
                                    Crear Historia
                                </Button>
                             )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Evolución Clínica</label>
                        <Textarea 
                            value={clinicalNotes}
                            onChange={(e) => setClinicalNotes(e.target.value)}
                            placeholder={isReadOnly ? "No hay evolución registrada" : "Evolución del paciente..."} 
                            disabled={isReadOnly}
                            className="min-h-[200px] resize-none text-base p-4 bg-background shadow-sm border-muted focus:border-primary transition-colors disabled:opacity-80"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center justify-between">
                            <span>Evidencia Fotográfica</span>
                            <span className="text-xs text-muted-foreground">{currentImages.length} imágenes</span>
                        </label>
                        
                        {/* EvidenceUploader Component Inline */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                             {currentImages.map((url, idx) => (
                                 <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border bg-background">
                                     <img src={url} alt={`Evidencia ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                         <button onClick={() => removeImage(idx)} className="p-1.5 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20">
                                             <Trash2 className="h-4 w-4" />
                                         </button>
                                     </div>
                                 </div>
                             ))}
                             
                             {!isReadOnly && (
                                 <label className={`
                                    flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed
                                    cursor-pointer transition-colors h-40
                                    ${uploading ? 'bg-muted opacity-50 cursor-not-allowed' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5'}
                                 `}>
                                     <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                     />
                                     {uploading ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                     ) : (
                                        <>
                                            <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                                            <span className="text-xs text-center text-muted-foreground px-2">Subir fotos</span>
                                        </>
                                     )}
                                 </label>
                             )}
                        </div>
                    </div>
                 </Tabs.Content>
                                  {/* Tab 2: HISTORIAL */}
                  <Tabs.Content value="history" className="outline-none animate-in fade-in-50">
                     <div className="space-y-6">
                         <div className="flex items-center justify-between">
                             <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Historial de Citas</h3>
                             <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                 {patient?.appointments?.length || 0} Registros
                             </span>
                         </div>
                         
                         <div className="relative space-y-4 ml-3">
                             {/* Timeline Line */}
                             <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-muted-foreground/20" />
                             
                             {patient?.appointments?.map((appt) => {
                                 const isCurrent = appt.id === appointment.id;
                                 return (
                                     <div key={appt.id} className="relative pl-8">
                                         {/* Timeline Node */}
                                         <div className={`absolute left-[-4px] top-2.5 h-2.5 w-2.5 rounded-full border-2 bg-background transition-colors ${
                                             isCurrent ? 'border-primary scale-125' : 'border-muted-foreground/30'
                                         }`} />
                                         
                                         <div className={`
                                             group p-4 rounded-xl border transition-all duration-200
                                             ${isCurrent 
                                                 ? 'bg-primary/5 border-primary/20 shadow-sm' 
                                                 : 'bg-background hover:bg-muted/30 border-muted hover:border-muted-foreground/30'}
                                         `}>
                                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                 <div className="space-y-1">
                                                     <div className="flex items-center gap-2">
                                                         <span className="text-sm font-bold text-foreground">
                                                             {format(new Date(appt.startTime), "dd MMM yyyy", { locale: es })}
                                                         </span>
                                                         <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                             <Clock className="w-3 h-3" />
                                                             {format(new Date(appt.startTime), "HH:mm")}
                                                         </span>
                                                     </div>
                                                     <div className="flex flex-col">
                                                         <span className="text-sm font-medium text-foreground">
                                                             {appt.service?.name || 'Servicio no especificado'}
                                                         </span>
                                                         <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                             <User className="w-3 h-3" />
                                                             {appt.professional?.firstName} {appt.professional?.lastName}
                                                         </span>
                                                     </div>
                                                 </div>
                                                 
                                                 <div className="flex items-center gap-3">
                                                     <Badge variant={
                                                         appt.status === APPOINTMENT_STATUS.CONFIRMED ? 'default' : 
                                                         appt.status === APPOINTMENT_STATUS.COMPLETED ? 'success' : 'secondary'
                                                     } className="text-[10px] h-5">
                                                         {APPOINTMENT_STATUS_LABELS[appt.status]}
                                                     </Badge>
                                                     {isCurrent && (
                                                         <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Cita Actual</span>
                                                     )}
                                                 </div>
                                             </div>
                                             
                                             {appt.clinicalNotes && (
                                                 <div className="mt-3 pt-3 border-t border-dashed border-muted-foreground/20">
                                                     <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                                         "{appt.clinicalNotes}"
                                                     </p>
                                                 </div>
                                             )}
                                         </div>
                                     </div>
                                 );
                             })}

                             {(!patient?.appointments || patient.appointments.length === 0) && (
                                 <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                                     <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                     <p className="text-sm">No hay citas anteriores registradas</p>
                                 </div>
                             )}
                         </div>
                     </div>
                  </Tabs.Content>

                 {/* Tab 3: DATOS */}
                 <Tabs.Content value="data" className="outline-none animate-in fade-in-50 h-full">
                     <div className="h-full overflow-y-auto px-1">
                        <PodiatryHistoryForm 
                            patientId={patient?.id || currentAppointmentRaw.patientId} 
                            patientContext={patient} // Nueva prop para datos personales
                            initialData={medicalHistory} // Pasa los datos si existen para editar
                            onSuccess={() => {
                                fetchAppointmentById(appointment.id); // Recarga para quitar la alerta amarilla
                                setActiveTab('attention'); // Vuelve a la atención automáticamente
                            }}
                            onCancel={() => setActiveTab('attention')}
                        />
                     </div>
                 </Tabs.Content>
             </div>
          </Tabs.Root>

          {/* Footer (Sticky Bottom) */}
          <div className="p-4 border-t bg-background flex flex-col sm:flex-row gap-3">
             {isReadOnly ? (
                <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={onClose}
                >
                    Cerrar
                </Button>
             ) : (
                <>
                    <Button 
                        variant="outline" 
                        className="flex-1"
                        disabled={isUpdating}
                        onClick={() => handleSave()}
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Guardar Borrador
                    </Button>
                    <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        disabled={isUpdating}
                        onClick={() => handleSave(APPOINTMENT_STATUS.COMPLETED)}
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {currentAppointmentRaw.payment?.status === PAYMENT_STATUS.COMPLETED 
                            ? 'Finalizar Atención' 
                            : 'Finalizar y Cobrar'}
                    </Button>
                </>
             )}
          </div>
            </>
          )}

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ClinicalWorkspaceSheet;
