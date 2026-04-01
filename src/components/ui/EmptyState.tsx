import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-mono-050)] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[var(--color-mono-300)]" />
      </div>
      <p className="text-[15px] font-semibold text-[var(--color-mono-700)] mb-1.5">{title}</p>
      {description && <p className="text-[13px] text-[var(--color-mono-400)] leading-relaxed max-w-xs mb-5">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="px-5 py-2.5 rounded-xl bg-[var(--color-primary-500)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-600)] transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}
