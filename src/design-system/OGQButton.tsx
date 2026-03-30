import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "default" | "outline" | "ghost" | "link";
type Color = "primary" | "secondary" | "mono" | "danger";
type Size = "sm" | "md" | "lg";

const BASE = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-40 disabled:cursor-not-allowed";

const VARIANT_COLOR: Record<Variant, Record<Color, string>> = {
  default: {
    primary: "bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] active:bg-[var(--color-primary-700)]",
    secondary: "bg-[var(--color-secondary-500)] text-white hover:bg-[var(--color-secondary-600)]",
    mono: "bg-[var(--color-mono-900)] text-white hover:bg-[var(--color-mono-800)]",
    danger: "bg-red-500 text-white hover:bg-red-600",
  },
  outline: {
    primary: "border border-[var(--color-primary-500)] text-[var(--color-primary-500)] hover:bg-[var(--color-primary-050)]",
    secondary: "border border-[var(--color-secondary-500)] text-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-050)]",
    mono: "border border-[var(--color-mono-200)] text-[var(--color-mono-700)] hover:bg-[var(--color-mono-050)]",
    danger: "border border-red-500 text-red-500 hover:bg-red-50",
  },
  ghost: {
    primary: "text-[var(--color-primary-500)] hover:bg-[var(--color-primary-050)]",
    secondary: "text-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-050)]",
    mono: "text-[var(--color-mono-600)] hover:bg-[var(--color-mono-050)]",
    danger: "text-red-500 hover:bg-red-50",
  },
  link: {
    primary: "text-[var(--color-primary-500)] hover:underline p-0 h-auto",
    secondary: "text-[var(--color-secondary-500)] hover:underline p-0 h-auto",
    mono: "text-[var(--color-mono-600)] hover:underline p-0 h-auto",
    danger: "text-red-500 hover:underline p-0 h-auto",
  },
};

const SIZE: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 h-8",
  md: "text-sm px-4 py-2 h-10",
  lg: "text-base px-6 py-3 h-12",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  color?: Color;
  size?: Size;
  fullWidth?: boolean;
}

const OGQButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "default", color = "primary", size = "md", fullWidth, className = "", children, ...rest }, ref) => (
    <button
      ref={ref}
      className={`${BASE} ${VARIANT_COLOR[variant][color]} ${SIZE[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
);
OGQButton.displayName = "OGQButton";
export default OGQButton;
