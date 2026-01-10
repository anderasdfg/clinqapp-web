import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Search,
    Eye, 
    Activity,
    ShieldAlert,
    AlertCircle,
    FileText,
    History,
    ClipboardList
} from 'lucide-react';

const MedicalRecordsPage = () => {
    const {
        patients,
        isLoading,
        searchQuery,
        setSearchQuery,
        fetchPatients,
    } = usePatientsStore();

    useEffect(() => {
        fetchPatients({ limit: 100 }); // Get more for the clinical list
    }, [fetchPatients]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
        } catch {
            return '-';
        }
    };

    const getMedicalStatus = (patient: any) => {
        const history = patient.medicalHistory;
        if (!history) return { label: 'Sin Historia', color: 'bg-muted text-muted-foreground' };
        
        if (history.systemic?.diabetes?.has) {
            return { label: 'Diabetes', color: 'bg-blue-100 text-blue-700 border-blue-200' };
        }
        
        return { label: 'Registrada', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    };

    return (
        <div className="animate-fade-in space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">
                        Historias Clínicas
                    </h1>
                    <p className="text-muted-foreground">
                        Consulta y gestiona los registros podológicos de tus pacientes
                    </p>
                </div>
                <div className="flex gap-2">
                    <Card className="bg-primary/5 border-primary/10 px-4 py-2 flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase text-primary/70">Total Historias</p>
                            <p className="text-lg font-bold leading-none">{patients.filter(p => p.medicalHistory).length}</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Search Hub */}
            <Card className="shadow-md border-none bg-white p-2">
                <CardContent className="p-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar paciente por nombre o DNI para consulta clínica..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-12 border-none text-lg focus-visible:ring-0 shadow-none"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Records List */}
            <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[300px]">Paciente</TableHead>
                                <TableHead>Estado Clínico</TableHead>
                                <TableHead>Alertas</TableHead>
                                <TableHead>Última Atención</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            <p className="text-sm text-muted-foreground">Cargando registros clínicos...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : patients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                            <ClipboardList className="w-12 h-12 opacity-20" />
                                            <p>No se encontraron pacientes para los criterios de búsqueda.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                patients.map((patient) => {
                                    const status = getMedicalStatus(patient);
                                    return (
                                        <TableRow key={patient.id} className="hover:bg-muted/20 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-muted">
                                                        <AvatarFallback
                                                            className="text-primary bg-primary/5 font-semibold text-xs"
                                                        >
                                                            {patient.firstName[0]}{patient.lastName[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-bold text-foreground">
                                                            {patient.firstName} {patient.lastName}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            DNI: {patient.dni || '---'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${status.color} border shadow-none font-medium px-2.5 py-0.5`}>
                                                    {status.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1.5">
                                                    {patient.medicalHistory?.systemic?.diabetes?.has && (
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600" title="Paciente Diabético">
                                                            <Activity className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                    {patient.medicalHistory?.allergies?.medication && (
                                                        <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600" title={`Alergia: ${patient.medicalHistory.allergies.medication}`}>
                                                            <ShieldAlert className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                    {!patient.medicalHistory && (
                                                        <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600" title="Historia pendiente">
                                                            <AlertCircle className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-foreground">
                                                    <History className="w-4 h-4 text-muted-foreground" />
                                                    {formatDate(patient.updatedAt)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline" className="gap-2 h-8" asChild>
                                                    <Link to={`/dashboard/patients/${patient.id}?tab=medical-record`}>
                                                        <Eye className="w-4 h-4" />
                                                        Ver Historia
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};

export default MedicalRecordsPage;
