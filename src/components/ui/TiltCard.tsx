"use client";

import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from "framer-motion";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export interface TiltCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
}

export function TiltCard({ children, className, ...props }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate normalized position -0.5 to 0.5
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={cn("glass relative flex flex-col items-start justify-end p-6 md:p-8 overflow-hidden group", className)}
            {...props}
        >
            {/* Glare effect */}
            <div
                className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)"
                }}
            />

            <div className="relative z-10 w-full" style={{ transform: "translateZ(30px)" }}>
                {children}
            </div>
        </motion.div>
    );
}
