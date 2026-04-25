import AppointmentCard from './AppointmentCard';
import type { Appointment, AppointmentStatus } from '@/types/appointment.types';

interface DayColumnProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onShowPayment: (appointment: Appointment, status?: AppointmentStatus) => void;
  onStatusUpdate: (appointmentId: string, status: AppointmentStatus) => Promise<void>;
  onEdit: (appointment: Appointment) => void;
}

export function DayColumn({
  appointments,
  onAppointmentClick,
  onShowPayment,
  onStatusUpdate,
  onEdit,
}: DayColumnProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-[rgb(var(--text-tertiary))] text-sm">
        Sin citas
      </div>
    );
  }

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="space-y-1">
      {sortedAppointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onClick={() => onAppointmentClick(appointment)}
          onShowPayment={onShowPayment}
          onStatusUpdate={onStatusUpdate}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
