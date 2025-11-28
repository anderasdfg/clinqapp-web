interface ErrorAlertProps {
    message: string;
}

export const ErrorAlert = ({ message }: ErrorAlertProps) => (
    <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm animate-slide-down">
        {message}
    </div>
);
