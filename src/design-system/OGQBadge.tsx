type Color = "primary" | "secondary" | "mono" | "danger" | "success" | "warning";
type Size = "sm" | "md";

const COLOR: Record<Color, string> = {
  primary: "bg-[var(--color-primary-050)] text-[var(--color-primary-600)]",
  secondary: "bg-[var(--color-secondary-050)] text-[var(--color-secondary-600)]",
  mono: "bg-[var(--color-mono-100)] text-[var(--color-mono-600)]",
  danger: "bg-red-50 text-red-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-700",
};

const SIZE: Record<Size, string> = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

interface Props {
  children: React.ReactNode;
  color?: Color;
  size?: Size;
  className?: string;
}

export default function OGQBadge({ children, color = "mono", size = "sm", className = "" }: Props) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${COLOR[color]} ${SIZE[size]} ${className}`}>
      {children}
    </span>
  );
}
