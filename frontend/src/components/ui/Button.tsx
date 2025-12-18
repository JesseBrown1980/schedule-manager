import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { SpinnerIcon } from "./icons";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseStyles = cn(
      "inline-flex items-center justify-center gap-2",
      "font-medium rounded-xl",
      "transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed"
    );

    const variantStyles = {
      primary: cn(
        "bg-gradient-to-b from-[#667EEA] to-[#764BA2]",
        "text-white shadow-button-glow",
        "hover:opacity-90 active:scale-[0.98]",
        "focus:ring-[#667EEA]/60"
      ),
      secondary: cn(
        "bg-primary-100 text-primary-700",
        "hover:bg-primary-200",
        "focus:ring-primary-500"
      ),
      outline: cn(
        "border border-slate-200 bg-white",
        "text-content",
        "hover:bg-slate-50",
        "focus:ring-slate-400"
      ),
      ghost: cn(
        "text-content-secondary",
        "hover:bg-slate-100 hover:text-content",
        "focus:ring-slate-400"
      ),
      danger: cn(
        "border border-red-200 bg-white",
        "text-red-600",
        "hover:bg-red-50",
        "focus:ring-red-500"
      ),
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <>
            <SpinnerIcon size={16} />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon}
            <span>{children}</span>
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
