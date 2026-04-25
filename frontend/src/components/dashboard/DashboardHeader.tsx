import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardHeaderProps {
  userName: string;
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--text-primary))]">
        Hola, {userName}
      </h1>
      <p className="text-[rgb(var(--text-secondary))] font-medium">
        {capitalize(formattedDate)}
      </p>
    </div>
  );
}
