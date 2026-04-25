import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ProductCategory } from '@/services/inventory.service';

interface ProductFiltersProps {
  searchQuery: string;
  categoryFilter: string | null;
  lowStockFilter: boolean;
  categories: ProductCategory[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string | null) => void;
  onLowStockChange: (value: boolean) => void;
  onReset: () => void;
}

export function ProductFilters({
  searchQuery,
  categoryFilter,
  lowStockFilter,
  categories,
  onSearchChange,
  onCategoryChange,
  onLowStockChange,
  onReset,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10"
        />
      </div>
      
      <Select 
        value={categoryFilter || 'all'} 
        onValueChange={(value) => onCategoryChange(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[180px] h-10">
          <SelectValue placeholder="Todas las categorías" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background h-10">
        <Switch
          id="low-stock"
          checked={lowStockFilter}
          onCheckedChange={onLowStockChange}
        />
        <Label htmlFor="low-stock" className="cursor-pointer text-sm font-normal">
          Solo stock bajo
        </Label>
      </div>

      {(searchQuery || categoryFilter || lowStockFilter) && (
        <Button 
          variant="ghost" 
          onClick={onReset} 
          size="sm"
          className="gap-2 h-10"
        >
          <Filter className="h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
