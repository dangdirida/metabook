type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };

export default function OGQSpinner({ size = "md", className = "" }: { size?: Size; className?: string }) {
  return (
    <div className={`${SIZES[size]} border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin ${className}`} />
  );
}
