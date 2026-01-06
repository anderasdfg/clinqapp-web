import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, type, ...props }, ref) => {
        const inputId = id || React.useId();
        const [showPassword, setShowPassword] = React.useState(false);
        
        // Determine if this is a password field
        const isPasswordField = type === 'password';
        // Use the toggled type if it's a password field
        const inputType = isPasswordField && showPassword ? 'text' : type;

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
        };

        return (
            <div className="space-y-2">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium mb-2 text-[rgb(var(--text-primary))] transition-colors duration-200"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        type={inputType}
                        className={cn(
                            'py-3.5 px-4 block w-full rounded-xl text-sm transition-all duration-200',
                            'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))]',
                            'border border-[rgb(var(--border-primary))]',
                            'placeholder:text-[rgb(var(--text-tertiary))] placeholder:font-light',
                            'focus:border-secondary focus:ring-1 focus:ring-secondary/20 focus:bg-[rgb(var(--bg-card))]',
                            'disabled:opacity-50 disabled:pointer-events-none',
                            'hover:border-[rgb(var(--border-secondary))]',
                            error && 'border-error focus:border-error focus:ring-error/20 bg-error/5',
                            // Add padding on the right when there's a password toggle or error icon
                            (isPasswordField || error) && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {/* Password visibility toggle button */}
                    {isPasswordField && (
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className={cn(
                                'absolute inset-y-0 flex items-center px-3 transition-colors duration-200',
                                'text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]',
                                'focus:outline-none focus:text-[rgb(var(--text-primary))]',
                                // Position based on whether there's an error
                                error ? 'end-8' : 'end-0'
                            )}
                            tabIndex={-1}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                            {showPassword ? (
                                // Eye-slash icon (password visible)
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                    />
                                </svg>
                            ) : (
                                // Eye icon (password hidden)
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            )}
                        </button>
                    )}
                    {/* Error icon */}
                    {error && (
                        <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
                            <svg
                                className="size-4 text-error"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                                aria-hidden="true"
                            >
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                            </svg>
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-xs text-error mt-2 animate-slide-down" id={`${inputId}-error`}>
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="text-xs text-[rgb(var(--text-tertiary))] mt-2" id={`${inputId}-helper`}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
