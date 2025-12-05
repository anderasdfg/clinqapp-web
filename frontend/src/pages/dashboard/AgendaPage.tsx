const AgendaPage = () => {
    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    Agenda
                </h1>
                <p className="text-[rgb(var(--text-secondary))]">
                    Gestiona las citas y el calendario de tu consultorio
                </p>
            </div>

            <div className="card p-12 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/10 flex items-center justify-center">
                        <svg className="w-10 h-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-3">
                        Próximamente
                    </h2>
                    <p className="text-[rgb(var(--text-secondary))] mb-6">
                        La gestión de agenda estará disponible pronto. Incluirá vista de lista, calendario semanal, y funcionalidad de arrastrar y soltar para reprogramar citas.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-secondary))] text-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>En desarrollo - Fase 3</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgendaPage;
