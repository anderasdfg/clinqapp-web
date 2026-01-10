import { useEffect, useState } from 'react';
import { useAppointmentsStore } from '@/stores/useAppointmentsStore';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { getWeekDays, getAppointmentsForDay } from '@/lib/utils/calendar.utils';
import AppointmentCard from '@/components/agenda/AppointmentCard';
import AppointmentModal from '@/components/agenda/AppointmentModal';
import AppointmentDetailModal from '@/components/agenda/AppointmentDetailModal';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import type { Appointment } from '@/types/appointment.types';

const AgendaPage = () => {
    const {
        appointments,
        isLoading,
        currentDate,
        setCurrentDate,
        fetchAppointments,
        setFilters,
    } = useAppointmentsStore();

    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    useEffect(() => {
        // Fetch appointments for current week
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });

        setFilters({
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        });

        fetchAppointments();
    }, [currentDate, fetchAppointments, setFilters]);

    const weekDays = getWeekDays(currentDate);

    const handlePreviousWeek = () => {
        setCurrentDate(subWeeks(currentDate, 1));
    };

    const handleNextWeek = () => {
        setCurrentDate(addWeeks(currentDate, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleAppointmentClick = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailModal(true);
    };

    const handleEditAppointment = () => {
        setShowDetailModal(false);
        setShowAppointmentModal(true);
    };

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
                <Button
                    onClick={() => setShowAppointmentModal(true)}
                    className="gap-2 bg-primary shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Cita
                </Button>
            </div>

            {/* Calendar Controls */}
            <div className="card p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleToday}
                            className="px-4 py-2 rounded-lg border border-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-secondary))] transition-colors duration-200 font-medium"
                        >
                            Hoy
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePreviousWeek}
                                className="p-2 rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={handleNextWeek}
                                className="p-2 rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
                        {format(weekDays[0], 'd', { locale: es })} - {format(weekDays[6], "d 'de' MMMM, yyyy", { locale: es })}
                    </h2>
                </div>
            </div>

            {/* Week View Calendar */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Header Row */}
                            <div className="grid grid-cols-7 bg-[rgb(var(--bg-secondary))] border-b border-[rgb(var(--border-primary))]">
                                {weekDays.map((day) => (
                                    <div
                                        key={day.toISOString()}
                                        className="p-4 text-center border-r border-[rgb(var(--border-primary))] last:border-r-0"
                                    >
                                        <div className="text-sm font-medium text-[rgb(var(--text-secondary))] uppercase">
                                            {format(day, 'EEE', { locale: es })}
                                        </div>
                                        <div className={`text-2xl font-bold mt-1 ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                                            ? 'text-primary'
                                            : 'text-[rgb(var(--text-primary))]'
                                            }`}>
                                            {format(day, 'd')}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Appointments Grid */}
                            <div className="grid grid-cols-7">
                                {weekDays.map((day) => {
                                    const dayAppointments = getAppointmentsForDay(appointments, day);

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className="min-h-[400px] p-3 border-r border-[rgb(var(--border-primary))] last:border-r-0 bg-[rgb(var(--bg-card))]"
                                        >
                                            {dayAppointments.length === 0 ? (
                                                <div className="flex items-center justify-center h-32 text-[rgb(var(--text-tertiary))] text-sm">
                                                    Sin citas
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {dayAppointments
                                                        .sort((a, b) =>
                                                            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                                                        )
                                                        .map((appointment) => (
                                                            <AppointmentCard
                                                                key={appointment.id}
                                                                appointment={appointment}
                                                                onClick={() => handleAppointmentClick(appointment)}
                                                            />
                                                        ))
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Appointment Modal */}
            <AppointmentModal
                appointment={selectedAppointment || undefined}
                isOpen={showAppointmentModal}
                onClose={() => {
                    setShowAppointmentModal(false);
                    setSelectedAppointment(null);
                }}
            />

            {/* Appointment Detail Modal */}
            <AppointmentDetailModal
                appointment={selectedAppointment}
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedAppointment(null);
                }}
                onEdit={handleEditAppointment}
            />
        </div>
    );
};

export default AgendaPage;
