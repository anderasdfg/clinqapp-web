import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION_GROUPS, NAVIGATION_ICONS } from '@/lib/constants/navigation';
import logoRectangle from '@/assets/images/logos/logo-rectangle.png';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const Sidebar = ({ isOpen, isCollapsed, onToggleCollapse }: SidebarProps) => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const renderIcon = (iconName: string, className?: string) => {
        const pathData = NAVIGATION_ICONS[iconName];
        return (
            <svg
                className={cn('w-5 h-5', className)}
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
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onToggleCollapse}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out',
                    'gradient-primary shadow-2xl',
                    // Mobile: slide in/out
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                    // Desktop: collapse/expand
                    isCollapsed ? 'lg:w-20' : 'lg:w-64',
                    'w-64'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        {!isCollapsed && (
                            <img
                                src={logoRectangle}
                                alt="ClinqApp"
                                className="h-8 transition-opacity duration-300"
                            />
                        )}
                        <button
                            onClick={onToggleCollapse}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-white"
                            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                        >
                            {renderIcon(isCollapsed ? 'chevron-right' : 'chevron-left')}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-2 sidebar-scrollbar">
                        {NAVIGATION_GROUPS.map((group) => (
                            <div key={group.id} className="mb-6">
                                {!isCollapsed && (
                                    <h3 className="px-3 mb-2 text-xs font-semibold text-white/60 uppercase tracking-wider">
                                        {group.label}
                                    </h3>
                                )}
                                <ul className="space-y-1">
                                    {group.items.map((item) => {
                                        const active = isActive(item.path);
                                        return (
                                            <li key={item.id}>
                                                <Link
                                                    to={item.path}
                                                    className={cn(
                                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                                                        'text-white/90 hover:bg-white/10 hover:text-white',
                                                        active && 'bg-white/20 text-white font-medium shadow-lg',
                                                        isCollapsed && 'justify-center'
                                                    )}
                                                    title={isCollapsed ? item.label : undefined}
                                                >
                                                    {renderIcon(item.icon, active ? 'text-white' : 'text-white/80')}
                                                    {!isCollapsed && (
                                                        <span className="flex-1 text-sm">{item.label}</span>
                                                    )}
                                                    {!isCollapsed && item.badge && (
                                                        <span className="px-2 py-0.5 text-xs font-semibold bg-white/20 rounded-full">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            className={cn(
                                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg',
                                'text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200',
                                isCollapsed && 'justify-center'
                            )}
                            title={isCollapsed ? 'Cerrar sesión' : undefined}
                        >
                            {renderIcon('logout')}
                            {!isCollapsed && <span className="text-sm">Cerrar sesión</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
