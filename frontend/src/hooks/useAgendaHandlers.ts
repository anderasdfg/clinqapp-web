import { useState, useEffect, useCallback } from 'react';
import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import { startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { toast } from 'sonner';
import type { Appointment, AppointmentStatus } from '@/types/appointment.types';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS } from '@/types/appointment.types';

interface UseAgendaHandlersReturn {
  showAppointmentDrawer: boolean;
  showDetailSheet: boolean;
  showPaymentModal: boolean;
  selectedAppointment: Appointment | null;
  postPaymentStatus: AppointmentStatus | null;
  setShowAppointmentDrawer: (show: boolean) => void;
  setShowDetailSheet: (show: boolean) => void;
  setShowPaymentModal: (show: boolean) => void;
  setSelectedAppointment: (appointment: Appointment | null) => void;
  setPostPaymentStatus: (status: AppointmentStatus | null) => void;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  handleToday: () => void;
  handleAppointmentClick: (appointment: Appointment) => void;
  handleStatusUpdate: (appointmentId: string, status: AppointmentStatus) => Promise<void>;
  handleRefresh: () => void;
  handleNewAppointment: () => void;
  handleEditAppointment: (appointment: Appointment) => void;
  handleShowPayment: (appointment: Appointment, status?: AppointmentStatus) => void;
  handlePaymentRegistered: () => Promise<void>;
  handleCloseAppointmentDrawer: () => void;
  handleCloseDetailSheet: () => void;
  handleClosePaymentModal: () => void;
}

export function useAgendaHandlers(): UseAgendaHandlersReturn {
  const {
    currentDate,
    setCurrentDate,
    fetchAppointments,
    setFilters,
    updateAppointmentStatus,
  } = useAppointmentsStore();

  const [showAppointmentDrawer, setShowAppointmentDrawer] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [postPaymentStatus, setPostPaymentStatus] = useState<AppointmentStatus | null>(null);

  // Fetch appointments when component mounts or week changes
  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });

    setFilters({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });

    // Force refresh every time to ensure fresh data
    fetchAppointments({}, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  // Week navigation
  const handlePreviousWeek = useCallback(() => {
    setCurrentDate(subWeeks(currentDate, 1));
  }, [currentDate, setCurrentDate]);

  const handleNextWeek = useCallback(() => {
    setCurrentDate(addWeeks(currentDate, 1));
  }, [currentDate, setCurrentDate]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, [setCurrentDate]);

  // Appointment actions
  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailSheet(true);
  }, []);

  const handleStatusUpdate = useCallback(async (appointmentId: string, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, { status });
      toast.success(`Cita marcada como: ${APPOINTMENT_STATUS_LABELS[status]}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Error al actualizar el estado de la cita');
    }
  }, [updateAppointmentStatus]);

  const handleRefresh = useCallback(() => {
    fetchAppointments({}, true);
  }, [fetchAppointments]);

  const handleNewAppointment = useCallback(() => {
    setSelectedAppointment(null);
    setShowAppointmentDrawer(true);
  }, []);

  const handleEditAppointment = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDrawer(true);
  }, []);

  const handleShowPayment = useCallback((appointment: Appointment, status?: AppointmentStatus) => {
    setSelectedAppointment(appointment);
    setPostPaymentStatus(status || null);
    setShowDetailSheet(false);
    setShowPaymentModal(true);
  }, []);

  const handlePaymentRegistered = useCallback(async () => {
    if (postPaymentStatus && selectedAppointment) {
      try {
        await updateAppointmentStatus(selectedAppointment.id, {
          status: postPaymentStatus,
        });

        if (postPaymentStatus === APPOINTMENT_STATUS.CONFIRMED) {
          toast.success('Pago registrado. Cita confirmada.');
        }
      } catch (error) {
        console.error('Error updating status after payment:', error);
      }
    }

    fetchAppointments({}, true);
    setShowPaymentModal(false);
    setSelectedAppointment(null);
    setPostPaymentStatus(null);
  }, [postPaymentStatus, selectedAppointment, updateAppointmentStatus, fetchAppointments]);

  // Close handlers
  const handleCloseAppointmentDrawer = useCallback(() => {
    setShowAppointmentDrawer(false);
    setSelectedAppointment(null);
  }, []);

  const handleCloseDetailSheet = useCallback(() => {
    setShowDetailSheet(false);
    setSelectedAppointment(null);
  }, []);

  const handleClosePaymentModal = useCallback(() => {
    setShowPaymentModal(false);
    setSelectedAppointment(null);
  }, []);

  return {
    showAppointmentDrawer,
    showDetailSheet,
    showPaymentModal,
    selectedAppointment,
    postPaymentStatus,
    setShowAppointmentDrawer,
    setShowDetailSheet,
    setShowPaymentModal,
    setSelectedAppointment,
    setPostPaymentStatus,
    handlePreviousWeek,
    handleNextWeek,
    handleToday,
    handleAppointmentClick,
    handleStatusUpdate,
    handleRefresh,
    handleNewAppointment,
    handleEditAppointment,
    handleShowPayment,
    handlePaymentRegistered,
    handleCloseAppointmentDrawer,
    handleCloseDetailSheet,
    handleClosePaymentModal,
  };
}
