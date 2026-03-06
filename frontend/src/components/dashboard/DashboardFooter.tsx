export default function DashboardFooter() {
    const version = __APP_VERSION__ || '1.0.0';
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto py-4 px-6 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-primary))]">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[rgb(var(--text-secondary))]">
                <p>
                    © {currentYear} ClinqApp. Todos los derechos reservados.
                </p>
                <p className="font-mono">
                    <span className="font-semibold text-[rgb(var(--text-primary))]">{version}</span>
                </p>
            </div>
        </footer>
    );
}
