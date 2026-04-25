import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { REFERRAL_SOURCE_LABELS } from '@/types/patient.types';

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
}

interface PatientFiltersProps {
  searchQuery: string;
  assignedProfessionalFilter: string | null;
  referralSourceFilter: string | null;
  professionals: Professional[];
  onSearchChange: (value: string) => void;
  onProfessionalFilterChange: (value: string) => void;
  onReferralSourceFilterChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function PatientFilters({
  searchQuery,
  assignedProfessionalFilter,
  referralSourceFilter,
  professionals,
  onSearchChange,
  onProfessionalFilterChange,
  onReferralSourceFilterChange,
  onClearFilters,
  hasActiveFilters,
}: PatientFiltersProps) {
  const professionalOptions = [
    { value: 'all', label: 'Todos los profesionales' },
    ...professionals.map((prof) => ({
      value: prof.id,
      label: `${prof.firstName} ${prof.lastName}`,
    })),
  ];

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-tertiary))] z-10 pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre completo o DNI..."
            className="pl-9 h-9"
          />
        </div>

        {/* Professional Filter */}
        <Combobox
          options={professionalOptions}
          value={assignedProfessionalFilter || 'all'}
          onValueChange={onProfessionalFilterChange}
          placeholder="Profesional"
          searchPlaceholder="Buscar profesional..."
          emptyText="No se encontraron profesionales"
          className="w-[200px]"
        />

        {/* Referral Source Filter */}
        <Select
          value={referralSourceFilter || 'all'}
          onValueChange={onReferralSourceFilterChange}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Fuente de referencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fuentes</SelectItem>
            {Object.entries(REFERRAL_SOURCE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1 h-9"
          >
            <X className="w-4 h-4" />
            Limpiar
          </Button>
        )}
      </div>
    </Card>
  );
}
