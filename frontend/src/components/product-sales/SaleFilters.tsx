import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SaleFiltersProps {
  searchQuery: string;
  startDate: string;
  endDate: string;
  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onApplyFilters: () => void;
  onReset: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export function SaleFilters({
  searchQuery,
  startDate,
  endDate,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onApplyFilters,
  onReset,
  onExport,
  isExporting,
}: SaleFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por cliente..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10"
        />
      </div>

      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="w-[160px] h-10"
        placeholder="Fecha inicio"
      />

      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="w-[160px] h-10"
        placeholder="Fecha fin"
      />

      <Button 
        variant="outline" 
        onClick={onApplyFilters}
        className="gap-2 h-10"
      >
        <Filter className="h-4 w-4" />
        Filtrar
      </Button>

      {(searchQuery || startDate || endDate) && (
        <Button 
          variant="ghost" 
          onClick={onReset}
          size="sm"
          className="gap-2 h-10"
        >
          <Filter className="h-4 w-4" />
          Limpiar
        </Button>
      )}

      <Button 
        variant="outline" 
        onClick={onExport}
        disabled={isExporting}
        className="gap-2 h-10 ml-auto"
      >
        {isExporting ? 'Exportando...' : 'Exportar'}
      </Button>
    </div>
  );
}
