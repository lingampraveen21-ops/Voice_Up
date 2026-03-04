import { cn } from "@/lib/utils";
import React from "react";

export type GhostButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const GhostButton = React.forwardRef<HTMLButtonElement, GhostButtonProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-full border border-primary/50 bg-transparent px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary/10 active:bg-primary/20 disabled:pointer-events-none disabled:opacity-50",
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);
GhostButton.displayName = "GhostButton";
