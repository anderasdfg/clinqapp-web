import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  valueColor?: string;
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  valueColor = 'text-[rgb(var(--text-primary))]',
  isLoading = false,
}: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className={`w-20 h-20 ${iconColor}`} />
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {title}
          </span>
        </div>
        
        {isLoading ? (
          <div className="h-9 w-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
        ) : (
          <h2 className={`text-3xl font-bold ${valueColor}`}>
            {value}
          </h2>
        )}
      </div>
    </div>
  );
}
