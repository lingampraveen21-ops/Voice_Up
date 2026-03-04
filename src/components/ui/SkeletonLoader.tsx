import { cn } from "@/lib/utils";
import React from "react";

export function SkeletonLoader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-surface-raised", className)}
            {...props}
        />
    );
}
