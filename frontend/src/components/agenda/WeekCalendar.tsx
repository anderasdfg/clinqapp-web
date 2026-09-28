import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAppointmentsForDay } from '@/lib/utils/calendar.utils';
import { DayColumn } from './DayColumn';
import type { Appointment, AppointmentStatus, CalendarViewMode } from '@/types/appointment.types';

interface WeekCalendarProps {
  weekDays: Date[];
  currentDate: Date;
  viewMode: CalendarViewMode;
  appointments: Appointment[];
  isLoading: boolean;
  onAppointmentClick: (appointment: Appointment) => void;
  onShowPayment: (appointment: Appointment, status?: AppointmentStatus) => void;
  onStatusUpdate: (appointmentId: string, status: AppointmentStatus) => Promise<void>;
  onEdit: (appointment: Appointment) => void;
}

export function WeekCalendar({
  weekDays,
  currentDate,
  viewMode,
  appointments,
  isLoading,
  onAppointmentClick,
  onShowPayment,
  onStatusUpdate,
  onEdit,
}: WeekCalendarProps) {
  if (isLoading) {
    return (
      <div className="card overflow-hidden">
        <div className="flex justify-center items-center py-20" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <span className="sr-only">Cargando agenda…</span>
        </div>
      </div>
    );
  }

  const isToday = (day: Date) => {
    return format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  };

  if (viewMode === 'day') {
    const dayAppointments = getAppointmentsForDay(appointments, currentDate);

    return (
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))]">
          <div className="text-sm font-medium text-[rgb(var(--text-secondary))] uppercase">
            {format(currentDate, 'EEEE', { locale: es })}
          </div>
          <div
            className={`text-2xl font-bold mt-1 ${
              isToday(currentDate) ? 'text-primary' : 'text-[rgb(var(--text-primary))]'
            }`}
          >
            {format(currentDate, "d 'de' MMMM", { locale: es })}
          </div>
        </div>
        <div className="min-h-[420px] p-4 bg-[rgb(var(--bg-card))]">
          <DayColumn
            appointments={dayAppointments}
            onAppointmentClick={onAppointmentClick}
            onShowPayment={onShowPayment}
            onStatusUpdate={onStatusUpdate}
            onEdit={onEdit}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto overscroll-x-contain">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 bg-[rgb(var(--bg-secondary))] border-b border-[rgb(var(--border-primary))]">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="p-4 text-center border-r border-[rgb(var(--border-primary))] last:border-r-0"
              >
                <div className="text-sm font-medium text-[rgb(var(--text-secondary))] uppercase">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div
                  className={`text-2xl font-bold mt-1 ${
                    isToday(day)
                      ? 'text-primary'
                      : 'text-[rgb(var(--text-primary))]'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {weekDays.map((day) => {
              const dayAppointments = getAppointmentsForDay(appointments, day);

              return (
                <div
                  key={day.toISOString()}
                  className="min-h-[400px] p-3 border-r border-[rgb(var(--border-primary))] last:border-r-0 bg-[rgb(var(--bg-card))]"
                >
                  <DayColumn
                    appointments={dayAppointments}
                    onAppointmentClick={onAppointmentClick}
                    onShowPayment={onShowPayment}
                    onStatusUpdate={onStatusUpdate}
                    onEdit={onEdit}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
