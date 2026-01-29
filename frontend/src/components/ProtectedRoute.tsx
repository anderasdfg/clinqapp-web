import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/auth.service';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const user = await AuthService.getUser();
            setIsAuthenticated(!!user);
        };
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        // Loading state
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/app/login" replace />;
    }

    return <>{children}</>;
};
