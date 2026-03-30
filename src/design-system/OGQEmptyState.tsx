import { Sparkles } from "lucide-react";

interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function OGQEmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon || <Sparkles className="w-12 h-12 text-[var(--color-mono-200)] mb-3" />}
      <p className="text-sm font-semibold text-[var(--color-mono-600)] mt-3">{title}</p>
      {description && <p className="text-xs text-[var(--color-mono-400)] mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
