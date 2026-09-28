import { useState, useEffect, useCallback } from 'react';
import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';
import { toast } from 'sonner';
import type { Appointment, AppointmentStatus, CalendarViewMode } from '@/types/appointment.types';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS } from '@/types/appointment.types';

function defaultViewMode(): CalendarViewMode {
  if (typeof window === 'undefined') return 'day';
  // ponytail: tablet portrait / narrow → day; desktop landscape → week
  return window.matchMedia('(min-width: 1024px)').matches ? 'week' : 'day';
}

interface UseAgendaHandlersReturn {
  viewMode: CalendarViewMode;
  setViewMode: (mode: CalendarViewMode) => void;
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
  handlePrevious: () => void;
  handleNext: () => void;
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
    updateAppointmentStatus,
  } = useAppointmentsStore();

  const [viewMode, setViewMode] = useState<CalendarViewMode>(defaultViewMode);
  const [showAppointmentDrawer, setShowAppointmentDrawer] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [postPaymentStatus, setPostPaymentStatus] = useState<AppointmentStatus | null>(null);

  useEffect(() => {
    const rangeStart =
      viewMode === 'day'
        ? startOfDay(currentDate)
        : startOfWeek(currentDate, { weekStartsOn: 1 });
    const rangeEnd =
      viewMode === 'day'
        ? endOfDay(currentDate)
        : endOfWeek(currentDate, { weekStartsOn: 1 });

    fetchAppointments(
      {
        startDate: rangeStart.toISOString(),
        endDate: rangeEnd.toISOString(),
      },
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, viewMode]);

  const handlePrevious = useCallback(() => {
    setCurrentDate(viewMode === 'day' ? subDays(currentDate, 1) : subWeeks(currentDate, 1));
  }, [currentDate, setCurrentDate, viewMode]);

  const handleNext = useCallback(() => {
    setCurrentDate(viewMode === 'day' ? addDays(currentDate, 1) : addWeeks(currentDate, 1));
  }, [currentDate, setCurrentDate, viewMode]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, [setCurrentDate]);

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
    // Close sibling dialogs first — unmounting ClinicalWorkspace while open
    // leaves a Radix overlay stuck on top of the appointment sheet.
    setShowDetailSheet(false);
    setShowPaymentModal(false);
    setSelectedAppointment(null);
    setShowAppointmentDrawer(true);
  }, []);

  const handleEditAppointment = useCallback((appointment: Appointment) => {
    setShowDetailSheet(false);
    setShowPaymentModal(false);
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
    viewMode,
    setViewMode,
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
    handlePrevious,
    handleNext,
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
