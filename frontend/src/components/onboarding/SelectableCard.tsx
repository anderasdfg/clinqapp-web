interface SelectableCardProps {
    label: string;
    isSelected: boolean;
    onClick: () => void;
    fullWidth?: boolean;
}

export const SelectableCard = ({
    label,
    isSelected,
    onClick,
    fullWidth = false
}: SelectableCardProps) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-4 rounded-xl border-2 transition-all text-left ${fullWidth ? 'w-full' : ''
            } ${isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-[rgb(var(--border-primary))] hover:border-primary/50'
            }`}
    >
        <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                    ? 'border-primary bg-primary'
                    : 'border-[rgb(var(--border-primary))]'
                }`}>
                {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <span className="font-medium text-[rgb(var(--text-primary))]">{label}</span>
        </div>
    </button>
);
