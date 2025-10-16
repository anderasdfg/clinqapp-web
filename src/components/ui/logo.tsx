// src/components/ui/logo.tsx
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
    className?: string
    variant?: 'default' | 'white' | 'dark'
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showText?: boolean
    href?: string
}

const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12',
}

export function Logo({
    className,
    variant = 'default',
    size = 'md',
    showText = true,
    href = '/'
}: LogoProps) {
    const content = (
        <div className={cn('flex items-center gap-2', className)}>
            {/* Logo Icon */}
            <div className={cn('relative', sizeClasses[size], 'aspect-square')}>
                <Image
                    src="/logo-icon.png" // Debes extraer solo el ícono del logo
                    alt="ClinqApp"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            {/* Text */}
            {showText && (
                <span
                    className={cn(
                        'font-bold tracking-tight',
                        size === 'sm' && 'text-lg',
                        size === 'md' && 'text-xl',
                        size === 'lg' && 'text-2xl',
                        size === 'xl' && 'text-3xl',
                        variant === 'white' && 'text-white',
                        variant === 'dark' && 'text-clinq-purple',
                        variant === 'default' && 'text-gradient'
                    )}
                >
                    ClinqApp
                </span>
            )}
        </div>
    )

    if (href) {
        return (
            <Link href={href} className="flex items-center">
                {content}
            </Link>
        )
    }

    return content
}

// Logo alternativo usando SVG inline
export function LogoSVG({ className, size = 'md' }: Omit<LogoProps, 'variant' | 'showText'>) {
    const heightMap = {
        sm: 24,
        md: 32,
        lg: 40,
        xl: 48,
    }

    const height = heightMap[size]

    return (
        <svg
            width={height * 5}
            height={height}
            viewBox="0 0 400 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Link Icon con gradiente cyan-magenta */}
            <defs>
                <linearGradient id="clinq-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00D9FF" />
                    <stop offset="100%" stopColor="#E91E8C" />
                </linearGradient>
            </defs>

            {/* Eslabón externo (Cyan) */}
            <path
                d="M20 25C20 17.268 26.268 11 34 11H46C53.732 11 60 17.268 60 25V35C60 42.732 53.732 49 46 49H34C26.268 49 20 42.732 20 35V25Z"
                stroke="#00D9FF"
                strokeWidth="6"
                fill="none"
            />

            {/* Triángulo interno (Magenta) */}
            <path
                d="M35 30L45 40L35 50V30Z"
                fill="#E91E8C"
            />

            {/* Texto "ClinqApp" */}
            <text
                x="85"
                y="48"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="36"
                fontWeight="600"
                fill="currentColor"
            >
                ClinqApp
            </text>
        </svg>
    )
}