import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { REFERRAL_SOURCE_LABELS, ReferralSource } from '@/types/patient.types';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
    Search, 
    Plus, 
    Eye, 
    Pencil, 
    Trash2, 
    MoreVertical, 
    ChevronLeft, 
    ChevronRight,
    Users,
    AlertTriangle,
    X,
    Filter,
    RefreshCw
} from 'lucide-react';
import { staffService } from '@/services/staff.service';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

const PatientsPage = () => {
    const {
        patients,
        isLoading,
        currentPage,
        totalPages,
        totalPatients,
        searchQuery,
        assignedProfessionalFilter,
        referralSourceFilter,
        setSearchQuery,
        setAssignedProfessionalFilter,
        setReferralSourceFilter,
        setCurrentPage,
        fetchPatients,
        deletePatient,
    } = usePatientsStore();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
    const [professionals, setProfessionals] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
    
    // Column filters
    const [columnFilters, setColumnFilters] = useState({
        patient: '',
        dni: '',
        contact: '',
        professional: [] as string[],
        referralSource: [] as string[],
    });
    
    const [openFilterPopover, setOpenFilterPopover] = useState<string | null>(null);
    const isFirstRender = useState(true);

    useEffect(() => {
        fetchPatients();
        loadProfessionals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Auto-search with debounce (skip on first render)
    useEffect(() => {
        // Skip the first render to avoid duplicate fetch
        if (isFirstRender[0]) {
            isFirstRender[1](false);
            return;
        }

        const debounceTimer = setTimeout(() => {
            fetchPatients();
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(debounceTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]); // Only depend on searchQuery

    const loadProfessionals = async () => {
        try {
            const response = await staffService.getStaff({ limit: 100 });
            setProfessionals(response.data);
        } catch (error) {
            console.error('Error loading professionals:', error);
        }
    };

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

    const handleProfessionalFilterChange = (value: string) => {
        setAssignedProfessionalFilter(value === 'all' ? null : value);
        fetchPatients();
    };

    const handleReferralSourceFilterChange = (value: string) => {
        setReferralSourceFilter(value === 'all' ? null : value as ReferralSource);
        fetchPatients();
    };

    const clearFilters = () => {
        setSearchQuery('');
        setAssignedProfessionalFilter(null);
        setReferralSourceFilter(null);
        fetchPatients();
    };

    const hasActiveFilters = searchQuery || assignedProfessionalFilter || referralSourceFilter;

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
        } catch {
            return '-';
        }
    };

    // Prepare options for Combobox
    const professionalOptions = [
        { value: 'all', label: 'Todos los profesionales' },
        ...professionals.map(prof => ({
            value: prof.id,
            label: `${prof.firstName} ${prof.lastName}`
        }))
    ];

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                        Pacientes
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))]">
                        Gestiona la información de tus pacientes
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={() => fetchPatients({}, true)} 
                        variant="outline"
                        className="gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualizar
                    </Button>
                    <Button asChild className="gap-2 bg-primary shadow-md">
                        <a href="/dashboard/patients/new">
                            <Plus className="w-5 h-5" />
                            Nuevo Paciente
                        </a>
                    </Button>
                </div>
            </div>

            {/* Search and Filters - Single Line */}
            <Card className="p-4">
                <form onSubmit={handleSearch}>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="flex-1 min-w-[100px] relative">
                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-tertiary))] z-10 pointer-events-none" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por nombre, DNI, teléfono o email..."
                                className="pl-9 h-9"
                            />
                        </div>

                        {/* Professional Filter - Combobox */}
                        <Combobox
                            options={professionalOptions}
                            value={assignedProfessionalFilter || 'all'}
                            onValueChange={handleProfessionalFilterChange}
                            placeholder="Todos los profesionales"
                            searchPlaceholder="Buscar profesional..."
                            emptyText="No se encontró profesional."
                            className="w-[220px] h-9"
                        />

                        {/* Referral Source Filter */}
                        <Select
                            value={referralSourceFilter || 'all'}
                            onValueChange={handleReferralSourceFilterChange}
                        >
                            <SelectTrigger className="w-[200px] h-9">
                                <SelectValue placeholder="Fuente de referencia" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las fuentes</SelectItem>
                                {Object.entries(REFERRAL_SOURCE_LABELS).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Search Button */}
                        <Button type="submit" className="gap-2 h-9 hover:opacity-90 transition-opacity">
                            <Search className="w-4 h-4" />
                            Buscar
                        </Button>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="gap-2 hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Limpiar filtros
                            </Button>
                        )}
                    </div>
                </form>
            </Card>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {/* Paciente Column */}
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        <span>Paciente</span>
                                        <Popover open={openFilterPopover === 'patient'} onOpenChange={(open) => setOpenFilterPopover(open ? 'patient' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                    <Filter className={`h-3.5 w-3.5 ${columnFilters.patient ? 'text-primary' : 'text-muted-foreground'}`} />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64" align="start">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-sm">Filtrar por Paciente</h4>
                                                    <Input
                                                        placeholder="Buscar paciente..."
                                                        value={columnFilters.patient}
                                                        onChange={(e) => setColumnFilters({ ...columnFilters, patient: e.target.value })}
                                                        className="h-8"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setColumnFilters({ ...columnFilters, patient: '' });
                                                                setOpenFilterPopover(null);
                                                            }}
                                                            variant="outline"
                                                            className="flex-1 h-8"
                                                        >
                                                            Limpiar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setOpenFilterPopover(null)}
                                                            className="flex-1 h-8"
                                                        >
                                                            Aplicar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </TableHead>
                                
                                {/* DNI Column */}
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        <span>DNI</span>
                                        <Popover open={openFilterPopover === 'dni'} onOpenChange={(open) => setOpenFilterPopover(open ? 'dni' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                    <Filter className={`h-3.5 w-3.5 ${columnFilters.dni ? 'text-primary' : 'text-muted-foreground'}`} />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64" align="start">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-sm">Filtrar por DNI</h4>
                                                    <Input
                                                        placeholder="Buscar DNI..."
                                                        value={columnFilters.dni}
                                                        onChange={(e) => setColumnFilters({ ...columnFilters, dni: e.target.value })}
                                                        className="h-8"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setColumnFilters({ ...columnFilters, dni: '' });
                                                                setOpenFilterPopover(null);
                                                            }}
                                                            variant="outline"
                                                            className="flex-1 h-8"
                                                        >
                                                            Limpiar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setOpenFilterPopover(null)}
                                                            className="flex-1 h-8"
                                                        >
                                                            Aplicar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </TableHead>
                                
                                {/* Contacto Column */}
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        <span>Contacto</span>
                                        <Popover open={openFilterPopover === 'contact'} onOpenChange={(open) => setOpenFilterPopover(open ? 'contact' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                    <Filter className={`h-3.5 w-3.5 ${columnFilters.contact ? 'text-primary' : 'text-muted-foreground'}`} />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64" align="start">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-sm">Filtrar por Contacto</h4>
                                                    <Input
                                                        placeholder="Buscar teléfono o email..."
                                                        value={columnFilters.contact}
                                                        onChange={(e) => setColumnFilters({ ...columnFilters, contact: e.target.value })}
                                                        className="h-8"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setColumnFilters({ ...columnFilters, contact: '' });
                                                                setOpenFilterPopover(null);
                                                            }}
                                                            variant="outline"
                                                            className="flex-1 h-8"
                                                        >
                                                            Limpiar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setOpenFilterPopover(null)}
                                                            className="flex-1 h-8"
                                                        >
                                                            Aplicar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </TableHead>
                                
                                {/* Profesional Column */}
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        <span>Profesional</span>
                                        <Popover open={openFilterPopover === 'professional'} onOpenChange={(open) => setOpenFilterPopover(open ? 'professional' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                    <Filter className={`h-3.5 w-3.5 ${columnFilters.professional.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64" align="start">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-sm">Filtrar por Profesional</h4>
                                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                                        {professionals.map((prof) => (
                                                            <div key={prof.id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`prof-${prof.id}`}
                                                                    checked={columnFilters.professional.includes(prof.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            setColumnFilters({
                                                                                ...columnFilters,
                                                                                professional: [...columnFilters.professional, prof.id]
                                                                            });
                                                                        } else {
                                                                            setColumnFilters({
                                                                                ...columnFilters,
                                                                                professional: columnFilters.professional.filter(id => id !== prof.id)
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                                <label
                                                                    htmlFor={`prof-${prof.id}`}
                                                                    className="text-sm cursor-pointer"
                                                                >
                                                                    {prof.firstName} {prof.lastName}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-2 pt-2 border-t">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setColumnFilters({ ...columnFilters, professional: [] });
                                                                setOpenFilterPopover(null);
                                                            }}
                                                            variant="outline"
                                                            className="flex-1 h-8"
                                                        >
                                                            Limpiar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setOpenFilterPopover(null)}
                                                            className="flex-1 h-8"
                                                        >
                                                            Aplicar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </TableHead>
                                
                                {/* Fecha de Registro Column */}
                                <TableHead>Fecha de Registro</TableHead>
                                
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : patients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Users className="w-12 h-12 text-[rgb(var(--text-tertiary))]" />
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
                                    </TableCell>
                                </TableRow>
                            ) : (
                                patients.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback
                                                        style={{
                                                            background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                                                        }}
                                                        className="text-white font-semibold"
                                                    >
                                                        {patient.firstName[0]}{patient.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-[rgb(var(--text-primary))]">
                                                        {patient.firstName} {patient.lastName}
                                                    </div>
                                                    <Badge variant="secondary" className="mt-1">
                                                        {REFERRAL_SOURCE_LABELS[patient.referralSource]}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[rgb(var(--text-primary))]">
                                                {patient.dni || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-[rgb(var(--text-primary))]">
                                                    {patient.phone}
                                                </div>
                                                <div className="text-sm text-[rgb(var(--text-secondary))]">
                                                    {patient.email || '-'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[rgb(var(--text-primary))]">
                                                {patient.assignedProfessional
                                                    ? `${patient.assignedProfessional.firstName} ${patient.assignedProfessional.lastName}`
                                                    : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-[rgb(var(--text-secondary))]">
                                                {formatDate(patient.createdAt)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            to={`/dashboard/patients/${patient.id}`}
                                                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Ver detalles
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            to={`/dashboard/patients/${patient.id}/edit`}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                            Editar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(patient.id)}
                                                        className="flex items-center gap-2 text-error cursor-pointer hover:bg-error/10 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-[rgb(var(--border-primary))] flex items-center justify-between">
                        <div className="text-sm text-[rgb(var(--text-secondary))]">
                            Mostrando {patients.length} de {totalPatients} pacientes
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCurrentPage(currentPage - 1);
                                    fetchPatients({ page: currentPage - 1 });
                                }}
                                disabled={currentPage === 1}
                                className="gap-2 hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </Button>
                            <span className="px-4 py-2 text-sm text-[rgb(var(--text-primary))] flex items-center">
                                Página {currentPage} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCurrentPage(currentPage + 1);
                                    fetchPatients({ page: currentPage + 1 });
                                }}
                                disabled={currentPage === totalPages}
                                className="gap-2 hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                            >
                                Siguiente
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-error/10">
                                <AlertTriangle className="h-5 w-5 text-error" />
                            </div>
                            <DialogTitle>Eliminar paciente</DialogTitle>
                        </div>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                            className="hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="hover:opacity-90 transition-opacity"
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PatientsPage;
