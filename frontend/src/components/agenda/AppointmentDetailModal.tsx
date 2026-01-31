import type { Appointment, AppointmentStatus } from '@/types/appointment.types';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS, APPOINTMENT_STATUS, PAYMENT_STATUS } from '@/types/appointment.types';
import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import { formatAppointmentDate, formatTimeRange } from '@/lib/utils/calendar.utils';
import { useState } from 'react';
import PaymentModal from './PaymentModal';
import { Textarea } from '@/components/ui/textarea';

interface AppointmentDetailModalProps {
    appointment: Appointment | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
}

const AppointmentDetailModal = ({ appointment, isOpen, onClose, onEdit }: AppointmentDetailModalProps) => {
    const { updateAppointmentStatus, deleteAppointment, fetchAppointmentById, isUpdating, isDeleting, appointments } = useAppointmentsStore();
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    const handleStatusUpdate = async (status: AppointmentStatus) => {
        try {
            await updateAppointmentStatus(appointment!.id, { status });
            onClose();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleCancel = async () => {
        try {
            await updateAppointmentStatus(appointment!.id, {
                status: APPOINTMENT_STATUS.CANCELLED,
                cancellationReason,
            });
            setShowCancelConfirm(false);
            onClose();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
        }
    };

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
            try {
                await deleteAppointment(appointment!.id);
                onClose();
            } catch (error) {
                console.error('Error deleting appointment:', error);
            }
        }
    };

    const handlePaymentRegistered = async () => {
        // Refresh appointment data to show updated payment info
        if (appointment) {
            await fetchAppointmentById(appointment.id);
        }
        setShowPaymentModal(false);
    };

    // Get fresh appointment data from store using reactive selector
    const currentAppointment = appointment
        ? appointments.find(apt => apt.id === appointment.id) || appointment
        : null;

    if (!isOpen || !currentAppointment) return null;

    const statusColor = APPOINTMENT_STATUS_COLORS[currentAppointment.status];
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black/50" onClick={onClose}></div>

                <div className="inline-block align-bottom bg-[rgb(var(--bg-card))] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="px-6 pt-5 pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
                                Detalles de la Cita
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {!showCancelConfirm ? (
                            <div className="space-y-4">
                                {/* Status Badge */}
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                                        {APPOINTMENT_STATUS_LABELS[currentAppointment.status]}
                                    </span>
                                </div>

                                {/* Patient Info */}
                                <div>
                                    <label className="text-sm text-[rgb(var(--text-secondary))]">Paciente</label>
                                    <p className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                                        {currentAppointment.patient?.firstName} {currentAppointment.patient?.lastName}
                                    </p>
                                    {currentAppointment.patient?.phone && (
                                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                                            {currentAppointment.patient.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Professional Info */}
                                <div>
                                    <label className="text-sm text-[rgb(var(--text-secondary))]">Profesional</label>
                                    <p className="font-medium text-[rgb(var(--text-primary))]">
                                        {currentAppointment.professional?.firstName} {currentAppointment.professional?.lastName}
                                    </p>
                                </div>

                                {/* Service Info */}
                                {currentAppointment.service && (
                                    <div>
                                        <label className="text-sm text-[rgb(var(--text-secondary))]">Servicio</label>
                                        <p className="font-medium text-[rgb(var(--text-primary))]">
                                            {currentAppointment.service.name}
                                        </p>
                                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                                            Duración: {currentAppointment.service.duration} minutos
                                        </p>
                                    </div>
                                )}

                                {/* Date and Time */}
                                <div>
                                    <label className="text-sm text-[rgb(var(--text-secondary))]">Fecha y Hora</label>
                                    <p className="font-medium text-[rgb(var(--text-primary))]">
                                        {formatAppointmentDate(currentAppointment.startTime)}
                                    </p>
                                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                                        {formatTimeRange(currentAppointment.startTime, currentAppointment.endTime)}
                                    </p>
                                </div>

                                {/* Payment Status */}
                                <div className="pt-4 border-t border-[rgb(var(--border-primary))]">
                                    <label className="text-sm text-[rgb(var(--text-secondary))]">Estado de Pago</label>
                                    {currentAppointment.payment && currentAppointment.payment.id ? (
                                        <div className="mt-2 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[rgb(var(--text-primary))] font-medium">
                                                    {PAYMENT_STATUS_LABELS[currentAppointment.payment.status]}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${currentAppointment.payment.status === PAYMENT_STATUS.COMPLETED
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                    }`}>
                                                    {currentAppointment.payment.status === PAYMENT_STATUS.COMPLETED ? 'Pagado' : 'Pendiente'}
                                                </span>
                                            </div>
                                            {currentAppointment.payment.status === PAYMENT_STATUS.COMPLETED && (
                                                <>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-[rgb(var(--text-secondary))]">Método:</span>
                                                        <span className="text-[rgb(var(--text-primary))] font-medium">
                                                            {PAYMENT_METHOD_LABELS[currentAppointment.payment.method]}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-[rgb(var(--text-secondary))]">Monto:</span>
                                                        <span className="text-[rgb(var(--text-primary))] font-medium">
                                                            S/ {Number(currentAppointment.payment.amount).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    {currentAppointment.payment.receiptNumber && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-[rgb(var(--text-secondary))]">Recibo:</span>
                                                            <span className="text-[rgb(var(--text-primary))] font-medium">
                                                                {currentAppointment.payment.receiptNumber}
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-[rgb(var(--text-secondary))] mt-1 mb-3">
                                                Sin pago registrado
                                            </p>
                                            {currentAppointment.status !== APPOINTMENT_STATUS.CANCELLED && (
                                                <button
                                                    onClick={() => setShowPaymentModal(true)}
                                                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                                                >
                                                    Registrar Pago
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                {currentAppointment.notes && (
                                    <div>
                                        <label className="text-sm text-[rgb(var(--text-secondary))]">Notas</label>
                                        <p className="text-[rgb(var(--text-primary))]">
                                            {currentAppointment.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Cancellation Reason */}
                                {currentAppointment.cancellationReason && (
                                    <div>
                                        <label className="text-sm text-[rgb(var(--text-secondary))]">Motivo de Cancelación</label>
                                        <p className="text-[rgb(var(--text-primary))]">
                                            {currentAppointment.cancellationReason}
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons - Simplified based on status */}
                                {currentAppointment.status !== APPOINTMENT_STATUS.CANCELLED && currentAppointment.status !== APPOINTMENT_STATUS.COMPLETED && (
                                    <div className="flex flex-col gap-3 pt-4 border-t border-[rgb(var(--border-primary))]">
                                        {/* Primary Actions */}
                                        <div className="flex gap-2">
                                            {currentAppointment.status === APPOINTMENT_STATUS.PENDING && (
                                                <button
                                                    onClick={() => handleStatusUpdate(APPOINTMENT_STATUS.CONFIRMED)}
                                                    disabled={isUpdating}
                                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
                                                >
                                                    Confirmar Cita
                                                </button>
                                            )}
                                            {currentAppointment.status === APPOINTMENT_STATUS.CONFIRMED && (
                                                <button
                                                    onClick={() => handleStatusUpdate(APPOINTMENT_STATUS.COMPLETED)}
                                                    disabled={isUpdating}
                                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50"
                                                >
                                                    Completar Cita
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Secondary Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowCancelConfirm(true)}
                                                disabled={isUpdating}
                                                className="flex-1 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium disabled:opacity-50"
                                            >
                                                Cancelar Cita
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                className="px-4 py-2 border border-[rgb(var(--border-primary))] text-[rgb(var(--text-secondary))] rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-colors text-sm font-medium disabled:opacity-50"
                                                title="Eliminar cita"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-[rgb(var(--text-primary))]">
                                    ¿Estás seguro de que deseas cancelar esta cita?
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Motivo de cancelación
                                    </label>
                                    <Textarea
                                        value={cancellationReason}
                                        onChange={(e) => setCancellationReason(e.target.value)}
                                        rows={3}
                                        placeholder="Motivo..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-3 bg-[rgb(var(--bg-secondary))] sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                        {!showCancelConfirm ? (
                            <>
                                {onEdit && currentAppointment.status !== APPOINTMENT_STATUS.COMPLETED && currentAppointment.status !== APPOINTMENT_STATUS.CANCELLED && (
                                    <button
                                        onClick={onEdit}
                                        style={{
                                            background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                                        }}
                                        className="w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-2 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:w-auto sm:text-sm font-medium transition-opacity"
                                    >
                                        Editar
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-full inline-flex justify-center rounded-lg border border-[rgb(var(--border-primary))] shadow-sm px-4 py-2 bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-secondary))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:w-auto sm:text-sm font-medium transition-colors"
                                >
                                    Cerrar
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleCancel}
                                    disabled={isUpdating}
                                    className="w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-2 bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    Confirmar Cancelación
                                </button>
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="w-full inline-flex justify-center rounded-lg border border-[rgb(var(--border-primary))] shadow-sm px-4 py-2 bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-secondary))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:w-auto sm:text-sm font-medium transition-colors"
                                >
                                    Volver
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {currentAppointment && (
                <PaymentModal
                    appointment={currentAppointment}
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onPaymentRegistered={handlePaymentRegistered}
                />
            )}
        </div>
    );
};

export default AppointmentDetailModal;
