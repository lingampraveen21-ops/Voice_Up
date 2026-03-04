"use client";

import { cn } from "@/lib/utils";
import { Mic } from "lucide-react";
import React from "react";

export interface MicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isRecording?: boolean;
}

export function MicButton({ className, isRecording, ...props }: MicButtonProps) {
    return (
        <button
            className={cn(
                "relative flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-white shadow-lg transition-transform hover:scale-105 active:scale-95",
                isRecording && "animate-pulse shadow-[0_0_20px_rgba(255,101,132,0.8)]",
                className
            )}
            {...props}
        >
            <Mic className="h-10 w-10" />
        </button>
    );
}
