import { ReactNode } from 'react';

interface StepHeaderProps {
    icon: ReactNode;
    title: string;
    description: string;
    gradient: string;
    iconColor: string;
    large?: boolean;
}

export const StepHeader = ({
    icon,
    title,
    description,
    gradient,
    iconColor,
    large = false
}: StepHeaderProps) => (
    <div className="text-center mb-6">
        <div className={`${large ? 'w-16 h-16' : 'w-14 h-14'} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 animate-scale-in`}>
            <div className={`${large ? 'w-9 h-9' : 'w-7 h-7'} ${iconColor}`}>
                {icon}
            </div>
        </div>
        <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">{title}</h2>
        <p className="text-sm text-[rgb(var(--text-secondary))]">{description}</p>
    </div>
);
