import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import { cn } from '@/lib/utils/cn';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Close sidebar on mobile when route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    // Handle sidebar toggle for mobile
    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Handle sidebar collapse for desktop
    const handleToggleCollapse = () => {
        // On mobile, close the sidebar
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        } else {
            // On desktop, toggle collapse
            setIsSidebarCollapsed(!isSidebarCollapsed);
        }
    };

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-secondary))]">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
            />

            {/* Main Content Area */}
            <div
                className={cn(
                    'transition-all duration-300 ease-in-out',
                    'lg:ml-64',
                    isSidebarCollapsed && 'lg:ml-20'
                )}
            >
                {/* Navbar */}
                <Navbar onToggleSidebar={handleToggleSidebar} />

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
