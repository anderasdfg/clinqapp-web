import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthService } from '@/services/auth.service';
import { useUserStore } from '@/stores/useUserStore';
import { ValidationMessages } from '@/lib/constants/messages';
import logoIcon from '@/assets/images/logos/logo-icon.png';
import doctor1 from '@/assets/images/doctor-1.png';
import doctor2 from '@/assets/images/doctor-2.png';
import nurse1 from '@/assets/images/nurse-1.png';

const loginSchema = z.object({
    email: z.string()
        .min(1, ValidationMessages.EMAIL_REQUIRED)
        .email(ValidationMessages.EMAIL_INVALID),
    password: z.string()
        .min(1, ValidationMessages.PASSWORD_REQUIRED),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
   //const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const user = useUserStore((state) => state.user);

    useEffect(() => {
        if (user) {
            navigate('/app/dashboard/home');
        }
    }, [user, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await AuthService.login(data);

            if (result.success) {
                // Check if user needs to complete onboarding
                const needsOnboarding = await AuthService.needsOnboarding();

                if (needsOnboarding) {
                    // Redirect to onboarding if organization is temporary
                    navigate('/app/onboarding');
                } else {
                    // Redirect to dashboard if onboarding is completed
                    navigate('/app/dashboard');
                }
            } else {
                setError(result.error || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Ocurrió un error inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    /* const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setError(null);
        try {
            await AuthService.signInWithGoogle();
        } catch (err) {
            setError('Error al iniciar sesión con Google');
            setIsGoogleLoading(false);
        }
    }; */

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Brand Showcase */}
            <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}></div>

                <div className="relative z-10 flex flex-col justify-center items-start w-full px-16 text-white max-w-xl mx-auto">
                    <div className="animate-fade-in w-full">
                        {/* Logo and Brand */}
                        <div className="flex items-center gap-3 mb-12">
                            <img
                                src={logoIcon}
                                alt="ClinqApp Logo"
                                className="w-14 h-14 drop-shadow-lg"
                            />
                            <span className="text-3xl font-bold italic tracking-tight">ClinqApp</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl font-bold mb-6 leading-tight tracking-tight">
                            Comienza tu<br />
                            <span className="text-cyan-300">Transformación</span><br />
                            <span className="text-purple-300">Digital</span>
                        </h1>

                        <p className="text-lg text-white/80 mb-12 leading-relaxed max-w-md font-light">
                            Únete a los podólogos que ya están organizando su clínica en un solo lugar. Agenda, pacientes, ingresos y evolución clínica, sin complicaciones.
                        </p>

                        {/* Trust Badge */}
                        <div className="flex items-center gap-3 glass px-5 py-3 rounded-full inline-flex">
                            <div className="flex -space-x-2">
                                <img
                                    src={doctor1}
                                    alt="Doctor"
                                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                />
                                <img
                                    src={doctor2}
                                    alt="Doctor"
                                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                />
                                <img
                                    src={nurse1}
                                    alt="Enfermera"
                                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                />
                            </div>
                            <div className="text-sm">
                                <div className="font-semibold">Podólogos en Perú</div>
                                <div className="text-white/70 text-xs">ya están usando ClinqApp</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-[rgb(var(--bg-primary))] p-8">
                <div className="w-full max-w-md animate-slide-up">
                    {/* Theme Toggle */}
                    <div className="flex justify-end mb-8">
                        <ThemeToggle />
                    </div>

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-12 justify-center">
                        <img
                            src={logoIcon}
                            alt="ClinqApp Logo"
                            className="w-10 h-10"
                        />
                        <span className="text-xl font-bold text-[rgb(var(--text-primary))]">ClinqApp</span>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-3 tracking-tight">
                            Bienvenido
                        </h1>
                        <p className="text-[rgb(var(--text-secondary))] font-light">
                            Por favor ingresa tus datos para iniciar sesión.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm animate-slide-down">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input
                            label="Correo Electrónico"
                            type="email"
                            placeholder="admin@ejemplo.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <Input
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register('password')}
                        />

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-[rgb(var(--border-secondary))] rounded transition-colors duration-200"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-[rgb(var(--text-secondary))] font-light"
                                >
                                    Recordarme
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link
                                    to="/forgot-password"
                                    className="font-medium text-secondary hover:text-secondary-hover transition-colors duration-200"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-6"
                            isLoading={isLoading}
                        >
                            Iniciar Sesión
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-[rgb(var(--text-secondary))] font-light">
                            ¿No tienes una cuenta?
                        </span>{' '}
                        <Link
                            to="/app/register"
                            className="font-semibold text-secondary hover:text-secondary-hover transition-colors duration-200"
                        >
                            Regístrate
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
