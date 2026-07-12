import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  asChild?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild, children, ...props }, ref) => {
    const variantClasses = {
      primary:
        "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-400 hover:to-pink-400",
      secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-astro",
      ghost: "text-orange-300 hover:text-orange-200",
    }[variant];

    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    }[size];

    const Component = asChild ? Slot : "button";

    return (
      <Component
        ref={ref}
        className={clsx(
          "rounded-full font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70",
          variantClasses,
          sizeClasses,
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Button.displayName = "Button";
