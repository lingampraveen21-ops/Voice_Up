import { cn } from "@/lib/utils";
import React from "react";

export function NovaAvatar({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-lg font-bold text-white shadow-[0_0_15px_rgba(255,101,132,0.5)]",
                className
            )}
        >
            N
        </div>
    );
}
