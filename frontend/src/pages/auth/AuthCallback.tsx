import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Supabase automatically handles the hash/query parameters in the URL
                // We just need to check if we have a valid session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    throw sessionError;
                }

                if (!session) {
                   // If no session, try to exchange code if present (though Supabase client usually auto-handles this)
                   // For hash-based flow (implicit), just checking session is often enough after the client loads.
                   // If we are here, it might be a failure or just slow loading.
                   // Let's give it a moment or redirect to login.
                   logger.warn("No session found in callback, redirecting to login");
                   navigate('/app/login?error=verification_failed');
                   return;
                }
                
                logger.info("Email verification successful, redirecting to dashboard");
                // Successful verification
                navigate('/app/dashboard');
            } catch (err: any) {
                logger.error("Error during auth callback", { error: err.message });
                setError("Error al verificar el correo. Por favor intenta iniciar sesión.");
                setTimeout(() => navigate('/app/login'), 3000);
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                {error ? (
                    <div className="mb-4 text-red-600 font-medium">
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Verificando tu cuenta...
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Por favor espera un momento
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
