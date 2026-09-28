import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarViewMode } from '@/types/appointment.types';

interface CalendarControlsProps {
  weekDays: Date[];
  currentDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarControls({
  weekDays,
  currentDate,
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
}: CalendarControlsProps) {
  const title =
    viewMode === 'day'
      ? format(currentDate, "EEEE d 'de' MMMM, yyyy", { locale: es })
      : `${format(weekDays[0], 'd', { locale: es })} - ${format(weekDays[6], "d 'de' MMMM, yyyy", { locale: es })}`;

  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={onToday} variant="outline" className="font-medium min-h-11">
            Hoy
          </Button>
          <div className="flex items-center gap-2">
            <Button
              onClick={onPrevious}
              variant="ghost"
              size="icon"
              aria-label={viewMode === 'day' ? 'Día anterior' : 'Semana anterior'}
              className="min-h-11 min-w-11"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button
              onClick={onNext}
              variant="ghost"
              size="icon"
              aria-label={viewMode === 'day' ? 'Día siguiente' : 'Semana siguiente'}
              className="min-h-11 min-w-11"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
          <div
            className="inline-flex rounded-lg border border-[rgb(var(--border-primary))] p-1 bg-[rgb(var(--bg-secondary))]"
            role="group"
            aria-label="Vista de agenda"
          >
            <Button
              type="button"
              variant={viewMode === 'day' ? 'primary' : 'ghost'}
              size="sm"
              className="min-h-11 min-w-[4.5rem] text-sm"
              onClick={() => onViewModeChange('day')}
            >
              Día
            </Button>
            <Button
              type="button"
              variant={viewMode === 'week' ? 'primary' : 'ghost'}
              size="sm"
              className="min-h-11 min-w-[4.5rem] text-sm"
              onClick={() => onViewModeChange('week')}
            >
              Semana
            </Button>
          </div>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-[rgb(var(--text-primary))] capitalize text-pretty">
          {title}
        </h2>
      </div>
    </div>
  );
}
