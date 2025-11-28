import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-[rgb(17,24,39)] dark:bg-primary hover:bg-[rgb(30,41,59)] dark:hover:bg-primary-hover text-white border-transparent focus:ring-primary shadow-sm hover:shadow-md transition-all duration-200',
            secondary: 'bg-secondary hover:bg-secondary-hover text-white border-transparent focus:ring-secondary shadow-sm hover:shadow-md transition-all duration-200',
            outline: 'bg-transparent border border-[rgb(var(--border-secondary))] text-[rgb(var(--text-primary))] hover:border-primary hover:bg-[rgb(var(--bg-secondary))] focus:ring-primary transition-all duration-200',
            ghost: 'bg-transparent text-primary hover:bg-primary/10 border-transparent focus:ring-primary transition-all duration-200',
        };

        const sizes = {
            sm: 'py-2 px-3 text-xs',
            md: 'py-3 px-6 text-sm',
            lg: 'py-4 px-8 text-base',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex justify-center items-center gap-x-2 font-semibold rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && (
                    <span
                        className="animate-spin inline-block size-4 border-[3px] border-current border-t-transparent rounded-full"
                        role="status"
                        aria-label="loading"
                    ></span>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
