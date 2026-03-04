"use client";

import React from "react";

export function AnimatedBadge({ text }: { text: string }) {
    return (
        <div className="relative inline-flex overflow-hidden rounded-full p-[1px]">
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-surface-raised px-4 py-1.5 text-sm font-medium text-white backdrop-blur-3xl gap-2">
                {text}
            </span>
        </div>
    );
}
