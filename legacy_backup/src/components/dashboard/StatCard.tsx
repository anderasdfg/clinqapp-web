// src/components/dashboard/StatCard.tsx
import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-lg', iconBgColor)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
        {trend && (
          <div
            className={cn(
              'text-sm font-medium px-2 py-1 rounded',
              trend.isPositive
                ? 'text-green-700 bg-green-100'
                : 'text-red-700 bg-red-100'
            )}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
