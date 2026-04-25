import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import { useAgendaHandlers } from '@/hooks/useAgendaHandlers';
import { getWeekDays } from '@/lib/utils/calendar.utils';
import { CalendarControls } from '@/components/agenda/CalendarControls';
import { WeekCalendar } from '@/components/agenda/WeekCalendar';
import AppointmentDrawer from '@/components/agenda/AppointmentDrawer';
import ClinicalWorkspaceSheet from '@/components/agenda/ClinicalWorkspaceSheet';
import PaymentModal from '@/components/agenda/PaymentModal';
import { Button } from '@/components/ui/Button';
import { Plus, RefreshCw } from 'lucide-react';

export default function AgendaPage() {
  const { appointments, isLoading, currentDate } = useAppointmentsStore();

  const {
    showAppointmentDrawer,
    showDetailSheet,
    showPaymentModal,
    selectedAppointment,
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
  } = useAgendaHandlers();

  const weekDays = getWeekDays(currentDate);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
            Agenda
          </h1>
          <p className="text-[rgb(var(--text-secondary))]">
            Gestiona tus citas y horarios
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Button
            onClick={handleNewAppointment}
            className="gap-2 bg-primary shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <CalendarControls
        weekDays={weekDays}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
      />

      {/* Week View Calendar */}
      <WeekCalendar
        weekDays={weekDays}
        appointments={appointments}
        isLoading={isLoading}
        onAppointmentClick={handleAppointmentClick}
        onShowPayment={handleShowPayment}
        onStatusUpdate={handleStatusUpdate}
        onEdit={handleEditAppointment}
      />

      {/* Appointment Drawer */}
      <AppointmentDrawer
        appointment={selectedAppointment || undefined}
        isOpen={showAppointmentDrawer}
        onClose={handleCloseAppointmentDrawer}
      />

      {/* Clinical Workspace Sheet */}
      <ClinicalWorkspaceSheet
        appointment={selectedAppointment}
        isOpen={showDetailSheet}
        onClose={handleCloseDetailSheet}
        onShowPayment={handleShowPayment}
      />

      {/* Payment Modal */}
      {selectedAppointment && (
        <PaymentModal
          appointment={selectedAppointment}
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          onPaymentRegistered={handlePaymentRegistered}
        />
      )}
    </div>
  );
}
