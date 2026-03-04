"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number; // 0 to 100
    indicatorClassName?: string;
}

export function ProgressBar({ value, className, indicatorClassName, ...props }: ProgressBarProps) {
    return (
        <div
            className={cn("relative h-4 w-full overflow-hidden rounded-full bg-surface-raised", className)}
            {...props}
        >
            <motion.div
                className={cn("h-full bg-success", indicatorClassName)}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>
    );
}
