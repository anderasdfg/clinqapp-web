import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/types/appointment.types';
import type { Appointment } from '@/types/appointment.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    ChevronLeft, 
    Pencil, 
    User, 
    Calendar, 
    Clock, 
    Phone, 
    Mail, 
    MapPin, 
    Briefcase, 
    AlertCircle, 
    History, 
    Plus,
    FileText,
    Activity,
    Stethoscope,
    ChevronRight,
    Info,
    Shield,
    ShieldAlert,
    Footprints
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from "@/components/ui/scroll-area";
import PodiatryHistoryForm from '@/components/medical-records/PodiatryHistoryForm';
import { toast } from 'sonner';

const PatientDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedPatient, isLoading, fetchPatientById } = usePatientsStore();
    const { appointments, fetchAppointments } = useAppointmentsStore();
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    
    // Handle tab from URL query params
    const queryParams = new URLSearchParams(window.location.search);
    const initialTab = queryParams.get('tab') || 'profile';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isEditingHistory, setIsEditingHistory] = useState(false);

    // Sync activeTab with URL (optional but helpful)
    useEffect(() => {
        const tab = queryParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [window.location.search]);

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
    const patientAppointments = appointments
        .filter(apt => apt.patientId === id)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    const completedAppointments = patientAppointments.filter(apt => apt.status === 'COMPLETED');
    const lastAppointment = patientAppointments.length > 0 ? patientAppointments[0] : null;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!selectedPatient) {
        return (
            <Card className="p-8 text-center max-w-lg mx-auto mt-12">
                <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Paciente no encontrado</h2>
                <p className="text-[rgb(var(--text-secondary))] mb-6">
                    El registro que buscas no existe o ha sido eliminado.
                </p>
                <Button variant="outline" onClick={() => navigate('/dashboard/patients')}>
                    Volver a la lista
                </Button>
            </Card>
        );
    }

    return (
        <div className="animate-fade-in space-y-6 max-w-7xl mx-auto">
            {/* Header optimized */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/dashboard/patients')}
                        className="rounded-full h-10 w-10"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-sm">
                            <AvatarFallback 
                                className="text-white text-xl font-bold"
                                style={{ background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)' }}
                            >
                                {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">
                                    {selectedPatient.firstName} {selectedPatient.lastName}
                                </h1>
                                <Badge variant="secondary" className="font-semibold">
                                    DNI: {selectedPatient.dni || '---'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-[rgb(var(--text-secondary))] text-sm">
                                <span className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" /> {selectedPatient.phone}
                                </span>
                                {selectedPatient.email && (
                                    <span className="items-center gap-1 hidden sm:flex">
                                        <Mail className="w-3.5 h-3.5" /> {selectedPatient.email}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" asChild>
                        <Link to={`/dashboard/patients/${id}/edit`}>
                            <Pencil className="w-4 h-4" />
                            Editar Perfil
                        </Link>
                    </Button>
                    <Button className="gap-2 bg-primary shadow-md">
                        <Plus className="w-4 h-4" />
                        Nueva Cita
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/50 p-1">
                    <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <User className="w-4 h-4" />
                        Perfil
                    </TabsTrigger>
                    <TabsTrigger value="medical-record" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Stethoscope className="w-4 h-4" />
                        Historia
                    </TabsTrigger>
                    <TabsTrigger value="evolutions" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <History className="w-4 h-4" />
                        Evoluciones
                    </TabsTrigger>
                </TabsList>

                {/* TAB CONTENT: PROFILE */}
                <TabsContent value="profile" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Details */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3 border-b bg-muted/10">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Info className="w-5 h-5 text-primary" />
                                        Información Personal
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <InfoItem label="Fecha de Nacimiento" value={formatDate(selectedPatient.dateOfBirth)} icon={<Calendar className="w-4 h-4" />} />
                                        <InfoItem label="Edad" value={calculateAge(selectedPatient.dateOfBirth)} icon={<Clock className="w-4 h-4" />} />
                                        <InfoItem label="Género" value={selectedPatient.gender || 'No especificado'} icon={<User className="w-4 h-4" />} />
                                        <InfoItem label="Ocupación" value={selectedPatient.occupation || 'No especificada'} icon={<Briefcase className="w-4 h-4" />} />
                                        <InfoItem label="Dirección" value={selectedPatient.address || 'No registrada'} icon={<MapPin className="w-4 h-4" />} fullWidth />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Details */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3 border-b bg-muted/10">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-red-500" />
                                        Contacto de Emergencia
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoItem label="Nombre de Contacto" value={selectedPatient.emergencyContact || 'No registrado'} />
                                        <InfoItem label="Teléfono de Emergencia" value={selectedPatient.emergencyPhone || 'No registrado'} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Summary Column */}
                        <div className="space-y-6">
                            <Card className="shadow-sm border-primary/10">
                                <CardHeader className="pb-3 bg-primary/5">
                                    <CardTitle className="text-md font-bold uppercase tracking-wider text-primary">
                                        Resumen de Citas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Citas Totales</span>
                                        <span className="font-bold">{patientAppointments.length}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Completadas</span>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {completedAppointments.length}
                                        </Badge>
                                    </div>
                                    <Separator />
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Última Visita</span>
                                        <p className="font-medium">
                                            {lastAppointment ? formatDate(lastAppointment.startTime) : 'Sin visitas registradas'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="pb-3 bg-muted/10">
                                    <CardTitle className="text-sm font-semibold">Profesional Responsable</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            <User className="w-5 h-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {selectedPatient.assignedProfessional
                                                ? `${selectedPatient.assignedProfessional.firstName} ${selectedPatient.assignedProfessional.lastName}`
                                                : 'Sin profesional asignado'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedPatient.assignedProfessional?.specialty || 'Podología General'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB CONTENT: MEDICAL RECORD */}
                <TabsContent value="medical-record" className="mt-6">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            {!isEditingHistory && (!selectedPatient.medicalHistory) ? (
                                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-muted-foreground/20">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                        <Stethoscope className="w-10 h-10 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">Sin Historia Clínica Registrada</h3>
                                    <p className="text-muted-foreground max-w-sm mb-8">
                                        Este paciente aún no cuenta con una historia podológica detallada. Comienza el examen técnico para registrar sus antecedentes.
                                    </p>
                                    <Button 
                                        onClick={() => setIsEditingHistory(true)}
                                        className="gap-2 px-8"
                                    >
                                        <Plus className="w-4 h-4" /> Registrar Historia Clínica
                                    </Button>
                                </div>
                            ) : isEditingHistory ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold tracking-tight">Registro de Historia Clínica</h2>
                                            <p className="text-muted-foreground">Complete los campos de la evaluación podológica especializada.</p>
                                        </div>
                                        <Button variant="outline" onClick={() => setIsEditingHistory(false)}>
                                            Cancelar
                                        </Button>
                                    </div>
                                    <PodiatryHistoryForm 
                                        patientId={selectedPatient.id}
                                        initialData={selectedPatient.medicalHistory}
                                        onSuccess={() => {
                                            setIsEditingHistory(false);
                                            toast.success('Historia clínica actualizada correctamente');
                                            fetchPatientById(selectedPatient.id); // Refresh patient data
                                        }}
                                        onCancel={() => setIsEditingHistory(false)}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between bg-white p-6 rounded-2xl border shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <Stethoscope className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">Resumen de Historia</h3>
                                                <p className="text-sm text-muted-foreground">Última actualización: {format(new Date(selectedPatient.updatedAt), "dd 'de' MMMM, yyyy", { locale: es })}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setIsEditingHistory(true)}
                                            className="gap-2"
                                        >
                                            <Pencil className="w-4 h-4" /> Editar Historia
                                        </Button>
                                    </div>

                                    {/* Quick Summary View of History */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card className="bg-blue-50/30 border-blue-100">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                                    <Activity className="w-4 h-4" /> Diabetes
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-bold text-blue-900">
                                                    {selectedPatient.medicalHistory?.systemic?.diabetes?.has ? 'SÍ' : 'NO'}
                                                </p>
                                                {selectedPatient.medicalHistory?.systemic?.diabetes?.has && (
                                                    <p className="text-xs text-blue-700 mt-1">
                                                        Tipo {selectedPatient.medicalHistory?.systemic?.diabetes?.type} - {selectedPatient.medicalHistory?.systemic?.diabetes?.controlled ? 'Controlada' : 'No controlada'}
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                        
                                        <Card className="bg-red-50/30 border-red-100">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-bold text-red-800 flex items-center gap-2">
                                                    <ShieldAlert className="w-4 h-4" /> Alergias
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-bold text-red-900 truncate">
                                                    {selectedPatient.medicalHistory?.allergies?.medication || 'Ninguna'}
                                                </p>
                                                {selectedPatient.medicalHistory?.allergies?.latex && (
                                                    <Badge variant="destructive" className="mt-1">Alergia al Látex</Badge>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-emerald-50/30 border-emerald-100">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                                                    <Footprints className="w-4 h-4" /> Pie
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-bold text-emerald-900">
                                                    {selectedPatient.medicalHistory?.podiatricExam?.biomechanical?.footType || 'N/A'}
                                                </p>
                                                <p className="text-xs text-emerald-700 mt-1">
                                                    {selectedPatient.medicalHistory?.podiatricExam?.nails?.onychopathy?.length || 0} Onicopatías reg.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="flex justify-center">
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setIsEditingHistory(true)}
                                            className="text-primary gap-2"
                                        >
                                            Ver Detalles Completos <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB CONTENT: EVOLUTIONS */}
                <TabsContent value="evolutions" className="mt-6">
                    <Card className="shadow-sm">
                        <CardHeader className="border-b bg-muted/10 pb-4">
                            <CardTitle className="text-xl">Evoluciones y Notas Clínicas</CardTitle>
                            <CardDescription>Seguimiento cronológico del tratamiento</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {patientAppointments.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No hay registros de evolución disponibles.</p>
                                </div>
                            ) : (
                                <ScrollArea className="max-h-[600px]">
                                    <div className="divide-y">
                                        {patientAppointments.map((apt) => (
                                            <div 
                                                key={apt.id} 
                                                className="p-6 hover:bg-muted/50 transition-colors cursor-pointer group"
                                                onClick={() => {
                                                    setSelectedAppointment(apt);
                                                    setShowDetailModal(true);
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-bold text-primary">
                                                                {formatDate(apt.startTime)}
                                                            </span>
                                                            <Badge className={APPOINTMENT_STATUS_COLORS[apt.status]}>
                                                                {APPOINTMENT_STATUS_LABELS[apt.status]}
                                                            </Badge>
                                                        </div>
                                                        <h4 className="font-semibold text-lg">
                                                            {apt.service?.name || 'Servicio de Podología'}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <User className="w-3.5 h-3.5" />
                                                            Dr. {apt.professional?.firstName} {apt.professional?.lastName}
                                                        </div>
                                                        {apt.clinicalNotes ? (
                                                            <p className="text-sm text-[rgb(var(--text-primary))] mt-4 line-clamp-3 bg-white p-3 rounded-md border italic">
                                                                "{apt.clinicalNotes}"
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground mt-2 italic">
                                                                Sin notas clínicas registradas en esta cita.
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Appointment Detail Modal refactored to shadcn Dialog */}
            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-2xl">Detalle de la Atención</DialogTitle>
                                <DialogDescription>
                                    Cita del {selectedAppointment ? formatDateTime(selectedAppointment.startTime) : ''}
                                </DialogDescription>
                            </div>
                            {selectedAppointment && (
                                <Badge className={APPOINTMENT_STATUS_COLORS[selectedAppointment.status]}>
                                    {APPOINTMENT_STATUS_LABELS[selectedAppointment.status]}
                                </Badge>
                            )}
                        </div>
                    </DialogHeader>

                    {selectedAppointment && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">Servicio</label>
                                    <p className="font-medium text-lg">{selectedAppointment.service?.name || 'Servicio de Podología'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">Profesional</label>
                                    <p className="font-medium text-lg">Dr. {selectedAppointment.professional?.firstName} {selectedAppointment.professional?.lastName}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    <h4 className="font-bold">Evolución y Hallazgos</h4>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-lg border min-h-[100px]">
                                    {selectedAppointment.clinicalNotes ? (
                                        <p className="text-[rgb(var(--text-primary))] whitespace-pre-wrap leading-relaxed">
                                            {selectedAppointment.clinicalNotes}
                                        </p>
                                    ) : (
                                        <p className="text-muted-foreground italic text-sm text-center pt-8">
                                            No se ingresaron notas clínicas detalladas para esta cita.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {selectedAppointment.notes && (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">Notas Administrativas</label>
                                    <p className="text-sm">{selectedAppointment.notes}</p>
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" />
                                        <h4 className="font-bold">Evidencia Clínica</h4>
                                    </div>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Plus className="w-4 h-4" /> Añadir Foto
                                    </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="aspect-square bg-muted rounded-md border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground">
                                        <CameraIcon className="w-6 h-6 mb-1" />
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Sin fotos</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Internal components for clean UI
const InfoItem = ({ label, value, icon, fullWidth = false }: { 
    label: string, 
    value: React.ReactNode, 
    icon?: React.ReactNode,
    fullWidth?: boolean 
}) => (
    <div className={`space-y-1 ${fullWidth ? 'md:col-span-2' : ''}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
            {icon && <span className="opacity-70">{icon}</span>}
            <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-[rgb(var(--text-primary))] font-medium pl-6">
            {value}
        </p>
    </div>
);

// Shorthand for simple icons missing from Lucide but needed
const CameraIcon = (props: any) => (
    <svg 
        {...props} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default PatientDetailPage;

