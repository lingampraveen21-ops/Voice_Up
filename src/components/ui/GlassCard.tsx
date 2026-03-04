import { cn } from "@/lib/utils";
import React from "react";

export type GlassCardProps = React.HTMLAttributes<HTMLDivElement>;

export function GlassCard({ className, children, ...props }: GlassCardProps) {
    return (
        <div className={cn("glass p-6", className)} {...props}>
            {children}
        </div>
    );
}
