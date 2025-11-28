import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const inputId = id || React.useId();

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
                        className={cn(
                            'py-3.5 px-4 block w-full rounded-xl text-sm transition-all duration-200',
                            'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))]',
                            'border border-[rgb(var(--border-primary))]',
                            'placeholder:text-[rgb(var(--text-tertiary))] placeholder:font-light',
                            'focus:border-secondary focus:ring-1 focus:ring-secondary/20 focus:bg-[rgb(var(--bg-card))]',
                            'disabled:opacity-50 disabled:pointer-events-none',
                            'hover:border-[rgb(var(--border-secondary))]',
                            error && 'border-error focus:border-error focus:ring-error/20 bg-error/5',
                            className
                        )}
                        {...props}
                    />
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
