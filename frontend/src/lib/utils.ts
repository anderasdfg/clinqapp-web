import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(
    amount: number,
    currency: string = 'PEN'
): string {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

// Format date
export function formatDate(
    date: Date | string,
    format: 'short' | 'long' = 'short'
): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'short') {
        return new Intl.DateTimeFormat('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(d);
    }

    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
}

// Format phone number
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{3})$/);

    if (match) {
        return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }

    return phone;
}

// Get initials from name
export function getInitials(firstName: string, lastName?: string): string {
    if (!lastName) {
        return firstName.charAt(0).toUpperCase();
    }
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
