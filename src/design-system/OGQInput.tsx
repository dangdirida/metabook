import { forwardRef, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: "search" | "none";
  error?: string;
}

const OGQInput = forwardRef<HTMLInputElement, Props>(
  ({ icon = "none", error, className = "", ...rest }, ref) => (
    <div className="relative">
      {icon === "search" && (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mono-400)]" />
      )}
      <input
        ref={ref}
        className={`w-full ${icon === "search" ? "pl-9" : "pl-4"} pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition-all ${
          error ? "border-red-400" : "border-[var(--color-mono-080)]"
        } ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
);
OGQInput.displayName = "OGQInput";
export default OGQInput;
