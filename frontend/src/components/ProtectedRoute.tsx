import { Navigate } from 'react-router-dom';
import { useUserStore } from '@/stores/useUserStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, isLoading } = useUserStore();

    if (isLoading) {
        // Loading state
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-primary))]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-sm text-[rgb(var(--text-secondary))] animate-pulse">
                        Verificando sesión...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/app/login" replace />;
    }

    return <>{children}</>;
};
