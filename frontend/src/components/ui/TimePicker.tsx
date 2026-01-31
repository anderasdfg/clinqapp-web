import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  TimeSlot, 
  TimeSlotStatus 
} from '@/types/schedule.types';
import { 
  TIME_SLOT_STYLES,
  TIME_PERIOD
} from '@/constants/time.constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value?: string; // Format: "HH:MM"
  onChange: (time: string) => void;
  slots: TimeSlot[];
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Enhanced TimePicker component
 * Displays available time slots with 12-hour format and business hours highlighting.
 */
export function TimePicker({
  value,
  onChange,
  slots,
  loading = false,
  disabled = false,
  className,
}: TimePickerProps) {
  
  // Group slots by period (AM/PM) for better organization
  const groupedSlots = useMemo(() => {
    if (!slots || slots.length === 0) return {};
    console.log('[DEBUG] TimePicker slots:', slots[0]); // Debug first slot
    return slots.reduce((acc, slot) => {
      const isPM = slot.time >= '12:00';
      const period = isPM ? TIME_PERIOD.PM : TIME_PERIOD.AM;
      
      if (!acc[period]) {
        acc[period] = [];
      }
      acc[period].push(slot);
      return acc;
    }, {} as Record<string, TimeSlot[]>);
  }, [slots]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-md bg-muted/10 animate-pulse">
        <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Cargando horarios...</span>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-md bg-muted/5">
        <span className="text-muted-foreground text-sm">No hay horarios disponibles</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <ScrollArea className="h-64 pr-4">
        <div className="space-y-6">
          {Object.entries(groupedSlots).map(([period, periodSlots]) => (
            <div key={period} className="space-y-2">
              <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur z-10 py-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                  {period}
                </span>
                <div className="h-[1px] flex-1 bg-border" />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {periodSlots.map((slot) => {
                  const isSelected = value === slot.time;
                  const isBooked = slot.status === TimeSlotStatus.BOOKED;
                  const isBusiness = slot.isBusinessHours;
                  
                  // Determine styles based on status
                  let buttonStyle = '';
                  if (isSelected) {
                    buttonStyle = TIME_SLOT_STYLES.SELECTED;
                  } else if (isBooked) {
                    buttonStyle = TIME_SLOT_STYLES.BOOKED;
                  } else if (isBusiness) {
                    buttonStyle = TIME_SLOT_STYLES.AVAILABLE_BUSINESS_HOURS;
                  } else {
                    buttonStyle = TIME_SLOT_STYLES.AVAILABLE_OUTSIDE_HOURS;
                  }

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={disabled || isBooked}
                      onClick={() => onChange(slot.time)}
                      className={cn(
                        "flex flex-col items-center justify-center py-2 px-3 rounded-md text-sm border transition-all duration-200",
                        buttonStyle,
                        !isBooked && !isSelected && "hover:scale-[1.02] active:scale-[0.98]",
                        "relative overflow-hidden group"
                      )}
                    >
                      <span className={cn(
                        "font-bold",
                        isSelected ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {slot.displayTime || slot.time}
                      </span>
                      
                      {/* Visual indicator for business hours vs outside */}
                      {!isBooked && !isSelected && (
                        <div className={cn(
                          "absolute bottom-0 left-0 right-0 h-0.5 opacity-40 transition-opacity group-hover:opacity-100",
                          isBusiness ? "bg-primary" : "bg-muted-foreground"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase tracking-tighter text-muted-foreground p-2 bg-muted/20 rounded-md border border-dashed">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary/20 border border-primary/40" />
          <span>Atención</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-muted border border-border" />
          <span>Fueras</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-50">
          <div className="w-2 h-2 rounded-full bg-muted/30 border border-border" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
}
