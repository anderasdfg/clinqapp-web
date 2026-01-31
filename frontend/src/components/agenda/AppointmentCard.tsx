import { Appointment, APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS, AppointmentStatus, APPOINTMENT_STATUS, PAYMENT_STATUS } from '@/types/appointment.types';
import { formatTimeRange } from '@/lib/utils/calendar.utils';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreVertical, CreditCard, X, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AppointmentCardProps {
    appointment: Appointment;
    onClick?: () => void;
    onShowPayment?: (appointment: Appointment, postPaymentStatus?: AppointmentStatus) => void;
    onStatusUpdate?: (appointmentId: string, status: AppointmentStatus) => void;
}

const AppointmentCard = ({ appointment, onClick, onShowPayment, onStatusUpdate }: AppointmentCardProps) => {
    const statusColor = APPOINTMENT_STATUS_COLORS[appointment.status];
    const isCompleted = appointment.status === APPOINTMENT_STATUS.COMPLETED;
    const isConfirmed = appointment.status === APPOINTMENT_STATUS.CONFIRMED;
    const isNoShow = appointment.status === APPOINTMENT_STATUS.NO_SHOW;
    const isPaid = appointment.payment?.status === PAYMENT_STATUS.COMPLETED;
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const handleStatusUpdate = async (appointmentId: string, status: AppointmentStatus) => {
        if (!onStatusUpdate) return;
        setIsUpdatingStatus(true);
        try {
            await onStatusUpdate(appointmentId, status);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <div
            className="group relative p-2 mb-1 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] hover:bg-[rgb(var(--bg-secondary))] cursor-pointer transition-colors duration-150 text-xs"
        >
            <div onClick={onClick} className="flex flex-col gap-1">
                {/* Patient Name */}
                <div className="flex items-start justify-between">
                    <p className="font-medium text-[rgb(var(--text-primary))] truncate text-xs flex-1">
                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </p>
                    
                    {!isCompleted && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity">
                                    <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {(!isConfirmed && !isNoShow && !isPaid) && (
                                        <DropdownMenuItem 
                                            className="gap-2 cursor-pointer text-blue-600 dark:text-blue-400"
                                            onClick={() => onShowPayment?.(appointment, APPOINTMENT_STATUS.CONFIRMED)}
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Registrar Pago (Reserva)
                                        </DropdownMenuItem>
                                    )}

                                    {!isNoShow && (
                                        <DropdownMenuItem 
                                            className="gap-2 cursor-pointer text-red-600 dark:text-red-400"
                                            onClick={() => handleStatusUpdate(appointment.id, APPOINTMENT_STATUS.NO_SHOW)}
                                        >
                                            <div className="w-4 h-4 rounded-full border-2 border-current" />
                                            Marcar como No Asistió
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuItem 
                                        className="gap-2 cursor-pointer text-red-600 dark:text-red-400"
                                        onClick={() => handleStatusUpdate(appointment.id, APPOINTMENT_STATUS.CANCELLED)}
                                    >
                                        <X className="w-4 h-4" />
                                        Cancelar Cita
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    {isUpdatingStatus && (
                        <Loader2 className="w-3 h-3 text-primary animate-spin" />
                    )}
                </div>

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
