import { usePatientsStore } from '@/stores/usePatientsStore';
import { usePatientsHandlers } from '@/hooks/usePatientsHandlers';
import { PatientFilters } from '@/components/patients/PatientFilters';
import { PatientTable } from '@/components/patients/PatientTable';
import { DeletePatientDialog } from '@/components/patients/DeletePatientDialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw } from 'lucide-react';

export default function PatientsPage() {
  const {
    patients,
    isLoading,
    totalPatients,
    hasMore,
    searchQuery,
    assignedProfessionalFilter,
    referralSourceFilter,
    setSearchQuery,
  } = usePatientsStore();

  const {
    professionals,
    showDeleteModal,
    observerTarget,
    handleDeleteClick,
    confirmDelete,
    cancelDelete,
    handleProfessionalFilterChange,
    handleReferralSourceFilterChange,
    clearFilters,
    handleRefresh,
  } = usePatientsHandlers();

  const hasActiveFilters =
    !!searchQuery || !!assignedProfessionalFilter || !!referralSourceFilter;

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
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Button asChild className="gap-2 bg-primary shadow-md">
            <a href="/app/dashboard/patients/new">
              <Plus className="w-5 h-5" />
              Nuevo Paciente
            </a>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <PatientFilters
        searchQuery={searchQuery}
        assignedProfessionalFilter={assignedProfessionalFilter}
        referralSourceFilter={referralSourceFilter}
        professionals={professionals}
        onSearchChange={setSearchQuery}
        onProfessionalFilterChange={handleProfessionalFilterChange}
        onReferralSourceFilterChange={handleReferralSourceFilterChange}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Results Count - Only show when filters are active */}
      {!isLoading && patients.length > 0 && hasActiveFilters && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {totalPatients} paciente{totalPatients !== 1 ? 's' : ''} encontrado
            {totalPatients !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}

      {/* Patient Table */}
      <PatientTable
        patients={patients}
        isLoading={isLoading}
        onDelete={handleDeleteClick}
      />

      {/* Infinite Scroll Observer */}
      {hasMore && !isLoading && (
        <div ref={observerTarget} className="h-10 flex items-center justify-center">
          <span className="text-sm text-[rgb(var(--text-secondary))]">
            Cargando más pacientes...
          </span>
        </div>
      )}

      {/* Loading More Indicator */}
      {isLoading && patients.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeletePatientDialog
        open={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
