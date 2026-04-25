import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarControlsProps {
  weekDays: Date[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export function CalendarControls({
  weekDays,
  onPreviousWeek,
  onNextWeek,
  onToday,
}: CalendarControlsProps) {
  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onToday}
            variant="outline"
            className="font-medium"
          >
            Hoy
          </Button>
          <div className="flex items-center gap-2">
            <Button
              onClick={onPreviousWeek}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              onClick={onNextWeek}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
          {format(weekDays[0], 'd', { locale: es })} -{' '}
          {format(weekDays[6], "d 'de' MMMM, yyyy", { locale: es })}
        </h2>
      </div>
    </div>
  );
}
