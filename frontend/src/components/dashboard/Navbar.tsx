import { ThemeToggle } from '@/components/ThemeToggle';
import { NAVIGATION_ICONS } from '@/lib/constants/navigation';
import { cn } from '@/lib/utils/cn';
import { useUserStore } from '@/stores/useUserStore';

interface NavbarProps {
    onToggleSidebar: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
    const user = useUserStore((state) => state.user);

    const renderIcon = (iconName: string, className?: string) => {
        const pathData = NAVIGATION_ICONS[iconName];
        return (
            <svg
                className={cn('w-6 h-6', className)}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d={pathData} />
            </svg>
        );
    };

    return (
        <header className="sticky top-0 z-30 bg-[rgb(var(--bg-card))] border-b border-[rgb(var(--border-primary))] shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                {/* Left: Menu Toggle */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-colors duration-200 text-[rgb(var(--text-secondary))] lg:hidden"
                        aria-label="Toggle menu"
                    >
                        {renderIcon('menu')}
                    </button>

                    {/* Breadcrumbs - placeholder for now */}
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <span className="text-[rgb(var(--text-secondary))]">Dashboard</span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Search - placeholder */}
                    <button
                        className="hidden sm:flex p-2 rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-colors duration-200 text-[rgb(var(--text-secondary))]"
                        aria-label="Buscar"
                    >
                        {renderIcon('search')}
                    </button>

                    {/* Notifications */}
                    <button
                        className="relative p-2 rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-colors duration-200 text-[rgb(var(--text-secondary))]"
                        aria-label="Notificaciones"
                    >
                        {renderIcon('bell')}
                        {/* Badge */}
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
                    </button>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-3 border-l border-[rgb(var(--border-primary))]">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                {user?.fullName || 'Usuario'}
                            </p>
                            <p className="text-xs text-[rgb(var(--text-secondary))]">
                                {user?.role === 'OWNER' ? 'Administrador' : 'Personal'}
                            </p>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold hover:scale-105 transition-transform duration-200 uppercase">
                            {user?.firstName?.[0] || 'U'}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
