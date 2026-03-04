import { cn } from "@/lib/utils";
import React from "react";

export type GradientButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "relative inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
                    "bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20",
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);
GradientButton.displayName = "GradientButton";
