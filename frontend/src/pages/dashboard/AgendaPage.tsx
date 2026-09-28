import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import { useStaffStore } from '@/stores/useStaffStore';
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
  const fetchStaff = useStaffStore((s) => s.fetchStaff);
  const [searchParams, setSearchParams] = useSearchParams();
  const [prefillPatientId, setPrefillPatientId] = useState<string | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    viewMode,
    setViewMode,
    showAppointmentDrawer,
    showDetailSheet,
    showPaymentModal,
    selectedAppointment,
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
  } = useAgendaHandlers();

  const weekDays = getWeekDays(currentDate);

  // Warm staff cache so Nueva Cita does not wait on first open
  useEffect(() => {
    void fetchStaff({ limit: 100 });
  }, [fetchStaff]);

  useEffect(() => {
    if (searchParams.get('new') !== '1') return;
    const patientId = searchParams.get('patientId') || undefined;
    setPrefillPatientId(patientId);
    handleNewAppointment();
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, handleNewAppointment]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      handleRefresh();
      // brief feedback so the button does not feel dead while the store fetches
      await new Promise((r) => setTimeout(r, 400));
    } finally {
      setIsRefreshing(false);
    }
  };

  const onCloseDrawer = () => {
    setPrefillPatientId(undefined);
    handleCloseAppointmentDrawer();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2 text-pretty">
            Agenda
          </h1>
          <p className="text-[rgb(var(--text-secondary))]">
            Gestiona tus citas y horarios
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button
            onClick={onRefresh}
            variant="outline"
            className="gap-2"
            isLoading={isRefreshing}
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Actualizar
          </Button>
          <Button
            onClick={handleNewAppointment}
            className="gap-2 bg-primary shadow-md"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            Nueva Cita
          </Button>
        </div>
      </div>

      <CalendarControls
        weekDays={weekDays}
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

      <WeekCalendar
        weekDays={weekDays}
        currentDate={currentDate}
        viewMode={viewMode}
        appointments={appointments}
        isLoading={isLoading}
        onAppointmentClick={handleAppointmentClick}
        onShowPayment={handleShowPayment}
        onStatusUpdate={handleStatusUpdate}
        onEdit={handleEditAppointment}
      />

      <AppointmentDrawer
        appointment={selectedAppointment || undefined}
        isOpen={showAppointmentDrawer}
        onClose={onCloseDrawer}
        defaultDate={viewMode === 'day' ? currentDate : undefined}
        defaultPatientId={prefillPatientId}
      />

      <ClinicalWorkspaceSheet
        appointment={selectedAppointment}
        isOpen={showDetailSheet}
        onClose={handleCloseDetailSheet}
        onShowPayment={handleShowPayment}
      />

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
