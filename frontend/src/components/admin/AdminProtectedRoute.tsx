  import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAuthenticated } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);


  // Give some time for the auth state to load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check authentication after loading
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
