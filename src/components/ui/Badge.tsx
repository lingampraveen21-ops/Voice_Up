import { cn } from "@/lib/utils";
import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "success" | "warning" | "error";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                {
                    "bg-primary/20 text-primary": variant === "default",
                    "bg-success/20 text-success": variant === "success",
                    "bg-warning/20 text-warning": variant === "warning",
                    "bg-error/20 text-error": variant === "error",
                },
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
