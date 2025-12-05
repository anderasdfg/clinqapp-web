const DashboardHome = () => {
    return (
        <div className="animate-fade-in">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    Bienvenido de nuevo 👋
                </h1>
                <p className="text-[rgb(var(--text-secondary))]">
                    Aquí está un resumen de tu actividad hoy
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
                {/* Stat Card 1 */}
                <div className="card card-hover p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <span className="text-xs font-medium text-success">+12%</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-1">248</h3>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Total Pacientes</p>
                </div>

                {/* Stat Card 2 */}
                <div className="card card-hover p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-xs font-medium text-warning">Hoy</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-1">12</h3>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Citas Programadas</p>
                </div>

                {/* Stat Card 3 */}
                <div className="card card-hover p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xs font-medium text-success">+8%</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-1">89%</h3>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Tasa de Asistencia</p>
                </div>

                {/* Stat Card 4 */}
                <div className="card card-hover p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xs font-medium text-success">+15%</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-1">$12,450</h3>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Ingresos del Mes</p>
                </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                            Acciones Rápidas
                        </h2>
                        <div className="space-y-3">
                            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-all duration-200 hover-lift">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-[rgb(var(--text-primary))]">Nueva Cita</span>
                            </button>

                            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-all duration-200 hover-lift">
                                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-[rgb(var(--text-primary))]">Nuevo Paciente</span>
                            </button>

                            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-all duration-200 hover-lift">
                                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-[rgb(var(--text-primary))]">Ver Reportes</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                            Actividad Reciente
                        </h2>
                        <div className="space-y-4">
                            {[
                                { name: 'María García', action: 'Cita completada', time: 'Hace 10 min', color: 'success' },
                                { name: 'Juan Pérez', action: 'Nueva cita agendada', time: 'Hace 25 min', color: 'info' },
                                { name: 'Ana Martínez', action: 'Recordatorio enviado', time: 'Hace 1 hora', color: 'warning' },
                                { name: 'Carlos López', action: 'Pago recibido', time: 'Hace 2 horas', color: 'success' },
                            ].map((activity, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-colors duration-200">
                                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                                        {activity.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                            {activity.name}
                                        </p>
                                        <p className="text-xs text-[rgb(var(--text-secondary))]">
                                            {activity.action}
                                        </p>
                                    </div>
                                    <span className="text-xs text-[rgb(var(--text-tertiary))]">
                                        {activity.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
