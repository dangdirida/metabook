import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-[var(--color-primary-030)] flex items-center justify-center mb-5">
        <Icon className="w-10 h-10 text-[var(--color-primary-300)]" />
      </div>
      <p className="text-[16px] font-bold text-[var(--color-mono-700)] mb-2">{title}</p>
      {description && <p className="text-[13px] text-[var(--color-mono-400)] leading-relaxed max-w-xs mb-6">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="px-6 py-3 rounded-2xl bg-[var(--color-primary-500)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-600)] transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}
