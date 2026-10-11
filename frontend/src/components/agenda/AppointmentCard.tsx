import { Appointment, APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS, AppointmentStatus, APPOINTMENT_STATUS, PAYMENT_STATUS } from '@/types/appointment.types';
import { formatTimeRange } from '@/lib/utils/calendar.utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreVertical, CreditCard, X, Loader2, Edit } from 'lucide-react';
import { useState } from 'react';

interface AppointmentCardProps {
    appointment: Appointment;
    onClick?: () => void;
    onShowPayment?: (appointment: Appointment, postPaymentStatus?: AppointmentStatus) => void;
    onStatusUpdate?: (appointmentId: string, status: AppointmentStatus) => void;
    onEdit?: (appointment: Appointment) => void;
}

const AppointmentCard = ({ appointment, onClick, onShowPayment, onStatusUpdate, onEdit }: AppointmentCardProps) => {
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
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            className="relative min-w-0 overflow-hidden p-3 mb-2 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] hover:bg-[rgb(var(--bg-secondary))] active:bg-[rgb(var(--bg-secondary))] cursor-pointer transition-colors duration-150 touch-manipulation"
        >
            {/* Menu overlays so the 44px touch target does not crush text in narrow week columns */}
            {!isCompleted && (
                <div onClick={(e) => e.stopPropagation()} className="absolute top-1 right-1 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            aria-label="Acciones de la cita"
                            className="inline-flex items-center justify-center min-h-11 min-w-11 p-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-colors bg-[rgb(var(--bg-card))]/90"
                        >
                            <MoreVertical className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="gap-2 cursor-pointer min-h-11 text-base"
                                onClick={() => onEdit?.(appointment)}
                            >
                                <Edit className="w-4 h-4" aria-hidden="true" />
                                Editar Cita
                            </DropdownMenuItem>

                            {(!isConfirmed && !isNoShow && !isPaid) && (
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer min-h-11 text-base text-blue-600 dark:text-blue-400"
                                    onClick={() => onShowPayment?.(appointment, APPOINTMENT_STATUS.CONFIRMED)}
                                >
                                    <CreditCard className="w-4 h-4" aria-hidden="true" />
                                    Registrar Pago (Reserva)
                                </DropdownMenuItem>
                            )}

                            {!isNoShow && (
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer min-h-11 text-base text-red-600 dark:text-red-400"
                                    onClick={() => handleStatusUpdate(appointment.id, APPOINTMENT_STATUS.NO_SHOW)}
                                >
                                    <div className="w-4 h-4 rounded-full border-2 border-current" aria-hidden="true" />
                                    Marcar como No Asistió
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                className="gap-2 cursor-pointer min-h-11 text-base text-red-600 dark:text-red-400"
                                onClick={() => handleStatusUpdate(appointment.id, APPOINTMENT_STATUS.CANCELLED)}
                            >
                                <X className="w-4 h-4" aria-hidden="true" />
                                Cancelar Cita
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <div className={`flex flex-col gap-1.5 min-w-0 ${!isCompleted ? 'pr-11' : ''}`}>
                <div className="flex items-start gap-2 min-w-0">
                    <p className="font-medium text-[rgb(var(--text-primary))] truncate text-sm sm:text-base flex-1 min-w-0">
                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </p>

                    {isUpdatingStatus && (
                        <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" aria-hidden="true" />
                    )}
                </div>

                {appointment.services && appointment.services.length > 0 && (
                    <div className="flex flex-col gap-1 min-w-0">
                        {appointment.services.map((as) => (
                            <span
                                key={as.id}
                                className="px-2 py-0.5 rounded text-xs sm:text-sm bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border-primary))] truncate max-w-full"
                                title={
                                    appointment.sessionNumber
                                        ? `${as.service.name} — Sesión ${appointment.sessionNumber}`
                                        : as.service.name
                                }
                            >
                                {as.service.name}
                                {appointment.sessionNumber && ` — Sesión ${appointment.sessionNumber}`}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className={`px-2 py-0.5 rounded text-xs sm:text-sm font-medium truncate max-w-full ${statusColor}`}>
                        {APPOINTMENT_STATUS_LABELS[appointment.status]}
                    </span>
                    <p className="text-[rgb(var(--text-secondary))] text-xs sm:text-sm tabular-nums shrink-0">
                        {formatTimeRange(appointment.startTime, appointment.endTime)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AppointmentCard;
