import type { Appointment } from '@/types/appointment.types';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/types/appointment.types';
import { formatTimeRange } from '@/lib/utils/calendar.utils';

interface AppointmentCardProps {
    appointment: Appointment;
    onClick?: () => void;
}

const AppointmentCard = ({ appointment, onClick }: AppointmentCardProps) => {
    const statusColor = APPOINTMENT_STATUS_COLORS[appointment.status];

    return (
        <div
            onClick={onClick}
            className="p-2 mb-1 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] hover:bg-[rgb(var(--bg-secondary))] cursor-pointer transition-colors duration-150 text-xs"
        >
            <div className="flex flex-col gap-1">
                {/* Patient Name */}
                <p className="font-medium text-[rgb(var(--text-primary))] truncate text-xs">
                    {appointment.patient?.firstName} {appointment.patient?.lastName}
                </p>

                {/* Service Name */}
                {appointment.service && (
                    <p className="text-[rgb(var(--text-secondary))] truncate text-[10px]">
                        {appointment.service.name}
                    </p>
                )}

                {/* Status Badge */}
                <div className="flex items-center">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${statusColor}`}>
                        {APPOINTMENT_STATUS_LABELS[appointment.status]}
                    </span>
                </div>

                {/* Time */}
                <p className="text-[rgb(var(--text-tertiary))] text-[10px]">
                    {formatTimeRange(appointment.startTime, appointment.endTime)}
                </p>
            </div>
        </div>
    );
};

export default AppointmentCard;
