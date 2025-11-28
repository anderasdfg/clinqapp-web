import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthService } from '@/services/auth.service';
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
                    navigate('/onboarding');
                } else {
                    // Redirect to dashboard if onboarding is completed
                    navigate('/dashboard');
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
                            El Futuro de la<br />
                            <span className="text-cyan-300">Gestión</span><br />
                            <span className="text-purple-300">Médica</span>
                        </h1>

                        <p className="text-lg text-white/80 mb-12 leading-relaxed max-w-md font-light">
                            Optimiza la atención de pacientes, mejora los flujos de trabajo y accede a información en tiempo real con el CRM más avanzado para profesionales médicos.
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
                                <div className="font-semibold">+1000 confian</div>
                                <div className="text-white/70 text-xs">Profesionales de la Salud</div>
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

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[rgb(var(--border-primary))]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-tertiary))] font-light">
                                    O continuar con
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3">
                            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-[rgb(var(--border-primary))] rounded-xl hover:bg-[rgb(var(--bg-secondary))] transition-all duration-200 font-medium text-sm">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-[rgb(var(--text-secondary))] font-light">
                            ¿No tienes una cuenta?
                        </span>{' '}
                        <Link
                            to="/register"
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
