import { useState, useEffect } from 'react';
import { Check, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { Service } from '@/types/service.types';

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceIds: string[];
  onSelectionChange: (serviceIds: string[]) => void;
  error?: string;
}

export function ServiceSelector({
  services,
  selectedServiceIds,
  onSelectionChange,
  error,
}: ServiceSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(selectedServiceIds)
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSelected(new Set(selectedServiceIds));
  }, [selectedServiceIds]);

  const handleToggle = (serviceId: string) => {
    const newSelected = new Set(selected);
    
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    
    setSelected(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedServices = services.filter((s) => selected.has(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.basePrice || 0), 0);

  const formatPrice = (price: number) => {
    return `S/ ${price.toFixed(2)}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-[rgb(var(--text-primary))]">
          Servicios <span className="text-destructive">*</span>
        </label>
        <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
          Selecciona uno o más servicios para esta cita
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 text-[rgb(var(--text-secondary))]" />
        <Input
          type="text"
          placeholder="Buscar servicios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[200px] rounded-lg border border-[rgb(var(--border-primary))]">
        <div className="p-2 space-y-1">
          {filteredServices.map((service) => {
            const isSelected = selected.has(service.id);
            
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleToggle(service.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-all duration-200',
                  'hover:bg-[rgb(var(--bg-secondary))]',
                  isSelected && 'bg-[rgb(var(--bg-secondary))] border-2 border-primary'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors',
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-[rgb(var(--border-primary))]'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="mb-1">
                      <span className="font-medium text-sm text-[rgb(var(--text-primary))]">
                        {service.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[rgb(var(--text-secondary))]">
                      <span className="font-medium">
                        {formatPrice(Number(service.basePrice))}
                      </span>
                      <span>•</span>
                      <span>{formatDuration(service.duration)}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Summary */}
      {selected.size > 0 && (
        <div className="rounded-lg bg-[rgb(var(--bg-secondary))] p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[rgb(var(--text-secondary))]">
              {selected.size} servicio{selected.size !== 1 ? 's' : ''} seleccionado{selected.size !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-[rgb(var(--text-primary))]">
              Total
            </span>
            <div className="text-right">
              <div className="font-bold text-lg text-primary">
                {formatPrice(totalPrice)}
              </div>
              {/* <div className="text-xs text-[rgb(var(--text-secondary))]">
                {formatDuration(totalDuration)}
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
